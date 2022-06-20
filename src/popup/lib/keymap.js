// This module defines a custom `Map` object for accessing elements from a keyboard event.
//
// Map: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
// KeyboardEvent: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent

class Keymap extends Map {
  // Returns the key sequence from a keyboard event.
  // Its main use is for accessing the keymap.
  static getKeySequence({ctrlKey = false, altKey = false, shiftKey = false, metaKey = false, code}) {
    return Symbol.for([ctrlKey, altKey, shiftKey, metaKey, code])
  }

  get(keyboardEvent) {
    const key = Keymap.getKeySequence(keyboardEvent)
    return super.get(key)
  }

  set(keyboardEvent, value) {
    const key = Keymap.getKeySequence(keyboardEvent)
    return super.set(key, value)
  }

  has(keyboardEvent) {
    const key = Keymap.getKeySequence(keyboardEvent)
    return super.has(key)
  }
}

export default Keymap
