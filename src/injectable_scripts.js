// This module contains “content script” functions that run in the context of web pages.
//
// NOTE: The function’s body must be self-contained.
//
// Content scripts: https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts

/**
 * Simulates a mouse click on selected page element.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/click
 *
 * @param {string} selectors
 * @returns {void}
 */
export function clickPageElement(selectors) {
  for (const childElement of getAllElements(document)) {
    if (childElement.matches(selectors)) {
      childElement.click()
      break
    }
  }
}

/**
 * Cycles through matching page elements.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus
 *
 * @param {string} selectors
 * @returns {void}
 */
export function cyclePageElements(selectors) {
  const activeElement = getActiveElement(document)

  const elements = Array.from(getAllElements(document))
    .filter((element) =>
      element.matches(selectors) &&
      element.checkVisibility({
        opacityProperty: true,
        visibilityProperty: true,
        contentVisibilityAuto: true
      })
    )

  const nextElement = elements[
    (elements.indexOf(activeElement) + 1) % elements.length
  ]

  nextElement.focus()
}

/**
 * Blurs the active element.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/blur
 *
 * @returns {void}
 */
export function blurActiveElement() {
  const activeElement = getActiveElement(document)
  activeElement.blur()
}

/**
 * Reads the textual contents of the system clipboard.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/readText
 *
 * @returns {Promise<string>}
 */
export async function readTextFromClipboard() {
  return navigator.clipboard.readText()
}

/**
 * Writes the specified text to the system clipboard.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
 *
 * @param {string} text
 * @returns {Promise<true>}
 */
export async function writeTextToClipboard(text) {
  await navigator.clipboard.writeText(text)
  return true
}

/**
 * Returns selected text, if any.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/getSelection
 *
 * @returns {?string}
 */
export function getSelectedText() {
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
 * @param {object} scrollProperties
 * @param {number} scrollProperties.deltaX
 * @param {number} scrollProperties.deltaY
 * @param {number[]} scrollProperties.frameCalibration
 * @param {boolean} scrollProperties.cancelable
 * @returns {void}
 */
export function scrollBy({
  deltaX,
  deltaY,
  frameCalibration,
  cancelable,
}) {
  performScroll((scrollingElement) => {
    scroller.scrollBy({
      scrollingElement,
      deltaX,
      deltaY,
      frameCalibration,
      cancelable,
    })
  })
}

/**
 * Scrolls the document by the specified number of pages.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollByPages
 *
 * @param {object} scrollProperties
 * @param {number} scrollProperties.pageFactor
 * @param {number[]} scrollProperties.frameCalibration
 * @param {boolean} scrollProperties.cancelable
 * @returns {void}
 */
export function scrollByPages({
  pageFactor,
  frameCalibration,
  cancelable,
}) {
  performScroll((scrollingElement) => {
    scroller.scrollBy({
      scrollingElement,
      deltaX: 0,
      deltaY: window.innerHeight * pageFactor,
      frameCalibration,
      cancelable,
    })
  })
}

/**
 * Scrolls the document to the specified coordinates.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTo
 *
 * @param {object} scrollProperties
 * @param {number} scrollProperties.scrollLeft
 * @param {number} scrollProperties.scrollTop
 * @param {number[]} scrollProperties.frameCalibration
 * @param {boolean} scrollProperties.cancelable
 * @returns {void}
 */
export function scrollTo({
  scrollLeft,
  scrollTop,
  frameCalibration,
  cancelable,
}) {
  performScroll((scrollingElement) => {
    scroller.scrollTo({
      scrollingElement,
      scrollLeft,
      scrollTop,
      frameCalibration,
      cancelable,
    })
  })
}

/**
 * Scrolls the document to the maximum top and left scroll offset possible.
 *
 * - https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTopMax
 * - https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollLeftMax
 *
 * @param {object} scrollProperties
 * @param {number} [scrollProperties.scrollLeft]
 * @param {number} [scrollProperties.scrollTop]
 * @param {number[]} scrollProperties.frameCalibration
 * @param {boolean} scrollProperties.cancelable
 * @returns {void}
 */
export function scrollToMax({
  scrollLeft,
  scrollTop,
  frameCalibration,
  cancelable,
}) {
  performScroll((scrollingElement) => {
    scroller.scrollTo({
      scrollingElement,
      scrollLeft: scrollLeft ?? scrollingElement.scrollWidth,
      scrollTop: scrollTop ?? scrollingElement.scrollHeight,
      frameCalibration,
      cancelable,
    })
  })
}

/**
 * Cancels all cancelable animation frames.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame
 *
 * @returns {void}
 */
export function cancelAnimationFrames() {
  scroller.cancelAnimationFrames()
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

/**
 * Turns picture-in-picture mode on or off.
 *
 * Shortcuts will attempt to open the most relevant video on the page
 * into a picture-in-picture window, or will close it if already open.
 *
 * IMPORTANT: Entering picture-in-picture mode requires a user gesture.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Picture-in-Picture_API
 *
 * @returns {Promise<void>}
 */
export async function togglePictureInPicture() {
  if (document.pictureInPictureElement) {
    await document.exitPictureInPicture()
  } else {
    const videoElements = Array.from(
      getAllElements(document)
    )
      .filter((element) =>
        element.localName === 'video' &&
        element.readyState !== HTMLMediaElement.HAVE_NOTHING &&
        element.disablePictureInPicture === false &&
        element.checkVisibility({
          opacityProperty: true,
          visibilityProperty: true,
          contentVisibilityAuto: true,
        })
      )
      .sort((videoElement, otherVideoElement) =>
        videoElement.paused - otherVideoElement.paused ||
        videoElement.muted - otherVideoElement.muted
      )

    if (videoElements.length > 0) {
      const videoElement = videoElements[0]

      if (navigator.userActivation.isActive) {
        await videoElement.requestPictureInPicture()
        videoElement.addEventListener(
          'leavepictureinpicture',
          () => {
            if (!document.hasFocus()) {
              videoElement.pause()
            }
          },
          {
            once: true,
          },
        )
      } else {
        const buttonElement = document.createElement('button')
        buttonElement.textContent = chrome.i18n.getMessage(
          'enterPictureInPictureButtonLabel'
        )
        buttonElement.style.all = 'revert'
        buttonElement.style.position = 'fixed'
        buttonElement.style.zIndex = '2147483647'
        buttonElement.style.top = '50%'
        buttonElement.style.left = '50%'
        buttonElement.addEventListener('click', async () => {
          await videoElement.requestPictureInPicture()
          videoElement.addEventListener(
            'leavepictureinpicture',
            () => {
              if (!document.hasFocus()) {
                videoElement.pause()
              }
            },
            {
              once: true,
            },
          )
          buttonElement.remove()
        })
        buttonElement.addEventListener('focusout', () => {
          buttonElement.remove()
        })
        buttonElement.addEventListener('keydown', (keyboardEvent) => {
          switch (keyboardEvent.code) {
            case 'Escape':
              buttonElement.remove()
              break
          }
        })
        document.documentElement.append(
          buttonElement
        )
        buttonElement.focus({
          preventScroll: true,
        })
      }
    }
  }
}
