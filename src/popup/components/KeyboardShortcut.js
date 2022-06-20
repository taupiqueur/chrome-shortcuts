// This module defines a custom keyboard shortcut element.
// Implementation reference: https://github.com/lydell/LinkHints/blob/main/src/options/KeyboardShortcut.tsx

// Config for key display.
const keyDisplay = { ctrlKey: '⌃', altKey: '⌥', shiftKey: '⇧', metaKey: '⌘' }

// Keyboard mapping
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/Keyboard_API#keyboard_mapping
const keyboardLayoutMap = await navigator.keyboard.getLayoutMap()

const template = document.createElement('template')
template.innerHTML = `
  <kbd part="key">
    <slot name="ctrlKey"></slot>
    <slot name="altKey"></slot>
    <slot name="shiftKey"></slot>
    <slot name="metaKey"></slot>
    <slot name="code"></slot>
  </kbd>
`

// Define our custom keyboard shortcut element.
class KeyboardShortcut extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.append(template.content.cloneNode(true))
  }

  // We can now safely retrieve attributes.
  connectedCallback() {
    // Display keyboard shortcut.
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
    const keyValue = keyboardLayoutMap.get(this.dataset.code)
    const keyHint = keyValue ? `“${keyValue}” on your keyboard.` : `No value found for “${this.dataset.code}”.`
    this.addKey('code', keyHint, this.dataset.code)
  }

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
