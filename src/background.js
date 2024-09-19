// This module contains the background service worker to run commands via messages,
// using keyboard shortcuts or menu commands.
//
// Service workers: https://developer.chrome.com/docs/extensions/develop/concepts/service-workers
// Messaging: https://developer.chrome.com/docs/extensions/develop/concepts/messaging

import * as commands from './commands.js'
import popupWorker from './popup/service_worker.js'
import optionsWorker from './options/service_worker.js'
import manualWorker from './manual/service_worker.js'
import RecentTabsManager from './recent_tabs_manager.js'
import SuggestionEngine, { SuggestionType } from './suggestion_engine/suggestion_engine.js'

const { TAB_GROUP_ID_NONE } = chrome.tabGroups

const recentTabsManager = new RecentTabsManager

const suggestionEngine = new SuggestionEngine({
  recentTabsManager
})

/**
 * Adds items to the browser’s context menu.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/contextMenus
 *
 * @returns {void}
 */
function createMenuItems() {
  chrome.contextMenus.create({
    id: 'open_documentation',
    title: 'Documentation',
    contexts: ['action']
  })

  chrome.contextMenus.create({
    id: 'open_support_chat',
    title: 'Support Chat',
    contexts: ['action']
  })

  chrome.contextMenus.create({
    id: 'open_sponsorship_page',
    title: 'Sponsor this project',
    contexts: ['action']
  })

  chrome.contextMenus.create({
    id: 'copy_debug_info',
    title: 'Copy debug info',
    contexts: ['action']
  })
}

/**
 * Handles the initial setup when the extension is first installed or updated to a new version.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onInstalled
 *
 * @param {object} details
 * @returns {void}
 */
function onInstalled(details) {
  switch (details.reason) {
    case 'install':
      onInstall()
      break
  }

  popupWorker.onInstalled(details)
  createMenuItems()

  // Chrome only automatically loads content scripts into new tabs.
  runContentScripts()
}

/**
 * Handles the initial setup when the extension is first installed.
 *
 * @returns {Promise<void>}
 */
async function onInstall() {
  await chrome.tabs.create({
    active: true,
    url: 'src/manual/manual.html'
  })
}

/**
 * Runs content scripts.
 *
 * https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts#programmatic
 *
 * @returns {Promise<void>}
 */
async function runContentScripts() {
  const tabs = await chrome.tabs.query({
    url: [
      'file:///*',
      'http://*/*',
      'https://*/*'
    ],
    status: 'complete'
  })

  await Promise.allSettled(
    tabs.map((tab) =>
      chrome.scripting.executeScript({
        target: {
          tabId: tab.id
        },
        files: [
          'src/lib/scroller.js',
          'src/content_script.js'
        ]
      })
    )
  )
}

/**
 * Handles keyboard shortcuts.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/commands#event-onCommand
 *
 * @param {string} commandNameWithIndex
 * @param {chrome.tabs.Tab} tab
 * @returns {Promise<void>}
 */
async function onCommand(commandNameWithIndex, tab) {
  const commandName = commandNameWithIndex.split('.')[1]

  await commands[commandName]({
    tab,
    recentTabsManager
  })
}

/**
 * Handles the context menu on click.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/contextMenus#event-onClicked
 *
 * @param {chrome.contextMenus.OnClickData} info
 * @param {chrome.tabs.Tab} tab
 * @returns {Promise<void>}
 */
async function onMenuItemClicked(info, tab) {
  switch (info.menuItemId) {
    case 'open_documentation':
      openNewTabRight(tab, 'src/manual/manual.html')
      break

    case 'open_support_chat':
      openNewTabRight(tab, 'https://web.libera.chat/gamja/#taupiqueur')
      break

    case 'open_sponsorship_page':
      openNewTabRight(tab, 'https://github.com/sponsors/taupiqueur')
      break

    case 'copy_debug_info': {
      const debugInfo = await getDebugInfo(tab.id)

      await chrome.scripting.executeScript({
        target: {
          tabId: tab.id
        },
        func: (text) => {
          return navigator.clipboard.writeText(text)
        },
        args: [
          JSON.stringify(debugInfo, null, 2)
        ]
      })
      break
    }
  }
}

/**
 * Opens and activates a new tab to the right.
 *
 * @param {chrome.tabs.Tab} openerTab
 * @param {string} url
 * @returns {Promise<void>}
 */
