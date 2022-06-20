// This module contains the Options page actions to manage settings.
// Implementation reference: https://github.com/lydell/LinkHints/blob/main/src/options/Program.tsx

import { saveFile, selectFile, readFileAsJSON } from './lib/file.js'
import { getISODateString } from './lib/date.js'
import popupConfig from '../popup/config.json' assert { type: 'json' }

// Imports options.
export async function importOptions() {
  const file = await selectFile('application/json')
  const data = await readFileAsJSON(file)
  await chrome.storage.sync.set(data)
}

// Exports options.
export async function exportOptions() {
  const options = await chrome.storage.sync.get()
  const content = JSON.stringify(options, null, 2)
  const dateString = getISODateString(new Date())
  await saveFile(content, `shortcuts-options-${dateString}.json`, 'application/json')
}

// Resets options.
export async function resetOptions() {
  await chrome.storage.sync.clear()
  await chrome.storage.sync.set({ popupConfig })
}
