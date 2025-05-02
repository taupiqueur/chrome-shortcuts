// This module contains the background service worker to run commands via messages,
// using keyboard shortcuts or menu commands.
//
// Service workers: https://developer.chrome.com/docs/extensions/develop/concepts/service-workers
// Messaging: https://developer.chrome.com/docs/extensions/develop/concepts/messaging

import * as commands from './commands.js'
import popupWorker from './popup/service_worker.js'
import optionsUIWorker from './options_ui/service_worker.js'
import optionsWorker from './options/service_worker.js'
import manualWorker from './manual/service_worker.js'
import RecentTabsManager from './recent_tabs_manager.js'
import SuggestionEngine, { SuggestionType } from './suggestion_engine/suggestion_engine.js'

const COMMAND_NAME_OFFSET = 4

const { TAB_GROUP_ID_NONE } = chrome.tabGroups

const recentTabsManager = new RecentTabsManager

const suggestionEngine = new SuggestionEngine({
  recentTabsManager
})

const suggestionLabels = new Map([
  [SuggestionType.OpenTab, chrome.i18n.getMessage('openTabSuggestionLabel')],
  [SuggestionType.ClosedTab, chrome.i18n.getMessage('closedTabSuggestionLabel')],
  [SuggestionType.SyncedTab, chrome.i18n.getMessage('syncedTabSuggestionLabel')],
  [SuggestionType.Bookmark, chrome.i18n.getMessage('bookmarkSuggestionLabel')],
  [SuggestionType.ReadingList, chrome.i18n.getMessage('readingListSuggestionLabel')],
  [SuggestionType.History, chrome.i18n.getMessage('historySuggestionLabel')],
  [SuggestionType.Download, chrome.i18n.getMessage('downloadSuggestionLabel')],
  [SuggestionType.Extension, chrome.i18n.getMessage('extensionSuggestionLabel')],
])

/**
 * Cache where we will expose the data we retrieve from the storage.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/storage#asynchronous-preload-from-storage
 *
 * @type {{ homePage: string, manualPage: string, optionsPage: string, shortcutsPage: string }}
 */
const storageCache = {
}

/**
 * Configures the extension’s internal pages.
 *
 * @returns {Promise<void>}
 */
async function setLocalizedPages() {
  switch (chrome.i18n.getUILanguage()) {
    case 'en':
    case 'en-AU':
    case 'en-GB':
    case 'en-US':
      await chrome.action.setPopup({
        popup: 'src/popup/popup.html'
      })
      await chrome.storage.session.set({
        homePage: 'https://taupiqueur.github.io/chrome-shortcuts',
        manualPage: chrome.runtime.getURL('src/manual/manual.html'),
        optionsPage: chrome.runtime.getURL('src/options/options.html'),
        shortcutsPage: 'chrome://extensions/shortcuts#:~:text=Shortcuts,-Activate the extension',
      })
      break

    case 'fr':
      await chrome.action.setPopup({
        popup: 'src/popup/popup.fr.html'
      })
      await chrome.storage.session.set({
        homePage: 'https://taupiqueur.github.io/chrome-shortcuts/fr/',
        manualPage: chrome.runtime.getURL('src/manual/manual.fr.html'),
        optionsPage: chrome.runtime.getURL('src/options/options.fr.html'),
        shortcutsPage: 'chrome://extensions/shortcuts#:~:text=Shortcuts,-Activer l’extension',
      })
      break

    default:
      await chrome.action.setPopup({
        popup: 'src/popup/popup.html'
      })
      await chrome.storage.session.set({
        homePage: 'https://taupiqueur.github.io/chrome-shortcuts',
        manualPage: chrome.runtime.getURL('src/manual/manual.html'),
        optionsPage: chrome.runtime.getURL('src/options/options.html'),
        shortcutsPage: 'chrome://extensions/shortcuts#:~:text=Shortcuts',
      })
  }
}

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
    title: chrome.i18n.getMessage('openDocumentationMenuItemTitle'),
    contexts: ['action']
  })

  chrome.contextMenus.create({
    id: 'open_support_chat',
    title: chrome.i18n.getMessage('openSupportChatMenuItemTitle'),
    contexts: ['action']
  })

  chrome.contextMenus.create({
    id: 'open_sponsorship_page',
    title: chrome.i18n.getMessage('openSponsorshipPageMenuItemTitle'),
    contexts: ['action']
  })

  chrome.contextMenus.create({
    id: 'copy_debug_info',
    title: chrome.i18n.getMessage('copyDebugInfoMenuItemTitle'),
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

    case 'update':
      onUpdate(details.previousVersion)
      break
  }
  recentTabsManager.onInstalled(details)
}

