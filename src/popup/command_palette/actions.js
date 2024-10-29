// This module contains the palette actions.

/**
 * @typedef {object} PaletteActionContext
 * @property {HTMLElement} paletteInputElement
 * @property {HTMLElement} paletteMenuElement
 * @property {HTMLElement} menuElement
 * @property {HTMLElement} mainElement
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
  const activeElement = cx.paletteMenuElement.querySelector(`
    menu-item.active
  `)

  if (
    activeElement instanceof MenuItem &&
    activeElement.nextElementSibling instanceof MenuItem
  ) {
    activeElement.classList.remove('active')
    activeElement.nextElementSibling.classList.add('active')
    activeElement.nextElementSibling.scrollIntoView({
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
  const activeElement = cx.paletteMenuElement.querySelector(`
    menu-item.active
  `)

  if (
    activeElement instanceof MenuItem &&
    activeElement.previousElementSibling instanceof MenuItem
  ) {
    activeElement.classList.remove('active')
    activeElement.previousElementSibling.classList.add('active')
    activeElement.previousElementSibling.scrollIntoView({
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
  const activeElement = cx.paletteMenuElement.querySelector(`
    menu-item.active
  `)

  if (activeElement instanceof MenuItem) {
    activeElement.click()
  }
}

/**
 * Opens selected item in a new background tab.
 *
 * @param {PaletteActionContext} cx
 * @returns {void}
 */
export function openSelectedItemInNewBackgroundTab(cx) {
  const activeElement = cx.paletteMenuElement.querySelector(`
    menu-item.active
  `)

  if (activeElement instanceof MenuItem) {
    activeElement.dispatchEvent(
      new PointerEvent('click', {
        ctrlKey: true,
        altKey: false,
        shiftKey: false,
        metaKey: false,
      })
    )
  }
}

/**
 * Opens selected item in a new foreground tab.
 *
 * @param {PaletteActionContext} cx
 * @returns {void}
 */
export function openSelectedItemInNewForegroundTab(cx) {
  const activeElement = cx.paletteMenuElement.querySelector(`
    menu-item.active
  `)

  if (activeElement instanceof MenuItem) {
    activeElement.dispatchEvent(
      new PointerEvent('click', {
        ctrlKey: true,
        altKey: false,
        shiftKey: true,
        metaKey: false,
      })
    )
  }
}

/**
 * Opens selected item in a new window.
 *
 * @param {PaletteActionContext} cx
 * @returns {void}
 */
export function openSelectedItemInNewWindow(cx) {
  const activeElement = cx.paletteMenuElement.querySelector(`
    menu-item.active
  `)

  if (activeElement instanceof MenuItem) {
    activeElement.dispatchEvent(
      new PointerEvent('click', {
        ctrlKey: false,
        altKey: false,
        shiftKey: true,
        metaKey: false,
      })
    )
  }
}

/**
 * Downloads selected item.
 *
 * @param {PaletteActionContext} cx
 * @returns {void}
 */
export function downloadSelectedItem(cx) {
  const activeElement = cx.paletteMenuElement.querySelector(`
    menu-item.active
  `)

  if (activeElement instanceof MenuItem) {
    activeElement.dispatchEvent(
      new PointerEvent('click', {
        ctrlKey: false,
        altKey: true,
        shiftKey: false,
        metaKey: false,
      })
    )
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
  cx.paletteInputElement.value = ''
  cx.paletteInputElement.dispatchEvent(
    new InputEvent('input', {
      inputType: 'deleteContentBackward'
    })
  )
  cx.menuElement.focus({
    preventScroll: true
  })
}
