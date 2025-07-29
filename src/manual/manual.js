// This module contains the code to interpret the “manual.html” buttons and links,
// and documenting physical keys.

const MIDDLE_MOUSE_BUTTON = 1

const Modifier = {
  None: 0,
  Control: 1 << 0,
  Alt: 1 << 1,
  Shift: 1 << 2,
  Meta: 1 << 3,
}

const buttonElements = document.querySelectorAll('button[data-action]')
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
    const pointerEventModifiers = (
      (pointerEvent.ctrlKey ? Modifier.Control : Modifier.None) |
      (pointerEvent.altKey ? Modifier.Alt : Modifier.None) |
      (pointerEvent.shiftKey ? Modifier.Shift : Modifier.None) |
      (pointerEvent.metaKey ? Modifier.Meta : Modifier.None)
    )
    if (
      pointerEventModifiers === Modifier.Control ||
      pointerEventModifiers === Modifier.Meta
    ) {
      suppressEvent(pointerEvent)
      openNewBackgroundTab(chromeLinkElement.href)
    } else if (
      pointerEventModifiers === Modifier.None ||
      pointerEventModifiers === (Modifier.Control | Modifier.Shift) ||
      pointerEventModifiers === (Modifier.Shift | Modifier.Meta)
    ) {
      suppressEvent(pointerEvent)
      openNewForegroundTab(chromeLinkElement.href)
    } else if (
      pointerEventModifiers === Modifier.Shift
    ) {
      suppressEvent(pointerEvent)
      openNewWindow(chromeLinkElement.href)
    }
  })

  chromeLinkElement.addEventListener('auxclick', (pointerEvent) => {
    switch (pointerEvent.button) {
      case MIDDLE_MOUSE_BUTTON:
        suppressEvent(pointerEvent)
        openNewBackgroundTab(chromeLinkElement.href)
        break
    }
  })
}

for (const keyElement of keyCodeElements) {
  const codeValue = keyElement.textContent
  if (keyboardLayoutMap.has(codeValue)) {
    const keyValue = keyboardLayoutMap.get(codeValue)
    keyElement.replaceWith(
      createPopover(
        new Text(
          chrome.i18n.getMessage('keyCodeValuePopoverMessage', keyValue)
        ),
        keyElement
      )
    )
  } else {
    keyElement.replaceWith(
      createPopover(
        new Text(
          chrome.i18n.getMessage('noKeyCodeValuePopoverMessage', codeValue)
        ),
        keyElement
      )
    )
  }
}

/**
 * Adds a popover to the given element.
 * Display additional information when clicking on the element.
 *
 * @param {Node} content
 * @param {HTMLElement} element
 * @returns {HTMLElement}
 */
function createPopover(content, element) {
  const popoverElement = document.createElement('div')
  popoverElement.popover = 'auto'
  popoverElement.append(content)
  const buttonElement = document.createElement('button')
  buttonElement.popoverTargetElement = popoverElement
  buttonElement.append(
    element.cloneNode(true),
    popoverElement
  )
  return buttonElement
}

/**
 * Opens a new tab in background.
 *
 * @param {string} url
 * @returns {void}
 */
function openNewBackgroundTab(url) {
  port.postMessage({
    type: 'openNewBackgroundTab',
    url
  })
}

/**
 * Opens and activates a new tab.
 *
 * @param {string} url
 * @returns {void}
 */
function openNewForegroundTab(url) {
  port.postMessage({
    type: 'openNewForegroundTab',
    url
  })
}

/**
 * Opens a new window.
 *
 * @param {string} url
 * @returns {void}
 */
function openNewWindow(url) {
  port.postMessage({
    type: 'openNewWindow',
    url
  })
}

/**
 * Prevents the browser’s default handling of the event and stops propagation.
 *
 * @param {Event} event
 * @returns {void}
 */
function suppressEvent(event) {
  event.preventDefault()
  event.stopImmediatePropagation()
}