/**
 * Handles the initial setup when the extension is first installed.
 *
 * @returns {Promise<void>}
 */
async function onInstall() {
  const defaults = await optionsWorker.getDefaults()
  await chrome.storage.sync.set(defaults)
  await setLocalizedPages()
  createMenuItems()
  await runContentScripts()
  await chrome.tabs.create({
    active: true,
    url: storageCache.homePage
  })
}

/**
 * Handles the setup when the extension is updated to a new version.
 *
 * @param {string} previousVersion
 * @returns {Promise<void>}
 */
async function onUpdate(previousVersion) {
  switch (previousVersion) {
    case '0.1.0':
    case '0.2.0':
    case '0.2.1':
    case '0.3.0':
    case '0.3.1':
    case '0.3.2':
    case '0.3.3':
    case '0.3.4':
    case '0.3.5':
    case '0.4.0':
    case '0.5.0':
    case '0.6.0':
    case '0.7.0':
    case '0.7.1':
    case '0.7.2':
    case '0.7.3':
    case '0.7.4':
    case '0.8.0':
    case '0.8.1':
    case '0.9.0':
    case '0.9.1':
    case '0.9.2':
    case '0.10.0':
    case '0.10.1':
    case '0.11.0': {
      const defaults = await optionsWorker.getDefaults()
      await chrome.storage.sync.set(defaults)
      await setLocalizedPages()
      createMenuItems()
      await runContentScripts()
      break
    }

    default:
      await setLocalizedPages()
      createMenuItems()
      await runContentScripts()
  }
}

/**
 * Handles startup when a profile is started
 * (e.g., when the browser first starts up).
 *
 * https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onStartup
 *
 * @returns {void}
 */
function onStartup() {
  setLocalizedPages()
  chrome.contextMenus.removeAll()
  createMenuItems()
  recentTabsManager.onStartup()
}

/**
 * Runs content scripts.
 *
 * NOTE: Chrome only automatically loads content scripts into new tabs.
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
 * Handles option changes.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/storage#event-onChanged
 *
 * @param {object} changes
 * @param {string} areaName
 * @returns {void}
 */
function onOptionsChange(changes, areaName) {
  switch (areaName) {
    case 'session':
      for (const key in changes) {
        storageCache[key] = changes[key].newValue
      }
      break
  }
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
  const commandName = commandNameWithIndex.substring(COMMAND_NAME_OFFSET)

  await commands[commandName]({
    tab,
    recentTabsManager,
    manualPage: storageCache.manualPage,
    shortcutsPage: storageCache.shortcutsPage,
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
      openNewTab({
        active: true,
        url: storageCache.manualPage,
        openerTabId: tab.id,
      })
      break

    case 'open_support_chat':
      openNewTab({
        active: true,
        url: 'https://web.libera.chat/gamja/#taupiqueur',
        openerTabId: tab.id,
      })
      break

    case 'open_sponsorship_page':
      openNewTab({
        active: true,
        url: 'https://github.com/sponsors/taupiqueur',
        openerTabId: tab.id,
      })
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
 * Opens a new tab to the right.
 *
 * @param {object} createProperties
 * @param {boolean} createProperties.active
 * @param {string} createProperties.url
 * @param {number} createProperties.openerTabId
 * @returns {Promise<void>}
 */
async function openNewTab({
  active,
  url,
  openerTabId,
}) {
  const openerTab = await chrome.tabs.get(openerTabId)
  const createdTab = await chrome.tabs.create({
    active,
    url,
    index: openerTab.index + 1,
    openerTabId,
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
        suggestionEngine,
        suggestionLabels,
        manualPage: storageCache.manualPage,
        shortcutsPage: storageCache.shortcutsPage,
      })
      break

    case 'options_ui':
      optionsUIWorker.onConnect(port, {
        optionsPage: storageCache.optionsPage,
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

chrome.storage.session.get((sessionStorage) => {
  Object.assign(storageCache, sessionStorage)
})

recentTabsManager.restoreState()

// Set up listeners.
// https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/events
chrome.runtime.onInstalled.addListener(onInstalled)
chrome.runtime.onStartup.addListener(onStartup)
chrome.storage.onChanged.addListener(onOptionsChange)
chrome.commands.onCommand.addListener(onCommand)
chrome.contextMenus.onClicked.addListener(onMenuItemClicked)
chrome.runtime.onConnect.addListener(onConnect)
chrome.tabs.onActivated.addListener(onTabActivated)
chrome.tabs.onRemoved.addListener(onTabRemoved)
chrome.tabs.onReplaced.addListener(onTabReplaced)
chrome.windows.onFocusChanged.addListener(onWindowFocusChanged)
