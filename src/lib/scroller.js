/**
 * @typedef {object} AnimationFrameEntry
 * @property {number} animationFrameId
 * @property {boolean} cancelable
 */

/**
 * This class provides the functionality to scroll elements smoothly.
 *
 * Its main use is to work around the quirks of the smooth scroll behavior.
 */
class Scroller {
  /**
   * Creates a new scroller.
   */
  constructor() {
    /**
     * A hash map that stores HTML elements as keys and animation frame entries as values.
     *
     * @type {Map<HTMLElement, AnimationFrameEntry>}
     */
    this.animationFrameMap = new Map
  }

  /**
   * Scrolls the element by the given amount.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollBy
   *
   * @param {object} scrollProperties
   * @param {HTMLElement} scrollProperties.scrollingElement
   * @param {number} scrollProperties.deltaX
   * @param {number} scrollProperties.deltaY
   * @param {number[]} scrollProperties.frameCalibration
   * @param {boolean} scrollProperties.cancelable
   * @returns {void}
   */
  scrollBy({
    scrollingElement,
    deltaX,
    deltaY,
    frameCalibration,
    cancelable,
  }) {
    if (this.animationFrameMap.has(scrollingElement)) {
      const animationFrameEntry = this.animationFrameMap.get(scrollingElement)
      window.cancelAnimationFrame(
        animationFrameEntry.animationFrameId
      )
    }

    // Initiate a new scroll in order to be detected by scroll performers.
    scrollingElement.scrollBy({
      left: Math.sign(deltaX),
      top: Math.sign(deltaY),
      behavior: 'instant'
    })

    /**
     * @param {number} frameCount
     * @param {number} frameLimit
     * @returns {void}
     */
    const scrollPerformer = (frameCount, frameLimit) => {
      if (frameCount < frameLimit) {
        const calibration = frameCalibration[frameCount]
        const { scrollLeft, scrollTop } = scrollingElement
        scrollingElement.scrollBy({
          left: Math.sign(deltaX) * Math.ceil(Math.abs(deltaX) * calibration),
          top: Math.sign(deltaY) * Math.ceil(Math.abs(deltaY) * calibration),
          behavior: 'instant'
        })
        if (
          scrollingElement.scrollLeft !== scrollLeft ||
          scrollingElement.scrollTop !== scrollTop
        ) {
          const animationFrameId = window.requestAnimationFrame(() => {
            scrollPerformer(frameCount + 1, frameLimit)
          })
          this.animationFrameMap.set(scrollingElement, {
            animationFrameId,
            cancelable,
          })
        } else {
          this.animationFrameMap.delete(scrollingElement)
        }
      } else {
        this.animationFrameMap.delete(scrollingElement)
      }
    }

    window.requestAnimationFrame(() => {
      scrollPerformer(0, frameCalibration.length)
    })
  }

  /**
   * Scrolls the element to the specified coordinates.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTo
   *
   * @param {object} scrollProperties
   * @param {HTMLElement} scrollProperties.scrollingElement
   * @param {number} scrollProperties.scrollLeft
   * @param {number} scrollProperties.scrollTop
   * @param {number[]} scrollProperties.frameCalibration
   * @param {boolean} scrollProperties.cancelable
   * @returns {void}
   */
  scrollTo({
    scrollingElement,
    scrollLeft,
    scrollTop,
    frameCalibration,
    cancelable,
  }) {
    this.scrollBy({
      scrollingElement,
      deltaX: scrollLeft - scrollingElement.scrollLeft,
      deltaY: scrollTop - scrollingElement.scrollTop,
      frameCalibration,
      cancelable,
    })
  }

  /**
   * Cancels all cancelable animation frames.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/Window/cancelAnimationFrame
   *
   * @returns {void}
   */
  cancelAnimationFrames() {
    for (const [scrollingElement, animationFrameEntry] of this.animationFrameMap) {
      if (animationFrameEntry.cancelable) {
        window.cancelAnimationFrame(
          animationFrameEntry.animationFrameId
        )
        this.animationFrameMap.delete(scrollingElement)
      }
    }
  }
}
