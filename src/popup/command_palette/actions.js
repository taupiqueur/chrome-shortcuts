// This module contains the palette actions.

/**
 * @typedef {object} PaletteActionContext
 * @property {HTMLElement} mainElement
 * @property {HTMLElement} inputElement
 * @property {HTMLElement} menuElement
 * @property {HTMLElement} activeElement
 */

import MenuItem from '../components/MenuItem.js'

const scroller = new Scroller

/**
 * Selects the next item.
 *
 * @param {PaletteActionContext} cx
 * @returns {void}
 */
export function selectNextItem(cx) {
  if (
    cx.activeElement instanceof MenuItem &&
    cx.activeElement.nextElementSibling instanceof MenuItem
  ) {
    cx.activeElement.classList.remove('active')
    cx.activeElement.nextElementSibling.classList.add('active')
    cx.activeElement.nextElementSibling.scrollIntoView({
      behavior: 'instant',
      block: 'nearest',
      inline: 'nearest'
    })
  }
}

/**
 * Selects the previous item.
 *
 * @param {PaletteActionContext} cx
 * @returns {void}
 */
export function selectPreviousItem(cx) {
  if (
    cx.activeElement instanceof MenuItem &&
    cx.activeElement.previousElementSibling instanceof MenuItem
  ) {
    cx.activeElement.classList.remove('active')
    cx.activeElement.previousElementSibling.classList.add('active')
    cx.activeElement.previousElementSibling.scrollIntoView({
      behavior: 'instant',
      block: 'nearest',
      inline: 'nearest'
    })
  }
}

/**
 * Activates selected item.
 *
 * @param {PaletteActionContext} cx
 * @returns {void}
 */
export function activateSelectedItem(cx) {
  if (cx.activeElement instanceof MenuItem) {
    cx.activeElement.click()
  }
}

/**
 * Moves page down.
 *
 * @param {PaletteActionContext} cx
 * @returns {void}
 */
export function movePageDown(cx) {
  scroller.scrollBy(
    cx.mainElement,
    0,
    window.innerHeight * 0.9
  )
}

/**
 * Moves page up.
 *
 * @param {PaletteActionContext} cx
 * @returns {void}
 */
export function movePageUp(cx) {
  scroller.scrollBy(
    cx.mainElement,
    0,
    window.innerHeight * -0.9
  )
}

/**
 * Closes the command palette.
 *
 * @param {PaletteActionContext} cx
 * @returns {void}
 */
export function closeCommandPalette(cx) {
  cx.inputElement.value = ''
  cx.inputElement.dispatchEvent(
    new InputEvent('input', {
      inputType: 'deleteContentBackward'
    })
  )
  cx.menuElement.focus({
    preventScroll: true
  })
}
