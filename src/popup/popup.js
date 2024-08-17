// This module contains the code to interpret the “popup.html” custom menu.

import * as commands from './commands.js'
import commandPalette from './command_palette/command_palette.js'

import CustomMenu from './components/CustomMenu.js'
import MenuItem from './components/MenuItem.js'

const paletteInputElement = document.getElementById('palette-input')
const paletteMenuElement = document.getElementById('palette-menu')
const menuElement = document.getElementById('menu-commands')
const menuItemElements = menuElement.querySelectorAll('menu-item')
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
        paletteBindings: message.paletteBindings,
        paletteInputElement,
        paletteMenuElement,
        menuElement,
        menuItemElements,
      })
      break

    case 'stateSync':
      onStateSync(message.command)
      break

    case 'command':
      onCommand(message.command)
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
