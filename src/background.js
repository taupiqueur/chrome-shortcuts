// This module contains the background service worker to run commands via messages,
// using keyboard shortcuts or menu commands.
//
// Service workers: https://developer.chrome.com/docs/extensions/develop/concepts/service-workers
// Messaging: https://developer.chrome.com/docs/extensions/develop/concepts/messaging

import * as commands from './commands.js'
import popupWorker from './popup/service_worker.js'
import optionsUIWorker from './options_ui/service_worker.js'
import optionsWorker from './options/service_worker.js'
import manualWorker from './manual/service_worker.js'
import RecentTabsManager from './recent_tabs_manager.js'
import SuggestionEngine, { SuggestionType } from './suggestion_engine/suggestion_engine.js'

const { compare: versionCompare } = new Intl.Collator('en-US', {
  numeric: true
})

const COMMAND_NAME_OFFSET = 4

const { TAB_GROUP_ID_NONE } = chrome.tabGroups

const {
  WIN: WIN_PLATFORM_OS,
  LINUX: LINUX_PLATFORM_OS,
  MAC: MAC_PLATFORM_OS,
} = chrome.runtime.PlatformOs

const {
  OFFSCREEN_DOCUMENT: OFFSCREEN_DOCUMENT_CONTEXT_TYPE,
} = chrome.runtime.ContextType

const {
  WORKERS: KEYBOARD_OFFSCREEN_REASON,
} = chrome.offscreen.Reason

const OFFSCREEN_DOCUMENT_PATH = 'src/offscreen/offscreen.html'

const WIN_LINUX_CHROME_COMMAND_KEY_TRANSLATIONS = {
  'A': 'a',
  'B': 'b',
  'C': 'c',
  'D': 'd',
  'E': 'e',
  'F': 'f',
  'G': 'g',
  'H': 'h',
  'I': 'i',
  'J': 'j',
  'K': 'k',
  'L': 'l',
  'M': 'm',
  'N': 'n',
  'O': 'o',
  'P': 'p',
  'Q': 'q',
  'R': 'r',
  'S': 's',
  'T': 't',
  'U': 'u',
  'V': 'v',
  'W': 'w',
  'X': 'x',
  'Y': 'y',
  'Z': 'z',
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  'Comma': ',',
  'Period': '.',
  'Home': 'Home',
  'End': 'End',
  'Page Up': 'PageUp',
  'Page Down': 'PageDown',
  'Space': 'Space',
  'Ins': 'Insert',
  'Del': 'Delete',
  'Up Arrow': 'ArrowUp',
  'Down Arrow': 'ArrowDown',
  'Left Arrow': 'ArrowLeft',
  'Right Arrow': 'ArrowRight',
}

const MACOS_CHROME_COMMAND_KEY_TRANSLATIONS = {
  'A': 'a',
  'B': 'b',
  'C': 'c',
  'D': 'd',
  'E': 'e',
  'F': 'f',
  'G': 'g',
  'H': 'h',
  'I': 'i',
  'J': 'j',
  'K': 'k',
  'L': 'l',
  'M': 'm',
  'N': 'n',
  'O': 'o',
  'P': 'p',
  'Q': 'q',
  'R': 'r',
  'S': 's',
  'T': 't',
  'U': 'u',
  'V': 'v',
  'W': 'w',
  'X': 'x',
  'Y': 'y',
  'Z': 'z',
  '0': '0',
  '1': '1',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  ',': ',',
  '.': '.',
  '↖': 'Home',
  '↘': 'End',
  '⇞': 'PageUp',
  '⇟': 'PageDown',
  'Space': 'Space',
  'Ins': 'Insert',
  'Del': 'Delete',
  '↑': 'ArrowUp',
  '↓': 'ArrowDown',
  '←': 'ArrowLeft',
  '→': 'ArrowRight',
}

const WIN_LINUX_CHROME_COMMAND_SHORTCUT_REGEX = /^(?<ctrlKey>Ctrl\+)?(?<altKey>Alt\+)?(?<shiftKey>Shift\+)?(?<key>(A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z|0|1|2|3|4|5|6|7|8|9|Comma|Period|Home|End|Page\sUp|Page\sDown|Space|Ins|Del|Up\sArrow|Down\sArrow|Left\sArrow|Right\sArrow))$/
const MACOS_CHROME_COMMAND_SHORTCUT_REGEX = /^(?<ctrlKey>⌃)?(?<altKey>⌥)?(?<shiftKey>⇧)?(?<metaKey>⌘)?(?<key>(A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z|0|1|2|3|4|5|6|7|8|9|,|\.|↖|↘|⇞|⇟|Space|Ins|Del|↑|↓|←|→))$/

