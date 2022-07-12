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

// Scrolls the document by the given amount.
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollBy
export function scrollBy(...params) {
  return document.scrollingElement.scrollBy(...params)
}

// Scrolls the document by the specified number of pages.
// Reference—Non-standard: https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollByPages
export function scrollByPages({ top: pageFactor, behavior }) {
  return document.scrollingElement.scrollBy({ top: window.innerHeight * pageFactor, behavior })
}

// Scrolls the document to the specified coordinates.
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTo
export function scrollTo(...params) {
  return document.scrollingElement.scrollTo(...params)
}

// Scrolls the document to the maximum top and left scroll offset possible.
// Reference—Non-standard: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTopMax
// Reference—Non-standard: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeftMax
export function scrollToMax({ top = document.scrollingElement.scrollHeight, left = document.scrollingElement.scrollWidth, behavior }) {
  return document.scrollingElement.scrollTo({ top, left, behavior })
}
