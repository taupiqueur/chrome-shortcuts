/**
 * This class defines a custom `Map` object for accessing elements from a keyboard event.
 *
 * - Map: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
 * - KeyboardEvent: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
 *
 * {@inheritDoc Map}
 *
 * @template Key,Value
 * @extends {Map<Key, Value>}
 */
class Keymap extends Map {
  /**
   * Returns the key sequence from a keyboard event.
   * Its main use is for accessing the keymap’s elements.
   *
   * @param {KeyboardEvent} keyboardEvent
   * @returns {symbol}
   */
  static getKeySequence({
    ctrlKey = false,
    altKey = false,
    shiftKey = false,
    metaKey = false,
    code
  }) {
    return Symbol.for([
      ctrlKey,
      altKey,
      shiftKey,
      metaKey,
      code
    ])
  }

  /**
   * @param {KeyboardEvent} keyboardEvent
   * @returns {Value}
   */
  get(keyboardEvent) {
    return super.get(
      Keymap.getKeySequence(keyboardEvent)
    )
  }

  /**
   * @param {KeyboardEvent} keyboardEvent
   * @param {Value} value
   * @returns {Keymap}
   */
  set(keyboardEvent, value) {
    return super.set(
      Keymap.getKeySequence(keyboardEvent),
      value
    )
  }

  /**
   * @param {KeyboardEvent} keyboardEvent
   * @returns {boolean}
   */
  has(keyboardEvent) {
    return super.has(
      Keymap.getKeySequence(keyboardEvent)
    )
  }
}

export default Keymap
