/**
 * This class provides the functionality to scroll elements smoothly.
 *
 * Its main use is to work around the quirks of the smooth scroll behavior.
 */
class Scroller {
  static SHORT_THROW_FRAME_CALIBRATION = [0.2, 0.2, 0.2, 0.2, 0.2]
  static LONG_THROW_FRAME_CALIBRATION = [0.001, 0.002, 0.003, 0.004, 0.99]

  /**
   * Creates a new scroller.
   */
  constructor() {
    /**
     * A hash map that stores HTML elements as keys and animation request IDs as values.
     *
     * @type {Map<HTMLElement, number>}
     */
    this.animationFrameMap = new Map
  }

  /**
   * Scrolls the element by the given amount.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollBy
   *
   * @param {HTMLElement} scrollingElement
   * @param {number} deltaX
   * @param {number} deltaY
   * @returns {void}
   */
  scrollBy(scrollingElement, deltaX, deltaY) {
    const frameCalibration = (
      Math.abs(deltaX) > window.innerWidth ||
      Math.abs(deltaY) > window.innerHeight
    )
      ? Scroller.LONG_THROW_FRAME_CALIBRATION
      : Scroller.SHORT_THROW_FRAME_CALIBRATION

    if (this.animationFrameMap.has(scrollingElement)) {
      const animationFrame = this.animationFrameMap.get(scrollingElement)
      window.cancelAnimationFrame(animationFrame)
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
        scrollingElement.scrollBy({
          left: Math.sign(deltaX) * Math.ceil(Math.abs(deltaX) * calibration),
          top: Math.sign(deltaY) * Math.ceil(Math.abs(deltaY) * calibration),
          behavior: 'instant'
        })
        const animationFrame = window.requestAnimationFrame(() => {
          scrollPerformer(frameCount + 1, frameLimit)
        })
        this.animationFrameMap.set(scrollingElement, animationFrame)
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
   * @param {HTMLElement} scrollingElement
   * @param {number} scrollLeft
   * @param {number} scrollTop
   * @returns {void}
   */
  scrollTo(scrollingElement, scrollLeft, scrollTop) {
    this.scrollBy(
      scrollingElement,
      scrollLeft - scrollingElement.scrollLeft,
      scrollTop - scrollingElement.scrollTop
    )
  }
}