async function openNewTabRight(openerTab, url) {
  const createdTab = await chrome.tabs.create({
    active: true,
    url,
    index: openerTab.index + 1,
    openerTabId: openerTab.id,
    windowId: openerTab.windowId
  })

  if (openerTab.groupId !== TAB_GROUP_ID_NONE) {
    await chrome.tabs.group({
      groupId: openerTab.groupId,
      tabIds: [
        createdTab.id
      ]
    })
  }
}

/**
 * Returns debug info.
 *
 * https://github.com/lydell/LinkHints/blob/main/src/popup/Program.tsx
 *
 * @typedef {object} DebugInfo
 * @property {string} version
 * @property {string} userAgent
 * @property {chrome.runtime.PlatformInfo} platformInfo
 * @property {object} syncStorage
 * @property {object} localStorage
 * @property {object} sessionStorage
 * @property {string} language
 * @property {Object<string, string>} keyboardLayout
 *
 * @param {number} tabId
 * @returns {Promise<DebugInfo>}
 */
async function getDebugInfo(tabId) {
  const manifest = chrome.runtime.getManifest()

  const [
    platformInfo,
    syncStorage,
    localStorage,
    sessionStorage,
    keyboardLayoutResults,
  ] = await Promise.all([
    chrome.runtime.getPlatformInfo(),
    chrome.storage.sync.get(),
    chrome.storage.local.get(),
    chrome.storage.session.get(),
    chrome.scripting.executeScript({
      target: { tabId },
      func: async () => {
        const keyboardLayoutMap = await navigator.keyboard.getLayoutMap()
        return Object.fromEntries(keyboardLayoutMap)
      }
    })
  ])

  const keyboardLayout = keyboardLayoutResults[0].result

  return {
    version: manifest.version,
    userAgent: navigator.userAgent,
    platformInfo,
    syncStorage,
    localStorage,
    sessionStorage,
    language: navigator.language,
    keyboardLayout,
  }
}

/**
 * Handles long-lived connections.
 * Uses the channel name to distinguish different types of connections.
 *
 * https://developer.chrome.com/docs/extensions/develop/concepts/messaging#connect
 *
 * @param {chrome.runtime.Port} port
 * @returns {void}
 */
function onConnect(port) {
  switch (port.name) {
    case 'popup':
      popupWorker.onConnect(port, {
        recentTabsManager,
        suggestionEngine
      })
      break

    case 'options':
      optionsWorker.onConnect(port)
      break

    case 'manual':
      manualWorker.onConnect(port)
      break

    default:
      port.postMessage({
        type: 'error',
        message: `Unknown type of connection: ${port.name}`
      })
  }
}

/**
 * Handles tab activation, when the active tab in a window changes.
 * Note window activation does not change the active tab.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/tabs#event-onActivated
 *
 * @param {object} activeInfo
 * @returns {void}
 */
function onTabActivated(activeInfo) {
  recentTabsManager.onTabActivated(activeInfo)
}

/**
 * Handles tab closing, when a tab is closed or a window is being closed.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/tabs#event-onRemoved
 *
 * @param {number} tabId
 * @param {object} removeInfo
 * @returns {void}
 */
function onTabRemoved(tabId, removeInfo) {
  recentTabsManager.onTabRemoved(tabId, removeInfo)
}

/**
 * Handles tab replacement, when a tab is replaced with another tab due to pre-rendering or instant.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/tabs#event-onReplaced
 *
 * @param {number} addedTabId
 * @param {number} removedTabId
 * @returns {void}
 */
function onTabReplaced(addedTabId, removedTabId) {
  recentTabsManager.onTabReplaced(addedTabId, removedTabId)
}

/**
 * Handles window activation, when the currently focused window changes.
 * Will be `WINDOW_ID_NONE` if all Chrome windows have lost focus.
 *
 * NOTE: On some window managers (e.g., Sway), `WINDOW_ID_NONE` is always
 * sent immediately preceding a switch from one Chrome window to another.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/windows#event-onFocusChanged
 *
 * @param {number} windowId
 * @returns {void}
 */
function onWindowFocusChanged(windowId) {
  recentTabsManager.onWindowFocusChanged(windowId)
}

// Set up listeners.
// https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/events
chrome.runtime.onInstalled.addListener(onInstalled)
chrome.commands.onCommand.addListener(onCommand)
chrome.contextMenus.onClicked.addListener(onMenuItemClicked)
chrome.runtime.onConnect.addListener(onConnect)
chrome.tabs.onActivated.addListener(onTabActivated)
chrome.tabs.onRemoved.addListener(onTabRemoved)
chrome.tabs.onReplaced.addListener(onTabReplaced)
chrome.windows.onFocusChanged.addListener(onWindowFocusChanged)
recentTabsManager.onStartup()
