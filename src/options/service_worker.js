// This module contains the “Options” service worker to manage settings via messages.
//
// Options page: https://developer.chrome.com/docs/extensions/develop/ui/options-page
// Service workers: https://developer.chrome.com/docs/extensions/develop/concepts/service-workers
// Long-lived connections: https://developer.chrome.com/docs/extensions/develop/concepts/messaging#connect

const KEEP_ALIVE_INTERVAL = 29000

/**
 * Retrieves the default config.
 *
 * @returns {Promise<object>}
 */
async function getDefaults() {
  return (
    fetch('config.json')
      .then((response) =>
        response.json()
      )
  )
}

/**
 * Retrieves Vim’s defaults.
 *
 * @returns {Promise<object>}
 */
async function getVimDefaults() {
  return (
    fetch('vim_config.json')
      .then((response) =>
        response.json()
      )
  )
}

/**
 * List of active ports.
 *
 * @type {Set<chrome.runtime.Port>}
 */
const activePorts = new Set

/**
 * Handles a new connection when opening the “Options” page.
 *
 * @param {chrome.runtime.Port} port
 * @returns {void}
 */
function onConnect(port) {
  activePorts.add(port)
  const keepAliveIntervalId = setInterval(() => {
    port.postMessage({
      type: 'keepAlive'
    })
  }, KEEP_ALIVE_INTERVAL)
  port.onDisconnect.addListener((port) => {
    onDisconnect(port, keepAliveIntervalId)
  })
  port.onMessage.addListener(onMessage)
  onOptionsScriptAdded(port)
}

/**
 * Handles disconnection by clearing the keep-alive interval.
 *
 * @param {chrome.runtime.Port} port
 * @param {number} keepAliveIntervalId
 * @returns {void}
 */
function onDisconnect(port, keepAliveIntervalId) {
  activePorts.delete(port)
  clearInterval(keepAliveIntervalId)
}

/**
 * Handles the Options page initialization.
 *
 * @param {chrome.runtime.Port} port
 * @returns {Promise<void>}
 */
async function onOptionsScriptAdded(port) {
  const {
    pageBindings,
    popupStyleSheet,
  } = await chrome.storage.sync.get()

  port.postMessage({
    type: 'stateSync',
    vimModeEnabled: pageBindings.length > 0,
    popupStyleSheetChanged: popupStyleSheet.length > 0,
  })
}

/**
 * Handles message by using a discriminator field. Each message has a `type` field,
 * and the rest of the fields, and their meaning, depend on its value.
 *
 * https://crystal-lang.org/api/master/JSON/Serializable.html#discriminator-field
 *
 * @param {object} message
 * @param {chrome.runtime.Port} port
 * @returns {Promise<void>}
 */
async function onMessage(message, port) {
  switch (message.type) {
    case 'saveOptions':
      await saveOptions(message.partialOptions)
      await updateOptionsPagesAfterOptionsChange()
      break

    case 'resetOptions':
      await resetOptions()
      await updateOptionsPagesAfterOptionsChange()
      break

    case 'enableVimMode':
      await enableVimMode()
      await updateOptionsPagesAfterOptionsChange()
      break

    case 'disableVimMode':
      await disableVimMode()
      await updateOptionsPagesAfterOptionsChange()
      break

    case 'restoreDefaultTheme':
      await restoreDefaultTheme()
      await updateOptionsPagesAfterOptionsChange()
      break

    default:
      port.postMessage({
        type: 'error',
        message: 'Unknown request'
      })
  }
}

/**
 * Saves options.
 *
 * @param {object} partialOptions
 * @returns {Promise<void>}
 */
async function saveOptions(partialOptions) {
  await chrome.storage.sync.set(partialOptions)
}

/**
 * Resets options.
 *
 * @returns {Promise<void>}
 */
async function resetOptions() {
  const defaults = await getDefaults()
  await chrome.storage.sync.clear()
  await chrome.storage.sync.set(defaults)
}

/**
 * Enables Vim mode.
 *
 * @returns {Promise<void>}
 */
async function enableVimMode() {
  const vimDefaults = await getVimDefaults()
  await chrome.storage.sync.set(vimDefaults)
}

/**
 * Disables Vim mode.
 *
 * @returns {Promise<void>}
 */
async function disableVimMode() {
  await chrome.storage.sync.set({
    pageBindings: []
  })
}

/**
 * Restores the default theme.
 *
 * @returns {Promise<void>}
 */
async function restoreDefaultTheme() {
  await chrome.storage.sync.set({
    popupStyleSheet: []
  })
}

/**
 * Updates Options pages after option changes.
 *
 * @returns {Promise<void>}
 */
async function updateOptionsPagesAfterOptionsChange() {
  const {
    pageBindings,
    popupStyleSheet,
  } = await chrome.storage.sync.get()

  for (const port of activePorts) {
    port.postMessage({
      type: 'stateSync',
      vimModeEnabled: pageBindings.length > 0,
      popupStyleSheetChanged: popupStyleSheet.length > 0,
    })
  }
}

export default { getDefaults, onConnect }
