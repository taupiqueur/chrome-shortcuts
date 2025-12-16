// This module contains the popup commands.

import * as commands from '../commands.js'

import {
  scrollBy,
} from '../injectable_scripts.js'

const CONTINUOUS_SCROLL_FRAME_CALIBRATION = Array(30).fill(0.2)

/**
 * Creates a new function that, when called, executes a command.
 *
 * @param {string} commandName
 * @returns {(port: chrome.runtime.Port, activePorts: Set<chrome.runtime.Port>, cx: CommandContext) => Promise<void>}
 */
function execCommand(commandName) {
  return async (port, activePorts, cx) => {
    await commands[commandName](cx)
    const currentWindow = await chrome.windows.getLastFocused()
    if (
      cx.tab.windowId === currentWindow.id &&
      !activePorts.has(port)
    ) {
      const newPort = await openPopup(cx.tab.windowId)
      newPort.postMessage({
        type: 'stateSync',
        command: commandName
      })
    } else if (
      cx.tab.windowId !== currentWindow.id &&
      activePorts.has(port)
    ) {
      await closePopup(port)
      const newPort = await openPopup(currentWindow.id)
      newPort.postMessage({
        type: 'stateSync',
        command: commandName
      })
    } else if (
      cx.tab.windowId !== currentWindow.id &&
      !activePorts.has(port)
    ) {
      const newPort = await openPopup(currentWindow.id)
      newPort.postMessage({
        type: 'stateSync',
        command: commandName
      })
    }
  }
}

/**
 * Creates a new function that, when called, executes a command
 * causing a web navigation.
 *
 * @param {string} commandName
 * @returns {(port: chrome.runtime.Port, activePorts: Set<chrome.runtime.Port>, cx: CommandContext) => Promise<void>}
 */
function execCommandWithNavigation(commandName) {
  return async (port, activePorts, cx) => {
    await commands[commandName](cx)
    const [currentTab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    })
    await waitForNavigation(currentTab.id, 'onCommitted')
    if (
      cx.tab.windowId === currentTab.windowId &&
      !activePorts.has(port)
    ) {
      const newPort = await openPopup(cx.tab.windowId)
      newPort.postMessage({
        type: 'stateSync',
        command: commandName
      })
    } else if (
      cx.tab.windowId !== currentTab.windowId &&
      activePorts.has(port)
    ) {
      await closePopup(port)
      const newPort = await openPopup(currentTab.windowId)
      newPort.postMessage({
        type: 'stateSync',
        command: commandName
      })
    } else if (
      cx.tab.windowId !== currentTab.windowId &&
      !activePorts.has(port)
    ) {
      const newPort = await openPopup(currentTab.windowId)
      newPort.postMessage({
        type: 'stateSync',
        command: commandName
      })
    }
  }
}

/**
 * Creates a new function that, when called, closes the extension’s popup, then
 * executes a command.
 *
 * @param {string} commandName
 * @returns {(port: chrome.runtime.Port, activePorts: Set<chrome.runtime.Port>, cx: CommandContext) => Promise<void>}
 */
function execCommandAndClosePopup(commandName) {
  return async (port, activePorts, cx) => {
    await closePopup(port)
    await commands[commandName](cx)
  }
}

// Shortcuts -------------------------------------------------------------------

export const openShortcutsManual = execCommandAndClosePopup('openShortcutsManual')
export const openShortcutsOptionsPage = execCommandAndClosePopup('openShortcutsOptionsPage')
export const openShortcutsShortcutsPage = execCommandAndClosePopup('openShortcutsShortcutsPage')
export const openShortcutsThemeStore = execCommandAndClosePopup('openShortcutsThemeStore')

// Navigation ------------------------------------------------------------------

