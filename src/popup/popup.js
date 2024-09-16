// This module contains the code to interpret the “popup.html” custom menu.

import * as commands from './commands.js'
import commandPalette from './command_palette/command_palette.js'

import CustomMenu from './components/CustomMenu.js'
import MenuItem from './components/MenuItem.js'
import SuggestionItem from './components/SuggestionItem.js'

const mainElement = document.querySelector('main')
const paletteInputElement = document.getElementById('palette-input')
const paletteMenuElement = document.getElementById('palette-menu')
const menuElement = document.getElementById('menu-commands')
const menuItemElements = menuElement.getElementsByTagName('menu-item')
const scriptingMenuItemElements = menuElement.querySelectorAll('menu-item[data-permissions~="scripting"]')

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
      onSuggestionSync(message.suggestions)
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
 * @param {{ commandBindings: object, isEnabled: boolean }} options
 * @returns {void}
 */
function render({ commandBindings, isEnabled }) {
  if (!isEnabled) {
    menuElement.title = 'Browser extensions are not allowed on this page.'

    for (const menuItemElement of scriptingMenuItemElements) {
      menuItemElement.setAttribute('disabled', '')
    }
  }

  // Add menu commands and keyboard shortcuts.
  for (const [commandName, menuItemElement] of menuCommands) {
    menuItemElement.addEventListener('click', () => {
      onCommand(commandName)
    })

    for (const keybinding of commandBindings[commandName]) {
      menuItemElement.addKeyboardShortcut(keybinding)
    }
  }

  mainElement.addEventListener('scroll', debounce(() => {
    mainElement.dataset.scrollTop = mainElement.scrollTop
  }))

  mainElement.dataset.scrollTop = 0

  // Listen for keyboard shortcuts.
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
 * @returns {void}
 */
function onSuggestionSync(suggestions) {
  const menuItemElements = suggestions.map((suggestion) => {
    const menuItemElement = document.createElement('menu-item')
    const suggestionElement = document.createElement('suggestion-item')
    Object.assign(
      suggestionElement.dataset,
      suggestion
    )
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
