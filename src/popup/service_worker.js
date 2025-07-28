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
 * @property {KeyboardMapping[]} commandBindings
 * @property {KeyboardMapping[]} paletteBindings
 * @property {string} manualPage
 * @property {string} shortcutsPage
 */

/**
 * @typedef {CommandMessage | SuggestionMessage | SuggestionSyncRequestMessage | CancelAnimationFrameRequestMessage} Message
 *
 * @typedef {object} CommandMessage
 * @property {"command"} type
 * @property {string} commandName
 *
 * @typedef {object} SuggestionMessage
 * @property {"suggestion"} type
 * @property {Suggestion} suggestion
 *
 * @typedef {object} SuggestionSyncRequestMessage
 * @property {"suggestionSyncRequest"} type
 *
 * @typedef {object} CancelAnimationFrameRequestMessage
 * @property {"cancelAnimationFrameRequest"} type
 */

import * as commands from './service_worker_commands.js'

import {
  cancelAnimationFrames,
} from '../injectable_scripts.js'

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
 * List of active ports.
 *
 * @type {Set<chrome.runtime.Port>}
 */
const activePorts = new Set

/**
 * Handles a new connection when the popup shows up.
 *
 * @param {chrome.runtime.Port} port
 * @param {PopupContext} cx
 * @returns {void}
 */
function onConnect(port, cx) {
  activePorts.add(port)
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
  onPopupScriptAdded(port, cx)
}

/**
 * Handles disconnection by clearing the keep-alive interval.
 *
 * @param {chrome.runtime.Port} port
 * @param {number} keepAliveIntervalId
 * @returns {Promise<void>}
 */
async function onDisconnect(port, keepAliveIntervalId) {
  activePorts.delete(port)
  clearInterval(keepAliveIntervalId)

  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  })

  if (
    tabs.length > 0 &&
    !isChromeDomain(tabs[0].url)
  ) {
    await chrome.scripting.executeScript({
      target: {
        tabId: tabs[0].id
      },
      func: cancelAnimationFrames
    })
  }
}

/**
 * Handles the popup initialization.
 *
 * @param {chrome.runtime.Port} port
 * @param {PopupContext} cx
 * @returns {Promise<void>}
 */
async function onPopupScriptAdded(port, cx) {
  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  })

  if (tabs.length > 0) {
    port.postMessage({
      type: 'init',
      commandBindings: cx.commandBindings,
      paletteBindings: cx.paletteBindings,
      isEnabled: !isChromeDomain(tabs[0].url)
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

    case 'cancelAnimationFrameRequest':
      onCancelAnimationFrameRequestMessage(message, port, cx)
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
 * @param {CommandMessage} message
 * @param {chrome.runtime.Port} port
 * @param {PopupContext} cx
 * @returns {Promise<void>}
 */
async function onCommandMessage(message, port, cx) {
  const { commandName } = message

  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  })

  if (tabs.length > 0) {
    await commands[commandName](port, activePorts, {
      tab: tabs[0],
      recentTabsManager: cx.recentTabsManager,
      manualPage: cx.manualPage,
      shortcutsPage: cx.shortcutsPage,
    })
  }
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

/**
 * Handles a cancel animation frame request message.
 *
 * @param {CancelAnimationFrameRequestMessage} message
 * @param {chrome.runtime.Port} port
 * @param {PopupContext} cx
 * @returns {Promise<void>}
 */
async function onCancelAnimationFrameRequestMessage(message, port, cx) {
  const tabs = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  })

  if (
    tabs.length > 0 &&
    !isChromeDomain(tabs[0].url)
  ) {
    await chrome.scripting.executeScript({
      target: {
        tabId: tabs[0].id
      },
      func: cancelAnimationFrames
    })
  }
}

/**
 * Determines whether the given URL is a Chrome domain.
 *
 * @param {string} url
 * @returns {boolean}
 */
function isChromeDomain(url) {
  return CHROME_DOMAINS.some((domain) =>
    domain.test(url)
  )
}

export default { onConnect }
