// This module contains the background service worker to run commands via messages,
// using keyboard shortcuts or menu commands.
//
// Service workers: https://developer.chrome.com/docs/extensions/mv3/service_workers/
// Messaging: https://developer.chrome.com/docs/extensions/mv3/messaging/

import * as commands from './commands.js'
import popupWorker from './popup/service_worker.js'
import optionsWorker from './options/service_worker.js'

// Handle the initial setup when the extension is first installed or updated to a new version.
// Reference: https://developer.chrome.com/docs/extensions/reference/runtime/#event-onInstalled
chrome.runtime.onInstalled.addListener((details) => {
  switch (details.reason) {
    case 'install':
      popupWorker.onInstall()
      break
    case 'update':
      popupWorker.onUpdate(details.previousVersion)
      break
  }
})

// Handles a single command.
async function onCommand(commandName, tab) {
  await commands[commandName]({ tab })
}

// Handle keyboard shortcuts.
// Reference: https://developer.chrome.com/docs/extensions/reference/commands/#event-onCommand
chrome.commands.onCommand.addListener((commandNameWithIndex, tab) => {
  const commandName = commandNameWithIndex.split('.')[1]
  onCommand(commandName, tab)
})

// Handle long-lived connections.
// Use the channel name to distinguish different types of connections.
// Reference: https://developer.chrome.com/docs/extensions/mv3/messaging/#connect
chrome.runtime.onConnect.addListener((port) => {
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
})
