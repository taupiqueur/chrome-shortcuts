// This module contains the Options service worker to manage settings via messages.
//
// Options: https://developer.chrome.com/docs/extensions/mv3/options/
// Service workers: https://developer.chrome.com/docs/extensions/mv3/service_workers/

// Retrieve the popup config.
const popupConfigPromise = fetch('popup/config.json').then(response => response.json())

// Handles a new connection when opening the Options page.
function onConnect(port) {
  port.onMessage.addListener(onMessage)
}

// Handles message by using a discriminator field.
// Each message has a `type` field, and the rest of the fields, and their meaning, depend on its value.
// Reference: https://crystal-lang.org/api/master/JSON/Serializable.html#discriminator-field
function onMessage(message, port) {
  switch (message.type) {
    case 'saveOptions':
      saveOptions(message.partialOptions)
      break

    case 'resetOptions':
      resetOptions()
      break

    default:
      port.postMessage({ type: 'error', message: 'Unknown request' })
  }
}

// Saves options.
async function saveOptions(partialOptions) {
  await chrome.storage.sync.set(partialOptions)
}

// Resets options.
async function resetOptions() {
  const popupConfig = await popupConfigPromise
  await chrome.storage.sync.clear()
  await chrome.storage.sync.set({ popupConfig })
}

export default { onConnect }
