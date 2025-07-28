/**
 * @typedef {object} Keypress
 * @property {boolean} ctrlKey
 * @property {boolean} altKey
 * @property {boolean} shiftKey
 * @property {boolean} metaKey
 * @property {string} code
 */

/**
 * This class provides a specialized map for associating values with unique keyboard combinations.
 *
 * @template Value
 * @extends {Map<symbol, Value>}
 */
class Keymap extends Map {
  /**
   * Retrieves the value associated with a given key combination.
   *
   * @param {Keypress} keypress
   * @returns {?Value}
   */
  get(keypress) {
    return super.get(
      keySequence(
        keypress
      )
    )
  }

  /**
   * Sets a key combination to a specific value.
   *
   * @param {Keypress} keypress
   * @param {Value} value
   * @returns {Keymap}
   */
  set(keypress, value) {
    return super.set(
      keySequence(
        keypress
      ),
      value
    )
  }

  /**
   * Checks whether the keymap contains a binding for a given key combination.
   *
   * @param {Keypress} keypress
   * @returns {boolean}
   */
  has(keypress) {
    return super.has(
      keySequence(
        keypress
      )
    )
  }
}

/**
 * Generates a unique symbol for a given key combination.
 *
 * @param {Keypress} keypress
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
