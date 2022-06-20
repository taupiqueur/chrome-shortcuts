import { getCurrentTab } from '../lib/browser.js'
import * as commands from './commands.js'
import CustomMenu from './components/CustomMenu.js'
import MenuItem from './components/MenuItem.js'

const menuElement = document.querySelector('custom-menu')
const menuItemElements = document.querySelectorAll('menu-item')

// Options
const { popupConfig: { commandBindings } } = await chrome.storage.sync.get('popupConfig')

// Open a channel to communicate with the service worker.
const port = chrome.runtime.connect({ name: 'popup' })

// Listen for messages.
port.onMessage.addListener((message, port) => {
  switch (message.type) {
    case 'command':
      handleCommand(message.command, port)
      break
    default:
      port.postMessage({ type: 'error', message: 'Unknown request' })
  }
})

// Handles a single command.
async function handleCommand(commandName, port) {
  const tab = await getCurrentTab()
  await commands[commandName]({ tab, window, port })
}

// Add menu commands and keyboard shortcuts.
for (const menuItemElement of menuItemElements) {
  const commandName = menuItemElement.dataset.command
  menuItemElement.addEventListener('click', handleCommand.bind(null, commandName, port))
  for (const keybinding of commandBindings[commandName]) {
    menuItemElement.addKeyboardShortcut(keybinding)
  }
}

// Listen keyboard shortcuts.
// Note: <custom-menu autofocus> does not work reliably,
// hence the use of JavaScript.
menuElement.focus()
