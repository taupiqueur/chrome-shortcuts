// This module contains the popup service worker to run commands via messages.
//
// Uses a long-lived connection for the popup lifetime.
// This allows to determine when the popup shows up or goes away.
//
// Popup page: https://developer.chrome.com/docs/extensions/develop/ui/add-popup
// Service workers: https://developer.chrome.com/docs/extensions/develop/concepts/service-workers
// Long-lived connections: https://developer.chrome.com/docs/extensions/develop/concepts/messaging#connect

/**
 * @typedef {object} PopupContext
 * @property {RecentTabsManager} recentTabsManager
 * @property {SuggestionEngine} suggestionEngine
 * @property {Map<string, string>} suggestionLabels
 * @property {string} manualPage
 * @property {string} optionsPage
 */

/**
 * @typedef {CommandMessage | SuggestionMessage | SuggestionSyncRequestMessage} Message
 *
 * @typedef {object} CommandMessage
 * @property {"command"} type
 * @property {string} commandName
 * @property {boolean} passingMode
 * @property {boolean} stickyWindow
 *
 * @typedef {object} SuggestionMessage
 * @property {"suggestion"} type
 * @property {Suggestion} suggestion
 *
 * @typedef {object} SuggestionSyncRequestMessage
 * @property {"suggestionSyncRequest"} type
 */

import * as commands from '../commands.js'

const KEEP_ALIVE_INTERVAL = 29000

const { TAB_GROUP_ID_NONE } = chrome.tabGroups

const CHROME_DOMAINS = [
  new URLPattern({
    protocol: 'chrome'
  }),
  new URLPattern({
    protocol: 'chrome-extension'
  }),
  new URLPattern({
    hostname: 'chromewebstore.google.com'
  })
]

/**
 * Handles a new connection when the popup shows up.
 *
 * @param {chrome.runtime.Port} port
 * @param {PopupContext} cx
 * @returns {void}
 */
function onConnect(port, cx) {
  const keepAliveIntervalId = setInterval(() => {
    port.postMessage({
      type: 'keepAlive'
    })
  }, KEEP_ALIVE_INTERVAL)
  port.onDisconnect.addListener((port) => {
    onDisconnect(port, keepAliveIntervalId)
  })
  port.onMessage.addListener((message, port) => {
    onMessage(message, port, cx)
  })
  onPopupScriptAdded(port)
}

/**
 * Handles disconnection by clearing the keep-alive interval.
 *
 * @param {chrome.runtime.Port} port
 * @param {number} keepAliveIntervalId
 * @returns {void}
 */
function onDisconnect(port, keepAliveIntervalId) {
  clearInterval(keepAliveIntervalId)
}

/**
 * Handles the popup initialization.
 *
 * @param {chrome.runtime.Port} port
 * @returns {Promise<void>}
 */
async function onPopupScriptAdded(port) {
  const localStorage = await chrome.storage.sync.get([
    'commandBindings',
    'paletteBindings',
  ])

  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  })

  if (tabs.length > 0) {
    const { url } = tabs[0]

    port.postMessage({
      type: 'init',
      commandBindings: localStorage.commandBindings,
      paletteBindings: localStorage.paletteBindings,
      isEnabled: !CHROME_DOMAINS.some((domain) =>
        domain.test(url)
      )
    })
  }
}

/**
 * Handles message by using a discriminator field. Each message has a `type` field,
 * and the rest of the fields, and their meaning, depend on its value.
 *
 * https://crystal-lang.org/api/master/JSON/Serializable.html#discriminator-field
 *
 * @param {Message} message
 * @param {chrome.runtime.Port} port
 * @param {PopupContext} cx
 * @returns {void}
 */
async function onMessage(message, port, cx) {
  switch (message.type) {
    case 'command':
      onCommandMessage(message, port, cx)
      break

    case 'suggestion':
      onSuggestionMessage(message, port, cx)
      break

    case 'suggestionSyncRequest':
      onSuggestionSyncRequestMessage(message, port, cx)
      break

    case 'open': {
      const tabs = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
      })
      if (tabs.length > 0) {
        await chrome.tabs.update(tabs[0].id, {
          url: message.url
        })
      }
      break
    }

    case 'openNewBackgroundTab': {
      const tabs = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
      })
      if (tabs.length > 0) {
        await openNewTab({
          active: false,
          url: message.url,
          openerTabId: tabs[0].id,
        })
      }
      break
    }

    case 'openNewForegroundTab': {
      const tabs = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
      })
      if (tabs.length > 0) {
        await openNewTab({
          active: true,
          url: message.url,
          openerTabId: tabs[0].id,
        })
      }
      break
    }

    case 'openNewWindow': {
      const tabs = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
      })
      if (tabs.length > 0) {
        await chrome.windows.create({
          focused: true,
          incognito: tabs[0].incognito,
          url: message.url,
        })
      }
      break
    }

    default:
      port.postMessage({
        type: 'error',
        message: 'Unknown request'
      })
  }
}

