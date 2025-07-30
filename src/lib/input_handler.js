/**
 * @typedef {object} MappableCommand
 * @property {string} name
 * @property {(keyboardEvent: KeyboardEvent) => void} fun
 *
 * @typedef {object} KeyboardMapping
 * @property {Keypress} key
 * @property {string} command
 */

/**
 * This class provides the functionality to handle keyboard shortcuts.
 */
class InputHandler {
  /**
   * A map of action names to their corresponding functions.
   *
   * @type {Map<string, (keyboardEvent: KeyboardEvent) => void>}
   */
  actions = new Map

  /**
   * A keymap that maps key combinations to action names.
   *
   * @type {Keymap<symbol, string>}
   */
  keymap = new Keymap

  /**
   * Creates a new input handler for the given element.
   *
   * @param {HTMLElement} eventTarget
   */
  constructor(eventTarget) {
    this.eventTarget = eventTarget
  }

  /**
   * Starts listening for keyboard events.
   *
   * @returns {void}
   */
  start() {
    this.eventTarget.addEventListener('keydown', this.onKeyDown, {
      capture: true,
      passive: false,
    })
  }

  /**
   * Stops listening for keyboard events.
   *
   * @returns {void}
   */
  stop() {
    this.eventTarget.removeEventListener('keydown', this.onKeyDown, {
      capture: true,
      passive: false,
    })
  }

  /**
   * Handles keyboard shortcuts.
   *
   * @param {KeyboardEvent} keyboardEvent
   * @returns {void}
   */
  onKeyDown = (keyboardEvent) => {
    if (
      keyboardEvent.isTrusted &&
      this.keymap.has(keyboardEvent)
    ) {
      suppressEvent(keyboardEvent)
      const actionName = this.keymap.get(keyboardEvent)
      if (this.actions.has(actionName)) {
        this.actions.get(actionName)(keyboardEvent)
      }
    }
  }

  /**
   * Handles state syncing.
   *
   * @param {object} properties
   * @param {MappableCommand[]} properties.actions
   * @param {KeyboardMapping[]} properties.shortcuts
   * @returns {void}
   */
  onStateSync({
    actions,
    shortcuts,
  }) {
    this.actions.clear()
    for (const { name, fun } of actions) {
      this.actions.set(name, fun)
    }
    this.keymap.clear()
    for (const { key, command } of shortcuts) {
      this.keymap.set(key, command)
    }
  }
}

/**
 * Prevents the browser’s default handling of the event and stops propagation.
 *
 * @param {Event} event
 * @returns {void}
 */
function suppressEvent(event) {
  event.preventDefault()
  event.stopImmediatePropagation()
}
