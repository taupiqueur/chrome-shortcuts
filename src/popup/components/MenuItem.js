// This module defines a custom menu item element.
// Defining a Menu in XML: https://developer.android.com/guide/topics/ui/menus#xml

import KeyboardShortcut from './KeyboardShortcut.js'

const templateElement = document.createElement('template')

templateElement.innerHTML = `
  <li part="item">
    <button part="button">
      <span part="description">
        <slot></slot>
      </span>
      <span part="shortcuts">
        <slot name="shortcut"></slot>
      </span>
    </button>
  </li>
`

/**
 * @extends {HTMLElement}
 */
class MenuItem extends HTMLElement {
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
  }

  /**
   * Adds keyboard shortcut.
   *
   * @param {KeyboardEvent} keyboardEvent
   * @returns {void}
   */
  addKeyboardShortcut(keyboardEvent) {
    const keyboardShortcutElement = document.createElement('keyboard-shortcut')
    keyboardShortcutElement.slot = 'shortcut'
    Object.assign(keyboardShortcutElement.dataset, keyboardEvent)
    this.append(keyboardShortcutElement)
    this.parentElement.addKeyboardShortcut(keyboardEvent, this)
  }
}

customElements.define('menu-item', MenuItem)

export default MenuItem
