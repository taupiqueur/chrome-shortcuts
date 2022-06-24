// This module contains file utility functions.
// Implementation reference: https://github.com/lydell/LinkHints/blob/main/src/options/Program.tsx

// Saves file.
export async function saveFile(content, fileName, contentType) {
  const anchorElement = document.createElement('a')
  const file = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(file)
  anchorElement.href = url
  anchorElement.download = fileName
  anchorElement.click()
  URL.revokeObjectURL(url)
}

// Selects file.
export async function selectFile(accept) {
  return new Promise((resolve) => {
    const inputElement = document.createElement('input')
    inputElement.type = 'file'
    inputElement.accept = accept
    inputElement.addEventListener('change', (event) => resolve(inputElement.files.item(0)))
    inputElement.click()
  })
}

// Reads file as JSON.
export async function readFileAsJSON(file) {
  return new Response(file).json()
}
