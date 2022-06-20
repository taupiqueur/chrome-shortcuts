// This module defines a custom menu item element.
// Defining a Menu in XML: https://developer.android.com/guide/topics/ui/menus#xml

import KeyboardShortcut from './KeyboardShortcut.js'

const template = document.createElement('template')
template.innerHTML = `
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

// Define our custom menu item.
class MenuItem extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.append(template.content.cloneNode(true))

    // Causes the element to be focusable.
    this.tabIndex = 0
  }

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
