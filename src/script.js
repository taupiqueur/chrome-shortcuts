// This module contains content script functions that run in the context of web pages.
// Reference: https://developer.chrome.com/docs/extensions/mv3/content_scripts/

// Simulates a mouse click on selected page element, if any.
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/click
export function clickPageElement(selectors) {
  return document.querySelector(selectors).click()
}

// Focuses selected page element, if any.
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus
export function focusPageElement(selectors) {
  return document.querySelector(selectors).focus()
}

// Blurs the active element.
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/blur
export function blurActiveElement() {
  return document.activeElement.blur()
}

// Writes the specified text to the system clipboard.
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
export async function writeTextToClipboard(text) {
  return navigator.clipboard.writeText(text)
}

// Returns selected text.
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/Window/getSelection
export async function getSelectedText() {
  return window.getSelection().toString()
}

// Scrolls the document by the given amount.
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollBy
export function scrollBy(deltaX, deltaY) {
  // Import constants.
  const SCROLLABLE_OVERFLOW_VALUES = new Set(['auto', 'scroll'])
  // Find the first scrollable element.
  let scrollingElement = document.activeElement
  // Start from the point the user has clicked, if any.
  const selection = window.getSelection()
  if (selection.type !== 'None') {
    scrollingElement = selection.focusNode.parentElement
  }
  while (scrollingElement) {
    const computedStyle = getComputedStyle(scrollingElement)
    if (scrollingElement.scrollWidth > scrollingElement.clientWidth && SCROLLABLE_OVERFLOW_VALUES.has(computedStyle.overflowX)) {
      break
    }
    if (scrollingElement.scrollHeight > scrollingElement.clientHeight && SCROLLABLE_OVERFLOW_VALUES.has(computedStyle.overflowY)) {
      break
    }
    scrollingElement = scrollingElement.parentElement
  }
  scrollingElement ||= document.scrollingElement

  return scrollingElement.scrollBy(deltaX, deltaY)
}

// Scrolls the document by the specified number of pages.
// Reference—Non-standard: https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollByPages
export function scrollByPages(pageFactor) {
  // Import constants.
  const SCROLLABLE_OVERFLOW_VALUES = new Set(['auto', 'scroll'])
  // Find the first scrollable element.
  let scrollingElement = document.activeElement
  // Start from the point the user has clicked, if any.
  const selection = window.getSelection()
  if (selection.type !== 'None') {
    scrollingElement = selection.focusNode.parentElement
  }
  while (scrollingElement) {
    const computedStyle = getComputedStyle(scrollingElement)
    if (scrollingElement.scrollHeight > scrollingElement.clientHeight && SCROLLABLE_OVERFLOW_VALUES.has(computedStyle.overflowY)) {
      break
    }
    scrollingElement = scrollingElement.parentElement
  }
  scrollingElement ||= document.scrollingElement

  return scrollingElement.scrollBy(0, window.innerHeight * pageFactor)
}

// Scrolls the document to the specified coordinates.
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTo
export function scrollTo(scrollLeft, scrollTop) {
  // Import constants.
  const SCROLLABLE_OVERFLOW_VALUES = new Set(['auto', 'scroll'])
  // Find the first scrollable element.
  let scrollingElement = document.activeElement
  // Start from the point the user has clicked, if any.
  const selection = window.getSelection()
  if (selection.type !== 'None') {
    scrollingElement = selection.focusNode.parentElement
  }
  while (scrollingElement) {
    const computedStyle = getComputedStyle(scrollingElement)
    if (scrollingElement.scrollWidth > scrollingElement.clientWidth && SCROLLABLE_OVERFLOW_VALUES.has(computedStyle.overflowX)) {
      break
    }
    if (scrollingElement.scrollHeight > scrollingElement.clientHeight && SCROLLABLE_OVERFLOW_VALUES.has(computedStyle.overflowY)) {
      break
    }
    scrollingElement = scrollingElement.parentElement
  }
  scrollingElement ||= document.scrollingElement

  return scrollingElement.scrollTo(scrollLeft, scrollTop)
}

// Scrolls the document to the maximum top and left scroll offset possible.
// Reference—Non-standard: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTopMax
// Reference—Non-standard: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeftMax
export function scrollToMax(scrollLeft, scrollTop) {
  // Import constants.
  const SCROLLABLE_OVERFLOW_VALUES = new Set(['auto', 'scroll'])
  // Find the first scrollable element.
  let scrollingElement = document.activeElement
  // Start from the point the user has clicked, if any.
  const selection = window.getSelection()
  if (selection.type !== 'None') {
    scrollingElement = selection.focusNode.parentElement
  }
  while (scrollingElement) {
    const computedStyle = getComputedStyle(scrollingElement)
    if (scrollingElement.scrollWidth > scrollingElement.clientWidth && SCROLLABLE_OVERFLOW_VALUES.has(computedStyle.overflowX)) {
      break
    }
    if (scrollingElement.scrollHeight > scrollingElement.clientHeight && SCROLLABLE_OVERFLOW_VALUES.has(computedStyle.overflowY)) {
      break
    }
    scrollingElement = scrollingElement.parentElement
  }
  scrollingElement ||= document.scrollingElement

  return scrollingElement.scrollTo(scrollLeft ?? scrollingElement.scrollWidth, scrollTop ?? scrollingElement.scrollHeight)
}

// Returns the value that the user entered in a prompt, if any.
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt
export function prompt(message, defaultValue) {
  return window.prompt(message, defaultValue)
}
