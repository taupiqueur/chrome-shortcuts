// This module contains the popup service worker to run commands via messages.
//
// Uses a long-lived connection for the popup lifetime.
// This allows to determine when the popup shows up or goes away.
//
// Action: https://developer.chrome.com/docs/extensions/reference/action/
// Service workers: https://developer.chrome.com/docs/extensions/mv3/service_workers/
// Long-lived connections: https://developer.chrome.com/docs/extensions/mv3/messaging/#connect

import * as commands from '../commands.js'

// Retrieve the popup config.
const popupConfigPromise = fetch('popup/config.json').then(response => response.json())

let popupIsOpen = false

// Handles the initial setup when the extension is first installed.
async function onInstall() {
  const popupConfig = await popupConfigPromise
  await chrome.storage.sync.set({ popupConfig })
}

// Handles the setup when the extension is updated to a new version.
async function onUpdate(previousVersion) {
  const popupConfig = await popupConfigPromise
  // Merge config to handle added commands.
  const { popupConfig: { commandBindings } } = await chrome.storage.sync.get('popupConfig')
  Object.assign(popupConfig.commandBindings, commandBindings)
  await chrome.storage.sync.set({ popupConfig })
}

// Handles a new connection when the popup shows up.
function onConnect(port) {
  popupIsOpen = true
  port.onDisconnect.addListener(onDisconnect)
  port.onMessage.addListener(onMessage)
}

// Handles disconnection when the popup goes away.
function onDisconnect(port) {
  popupIsOpen = false
}

// Handles message by using a discriminator field.
// Each message has a `type` field, and the rest of the fields, and their meaning, depend on its value.
// Reference: https://crystal-lang.org/api/master/JSON/Serializable.html#discriminator-field
function onMessage(message, port) {
  switch (message.type) {
    case 'command':
      onCommandMessage(message, port)
      break
    default:
      port.postMessage({ type: 'error', message: 'Unknown request' })
  }
}

// Handles a single command.
async function onCommandMessage(message, port) {
  const { command: commandName, passingMode, stickyWindow, tab } = message

  // If passing mode is specified, close the popup window.
  if (passingMode) {
    port.postMessage({ type: 'command', command: 'closePopup' })
  }

  // Execute the command and wait for it to complete.
  await commands[commandName]({ tab })

  // If the sticky flag has been specified, then “stick” the extension’s popup.
  if (stickyWindow) {
    await chrome.action.openPopup()
  }

  // Save command to session.
  await chrome.storage.session.set({ lastCommand: commandName })
}

export default { onInstall, onUpdate, onConnect }
