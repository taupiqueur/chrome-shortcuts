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

    this.slotElements = this.shadowRoot.querySelectorAll('slot')
  }

  connectedCallback() {
    for (const slotElement of this.slotElements) {
      for (const slottedElement of slotElement.assignedElements()) {
        slottedElement.remove()
      }
    }

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

    this.addKey('code', null, this.dataset.code)
  }

  /**
   * Adds key with specified *label* and *content* to slot.
   *
   * @param {"ctrlKey" | "altKey" | "shiftKey" | "metaKey" | "code"} slot
   * @param {?string} label
   * @param {string} content
   * @returns {void}
   */
  addKey(slot, label, content) {
    const keyElement = document.createElement('kbd')
    keyElement.slot = slot
    keyElement.ariaLabel = label
    keyElement.textContent = content
    this.append(keyElement)
  }
}

customElements.define('keyboard-shortcut', KeyboardShortcut)

export default KeyboardShortcut
