// This module contains the code to interpret the “popup.html” custom menu.

import * as commands from './commands.js'

import CustomMenu from './components/CustomMenu.js'
import MenuItem from './components/MenuItem.js'

const menuElement = document.querySelector('custom-menu')
const menuItemElements = document.querySelectorAll('menu-item')

const localStorage = await chrome.storage.sync.get('popupConfig')
const sessionStorage = await chrome.storage.session.get('lastCommand')

// Open a channel to communicate with the service worker.
const port = chrome.runtime.connect({
  name: 'popup'
})

// Listen for messages.
port.onMessage.addListener((message) => {
  switch (message.type) {
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

const menuCommands = new Map(
  Array.from(menuItemElements, (menuItemElement) => [
    menuItemElement.dataset.command, menuItemElement
  ])
)

// Add menu commands and keyboard shortcuts.
for (const [commandName, menuItemElement] of menuCommands) {
  menuItemElement.addEventListener('click', () => {
    onCommand(commandName)
  })

  for (const keybinding of localStorage.popupConfig.commandBindings[commandName]) {
    menuItemElement.addKeyboardShortcut(keybinding)
  }
}

// Listen for keyboard shortcuts.
if (sessionStorage.lastCommand) {
  menuCommands.get(sessionStorage.lastCommand).focus()
} else {
  menuElement.focus()
}

/**
 * Handles a single command.
 *
 * @param {string} commandName
 * @returns {void}
 */
function onCommand(commandName) {
  commands[commandName](port)
}