const recentTabsManager = new RecentTabsManager

const suggestionEngine = new SuggestionEngine({
  recentTabsManager
})

const suggestionLabels = new Map([
  [SuggestionType.OpenTab, chrome.i18n.getMessage('openTabSuggestionLabel')],
  [SuggestionType.ClosedTab, chrome.i18n.getMessage('closedTabSuggestionLabel')],
  [SuggestionType.SyncedTab, chrome.i18n.getMessage('syncedTabSuggestionLabel')],
  [SuggestionType.Bookmark, chrome.i18n.getMessage('bookmarkSuggestionLabel')],
  [SuggestionType.ReadingList, chrome.i18n.getMessage('readingListSuggestionLabel')],
  [SuggestionType.History, chrome.i18n.getMessage('historySuggestionLabel')],
  [SuggestionType.Download, chrome.i18n.getMessage('downloadSuggestionLabel')],
  [SuggestionType.Extension, chrome.i18n.getMessage('extensionSuggestionLabel')],
])

/**
 * Cache where we will expose the data we retrieve from the storage.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/storage#asynchronous-preload-from-storage
 *
 * @typedef {object} StorageCache
 * @property {KeyboardMapping[]} commandBindings
 * @property {KeyboardMapping[]} paletteBindings
 * @property {KeyboardMapping[]} pageBindings
 * @property {KeyboardMapping[]} chromeCommandBindings
 * @property {string[]} popupStyleSheet
 * @property {string} homePage
 * @property {string} manualPage
 * @property {string} optionsPage
 * @property {string} shortcutsPage
 *
 * @type {StorageCache}
 */
const storageCache = {
}

/**
 * Configures the extension’s internal pages.
 *
 * @returns {Promise<void>}
 */
async function setLocalizedPages() {
  switch (chrome.i18n.getUILanguage()) {
    case 'en':
    case 'en-AU':
    case 'en-GB':
    case 'en-US':
      await chrome.action.setPopup({
        popup: 'src/popup/popup.html'
      })
      await chrome.storage.session.set({
        homePage: 'https://taupiqueur.github.io/chrome-shortcuts',
        manualPage: chrome.runtime.getURL('src/manual/manual.html'),
        optionsPage: chrome.runtime.getURL('src/options/options.html'),
        shortcutsPage: 'chrome://extensions/shortcuts#:~:text=Shortcuts,-Activate the extension',
      })
      break

    case 'fr':
      await chrome.action.setPopup({
        popup: 'src/popup/popup.fr.html'
      })
      await chrome.storage.session.set({
        homePage: 'https://taupiqueur.github.io/chrome-shortcuts/fr/',
        manualPage: chrome.runtime.getURL('src/manual/manual.fr.html'),
        optionsPage: chrome.runtime.getURL('src/options/options.fr.html'),
        shortcutsPage: 'chrome://extensions/shortcuts#:~:text=Shortcuts,-Activer l’extension',
      })
      break

    default:
      await chrome.action.setPopup({
        popup: 'src/popup/popup.html'
      })
      await chrome.storage.session.set({
        homePage: 'https://taupiqueur.github.io/chrome-shortcuts',
        manualPage: chrome.runtime.getURL('src/manual/manual.html'),
        optionsPage: chrome.runtime.getURL('src/options/options.html'),
        shortcutsPage: 'chrome://extensions/shortcuts#:~:text=Shortcuts',
      })
  }
}

/**
 * Configures Chrome command bindings.
 *
 * Keyboard shortcuts from the “Extension shortcuts” interface are translated
 * into their corresponding `KeyboardEvent.code` values.
 *
 * @returns {Promise<void>}
 */