export const goBack = execCommandWithNavigation('goBack')
export const goForward = execCommandWithNavigation('goForward')
export const reloadTab = execCommand('reloadTab')
export const reloadTabWithoutCache = execCommand('reloadTabWithoutCache')
export const goToNextPage = execCommandWithNavigation('goToNextPage')
export const goToPreviousPage = execCommandWithNavigation('goToPreviousPage')
export const removeURLParams = execCommandWithNavigation('removeURLParams')
export const goUp = execCommandWithNavigation('goUp')
export const goToRoot = execCommandWithNavigation('goToRoot')

// Accessibility ---------------------------------------------------------------

export const focusTextInput = execCommand('focusTextInput')
export const focusMediaPlayer = execCommand('focusMediaPlayer')
export const blurElement = execCommand('blurElement')

// Clipboard -------------------------------------------------------------------

export const copyURL = execCommandAndClosePopup('copyURL')
export const copyTitle = execCommandAndClosePopup('copyTitle')
export const copyTitleAndURL = execCommandAndClosePopup('copyTitleAndURL')
export const openNewTabsFromClipboard = execCommandAndClosePopup('openNewTabsFromClipboard')

// Save pages ------------------------------------------------------------------

export const savePage = execCommand('savePage')
export const savePageAsMHTML = execCommand('savePageAsMHTML')
export const savePageAsPNG = execCommandAndClosePopup('savePageAsPNG')
export const savePageAsJPEG = execCommandAndClosePopup('savePageAsJPEG')
export const savePageAsWebP = execCommandAndClosePopup('savePageAsWebP')

// Web search ------------------------------------------------------------------

export const openWebSearchForSelectedText = execCommandAndClosePopup('openWebSearchForSelectedText')

// Scroll ----------------------------------------------------------------------

