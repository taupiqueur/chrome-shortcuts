// This module defines a custom menu element.
// Defining a Menu in XML: https://developer.android.com/guide/topics/ui/menus#xml

import Keymap from '../lib/keymap.js'

const templateElement = document.createElement('template')

templateElement.innerHTML = `
  <h6 part="name">
    <slot name="name">Menu Items</slot>
  </h6>
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

    this.slotElement = this.shadowRoot.querySelector('slot:not([name])')

    /**
     * @type {Keymap<symbol, MenuItem>}
     */
    this.keymap = new Keymap

    // Handle keyboard shortcuts.
    this.addEventListener('keydown', this.onKeyDown)
  }

  connectedCallback() {
    /**
     * A value of “0” causes the element to be focusable.
     *
     * @type {number}
     */
    this.tabIndex = 0
  }

  /**
   * Replaces menu items.
   *
   * @param {HTMLElement[]} menuItemElements
   * @returns {void}
   */
  replaceMenuItems(menuItemElements) {
    this.clearMenuItems()
    this.append(...menuItemElements)
  }

  /**
   * Clears menu items.
   *
   * @returns {void}
   */
  clearMenuItems() {
    for (const slottedElement of this.slotElement.assignedElements()) {
      slottedElement.remove()
    }
  }

  /**
   * Adds keyboard shortcut.
   *
   * @param {Keypress} keypress
   * @param {MenuItem} menuItem
   * @returns {void}
   */
  addKeyboardShortcut(keypress, menuItem) {
    this.keymap.set(keypress, menuItem)
  }

  /**
   * Handles keyboard shortcuts.
   *
   * @param {KeyboardEvent} keyboardEvent
   * @returns {void}
   */
  onKeyDown(keyboardEvent) {
    if (this.keymap.has(keyboardEvent)) {
      suppressEvent(keyboardEvent)
      const menuItem = this.keymap.get(keyboardEvent)
      menuItem.focus()
      menuItem.click()
    }
  }
}

/**
 * Prevents the browser’s default handling of the event and stops propagation.
 *
 * @param {Event} event
 * @returns {void}
 */
function suppressEvent(event) {
  event.preventDefault()
  event.stopImmediatePropagation()
}

customElements.define('custom-menu', CustomMenu)

export default CustomMenu
