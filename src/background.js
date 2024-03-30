// This module contains the background service worker to run commands via messages,
// using keyboard shortcuts or menu commands.
//
// Service workers: https://developer.chrome.com/docs/extensions/develop/concepts/service-workers
// Messaging: https://developer.chrome.com/docs/extensions/develop/concepts/messaging

import * as commands from './commands.js'
import popupWorker from './popup/service_worker.js'
import optionsWorker from './options/service_worker.js'
import RecentTabsManager from './recent_tabs_manager.js'

const recentTabsManager = new RecentTabsManager

/**
 * Handles the initial setup when the extension is first installed or updated to a new version.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onInstalled
 *
 * @param {object} details
 * @returns {void}
 */
function onInstalled(details) {
  popupWorker.onInstalled(details)

  // Chrome only automatically loads content scripts into new tabs.
  runContentScripts()
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
        recentTabsManager
      })
      break

    case 'options':
      optionsWorker.onConnect(port)
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
chrome.runtime.onConnect.addListener(onConnect)
chrome.tabs.onActivated.addListener(onTabActivated)
chrome.tabs.onRemoved.addListener(onTabRemoved)
chrome.windows.onFocusChanged.addListener(onWindowFocusChanged)
recentTabsManager.onStartup()
