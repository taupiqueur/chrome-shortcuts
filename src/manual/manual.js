// This module contains the code to interpret the “manual.html” buttons and links,
// and documenting physical keys.

const MIDDLE_MOUSE_BUTTON = 1

const buttonElements = document.querySelectorAll('button')
const chromeLinkElements = document.querySelectorAll('a[href^="chrome:"]')
const keyCodeElements = document.querySelectorAll('kbd.code')

const keyboardLayoutMap = await navigator.keyboard.getLayoutMap()

const port = chrome.runtime.connect({
  name: 'manual'
})

for (const buttonElement of buttonElements) {
  const actionName = buttonElement.dataset.action

  switch (actionName) {
    case 'copyToClipboard':
      buttonElement.addEventListener('click', () => {
        navigator.clipboard
          .writeText(buttonElement.value)
          .then(() => {
            buttonElement.textContent = buttonElement.dataset.copyFeedback
            setTimeout(() => {
              buttonElement.textContent = buttonElement.ariaLabel
            }, 1000)
          })
      })
      break

    default:
      console.error(
        'Unknown action: "%s"',
        actionName
      )
  }
}

for (const chromeLinkElement of chromeLinkElements) {
  chromeLinkElement.addEventListener('click', (pointerEvent) => {
    port.postMessage({
      type: 'openNewTab',
      url: chromeLinkElement.href
    })
    pointerEvent.preventDefault()
  })

  chromeLinkElement.addEventListener('auxclick', (pointerEvent) => {
    switch (pointerEvent.button) {
      case MIDDLE_MOUSE_BUTTON:
        port.postMessage({
          type: 'openNewTab',
          url: chromeLinkElement.href
        })
        pointerEvent.preventDefault()
        break
    }
  })
}

for (const keyElement of keyCodeElements) {
  const codeValue = keyElement.textContent
  if (keyboardLayoutMap.has(codeValue)) {
    const keyValue = keyboardLayoutMap.get(codeValue)
    keyElement.title = `“${keyValue}” on your keyboard.`
  } else {
    keyElement.title = `No value found for “${codeValue}”.`
  }
}
