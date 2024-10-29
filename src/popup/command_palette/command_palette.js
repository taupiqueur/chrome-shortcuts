// This module contains the code to interpret the “popup.html” command palette.

/**
 * @typedef {object} PaletteRenderContext
 * @property {chrome.runtime.Port} port
 * @property {KeyboardMapping[]} paletteBindings
 * @property {HTMLElement} paletteInputElement
 * @property {HTMLElement} paletteMenuElement
 * @property {HTMLElement} menuElement
 * @property {HTMLElement} menuItemElements
 * @property {HTMLElement} mainElement
 */

import * as paletteActions from './actions.js'
import Keymap from '../lib/keymap.js'
import StringMatcher from './lib/string_matcher.js'
import MenuItem from '../components/MenuItem.js'

const INPUT_DEBOUNCE_DELAY = 50
const MAX_CANDIDATE_RESULTS = 25

/**
 * @type {Keymap<KeyboardEvent, string>}
 */
const inputKeymap = new Keymap

/**
 * Handles the command palette rendering.
 *
 * @param {PaletteRenderContext} cx
 * @returns {void}
 */
function render(cx) {
  for (const { key, command } of cx.paletteBindings) {
    inputKeymap.set(key, command)
  }

  cx.paletteInputElement.addEventListener('focus', (focusEvent) => {
    onFocus(focusEvent, cx)
  }, {
    once: true
  })

  cx.paletteInputElement.addEventListener('input', debounce((inputEvent) => {
    onInput(inputEvent, cx)
  }, INPUT_DEBOUNCE_DELAY))

  cx.paletteMenuElement.addEventListener('pointerover', (pointerEvent) => {
    onPointerOver(pointerEvent, cx)
  })

  cx.paletteInputElement.addEventListener('keydown', (keyboardEvent) => {
    onKeyDown(keyboardEvent, cx)
  })
}

/**
 * Handles focus event, when the command palette has been activated.
 *
 * @param {FocusEvent} focusEvent
 * @param {PaletteRenderContext} cx
 * @returns {void}
 */
function onFocus(focusEvent, cx) {
  cx.port.postMessage({
    type: 'suggestionSyncRequest'
  })
}

/**
 * Handles input change.
 *
 * @param {InputEvent} inputEvent
 * @param {PaletteRenderContext} cx
 * @returns {void}
 */
function onInput(inputEvent, cx) {
  const candidates = Array.from(cx.menuItemElements, (menuItemElement, index) => ({
    id: index,
    string: menuItemElement.description
  }))
  updateMatches(inputEvent.target.value, candidates, cx)
}

/**
 * Updates matches.
 *
 * @param {string} query
 * @param {{ id: number, string: string }[]} candidates
 * @param {PaletteRenderContext} cx
 * @returns {void}
 */
function updateMatches(query, candidates, cx) {
  if (query === '') {
    cx.paletteMenuElement.setAttribute('hidden', '')
    cx.paletteMenuElement.clearMenuItems()
  } else {
    const string_matcher = new StringMatcher(query)
    const filteredCandidates = Iterator.from(candidates)
      .filter((candidate) =>
        string_matcher.matches(candidate.string)
      )
      .take(MAX_CANDIDATE_RESULTS)
      .toArray()
    if (filteredCandidates.length > 0) {
      const menuItemElements = filteredCandidates.map((candidate) => {
        const commandElement = cx.menuItemElements[candidate.id]
        const menuItemElement = commandElement.cloneNode(true)
        menuItemElement.addEventListener('click', commandElement.onclick)
        menuItemElement.addEventListener('auxclick', commandElement.onauxclick)
        return menuItemElement
      })
      menuItemElements[0].classList.add('active')
      cx.paletteMenuElement.removeAttribute('hidden')
      cx.paletteMenuElement.replaceMenuItems(menuItemElements)
      cx.paletteMenuElement.scrollIntoView({
        behavior: 'instant',
        block: 'start',
        inline: 'start'
      })
    } else {
      const menuItemElement = document.createElement('menu-item')
      menuItemElement.setAttribute('disabled', '')
      menuItemElement.textContent = 'No results found'

      cx.paletteMenuElement.removeAttribute('hidden')
      cx.paletteMenuElement.replaceMenuItems([menuItemElement])
      cx.paletteMenuElement.scrollIntoView({
        behavior: 'instant',
        block: 'start',
        inline: 'start'
      })
    }
  }
}

/**
 * Handles mouse pointer hovering.
 *
 * @param {PointerEvent} pointerEvent
 * @param {PaletteRenderContext} cx
 * @returns {void}
 */
function onPointerOver(pointerEvent, cx) {
  const menuItemElement = pointerEvent.target.closest('menu-item')
  if (
    menuItemElement &&
    !menuItemElement.classList.contains('active')
  ) {
    const activeMenuItemElement = cx.paletteMenuElement.querySelector('menu-item.active')
    activeMenuItemElement.classList.remove('active')
    menuItemElement.classList.add('active')
  }
}

/**
 * Handles keyboard shortcuts.
 *
 * @param {KeyboardEvent} keyboardEvent
 * @param {PaletteRenderContext} cx
 * @returns {void}
 */
function onKeyDown(keyboardEvent, cx) {
  if (inputKeymap.has(keyboardEvent)) {
    const actionName = inputKeymap.get(keyboardEvent)
    if (actionName in paletteActions) {
      paletteActions[actionName]({
        paletteInputElement: cx.paletteInputElement,
        paletteMenuElement: cx.paletteMenuElement,
        menuElement: cx.menuElement,
        mainElement: cx.mainElement,
      })
    }
    keyboardEvent.preventDefault()
    keyboardEvent.stopImmediatePropagation()
  }
}

/**
 * Debounces a function, delaying its execution until after a specified delay.
 *
 * @param {function} callback
 * @param {number} delay
 * @returns {function}
 */
function debounce(callback, delay) {
  let timeoutId
  return (...params) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      callback(...params)
    }, delay)
  }
}

export default { render }
