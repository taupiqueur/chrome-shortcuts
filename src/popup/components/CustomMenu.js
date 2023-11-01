// This module defines a custom menu element.
// Defining a Menu in XML: https://developer.android.com/guide/topics/ui/menus#xml

import Keymap from '../lib/keymap.js'

const templateElement = document.createElement('template')

templateElement.innerHTML = `
  <ul part="menu">
    <slot></slot>
  </ul>
`

/**
 * @extends {HTMLElement}
 */
class CustomMenu extends HTMLElement {
  constructor() {
    super()

    this.attachShadow({
      mode: 'open'
    })

    this.shadowRoot.append(
      templateElement.content.cloneNode(true)
    )

    /**
     * A value of “0” causes the element to be focusable.
     *
     * @type {number}
     */
    this.tabIndex = 0

    /**
     * @type {Keymap<KeyboardEvent, MenuItem>}
     */
    this.keymap = new Keymap

    // Handle keyboard shortcuts.
    this.addEventListener('keydown', this.onKeyDown)
  }

  /**
   * Adds keyboard shortcut.
   *
   * @param {KeyboardEvent} keyboardEvent
   * @param {MenuItem} menuItem
   * @returns {void}
   */
  addKeyboardShortcut(keyboardEvent, menuItem) {
    this.keymap.set(keyboardEvent, menuItem)
  }

  /**
   * Handles keyboard shortcuts.
   *
   * @param {KeyboardEvent} keyboardEvent
   * @returns {void}
   */
  onKeyDown(keyboardEvent) {
    if (this.keymap.has(keyboardEvent)) {
      const menuItem = this.keymap.get(keyboardEvent)
      menuItem.focus()
      menuItem.click()
      keyboardEvent.preventDefault()
    }
  }
}

customElements.define('custom-menu', CustomMenu)

export default CustomMenu
