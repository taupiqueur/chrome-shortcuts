// This module contains the background service worker to run commands via messages,
// using keyboard shortcuts or menu commands.
//
// Service workers: https://developer.chrome.com/docs/extensions/mv3/service_workers/
// Messaging: https://developer.chrome.com/docs/extensions/mv3/messaging/

import * as commands from './commands.js'
import popupWorker from './popup/service_worker.js'
import optionsWorker from './options/service_worker.js'

// Handles the initial setup when the extension is first installed or updated to a new version.
// Reference: https://developer.chrome.com/docs/extensions/reference/runtime/#event-onInstalled
function onInstalled(details) {
  popupWorker.onInstalled(details)
}

// Handles keyboard shortcuts.
// Reference: https://developer.chrome.com/docs/extensions/reference/commands/#event-onCommand
function onCommand(commandNameWithIndex, tab) {
  const commandName = commandNameWithIndex.split('.')[1]
  commands[commandName]({ tab })
}

// Handles long-lived connections.
// Uses the channel name to distinguish different types of connections.
// Reference: https://developer.chrome.com/docs/extensions/mv3/messaging/#connect
function onConnect(port) {
  switch (port.name) {
    case 'popup':
      popupWorker.onConnect(port)
      break
    case 'options':
      optionsWorker.onConnect(port)
      break
    default:
      port.postMessage({ type: 'error', message: `Unknown type of connection: ${port.name}` })
  }
}

// Set up listeners.
// Reference: https://developer.chrome.com/docs/extensions/mv3/service_workers/#listeners
chrome.runtime.onInstalled.addListener(onInstalled)
chrome.commands.onCommand.addListener(onCommand)
chrome.runtime.onConnect.addListener(onConnect)
