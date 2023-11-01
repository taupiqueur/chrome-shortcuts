// This module defines a custom keyboard shortcut element.
//
// See lydell’s work for reference:
// https://github.com/lydell/LinkHints/blob/main/src/options/KeyboardShortcut.tsx

// Config for key display.
const keyDisplay = {
  ctrlKey: '⌃',
  altKey: '⌥',
  shiftKey: '⇧',
  metaKey: '⌘'
}

// Keyboard mapping
// https://developer.mozilla.org/en-US/docs/Web/API/Keyboard_API#keyboard_mapping
const keyboardLayoutMap = await navigator.keyboard.getLayoutMap()

const templateElement = document.createElement('template')

templateElement.innerHTML = `
  <kbd part="key">
    <slot name="ctrlKey"></slot>
    <slot name="altKey"></slot>
    <slot name="shiftKey"></slot>
    <slot name="metaKey"></slot>
    <slot name="code"></slot>
  </kbd>
`

/**
 * @extends {HTMLElement}
 */
class KeyboardShortcut extends HTMLElement {
  constructor() {
    super()

    this.attachShadow({
      mode: 'open'
    })

    this.shadowRoot.append(
      templateElement.content.cloneNode(true)
    )
  }

  connectedCallback() {
    if (this.dataset.ctrlKey) {
      this.addKey('ctrlKey', 'Control', keyDisplay.ctrlKey)
    }

    if (this.dataset.altKey) {
      this.addKey('altKey', 'Alt', keyDisplay.altKey)
    }

    if (this.dataset.shiftKey) {
      this.addKey('shiftKey', 'Shift', keyDisplay.shiftKey)
    }

    if (this.dataset.metaKey) {
      this.addKey('metaKey', 'Meta', keyDisplay.metaKey)
    }

    const codeValue = this.dataset.code
    const keyValue = keyboardLayoutMap.get(codeValue)

    const keyHint = keyValue
      ? `“${keyValue}” on your keyboard.`
      : `No value found for “${codeValue}”.`

    this.addKey('code', keyHint, codeValue)
  }

  /**
   * Adds key with specified *title* and *content* to slot.
   *
   * @param {"ctrlKey" | "altKey" | "shiftKey" | "metaKey" | "code"} slot
   * @param {string} title
   * @param {string} content
   * @returns {void}
   */
  addKey(slot, title, content) {
    const keyElement = document.createElement('kbd')
    keyElement.slot = slot
    keyElement.title = title
    keyElement.textContent = content
    this.append(keyElement)
  }
}

customElements.define('keyboard-shortcut', KeyboardShortcut)

export default KeyboardShortcut
