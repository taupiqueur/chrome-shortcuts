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
const popupConfigPromise = fetch('/src/popup/config.json').then(response => response.json())

let popupIsOpen = false

// Handles setup.
async function handleSetup() {
  const popupConfig = await popupConfigPromise
  await chrome.storage.sync.set({ popupConfig })
}

// Handles update.
async function handleUpdate(previousVersion) {
  const popupConfig = await popupConfigPromise
  // Merge config to handle added commands.
  const { popupConfig: { commandBindings } } = await chrome.storage.sync.get('popupConfig')
  Object.assign(popupConfig.commandBindings, commandBindings)
  await chrome.storage.sync.set({ popupConfig })
}

// Handles a new connection when the popup shows up.
async function handleConnection(port) {
  popupIsOpen = true
  port.onDisconnect.addListener(handleDisconnection)
  port.onMessage.addListener(handleMessage)
}

// Handles disconnection when the popup goes away.
async function handleDisconnection(port) {
  popupIsOpen = false
}

// Handles message by using a discriminator field.
// Each message has a `type` field, and the rest of the fields, and their meaning, depend on its value.
// Reference: https://crystal-lang.org/api/master/JSON/Serializable.html#discriminator-field
async function handleMessage(message, port) {
  switch (message.type) {
    case 'command':
      handleCommand(message, port)
      break
    default:
      port.postMessage({ type: 'error', message: 'Unknown request' })
  }
}

// Handles a single command.
async function handleCommand(message, port) {
  const { command: commandName, passingMode, stickyWindow, tab } = message

  // If passing mode is specified, close the popup window.
  if (passingMode) {
    await port.postMessage({ type: 'command', command: 'closePopup' })
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

export { handleSetup, handleUpdate, handleConnection }
