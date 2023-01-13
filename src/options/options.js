// This module contains the Options page actions to manage settings.
// Implementation reference: https://github.com/lydell/LinkHints/blob/main/src/options/Program.tsx

const buttonElements = document.querySelectorAll('button')

// Open a channel to communicate with the service worker.
const port = chrome.runtime.connect({ name: 'options' })

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
      console.error(`Unknown action: ${actionName}`)
  }
}

// Sends a single message to the service worker.
function sendMessage(message) {
  port.postMessage(message)
}

// Gets options.
async function getOptions() {
  return chrome.storage.sync.get()
}

// Saves options.
function saveOptions(partialOptions) {
  sendMessage({
    type: 'saveOptions',
    partialOptions
  })
}

// Resets options.
function resetOptions() {
  sendMessage({
    type: 'resetOptions'
  })
}

// Imports options.
async function importOptions() {
  const configFile = await selectFile('application/json')
  const newOptions = await readFileAsJSON(configFile)
  saveOptions(newOptions)
}

// Exports options.
async function exportOptions() {
  const options = await getOptions()
  const content = JSON.stringify(options, null, 2)
  const dateString = getISODateString(new Date)
  saveFile(content, `shortcuts-options-${dateString}.json`, 'application/json')
}

// Saves file.
function saveFile(content, fileName, contentType) {
  const anchorElement = document.createElement('a')
  const file = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(file)
  anchorElement.href = url
  anchorElement.download = fileName
  anchorElement.click()
  URL.revokeObjectURL(url)
}

// Selects file.
async function selectFile(accept) {
  return new Promise((resolve) => {
    const inputElement = document.createElement('input')
    inputElement.type = 'file'
    inputElement.accept = accept
    inputElement.addEventListener('change', (event) => resolve(inputElement.files.item(0)))
    inputElement.click()
  })
}

// Reads file as JSON.
async function readFileAsJSON(file) {
  return new Response(file).json()
}

// Returns the ISO date portion of the specified date.
// Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleDateString
function getISODateString(date) {
  return date.toLocaleDateString('en-CA')
}
