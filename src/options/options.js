// This module contains the “Options” page actions to manage settings.
//
// See lydell’s work for reference:
// https://github.com/lydell/LinkHints/blob/main/src/options/Program.tsx

const buttonElements = document.querySelectorAll('button')
const inputElements = document.querySelectorAll('input')
const vimModeCheckbox = document.querySelector('input[type="checkbox"][data-action="enableVimMode"]')

// Open a channel to communicate with the service worker.
const port = chrome.runtime.connect({
  name: 'options'
})

port.onMessage.addListener((message) => {
  switch (message.type) {
    case 'stateSync':
      onStateSync(message.vimModeEnabled)
      break

    case 'keepAlive':
      break

    default:
      port.postMessage({
        type: 'error',
        message: 'Unknown request'
      })
  }
})

// Add action to buttons.
for (const buttonElement of buttonElements) {
  const actionName = buttonElement.dataset.action

  switch (actionName) {
    case 'importOptions':
      buttonElement.addEventListener('click', importOptions)
      break

    case 'exportOptions':
      buttonElement.addEventListener('click', exportOptions)
      break

    case 'resetOptions':
      buttonElement.addEventListener('click', resetOptions)
      break

    default:
      console.error(
        'Unknown action: "%s"',
        actionName
      )
  }
}

for (const inputElement of inputElements) {
  const actionName = inputElement.dataset.action

  switch (actionName) {
    case 'enableVimMode':
      inputElement.addEventListener('change', () => {
        if (inputElement.checked) {
          enableVimMode()
        } else {
          disableVimMode()
        }
      })
      break

    default:
      console.error(
        'Unknown action: "%s"',
        actionName
      )
  }
}

/**
 * Handles state syncing.
 *
 * @param {boolean} vimModeEnabled
 * @returns {void}
 */
function onStateSync(vimModeEnabled) {
  vimModeCheckbox.checked = vimModeEnabled
}

/**
 * Sends a single message to the service worker.
 *
 * @param {any} message
 * @returns {void}
 */
function sendMessage(message) {
  port.postMessage(message)
}

/**
 * Gets options.
 *
 * @returns {Promise<object>}
 */
async function getOptions() {
  return chrome.storage.sync.get()
}

/**
 * Saves options.
 *
 * @param {object} partialOptions
 * @returns {void}
 */
function saveOptions(partialOptions) {
  sendMessage({
    type: 'saveOptions',
    partialOptions
  })
}

/**
 * Resets options.
 *
 * @returns {void}
 */
function resetOptions() {
  sendMessage({
    type: 'resetOptions'
  })
}

/**
 * Enables Vim mode.
 *
 * @returns {void}
 */
function enableVimMode() {
  sendMessage({
    type: 'enableVimMode'
  })
}

/**
 * Disables Vim mode.
 *
 * @returns {void}
 */
function disableVimMode() {
  sendMessage({
    type: 'disableVimMode'
  })
}

/**
 * Imports options.
 *
 * @returns {Promise<void>}
 */
async function importOptions() {
  const configFile = await selectFile('application/json')
  const newOptions = await readFileAsJSON(configFile)
  saveOptions(newOptions)
}

/**
 * Exports options.
 *
 * @returns {Promise<void>}
 */
async function exportOptions() {
  const options = await getOptions()
  const content = JSON.stringify(options, null, 2)
  const dateString = getISODateString(new Date)
  saveFile(content, `shortcuts-options-${dateString}.json`, 'application/json')
}

/**
 * Saves file.
 *
 * @param {string} content
 * @param {string} fileName
 * @param {string} contentType
 * @returns {void}
 */
function saveFile(content, fileName, contentType) {
  const anchorElement = document.createElement('a')
  const file = new Blob([content], {
    type: contentType
  })
  const url = URL.createObjectURL(file)
  anchorElement.href = url
  anchorElement.download = fileName
  anchorElement.click()
  URL.revokeObjectURL(url)
}

/**
 * Selects file.
 *
 * @param {string} accept
 * @returns {Promise<File>}
 */
async function selectFile(accept) {
  return new Promise((resolve) => {
    const inputElement = document.createElement('input')
    inputElement.type = 'file'
    inputElement.accept = accept
    inputElement.addEventListener('change', () => {
      const fileList = inputElement.files
      if (fileList.length > 0) {
        resolve(fileList.item(0))
      }
    })
    inputElement.click()
  })
}

/**
 * Reads file as JSON.
 *
 * @param {File} file
 * @returns {Promise<any>}
 */
async function readFileAsJSON(file) {
  return new Response(file).json()
}

/**
 * Returns the ISO date portion of the specified date.
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
 *
 * @param {Date} date
 * @returns {string}
 */
function getISODateString(date) {
  return date.toLocaleDateString('en-CA')
}
