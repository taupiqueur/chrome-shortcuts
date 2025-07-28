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

    this.slotElements = this.shadowRoot.querySelectorAll('slot')
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
   * The menu item description.
   *
   * @type {string}
   */
  get description() {
    return this.slotElements[0]
      .assignedNodes()
      .reduce((textContent, node) =>
        textContent.concat(node.textContent), ''
      )
  }

  /**
   * Adds keyboard shortcut.
   *
   * @param {Keypress} keypress
   * @returns {void}
   */
  addKeyboardShortcut(keypress) {
    const keyboardShortcutElement = document.createElement('keyboard-shortcut')
    keyboardShortcutElement.slot = 'shortcut'
    Object.assign(keyboardShortcutElement.dataset, keypress)
    this.append(keyboardShortcutElement)
    this.parentElement.addKeyboardShortcut(keypress, this)
  }
}

customElements.define('menu-item', MenuItem)

export default MenuItem
