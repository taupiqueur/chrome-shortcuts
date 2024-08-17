// This module contains the popup service worker to run commands via messages.
//
// Uses a long-lived connection for the popup lifetime.
// This allows to determine when the popup shows up or goes away.
//
// Popup page: https://developer.chrome.com/docs/extensions/develop/ui/add-popup
// Service workers: https://developer.chrome.com/docs/extensions/develop/concepts/service-workers
// Long-lived connections: https://developer.chrome.com/docs/extensions/develop/concepts/messaging#connect

/**
 * @typedef {CommandMessage} Message
 *
 * @typedef {object} CommandMessage
 * @property {"command"} type
 * @property {string} commandName
 * @property {boolean} passingMode
 * @property {boolean} stickyWindow
 */

import * as commands from '../commands.js'

const CHROME_DOMAINS = [
  new URLPattern({
    protocol: 'chrome'
  }),
  new URLPattern({
    protocol: 'chrome-extension'
  }),
  new URLPattern({
    hostname: 'chromewebstore.google.com'
  })
]

const popupConfigPromise = fetch('popup/config.json')
  .then((response) =>
    response.json()
  )

/**
 * Handles the initial setup when the extension is first installed or updated to a new version.
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
}

/**
 * Handles the initial setup when the extension is first installed.
 *
 * @returns {Promise<void>}
 */
async function onInstall() {
  const popupConfig = await popupConfigPromise
  await chrome.storage.sync.set({
    popupConfig
  })
}

/**
 * Handles the setup when the extension is updated to a new version.
 *
 * @param {string} previousVersion
 * @returns {Promise<void>}
 */
async function onUpdate(previousVersion) {
  const popupConfig = await popupConfigPromise
  const localStorage = await chrome.storage.sync.get('popupConfig')

  // Merge config to handle added commands.
  Object.assign(
    popupConfig.commandBindings,
    localStorage.popupConfig.commandBindings
  )

  Object.assign(
    popupConfig.paletteBindings,
    localStorage.popupConfig.paletteBindings
  )

  await chrome.storage.sync.set({
    popupConfig
  })
}

/**
 * Handles a new connection when the popup shows up.
 *
 * @param {chrome.runtime.Port} port
 * @param {Context} cx
 * @returns {void}
 */
function onConnect(port, cx) {
  port.onMessage.addListener((message, port) => {
    onMessage(message, port, cx)
  })
  onPopupScriptAdded(port)
}

/**
 * Handles the popup initialization.
 *
 * @param {chrome.runtime.Port} port
 * @returns {Promise<void>}
 */
async function onPopupScriptAdded(port) {
  const localStorage = await chrome.storage.sync.get('popupConfig')

  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  })

  if (tabs.length > 0) {
    const { url } = tabs[0]

    port.postMessage({
      type: 'init',
      commandBindings: localStorage.popupConfig.commandBindings,
      paletteBindings: localStorage.popupConfig.paletteBindings,
      isEnabled: !CHROME_DOMAINS.some((domain) =>
        domain.test(url)
      )
    })
  }
}

/**
 * Handles message by using a discriminator field. Each message has a `type` field,
 * and the rest of the fields, and their meaning, depend on its value.
 *
 * https://crystal-lang.org/api/master/JSON/Serializable.html#discriminator-field
 *
 * @param {Message} message
 * @param {chrome.runtime.Port} port
 * @param {Context} cx
 * @returns {void}
 */
function onMessage(message, port, cx) {
  switch (message.type) {
    case 'command':
      onCommandMessage(message, port, cx)
      break

    default:
      port.postMessage({
        type: 'error',
        message: 'Unknown request'
      })
  }
}

/**
 * Handles a command message.
 *
 * The options are as follows:
 *
 * ###### passingMode
 *
 * Specifies whether to close the popup window before executing the command.
 *
 * Default is `false`.
 *
 * ###### stickyWindow
 *
 * Specifies whether to reopen the popup window after executing the command.
 *
 * Default is `false`.
 *
 * @param {CommandMessage} message
 * @param {chrome.runtime.Port} port
 * @param {Context} cx
 * @returns {Promise<void>}
 */
async function onCommandMessage(message, port, cx) {
  const { commandName, passingMode, stickyWindow } = message

  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  })

  if (tabs.length > 0) {
    const tabInfo = tabs[0]

    if (passingMode) {
      await closePopup(port)
    }

    await commands[commandName]({
      tab: tabInfo,
      ...cx
    })

    if (
      stickyWindow &&
      // EXPERIMENTAL: Requires either Chrome 127+ or the dev channel.
      // See https://issues.chromium.org/issues/40057101 for more information.
      chrome.action.openPopup
    ) {
      const port = await openPopup(chrome.windows.WINDOW_ID_CURRENT)
      port.postMessage({
        type: 'stateSync',
        command: commandName
      })
    }
  }
}

/**
 * Opens the extension’s popup.
 *
 * @param {number} windowId
 * @returns {Promise<chrome.runtime.Port>}
 */
async function openPopup(windowId) {
  return new Promise((resolve, reject) => {
    chrome.runtime.onConnect.addListener(
      function fireAndForget(port) {
        if (port.name === 'popup') {
          chrome.runtime.onConnect.removeListener(fireAndForget)
          resolve(port)
        }
      }
    )
    chrome.action.openPopup({
      windowId
    }).catch(reject)
  })
}

/**
 * Closes the extension’s popup.
 *
 * @param {chrome.runtime.Port} port
 * @returns {Promise<void>}
 */
async function closePopup(port) {
  return new Promise((resolve) => {
    port.onDisconnect.addListener(resolve)
    port.postMessage({
      type: 'command',
      command: 'closePopup'
    })
  })
}

export default { onInstalled, onConnect }
