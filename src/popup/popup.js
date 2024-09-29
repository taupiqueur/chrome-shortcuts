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

const SCRIPTING_SELECTOR = '[data-permissions~="scripting"]'

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
      menuItemElement.addEventListener('click', () => {
        browserExtensionsNotAllowedPopoverElement.togglePopover()
      })
    } else {
      menuItemElement.addEventListener('click', () => {
        onCommand(commandName)
      })
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

  mainElement.addEventListener('scroll', debounce(() => {
    mainElement.dataset.scrollTop = mainElement.scrollTop
  }))

  mainElement.dataset.scrollTop = 0

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
    menuItemElement.addEventListener('click', () => {
      onSuggestionActivated(suggestion)
    })
    menuItemElement.append(suggestionElement)
    return menuItemElement
  })
  menuElement.append(...menuItemElements)
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
 * Debounces a function, delaying its execution until before the next repaint.
 *
 * @param {function} callback
 * @returns {function}
 */
function debounce(callback) {
  let animationFrame
  return (...params) => {
    window.cancelAnimationFrame(animationFrame)
    animationFrame = window.requestAnimationFrame(() => {
      callback(...params)
    })
  }
}
