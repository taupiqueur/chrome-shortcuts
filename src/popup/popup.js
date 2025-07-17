// This module contains the code to interpret the “popup.html” custom menu.

/**
 * @typedef {object} KeyboardMapping
 * @property {Shortcut} key
 * @property {string} command
 *
 * @typedef {object} Shortcut
 * @property {boolean} ctrlKey
 * @property {boolean} altKey
 * @property {boolean} shiftKey
 * @property {boolean} metaKey
 * @property {string} code
 */

import * as commands from './commands.js'
import commandPalette from './command_palette/command_palette.js'

import CustomMenu from './components/CustomMenu.js'
import MenuItem from './components/MenuItem.js'
import SuggestionItem from './components/SuggestionItem.js'

const MIDDLE_MOUSE_BUTTON = 1

const SCRIPTING_SELECTOR = '[data-permissions~="scripting"]'

const MODIFIER_KEYS = new Set([
  'Control',
  'Alt',
  'Shift',
  'Meta',
])

const Modifier = {
  None: 0,
  Control: 1 << 0,
  Alt: 1 << 1,
  Shift: 1 << 2,
  Meta: 1 << 3,
}

const mainElement = document.querySelector('main')
const paletteInputElement = document.getElementById('palette-input')
const paletteMenuElement = document.getElementById('palette-menu')
const menuElement = document.getElementById('menu-commands')
const menuItemElements = menuElement.getElementsByTagName('menu-item')
const browserExtensionsNotAllowedPopoverElement = document.getElementById('browser-extensions-not-allowed-popover')

const menuCommands = new Map(
  Array.from(menuItemElements, (menuItemElement) => [
    menuItemElement.dataset.command, menuItemElement
  ])
)

// Open a channel to communicate with the service worker.
const port = chrome.runtime.connect({
  name: 'popup'
})

// Listen for messages.
port.onMessage.addListener((message) => {
  switch (message.type) {
    case 'init':
      render({
        commandBindings: message.commandBindings,
        isEnabled: message.isEnabled,
      })
      commandPalette.render({
        port,
        paletteBindings: message.paletteBindings,
        paletteInputElement,
        paletteMenuElement,
        menuElement,
        menuItemElements,
        mainElement,
      })
      break

    case 'stateSync':
      onStateSync(message.command)
      break

    case 'suggestionSync':
      onSuggestionSync(message.suggestions, message.suggestionLabels)
      break

    case 'command':
      onCommand(message.command)
      break

    case 'keepAlive':
      break

    default:
      port.postMessage({
        type: 'error',
        message: 'Unknown request'
      })
  }
})

/**
 * Handles the popup rendering.
 *
 * @param {{ commandBindings: KeyboardMapping[], isEnabled: boolean }} options
 * @returns {void}
 */
function render({ commandBindings, isEnabled }) {
  const isDisabled = (menuItemElement) => (
    !isEnabled &&
    menuItemElement.matches(SCRIPTING_SELECTOR)
  )

  for (const { key, command } of commandBindings) {
    if (menuCommands.has(command)) {
      const menuItemElement = menuCommands.get(command)
      menuItemElement.addKeyboardShortcut(key)
    }
  }

  for (const [commandName, menuItemElement] of menuCommands) {
    if (isDisabled(menuItemElement)) {
      menuItemElement.setAttribute('disabled', '')
      menuItemElement.onclick = (pointerEvent) => {
        browserExtensionsNotAllowedPopoverElement.togglePopover()
        pointerEvent.preventDefault()
        pointerEvent.stopImmediatePropagation()
      }
    } else {
      menuItemElement.onclick = (pointerEvent) => {
        onCommand(commandName)
        pointerEvent.preventDefault()
        pointerEvent.stopImmediatePropagation()
      }
    }
  }

  browserExtensionsNotAllowedPopoverElement.addEventListener('keydown', (keyboardEvent) => {
    switch (keyboardEvent.code) {
      case 'Escape':
        browserExtensionsNotAllowedPopoverElement.hidePopover()
        keyboardEvent.preventDefault()
        keyboardEvent.stopImmediatePropagation()
        break
    }
  })

  menuElement.addEventListener('keyup', (keyboardEvent) => {
    if (!isModifierKey(keyboardEvent.key)) {
      port.postMessage({
        type: 'cancelAnimationFrameRequest'
      })
    }
  })

  if (!menuElement.contains(document.activeElement)) {
    menuElement.focus({
      preventScroll: true
    })
  }
}

