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
 * Handles a new connection when opening the “Options” page.
 *
 * @param {chrome.runtime.Port} port
 * @returns {void}
 */
function onConnect(port) {
  const keepAliveIntervalId = setInterval(() => {
    port.postMessage({
      type: 'keepAlive'
    })
  }, KEEP_ALIVE_INTERVAL)
  port.onDisconnect.addListener((port) => {
    onDisconnect(port, keepAliveIntervalId)
  })
  port.onMessage.addListener(onMessage)
}

/**
 * Handles disconnection by clearing the keep-alive interval.
 *
 * @param {chrome.runtime.Port} port
 * @param {number} keepAliveIntervalId
 * @returns {void}
 */
function onDisconnect(port, keepAliveIntervalId) {
  clearInterval(keepAliveIntervalId)
}

/**
 * Handles message by using a discriminator field. Each message has a `type` field,
 * and the rest of the fields, and their meaning, depend on its value.
 *
 * https://crystal-lang.org/api/master/JSON/Serializable.html#discriminator-field
 *
 * @param {object} message
 * @param {chrome.runtime.Port} port
 * @returns {void}
 */
function onMessage(message, port) {
  switch (message.type) {
    case 'saveOptions':
      saveOptions(message.partialOptions)
      break

    case 'resetOptions':
      resetOptions()
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

export default { getDefaults, onConnect }
