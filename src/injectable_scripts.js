// This module contains “content script” functions that run in the context of web pages.
//
// NOTE: The function’s body must be self-contained.
//
// Content scripts: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts

/**
 * Simulates a mouse click on selected page element.
 * If there’s no element matching *selectors*, the method throws an error.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/click
 *
 * @param {string} selectors
 * @returns {void}
 */
export function clickPageElement(selectors) {
  document.querySelector(selectors).click()
}

/**
 * Focuses selected page element.
 * If there’s no element matching *selectors*, the method throws an error.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus
 *
 * @param {string} selectors
 * @returns {void}
 */
export function focusPageElement(selectors) {
  document.querySelector(selectors).focus()
}

/**
 * Blurs the active element.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/blur
 *
 * @returns {void}
 */
export function blurActiveElement() {
  document.activeElement.blur()
}

/**
 * Writes the specified text to the system clipboard.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
 *
 * @param {string} text
 * @returns {Promise<void>}
 */
export async function writeTextToClipboard(text) {
  await navigator.clipboard.writeText(text)
}

/**
 * Returns selected text, if any.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/getSelection
 *
 * @returns {Promise<?string>}
 */
export async function getSelectedText() {
  const selection = window.getSelection()

  switch (selection.type) {
    case 'None':
    case 'Caret':
      return null

    case 'Range':
      return selection.toString()
  }
}

/**
 * Scrolls the document by the given amount.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollBy
 *
 * @param {number} deltaX
 * @param {number} deltaY
 * @returns {void}
 */
export function scrollBy(deltaX, deltaY) {
  const SCROLLABLE_OVERFLOW_VALUES = new Set([
    'auto',
    'scroll'
  ])

  let scrollingElement = document.activeElement

  const selection = window.getSelection()

  switch (selection.type) {
    case 'Caret':
    case 'Range':
      scrollingElement = selection.focusNode.parentElement
      break
  }

  while (scrollingElement instanceof HTMLElement) {
    const computedStyle = window.getComputedStyle(scrollingElement)

    const isHorizontallyScrollable =
      scrollingElement.scrollWidth > scrollingElement.clientWidth &&
      SCROLLABLE_OVERFLOW_VALUES.has(
        computedStyle.overflowX
      )

    const isVerticallyScrollable =
      scrollingElement.scrollHeight > scrollingElement.clientHeight &&
      SCROLLABLE_OVERFLOW_VALUES.has(
        computedStyle.overflowY
      )

    if (
      deltaX !== 0 && isHorizontallyScrollable ||
      deltaY !== 0 && isVerticallyScrollable
    ) {
      break
    }

    scrollingElement = scrollingElement.parentElement
  }

  scrollingElement ||= document.scrollingElement

  scrollingElement.scrollBy(deltaX, deltaY)
}

/**
 * Scrolls the document by the specified number of pages.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollByPages
 *
 * @param {number} pageFactor
 * @returns {void}
 */
export function scrollByPages(pageFactor) {
  const SCROLLABLE_OVERFLOW_VALUES = new Set([
    'auto',
    'scroll'
  ])

  let scrollingElement = document.activeElement

  const selection = window.getSelection()

  switch (selection.type) {
    case 'Caret':
    case 'Range':
      scrollingElement = selection.focusNode.parentElement
      break
  }

  while (scrollingElement instanceof HTMLElement) {
    const computedStyle = window.getComputedStyle(scrollingElement)

    const isScrollable =
      scrollingElement.scrollHeight > scrollingElement.clientHeight &&
      SCROLLABLE_OVERFLOW_VALUES.has(
        computedStyle.overflowY
      )

    if (isScrollable) {
      break
    }

    scrollingElement = scrollingElement.parentElement
  }

  scrollingElement ||= document.scrollingElement

  scrollingElement.scrollBy(0, window.innerHeight * pageFactor)
}

/**
 * Scrolls the document to the specified coordinates.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTo
 *
 * @param {number} scrollLeft
 * @param {number} scrollTop
 * @returns {void}
 */
export function scrollTo(scrollLeft, scrollTop) {
  const SCROLLABLE_OVERFLOW_VALUES = new Set([
    'auto',
    'scroll'
  ])

  let scrollingElement = document.activeElement

  const selection = window.getSelection()

  switch (selection.type) {
    case 'Caret':
    case 'Range':
      scrollingElement = selection.focusNode.parentElement
      break
  }

  while (scrollingElement instanceof HTMLElement) {
    const computedStyle = window.getComputedStyle(scrollingElement)

    const isHorizontallyScrollable =
      scrollingElement.scrollWidth > scrollingElement.clientWidth &&
      SCROLLABLE_OVERFLOW_VALUES.has(
        computedStyle.overflowX
      )

    const isVerticallyScrollable =
      scrollingElement.scrollHeight > scrollingElement.clientHeight &&
      SCROLLABLE_OVERFLOW_VALUES.has(
        computedStyle.overflowY
      )

    if (isHorizontallyScrollable || isVerticallyScrollable) {
      break
    }

    scrollingElement = scrollingElement.parentElement
  }

  scrollingElement ||= document.scrollingElement

  scrollingElement.scrollTo(scrollLeft, scrollTop)
}

/**
 * Scrolls the document to the maximum top and left scroll offset possible.
 *
 * - https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTopMax
 * - https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeftMax
 *
 * @param {number} [scrollLeft]
 * @param {number} [scrollTop]
 * @returns {void}
 */
export function scrollToMax(scrollLeft, scrollTop) {
  const SCROLLABLE_OVERFLOW_VALUES = new Set([
    'auto',
    'scroll'
  ])

  let scrollingElement = document.activeElement

  const selection = window.getSelection()

  switch (selection.type) {
    case 'Caret':
    case 'Range':
      scrollingElement = selection.focusNode.parentElement
      break
  }

  while (scrollingElement instanceof HTMLElement) {
    const computedStyle = window.getComputedStyle(scrollingElement)

    const isHorizontallyScrollable =
      scrollingElement.scrollWidth > scrollingElement.clientWidth &&
      SCROLLABLE_OVERFLOW_VALUES.has(
        computedStyle.overflowX
      )

    const isVerticallyScrollable =
      scrollingElement.scrollHeight > scrollingElement.clientHeight &&
      SCROLLABLE_OVERFLOW_VALUES.has(
        computedStyle.overflowY
      )

    if (isHorizontallyScrollable || isVerticallyScrollable) {
      break
    }

    scrollingElement = scrollingElement.parentElement
  }

  scrollingElement ||= document.scrollingElement

  scrollingElement.scrollTo(
    scrollLeft ?? scrollingElement.scrollWidth,
    scrollTop ?? scrollingElement.scrollHeight
  )
}

/**
 * Returns the value that the user entered in a prompt, if any.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/prompt
 *
 * @param {string} message
 * @param {string} [defaultValue]
 * @returns {?string}
 */
export function prompt(message, defaultValue) {
  return window.prompt(message, defaultValue)
}