/**
 * Handles state syncing.
 *
 * @param {string} commandName
 * @returns {void}
 */
function onStateSync(commandName) {
  if (menuCommands.has(commandName)) {
    menuCommands.get(commandName).focus()
  }
}

/**
 * Handles suggestion syncing.
 *
 * @param {Suggestion[]} suggestions
 * @param {Object<string, string>} suggestionLabels
 * @returns {void}
 */
function onSuggestionSync(suggestions, suggestionLabels) {
  const menuItemElements = suggestions.map((suggestion) => {
    const menuItemElement = document.createElement('menu-item')
    const suggestionElement = document.createElement('suggestion-item')
    suggestionElement.dataset.label = suggestionLabels[suggestion.type]
    suggestionElement.dataset.title = suggestion.title
    suggestionElement.dataset.domain = new URL(suggestion.url).hostname
    menuItemElement.onclick = (pointerEvent) => {
      const pointerEventModifiers = (
        (pointerEvent.ctrlKey ? Modifier.Control : Modifier.None) |
        (pointerEvent.altKey ? Modifier.Alt : Modifier.None) |
        (pointerEvent.shiftKey ? Modifier.Shift : Modifier.None) |
        (pointerEvent.metaKey ? Modifier.Meta : Modifier.None)
      )
      if (
        pointerEventModifiers === Modifier.Alt
      ) {
        open(suggestion.url)
        pointerEvent.preventDefault()
        pointerEvent.stopImmediatePropagation()
        window.close()
      } else if (
        pointerEventModifiers === Modifier.Control ||
        pointerEventModifiers === Modifier.Meta
      ) {
        openNewBackgroundTab(suggestion.url)
        pointerEvent.preventDefault()
        pointerEvent.stopImmediatePropagation()
      } else if (
        pointerEventModifiers === (Modifier.Control | Modifier.Shift) ||
        pointerEventModifiers === (Modifier.Shift | Modifier.Meta)
      ) {
        openNewForegroundTab(suggestion.url)
        pointerEvent.preventDefault()
        pointerEvent.stopImmediatePropagation()
      } else if (
        pointerEventModifiers === Modifier.Shift
      ) {
        openNewWindow(suggestion.url)
        pointerEvent.preventDefault()
        pointerEvent.stopImmediatePropagation()
      } else {
        onSuggestionActivated(suggestion)
        pointerEvent.preventDefault()
        pointerEvent.stopImmediatePropagation()
      }
    }
    menuItemElement.onauxclick = (pointerEvent) => {
      switch (pointerEvent.button) {
        case MIDDLE_MOUSE_BUTTON:
          openNewBackgroundTab(suggestion.url)
          pointerEvent.preventDefault()
          pointerEvent.stopImmediatePropagation()
          break
      }
    }
    menuItemElement.append(suggestionElement)
    return menuItemElement
  })
  menuElement.append(...menuItemElements)
}

/**
 * Opens a URL.
 *
 * @param {string} url
 * @returns {void}
 */
function open(url) {
  port.postMessage({
    type: 'open',
    url
  })
}

/**
 * Opens a new tab in background.
 *
 * @param {string} url
 * @returns {void}
 */
function openNewBackgroundTab(url) {
  port.postMessage({
    type: 'openNewBackgroundTab',
    url
  })
}

/**
 * Opens and activates a new tab.
 *
 * @param {string} url
 * @returns {void}
 */
function openNewForegroundTab(url) {
  port.postMessage({
    type: 'openNewForegroundTab',
    url
  })
}

/**
 * Opens a new window.
 *
 * @param {string} url
 * @returns {void}
 */
function openNewWindow(url) {
  port.postMessage({
    type: 'openNewWindow',
    url
  })
}

/**
 * Handles a single command.
 *
 * @param {string} commandName
 * @returns {void}
 */
function onCommand(commandName) {
  commands[commandName]({
    port,
    popupWindow: window,
    paletteInputElement,
  })
}

/**
 * Handles suggestion activation.
 *
 * @param {Suggestion} suggestion
 * @returns {void}
 */
function onSuggestionActivated(suggestion) {
  port.postMessage({
    type: 'suggestion',
    suggestion
  })
}

/**
 * Determines whether the given key is a modifier key.
 *
 * @param {string} key
 * @returns {boolean}
 */
function isModifierKey(key) {
  return MODIFIER_KEYS.has(key)
}
