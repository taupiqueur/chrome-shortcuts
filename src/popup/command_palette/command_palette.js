// This module contains the code to interpret the “popup.html” command palette.

/**
 * @typedef {object} PaletteRenderContext
 * @property {object} paletteBindings
 * @property {HTMLElement} paletteInputElement
 * @property {HTMLElement} paletteMenuElement
 * @property {HTMLElement} menuElement
 * @property {HTMLElement} menuItemElements
 */

import * as paletteActions from './actions.js'
import Keymap from '../lib/keymap.js'
import StringMatcher from './lib/string_matcher.js'
import MenuItem from '../components/MenuItem.js'

const PALETTE_ACTIONS = [
  'selectNextItem',
  'selectPreviousItem',
  'activateSelectedItem',
  'closeCommandPalette',
]

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
  for (const actionName of PALETTE_ACTIONS) {
    for (const keybinding of cx.paletteBindings[actionName]) {
      inputKeymap.set(keybinding, actionName)
    }
  }

  cx.paletteInputElement.addEventListener('input', (inputEvent) => {
    onInput(inputEvent, cx)
  })

  cx.paletteMenuElement.addEventListener('pointerover', (pointerEvent) => {
    onPointerOver(pointerEvent, cx)
  })

  cx.paletteInputElement.addEventListener('keydown', (keyboardEvent) => {
    onKeyDown(keyboardEvent, cx)
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
    const filteredCandidates = candidates.filter((candidate) =>
      string_matcher.matches(candidate.string)
    )
    if (filteredCandidates.length > 0) {
      const menuItemElements = filteredCandidates.map((candidate) => {
        const commandElement = cx.menuItemElements[candidate.id]
        const menuItemElement = commandElement.cloneNode(true)
        menuItemElement.addEventListener('click', () => {
          commandElement.focus()
          commandElement.click()
        })
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
  if (pointerEvent.target instanceof MenuItem) {
    const activeMenuItemElement = cx.paletteMenuElement.querySelector('menu-item.active')
    activeMenuItemElement.classList.remove('active')
    pointerEvent.target.classList.add('active')
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
    const activeMenuItemElement = cx.paletteMenuElement.querySelector('menu-item.active')
    const actionName = inputKeymap.get(keyboardEvent)
    paletteActions[actionName]({
      inputElement: cx.paletteInputElement,
      menuElement: cx.menuElement,
      activeElement: activeMenuItemElement,
    })
    keyboardEvent.preventDefault()
  }
}

export default { render }
