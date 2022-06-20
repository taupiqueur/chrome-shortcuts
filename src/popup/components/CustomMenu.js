// This module defines a custom menu element.
// Defining a Menu in XML: https://developer.android.com/guide/topics/ui/menus#xml

import Keymap from '../lib/keymap.js'

const template = document.createElement('template')
template.innerHTML = `
  <ul part="menu">
    <slot></slot>
  </ul>
`

// Define our custom menu.
class CustomMenu extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.append(template.content.cloneNode(true))

    // Causes the element to be focusable.
    this.tabIndex = 0

    // Handle keyboard shortcuts.
    this.keymap = new Keymap
    this.addEventListener('keydown', this.handleKey)
  }

  addKeyboardShortcut(keyboardEvent, menuItem) {
    this.keymap.set(keyboardEvent, menuItem)
  }

  handleKey(keyboardEvent) {
    if (!this.keymap.has(keyboardEvent)) {
      return
    }
    const menuItem = this.keymap.get(keyboardEvent)
    menuItem.focus()
    menuItem.click()
    keyboardEvent.preventDefault()
  }
}

customElements.define('custom-menu', CustomMenu)

export default CustomMenu
