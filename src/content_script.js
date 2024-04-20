// This module contains the content script that runs in the context of web pages.
//
// Its main use is to share functions with injectable scripts.
//
// Content scripts: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts

const scroller = new Scroller

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
 * Performs a scroll with the given scroll performer.
 *
 * @param {(scrollingElement: HTMLElement) => void} scrollPerformer
 * @returns {void}
 */
function performScroll(scrollPerformer) {
  let scrollingElement = getActiveElement(document) ?? document.scrollingElement

  while (scrollingElement instanceof HTMLElement) {
    const { scrollLeft, scrollTop } = scrollingElement

    scrollPerformer(scrollingElement)

    if (
      scrollingElement.scrollLeft !== scrollLeft ||
      scrollingElement.scrollTop !== scrollTop
    ) {
      break
    }

    scrollingElement = scrollingElement.parentElement
  }
}
