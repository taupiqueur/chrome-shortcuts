// This module contains the content script that runs in the context of web pages.
//
// Its main use is to share functions with injectable scripts.
//
// Content scripts: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts

const SCROLLABLE_OVERFLOW_VALUES = new Set([
  'visible',
  'scroll',
  'auto'
])

const PAGE_ACTIONS = [
  { name: 'openPopup', fun: openPopup },
  { name: 'sendEscapeKey', fun: sendEscapeKey },
]

const scroller = new Scroller

const inputHandler = new InputHandler(
  window
)

chrome.runtime.onMessage.addListener((message, sender) => {
  switch (message.type) {
    case 'stateSync':
      inputHandler.onStateSync({
        actions: PAGE_ACTIONS,
        shortcuts: message.pageBindings,
      })
      break
  }
})

chrome.runtime.sendMessage({
  type: 'contentScriptAdded'
})

inputHandler.start()

/**
 * Opens the extension’s popup.
 *
 * @param {KeyboardEvent} keyboardEvent
 * @returns {void}
 */
function openPopup(keyboardEvent) {
  chrome.runtime.sendMessage({
    type: 'openPopup'
  })
}

/**
 * Simulates pressing the `Escape` key.
 *
 * @param {KeyboardEvent} keyboardEvent
 * @returns {void}
 */
function sendEscapeKey(keyboardEvent) {
  keyboardEvent.target.dispatchEvent(
    new KeyboardEvent('keydown', {
      code: 'Escape',
      key: 'Escape',
      keyCode: 27,
      bubbles: true,
      cancelable: true,
      composed: true,
      view: window,
    })
  )
}

/**
 * Returns the element within the DOM—including “open” shadow roots—that currently has focus.
 *
 * https://github.com/lydell/LinkHints/blob/main/src/worker/ElementManager.ts
 *
 * @param {Document | ShadowRoot} documentOrShadowRoot
 * @returns {?HTMLElement}
 */
function getActiveElement(documentOrShadowRoot) {
  const { activeElement } = documentOrShadowRoot

  if (activeElement === null) {
    return null
  }

  const { shadowRoot } = activeElement

  return (
    shadowRoot &&
    // Unusual, but still can happen.
    shadowRoot.activeElement !== null
  )
    ? getActiveElement(shadowRoot)
    : activeElement
}

/**
 * Returns an iterator for the elements within the DOM—including “open” shadow roots.
 *
 * https://github.com/lydell/LinkHints/blob/main/src/worker/ElementManager.ts
 *
 * @param {Document | ShadowRoot} documentOrShadowRoot
 * @returns {Iterable<HTMLElement>}
 */
function* getAllElements(documentOrShadowRoot) {
  const childElements = documentOrShadowRoot.querySelectorAll('*')

  for (const childElement of childElements) {
    yield childElement

    const { shadowRoot } = childElement

    if (shadowRoot) {
      yield* getAllElements(shadowRoot)
    }
  }
}

/**
 * Returns whether the element is scrollable,
 * either horizontally or vertically.
 *
 * @param {HTMLElement} scrollingElement
 * @returns {boolean}
 */
function isScrollable(scrollingElement) {
  const computedStyle = window.getComputedStyle(scrollingElement)

  return (
    scrollingElement.scrollWidth > scrollingElement.clientWidth &&
    SCROLLABLE_OVERFLOW_VALUES.has(computedStyle.overflowX) ||
    scrollingElement.scrollHeight > scrollingElement.clientHeight &&
    SCROLLABLE_OVERFLOW_VALUES.has(computedStyle.overflowY)
  )
}

/**
 * Performs a scroll with the given scroll performer.
 *
 * @param {(scrollingElement: HTMLElement) => void} scrollPerformer
 * @returns {void}
 */
function performScroll(scrollPerformer) {
  let scrollingElement = getActiveElement(document) ?? document.scrollingElement

  while (scrollingElement instanceof HTMLElement) {
    if (isScrollable(scrollingElement)) {
      const { scrollLeft, scrollTop } = scrollingElement

      scrollPerformer(scrollingElement)
      if (
        scrollingElement.scrollLeft !== scrollLeft ||
        scrollingElement.scrollTop !== scrollTop
      ) {
        break
      }
    }
    scrollingElement = scrollingElement.parentElement
  }
}
