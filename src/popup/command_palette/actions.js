// This module contains the palette actions.

/**
 * @typedef {object} PaletteActionContext
 * @property {HTMLElement} inputElement
 * @property {HTMLElement} menuElement
 * @property {HTMLElement} activeElement
 */

import MenuItem from '../components/MenuItem.js'

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