/**
 * Opens a new tab to the right.
 *
 * @param {object} createProperties
 * @param {boolean} createProperties.active
 * @param {string} createProperties.url
 * @param {number} createProperties.openerTabId
 * @returns {Promise<void>}
 */
async function openNewTab({
  active,
  url,
  openerTabId,
}) {
  const openerTab = await chrome.tabs.get(openerTabId)
  const createdTab = await chrome.tabs.create({
    active,
    url,
    index: openerTab.index + 1,
    openerTabId,
    windowId: openerTab.windowId
  })

  if (openerTab.groupId !== TAB_GROUP_ID_NONE) {
    await chrome.tabs.group({
      groupId: openerTab.groupId,
      tabIds: [
        createdTab.id
      ]
    })
  }
}

/**
 * Handles a command message.
 *
 * The options are as follows:
 *
 * ###### passingMode
 *
 * Specifies whether to close the popup window before executing the command.
 *
 * Default is `false`.
 *
 * ###### stickyWindow
 *
 * Specifies whether to reopen the popup window after executing the command.
 *
 * Default is `false`.
 *
 * @param {CommandMessage} message
 * @param {chrome.runtime.Port} port
 * @param {PopupContext} cx
 * @returns {Promise<void>}
 */
async function onCommandMessage(message, port, cx) {
  const { commandName, passingMode, stickyWindow } = message

  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  })

  if (tabs.length > 0) {
    if (passingMode) {
      await closePopup(port)
    }

    await commands[commandName]({
      tab: tabs[0],
      recentTabsManager: cx.recentTabsManager,
      manualPage: cx.manualPage,
      optionsPage: cx.optionsPage,
    })

    if (
      stickyWindow &&
      // EXPERIMENTAL: Requires either Chrome 127+ or the dev channel.
      // See https://issues.chromium.org/issues/40057101 for more information.
      chrome.action.openPopup
    ) {
      const port = await openPopup(chrome.windows.WINDOW_ID_CURRENT)
      port.postMessage({
        type: 'stateSync',
        command: commandName
      })
    }
  }
}

/**
 * Opens the extension’s popup.
 *
 * @param {number} windowId
 * @returns {Promise<chrome.runtime.Port>}
 */
async function openPopup(windowId) {
  return new Promise((resolve, reject) => {
    chrome.runtime.onConnect.addListener(
      function fireAndForget(port) {
        if (port.name === 'popup') {
          chrome.runtime.onConnect.removeListener(fireAndForget)
          resolve(port)
        }
      }
    )
    chrome.action.openPopup({
      windowId
    }).catch(reject)
  })
}

/**
 * Closes the extension’s popup.
 *
 * @param {chrome.runtime.Port} port
 * @returns {Promise<void>}
 */
async function closePopup(port) {
  return new Promise((resolve) => {
    port.onDisconnect.addListener(resolve)
    port.postMessage({
      type: 'command',
      command: 'closePopup'
    })
  })
}

/**
 * Handles a suggestion message.
 *
 * @param {SuggestionMessage} message
 * @param {chrome.runtime.Port} port
 * @param {PopupContext} cx
 * @returns {Promise<void>}
 */
async function onSuggestionMessage(message, port, cx) {
  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  })

  if (tabs.length > 0) {
    cx.suggestionEngine.activate(
      message.suggestion,
      tabs[0]
    )
  }
}

/**
 * Handles a suggestion syncing request message.
 *
 * @param {SuggestionSyncRequestMessage} message
 * @param {chrome.runtime.Port} port
 * @param {PopupContext} cx
 * @returns {Promise<void>}
 */
async function onSuggestionSyncRequestMessage(message, port, cx) {
  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  })

  if (tabs.length > 0) {
    const suggestions = await cx.suggestionEngine.search({
      mode: 'combined',
      query: ''
    })

    port.postMessage({
      type: 'suggestionSync',
      suggestions,
      suggestionLabels: Object.fromEntries(
        cx.suggestionLabels
      )
    })
  }
}

export default { onConnect }