async function setChromeCommandBindings() {
  const offscreenDocumentURL = chrome.runtime.getURL(
    OFFSCREEN_DOCUMENT_PATH
  )

  const platformInfo = await chrome.runtime.getPlatformInfo()

  /**
   * @type {Object<string, string>}
   */
  let keyTranslations

  /**
   * @type {RegExp}
   */
  let shortcutRegex

  switch (platformInfo.os) {
    case WIN_PLATFORM_OS:
    case LINUX_PLATFORM_OS:
      keyTranslations = WIN_LINUX_CHROME_COMMAND_KEY_TRANSLATIONS
      shortcutRegex = WIN_LINUX_CHROME_COMMAND_SHORTCUT_REGEX
      break

    case MAC_PLATFORM_OS:
      keyTranslations = MACOS_CHROME_COMMAND_KEY_TRANSLATIONS
      shortcutRegex = MACOS_CHROME_COMMAND_SHORTCUT_REGEX
      break

    default:
      keyTranslations = WIN_LINUX_CHROME_COMMAND_KEY_TRANSLATIONS
      shortcutRegex = WIN_LINUX_CHROME_COMMAND_SHORTCUT_REGEX
  }

  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: [
      OFFSCREEN_DOCUMENT_CONTEXT_TYPE
    ],
    documentUrls: [
      offscreenDocumentURL
    ],
  })

  if (existingContexts.length === 0) {
    await chrome.offscreen.createDocument({
      url: offscreenDocumentURL,
      reasons: [
        KEYBOARD_OFFSCREEN_REASON
      ],
      justification: chrome.i18n.getMessage(
        'offscreenPermissionJustification'
      ),
    })
  }

  /**
   * @type {Object<string, string>}
   */
  const keyboardLayout = await chrome.runtime.sendMessage({
    type: 'keyboardLayout'
  })

  /**
   * @type {Object<string, string>}
   */
  const transposedLayout = {}

  for (const [code, key] of Object.entries(keyboardLayout)) {
    transposedLayout[key] = code
  }

  const commands = await chrome.commands.getAll()

  /**
   * @param {string} commandShortcut
   * @returns {Keypress}
   */
  function deserializeShortcut(commandShortcut) {
    const matches =
      commandShortcut.match(shortcutRegex)

    return {
      ctrlKey: matches.groups.ctrlKey !== undefined,
      altKey: matches.groups.altKey !== undefined,
      shiftKey: matches.groups.shiftKey !== undefined,
      metaKey: matches.groups.metaKey !== undefined,
      key: keyTranslations[matches.groups.key],
    }
  }

  /**
   * @type {KeyboardMapping[]}
   */
  const chromeCommandBindings = Iterator.from(commands)
    .drop(1)
    .filter((command) =>
      command.shortcut !== '' &&
      shortcutRegex.test(command.shortcut)
    )
    .map((command) => {
      const shortcut =
        deserializeShortcut(command.shortcut)

      return {
        command: command.name.substring(COMMAND_NAME_OFFSET),
        key: {
          ctrlKey: shortcut.ctrlKey,
          altKey: shortcut.altKey,
          shiftKey: shortcut.shiftKey,
          metaKey: shortcut.metaKey,
          code: transposedLayout[shortcut.key] ?? shortcut.key,
        }
      }
    })
    .toArray()

  await chrome.storage.session.set({
    chromeCommandBindings
  })

  await chrome.offscreen.closeDocument()
}

/**
 * Adds items to the browser’s context menu.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/contextMenus
 *
 * @returns {void}
 */
function createMenuItems() {
  chrome.contextMenus.create({
    id: 'open_documentation',
    title: chrome.i18n.getMessage('openDocumentationMenuItemTitle'),
    contexts: ['action']
  })

  chrome.contextMenus.create({
    id: 'open_support_chat',
    title: chrome.i18n.getMessage('openSupportChatMenuItemTitle'),
    contexts: ['action']
  })

  chrome.contextMenus.create({
    id: 'open_sponsorship_page',
    title: chrome.i18n.getMessage('openSponsorshipPageMenuItemTitle'),
    contexts: ['action']
  })

  chrome.contextMenus.create({
    id: 'copy_debug_info',
    title: chrome.i18n.getMessage('copyDebugInfoMenuItemTitle'),
    contexts: ['action']
  })
}

/**
 * Updates items of the browser’s context menu.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/contextMenus
 *
 * @returns {Promise<void>}
 */
