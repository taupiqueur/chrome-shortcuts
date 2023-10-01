// This module contains the background service worker to run commands via messages,
// using keyboard shortcuts or menu commands.
//
// Service workers: https://developer.chrome.com/docs/extensions/mv3/service_workers/
// Messaging: https://developer.chrome.com/docs/extensions/mv3/messaging/

import * as commands from './commands.js'
import popupWorker from './popup/service_worker.js'
import optionsWorker from './options/service_worker.js'
import MostRecentlyUsedTabsManager from './most_recently_used_tabs_manager.js'

const mostRecentlyUsedTabsManager = new MostRecentlyUsedTabsManager

// Handles the initial setup when the extension is first installed or updated to a new version.
// Reference: https://developer.chrome.com/docs/extensions/reference/runtime/#event-onInstalled
function onInstalled(details) {
  popupWorker.onInstalled(details)
}

// Handles keyboard shortcuts.
// Reference: https://developer.chrome.com/docs/extensions/reference/commands/#event-onCommand
async function onCommand(commandNameWithIndex, tab) {
  const commandName = commandNameWithIndex.split('.')[1]
  const commandContext = {
    tab,
    mostRecentlyUsedTabsManager
  }
  await commands[commandName](commandContext)
}

// Handles long-lived connections.
// Uses the channel name to distinguish different types of connections.
// Reference: https://developer.chrome.com/docs/extensions/mv3/messaging/#connect
function onConnect(port) {
  switch (port.name) {
    case 'popup':
      const backgroundContext = {
        mostRecentlyUsedTabsManager
      }
      popupWorker.onConnect(port, backgroundContext)
      break
    case 'options':
      optionsWorker.onConnect(port)
      break
    default:
      port.postMessage({ type: 'error', message: `Unknown type of connection: ${port.name}` })
  }
}

// Handles the service worker unloading, just before it goes dormant.
// This gives the extension an opportunity to save its current state.
// Reference: https://developer.chrome.com/docs/extensions/reference/runtime/#event-onSuspend
function onSuspend() {
  mostRecentlyUsedTabsManager.onSuspend()
}

// Handles tab activation, when the active tab in a window changes.
// Note window activation does not change the active tab.
// Reference: https://developer.chrome.com/docs/extensions/reference/tabs/#event-onActivated
function onTabActivated(activeInfo) {
  mostRecentlyUsedTabsManager.onTabActivated(activeInfo)
}

// Handles tab closing, when a tab is closed or a window is being closed.
// Reference: https://developer.chrome.com/docs/extensions/reference/tabs/#event-onRemoved
function onTabRemoved(tabId, removeInfo) {
  mostRecentlyUsedTabsManager.onTabRemoved(tabId, removeInfo)
}

// Handles window activation, when the currently focused window changes.
// Will be `WINDOW_ID_NONE` if all Chrome windows have lost focus.
// Note: On some window managers (e.g., Sway), `WINDOW_ID_NONE` will always be sent immediately preceding a switch from one Chrome window to another.
// Reference: https://developer.chrome.com/docs/extensions/reference/windows/#event-onFocusChanged
function onWindowFocusChanged(windowId) {
  mostRecentlyUsedTabsManager.onWindowFocusChanged(windowId)
}

// Set up listeners.
// Reference: https://developer.chrome.com/docs/extensions/mv3/service_workers/#listeners
chrome.runtime.onInstalled.addListener(onInstalled)
chrome.commands.onCommand.addListener(onCommand)
chrome.runtime.onConnect.addListener(onConnect)
chrome.runtime.onSuspend.addListener(onSuspend)
chrome.tabs.onActivated.addListener(onTabActivated)
chrome.tabs.onRemoved.addListener(onTabRemoved)
chrome.windows.onFocusChanged.addListener(onWindowFocusChanged)
mostRecentlyUsedTabsManager.onStartup()
