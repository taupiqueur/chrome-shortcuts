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
   * @param {KeyboardEvent} keyboardEvent
   * @returns {Value}
   */
  get(keyboardEvent) {
    return super.get(
      keySequence(
        keyboardEvent
      )
    )
  }

  /**
   * @param {KeyboardEvent} keyboardEvent
   * @param {Value} value
   * @returns {Keymap}
   */
  set(keyboardEvent, value) {
    return super.set(
      keySequence(
        keyboardEvent
      ),
      value
    )
  }

  /**
   * @param {KeyboardEvent} keyboardEvent
   * @returns {boolean}
   */
  has(keyboardEvent) {
    return super.has(
      keySequence(
        keyboardEvent
      )
    )
  }
}

/**
 * Returns the key sequence from a keyboard event.
 *
 * @param {KeyboardEvent} keyboardEvent
 * @returns {symbol}
 */
const keySequence = ({
  ctrlKey = false,
  altKey = false,
  shiftKey = false,
  metaKey = false,
  code
}) => Symbol.for([
  ctrlKey,
  altKey,
  shiftKey,
  metaKey,
  code
])

export default Keymap