async function updateMenuItems() {
  await Promise.all([
    chrome.contextMenus.update('open_documentation', {
      title: chrome.i18n.getMessage('openDocumentationMenuItemTitle')
    }),

    chrome.contextMenus.update('open_support_chat', {
      title: chrome.i18n.getMessage('openSupportChatMenuItemTitle')
    }),

    chrome.contextMenus.update('open_sponsorship_page', {
      title: chrome.i18n.getMessage('openSponsorshipPageMenuItemTitle')
    }),

    chrome.contextMenus.update('copy_debug_info', {
      title: chrome.i18n.getMessage('copyDebugInfoMenuItemTitle')
    }),
  ])
}

/**
 * Handles the initial setup when the extension is first installed or updated to a new version.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onInstalled
 *
 * @param {object} details
 * @returns {void}
 */
function onInstalled(details) {
  switch (details.reason) {
    case 'install':
      onInstall()
      break

    case 'update':
      onUpdate(details.previousVersion)
      break
  }
  recentTabsManager.onInstalled(details)
}

/**
 * Handles the initial setup when the extension is first installed.
 *
 * @returns {Promise<void>}
 */
async function onInstall() {
  const defaults = await optionsWorker.getDefaults()
  await chrome.storage.sync.set(defaults)
  createMenuItems()
  await Promise.all([
    setChromeCommandBindings(),
    setLocalizedPages(),
    runContentScripts(),
  ])
  await chrome.tabs.create({
    active: true,
    url: storageCache.homePage
  })
}

/**
 * Handles the setup when the extension is updated to a new version.
 *
 * @param {string} previousVersion
 * @returns {Promise<void>}
 */
async function onUpdate(previousVersion) {
  if (
    versionCompare(previousVersion, '0.18.0') < 0
  ) {
    const defaults = await optionsWorker.getDefaults()
    await chrome.storage.sync.set(defaults)
    createMenuItems()
    await Promise.all([
      setChromeCommandBindings(),
      setLocalizedPages(),
      runContentScripts(),
    ])
  } else {
    createMenuItems()
    await Promise.all([
      setChromeCommandBindings(),
      setLocalizedPages(),
      runContentScripts(),
    ])
  }
}

/**
 * Handles startup when a profile is started
 * (e.g., when the browser first starts up).
 *
 * https://developer.chrome.com/docs/extensions/reference/api/runtime#event-onStartup
 *
 * @returns {Promise<void>}
 */
async function onStartup() {
  await Promise.all([
    setChromeCommandBindings(),
    setLocalizedPages(),
    updateMenuItems(),
    recentTabsManager.onStartup(),
  ])
}

/**
 * Runs content scripts.
 *
 * NOTE: Chrome only automatically loads content scripts into new tabs.
 *
 * https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts#programmatic
 *
 * @returns {Promise<void>}
 */
async function runContentScripts() {
  const tabs = await chrome.tabs.query({
    url: [
      'file:///*',
      'http://*/*',
      'https://*/*'
    ],
    discarded: false,
  })

  await Promise.allSettled(
    tabs.map((tab) =>
      chrome.scripting.executeScript({
        target: {
          tabId: tab.id,
          allFrames: true,
        },
        files: [
          'src/lib/keymap.js',
          'src/lib/input_handler.js',
          'src/lib/scroller.js',
          'src/content_script.js'
        ],
        injectImmediately: true,
      })
    )
  )
}

/**
 * Updates tabs after option changes.
 *
 * @returns {Promise<void>}
 */
async function updateTabsAfterOptionsChange() {
  const tabs = await chrome.tabs.query({
    url: [
      'file:///*',
      'http://*/*',
      'https://*/*'
    ],
    discarded: false,
  })

  await Promise.allSettled(
    tabs.map((tab) =>
      chrome.tabs.sendMessage(tab.id, {
        type: 'stateSync',
        pageBindings: storageCache.pageBindings,
      })
    )
  )
}

/**
 * Handles option changes.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/storage#event-onChanged
 *
 * @param {object} changes
 * @param {string} areaName
 * @returns {void}
 */
function onOptionsChange(changes, areaName) {
  switch (areaName) {
    case 'sync':
      for (const key in changes) {
        storageCache[key] = changes[key].newValue
      }
      updateTabsAfterOptionsChange()
      break

    case 'local':
      for (const key in changes) {
        storageCache[key] = changes[key].newValue
      }
      updateTabsAfterOptionsChange()
      break

    case 'session':
      for (const key in changes) {
        storageCache[key] = changes[key].newValue
      }
      break
  }
}

/**
 * Handles keyboard shortcuts.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/commands#event-onCommand
 *
 * @param {string} commandNameWithIndex
 * @param {chrome.tabs.Tab} tab
 * @returns {Promise<void>}
 */