/**
 * Scrolls down continuously.
 *
 * @param {chrome.runtime.Port} port
 * @param {Set<chrome.runtime.Port>} activePorts
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function scrollDown(port, activePorts, cx) {
  await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id
    },
    func: scrollBy,
    args: [{
      deltaX: 0,
      deltaY: 70,
      frameCalibration: CONTINUOUS_SCROLL_FRAME_CALIBRATION,
      cancelable: true,
    }]
  })
}

/**
 * Scrolls up continuously.
 *
 * @param {chrome.runtime.Port} port
 * @param {Set<chrome.runtime.Port>} activePorts
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function scrollUp(port, activePorts, cx) {
  await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id
    },
    func: scrollBy,
    args: [{
      deltaX: 0,
      deltaY: -70,
      frameCalibration: CONTINUOUS_SCROLL_FRAME_CALIBRATION,
      cancelable: true,
    }]
  })
}

/**
 * Scrolls left continuously.
 *
 * @param {chrome.runtime.Port} port
 * @param {Set<chrome.runtime.Port>} activePorts
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function scrollLeft(port, activePorts, cx) {
  await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id
    },
    func: scrollBy,
    args: [{
      deltaX: -70,
      deltaY: 0,
      frameCalibration: CONTINUOUS_SCROLL_FRAME_CALIBRATION,
      cancelable: true,
    }]
  })
}

/**
 * Scrolls right continuously.
 *
 * @param {chrome.runtime.Port} port
 * @param {Set<chrome.runtime.Port>} activePorts
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function scrollRight(port, activePorts, cx) {
  await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id
    },
    func: scrollBy,
    args: [{
      deltaX: 70,
      deltaY: 0,
      frameCalibration: CONTINUOUS_SCROLL_FRAME_CALIBRATION,
      cancelable: true,
    }]
  })
}

export const scrollPageDown = execCommand('scrollPageDown')
export const scrollPageUp = execCommand('scrollPageUp')
export const scrollHalfPageDown = execCommand('scrollHalfPageDown')
export const scrollHalfPageUp = execCommand('scrollHalfPageUp')
export const scrollToTop = execCommand('scrollToTop')
export const scrollToBottom = execCommand('scrollToBottom')

// Zoom ------------------------------------------------------------------------

export const zoomIn = execCommand('zoomIn')
export const zoomOut = execCommand('zoomOut')
export const zoomReset = execCommand('zoomReset')

// Window state ----------------------------------------------------------------

export const minimizeWindow = execCommandAndClosePopup('minimizeWindow')
export const maximizeWindow = execCommandAndClosePopup('maximizeWindow')
export const toggleFullScreen = execCommandAndClosePopup('toggleFullScreen')
export const togglePictureInPicture = execCommandAndClosePopup('togglePictureInPicture')

// Create tabs -----------------------------------------------------------------

export const openNewTab = execCommandAndClosePopup('openNewTab')
export const openNewTabRight = execCommandAndClosePopup('openNewTabRight')
export const openNewWindow = execCommandAndClosePopup('openNewWindow')
export const openNewIncognitoWindow = execCommandAndClosePopup('openNewIncognitoWindow')

// Close tabs ------------------------------------------------------------------

export const closeTab = execCommand('closeTab')
export const closeOtherTabs = execCommand('closeOtherTabs')
export const closeRightTabs = execCommand('closeRightTabs')
export const closeWindow = execCommand('closeWindow')
export const restoreTab = execCommand('restoreTab')

// Tab state -------------------------------------------------------------------

export const duplicateTab = execCommandAndClosePopup('duplicateTab')
export const togglePinTab = execCommand('togglePinTab')
export const toggleGroupTab = execCommand('toggleGroupTab')
export const toggleCollapseTabGroups = execCommand('toggleCollapseTabGroups')
export const toggleMuteTab = execCommand('toggleMuteTab')
export const discardTab = execCommandAndClosePopup('discardTab')

// Organize tabs ---------------------------------------------------------------

export const sortTabsByName = execCommand('sortTabsByName')
export const sortTabsByURL = execCommand('sortTabsByURL')
export const sortTabsByRecency = execCommand('sortTabsByRecency')
export const reverseTabOrder = execCommand('reverseTabOrder')
export const groupTabsByDomain = execCommand('groupTabsByDomain')

// Manage tab groups -----------------------------------------------------------

export const collapseTabGroup = execCommand('collapseTabGroup')
export const renameTabGroup = execCommandAndClosePopup('renameTabGroup')
export const cycleTabGroupColorForward = execCommand('cycleTabGroupColorForward')
export const cycleTabGroupColorBackward = execCommand('cycleTabGroupColorBackward')

// Switch tabs -----------------------------------------------------------------

export const activateAudibleTab = execCommand('activateAudibleTab')
export const activateNextTab = execCommand('activateNextTab')
export const activatePreviousTab = execCommand('activatePreviousTab')
export const activateFirstTab = execCommand('activateFirstTab')
export const activateSecondTab = execCommand('activateSecondTab')
export const activateThirdTab = execCommand('activateThirdTab')
export const activateFourthTab = execCommand('activateFourthTab')
export const activateFifthTab = execCommand('activateFifthTab')
export const activateSixthTab = execCommand('activateSixthTab')
export const activateSeventhTab = execCommand('activateSeventhTab')
export const activateEighthTab = execCommand('activateEighthTab')
export const activateLastTab = execCommand('activateLastTab')
export const activateLastActiveTab = execCommand('activateLastActiveTab')
export const activateSecondLastActiveTab = execCommand('activateSecondLastActiveTab')
export const activateThirdLastActiveTab = execCommand('activateThirdLastActiveTab')
export const activateFourthLastActiveTab = execCommand('activateFourthLastActiveTab')
export const activateFifthLastActiveTab = execCommand('activateFifthLastActiveTab')
export const activateSixthLastActiveTab = execCommand('activateSixthLastActiveTab')
export const activateSeventhLastActiveTab = execCommand('activateSeventhLastActiveTab')
export const activateEighthLastActiveTab = execCommand('activateEighthLastActiveTab')
export const activateNinthLastActiveTab = execCommand('activateNinthLastActiveTab')
export const activateNextWindow = execCommand('activateNextWindow')
export const activatePreviousWindow = execCommand('activatePreviousWindow')

// Move tabs -------------------------------------------------------------------

export const grabTab = execCommand('grabTab')
export const moveTabLeft = execCommand('moveTabLeft')
export const moveTabRight = execCommand('moveTabRight')
export const moveTabFirst = execCommand('moveTabFirst')
export const moveTabLast = execCommand('moveTabLast')
export const moveTabNewWindow = execCommand('moveTabNewWindow')
export const moveTabPreviousWindow = execCommand('moveTabPreviousWindow')

// Select tabs -----------------------------------------------------------------

export const selectActiveTab = execCommand('selectActiveTab')
export const selectPreviousTab = execCommand('selectPreviousTab')
export const selectNextTab = execCommand('selectNextTab')
export const selectRelatedTabs = execCommand('selectRelatedTabs')
export const selectTabsInGroup = execCommand('selectTabsInGroup')
export const selectAllTabs = execCommand('selectAllTabs')
export const selectRightTabs = execCommand('selectRightTabs')
export const moveTabSelectionFaceBackward = execCommand('moveTabSelectionFaceBackward')
export const moveTabSelectionFaceForward = execCommand('moveTabSelectionFaceForward')

// Bookmarks -------------------------------------------------------------------

export const bookmarkTab = execCommand('bookmarkTab')
export const bookmarkSession = execCommandAndClosePopup('bookmarkSession')

// Reading list ----------------------------------------------------------------

export const addTabToReadingList = execCommand('addTabToReadingList')

// Folders ---------------------------------------------------------------------

export const openDownloadsFolder = execCommandAndClosePopup('openDownloadsFolder')

// Chrome URLs -----------------------------------------------------------------

export const openBrowsingHistory = execCommandAndClosePopup('openBrowsingHistory')
export const openSyncedTabsPage = execCommandAndClosePopup('openSyncedTabsPage')
export const openClearBrowserDataOptions = execCommandAndClosePopup('openClearBrowserDataOptions')
export const openDownloadHistory = execCommandAndClosePopup('openDownloadHistory')
export const openBookmarkManager = execCommandAndClosePopup('openBookmarkManager')
export const openSettings = execCommandAndClosePopup('openSettings')
export const openAppearanceSettings = execCommandAndClosePopup('openAppearanceSettings')
export const openPasswordManager = execCommandAndClosePopup('openPasswordManager')
export const openPaymentMethodSettings = execCommandAndClosePopup('openPaymentMethodSettings')
export const openAddressSettings = execCommandAndClosePopup('openAddressSettings')
export const openSearchEngineSettings = execCommandAndClosePopup('openSearchEngineSettings')
export const openAppsPage = execCommandAndClosePopup('openAppsPage')
export const openExtensionsPage = execCommandAndClosePopup('openExtensionsPage')
export const openExtensionShortcutsPage = execCommandAndClosePopup('openExtensionShortcutsPage')
export const openExperimentalSettings = execCommandAndClosePopup('openExperimentalSettings')
export const openAboutChromePage = execCommandAndClosePopup('openAboutChromePage')
export const openAboutChromeVersionPage = execCommandAndClosePopup('openAboutChromeVersionPage')
export const openWhatsNewPage = execCommandAndClosePopup('openWhatsNewPage')

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
 * Waits for a specific navigation event.
 * See “webNavigation events” for details.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/webNavigation#event
 *
 * @param {number} tabId
 * @param {string} eventType
 * @returns {Promise<object>}
 */
async function waitForNavigation(tabId, eventType) {
  return new Promise((resolve) => {
    chrome.webNavigation[eventType].addListener(
      function fireAndForget(details) {
        if (details.tabId === tabId) {
          chrome.webNavigation[eventType].removeListener(fireAndForget)
          resolve(details)
        }
      }
    )
  })
}