async function onCommand(commandNameWithIndex, tab) {
  const commandName = commandNameWithIndex.substring(COMMAND_NAME_OFFSET)

  await commands[commandName]({
    tab,
    recentTabsManager,
    manualPage: storageCache.manualPage,
    shortcutsPage: storageCache.shortcutsPage,
  })
}

/**
 * Handles the context menu on click.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/contextMenus#event-onClicked
 *
 * @param {chrome.contextMenus.OnClickData} info
 * @param {chrome.tabs.Tab} tab
 * @returns {Promise<void>}
 */
async function onMenuItemClicked(info, tab) {
  switch (info.menuItemId) {
    case 'open_documentation':
      openNewTab({
        active: true,
        url: storageCache.manualPage,
        openerTabId: tab.id,
      })
      break

    case 'open_support_chat':
      openNewTab({
        active: true,
        url: 'https://web.libera.chat/gamja/#taupiqueur',
        openerTabId: tab.id,
      })
      break

    case 'open_sponsorship_page':
      openNewTab({
        active: true,
        url: 'https://github.com/sponsors/taupiqueur',
        openerTabId: tab.id,
      })
      break

    case 'copy_debug_info': {
      const debugInfo = await getDebugInfo(tab.id)

      await chrome.scripting.executeScript({
        target: {
          tabId: tab.id
        },
        func: (text) => {
          return navigator.clipboard.writeText(text)
        },
        args: [
          JSON.stringify(debugInfo, null, 2)
        ]
      })
      break
    }
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
 * Returns debug info.
 *
 * https://github.com/lydell/LinkHints/blob/main/src/popup/Program.tsx
 *
 * @typedef {object} DebugInfo
 * @property {string} version
 * @property {string} userAgent
 * @property {chrome.runtime.PlatformInfo} platformInfo
 * @property {object} syncStorage
 * @property {object} localStorage
 * @property {object} sessionStorage
 * @property {string} language
 * @property {Object<string, string>} keyboardLayout
 *
 * @param {number} tabId
 * @returns {Promise<DebugInfo>}
 */
async function getDebugInfo(tabId) {
  const manifest = chrome.runtime.getManifest()

  const [
    platformInfo,
    syncStorage,
    localStorage,
    sessionStorage,
    keyboardLayoutResults,
  ] = await Promise.all([
    chrome.runtime.getPlatformInfo(),
    chrome.storage.sync.get(),
    chrome.storage.local.get(),
    chrome.storage.session.get(),
    chrome.scripting.executeScript({
      target: { tabId },
      func: async () => {
        const keyboardLayoutMap = await navigator.keyboard.getLayoutMap()
        return Object.fromEntries(keyboardLayoutMap)
      }
    })
  ])

  const keyboardLayout = keyboardLayoutResults[0].result

  return {
    version: manifest.version,
    userAgent: navigator.userAgent,
    platformInfo,
    syncStorage,
    localStorage,
    sessionStorage,
    language: navigator.language,
    keyboardLayout,
  }
}

/**
 * Handles one-time requests.
 *
 * https://developer.chrome.com/docs/extensions/develop/concepts/messaging#simple
 *
 * @param {object} message
 * @param {chrome.runtime.MessageSender} sender
 * @returns {void}
 */
function onMessage(message, sender) {
  switch (message.type) {
    case 'contentScriptAdded':
      chrome.tabs.sendMessage(sender.tab.id, {
        type: 'stateSync',
        pageBindings: storageCache.pageBindings,
      }, {
        documentId: sender.documentId,
      })
      break

    case 'openPopup':
      openPopup(sender.tab.windowId)
      break
  }
}

/**
 * Opens the extension’s popup.
 *
 * @param {number} windowId
 * @returns {Promise<void>}
 */
async function openPopup(windowId) {
  await chrome.action.openPopup({
    windowId
  })
}

/**
 * Handles long-lived connections.
 * Uses the channel name to distinguish different types of connections.
 *
 * https://developer.chrome.com/docs/extensions/develop/concepts/messaging#connect
 *
 * @param {chrome.runtime.Port} port
 * @returns {void}
 */
function onConnect(port) {
  switch (port.name) {
    case 'popup':
      popupWorker.onConnect(port, {
        recentTabsManager,
        suggestionEngine,
        suggestionLabels,
        commandBindings: storageCache.commandBindings.concat(storageCache.chromeCommandBindings),
        paletteBindings: storageCache.paletteBindings,
        popupStyleSheet: storageCache.popupStyleSheet.join('\n'),
        manualPage: storageCache.manualPage,
        shortcutsPage: storageCache.shortcutsPage,
      })
      break

    case 'options_ui':
      optionsUIWorker.onConnect(port, {
        optionsPage: storageCache.optionsPage,
      })
      break

    case 'options':
      optionsWorker.onConnect(port)
      break

    case 'manual':
      manualWorker.onConnect(port)
      break

    default:
      port.postMessage({
        type: 'error',
        message: `Unknown type of connection: ${port.name}`
      })
  }
}

/**
 * Handles tab activation, when the active tab in a window changes.
 * Note window activation does not change the active tab.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/tabs#event-onActivated
 *
 * @param {object} activeInfo
 * @returns {void}
 */
function onTabActivated(activeInfo) {
  recentTabsManager.onTabActivated(activeInfo)
}

/**
 * Handles tab closing, when a tab is closed or a window is being closed.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/tabs#event-onRemoved
 *
 * @param {number} tabId
 * @param {object} removeInfo
 * @returns {void}
 */
function onTabRemoved(tabId, removeInfo) {
  recentTabsManager.onTabRemoved(tabId, removeInfo)
}

/**
 * Handles tab replacement, when a tab is replaced with another tab due to pre-rendering or instant.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/tabs#event-onReplaced
 *
 * @param {number} addedTabId
 * @param {number} removedTabId
 * @returns {void}
 */
function onTabReplaced(addedTabId, removedTabId) {
  recentTabsManager.onTabReplaced(addedTabId, removedTabId)
}

/**
 * Handles window activation, when the currently focused window changes.
 * Will be `WINDOW_ID_NONE` if all Chrome windows have lost focus.
 *
 * NOTE: On some window managers (e.g., Sway), `WINDOW_ID_NONE` is always
 * sent immediately preceding a switch from one Chrome window to another.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/windows#event-onFocusChanged
 *
 * @param {number} windowId
 * @returns {void}
 */
function onWindowFocusChanged(windowId) {
  recentTabsManager.onWindowFocusChanged(windowId)
}

const allStorageLoaded = Promise.all([
  chrome.storage.sync.get().then((syncStorage) => {
    Object.assign(storageCache, syncStorage)
  }),

  chrome.storage.session.get().then((sessionStorage) => {
    Object.assign(storageCache, sessionStorage)
  }),

  recentTabsManager.restoreState(),
])

// Set up listeners.
// https://developer.chrome.com/docs/extensions/develop/concepts/service-workers/events
chrome.runtime.onInstalled.addListener((details) => {
  allStorageLoaded.then(() => {
    onInstalled(details)
  })
})

chrome.runtime.onStartup.addListener(() => {
  allStorageLoaded.then(() => {
    onStartup()
  })
})

chrome.storage.onChanged.addListener((changes, areaName) => {
  allStorageLoaded.then(() => {
    onOptionsChange(changes, areaName)
  })
})

chrome.commands.onCommand.addListener((commandName, tab) => {
  allStorageLoaded.then(() => {
    onCommand(commandName, tab)
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  allStorageLoaded.then(() => {
    onMenuItemClicked(info, tab)
  })
})

chrome.runtime.onMessage.addListener((message, sender) => {
  allStorageLoaded.then(() => {
    onMessage(message, sender)
  })
})

chrome.runtime.onConnect.addListener((port) => {
  allStorageLoaded.then(() => {
    onConnect(port)
  })
})

chrome.tabs.onActivated.addListener((activeInfo) => {
  allStorageLoaded.then(() => {
    onTabActivated(activeInfo)
  })
})

chrome.tabs.onRemoved.addListener((tabId, removeInfo) => {
  allStorageLoaded.then(() => {
    onTabRemoved(tabId, removeInfo)
  })
})

chrome.tabs.onReplaced.addListener((addedTabId, removedTabId) => {
  allStorageLoaded.then(() => {
    onTabReplaced(addedTabId, removedTabId)
  })
})

chrome.windows.onFocusChanged.addListener((windowId) => {
  allStorageLoaded.then(() => {
    onWindowFocusChanged(windowId)
  })
})
