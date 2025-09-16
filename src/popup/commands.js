// This module contains the popup commands.

/**
 * @typedef {object} PopupCommandContext
 * @property {chrome.runtime.Port} port
 * @property {Window} popupWindow
 * @property {HTMLElement} paletteInputElement
 */

/**
 * Creates a new function that, when called, sends a message to the service worker.
 *
 * @param {string} commandName
 * @returns {(cx: PopupCommandContext) => void}
 */
function message(commandName) {
  return (cx) => {
    cx.port.postMessage({
      type: 'command',
      commandName
    })
  }
}

// Shortcuts -------------------------------------------------------------------

export const openShortcutsManual = message('openShortcutsManual')
export const openShortcutsOptionsPage = message('openShortcutsOptionsPage')
export const openShortcutsShortcutsPage = message('openShortcutsShortcutsPage')

/**
 * Opens the command palette.
 *
 * @param {PopupCommandContext} cx
 * @returns {void}
 */
export function openCommandPalette(cx) {
  cx.paletteInputElement.focus()
}

/**
 * Closes the popup window.
 *
 * @param {PopupCommandContext} cx
 * @returns {void}
 */
export function closePopup(cx) {
  cx.popupWindow.close()
}

// Navigation ------------------------------------------------------------------

export const goBack = message('goBack')
export const goForward = message('goForward')
export const reloadTab = message('reloadTab')
export const reloadTabWithoutCache = message('reloadTabWithoutCache')
export const goToNextPage = message('goToNextPage')
export const goToPreviousPage = message('goToPreviousPage')
export const removeURLParams = message('removeURLParams')
export const goUp = message('goUp')
export const goToRoot = message('goToRoot')

// Accessibility ---------------------------------------------------------------

export const focusTextInput = message('focusTextInput')
export const focusMediaPlayer = message('focusMediaPlayer')
export const blurElement = message('blurElement')

// Clipboard -------------------------------------------------------------------

export const copyURL = message('copyURL')
export const copyTitle = message('copyTitle')
export const copyTitleAndURL = message('copyTitleAndURL')
export const openNewTabsFromClipboard = message('openNewTabsFromClipboard')

// Save pages ------------------------------------------------------------------

export const savePage = message('savePage')
export const savePageAsMHTML = message('savePageAsMHTML')

// Web search ------------------------------------------------------------------

export const openWebSearchForSelectedText = message('openWebSearchForSelectedText')

// Scroll ----------------------------------------------------------------------

export const scrollDown = message('scrollDown')
export const scrollUp = message('scrollUp')
export const scrollLeft = message('scrollLeft')
export const scrollRight = message('scrollRight')
export const scrollPageDown = message('scrollPageDown')
export const scrollPageUp = message('scrollPageUp')
export const scrollHalfPageDown = message('scrollHalfPageDown')
export const scrollHalfPageUp = message('scrollHalfPageUp')
export const scrollToTop = message('scrollToTop')
export const scrollToBottom = message('scrollToBottom')

// Zoom ------------------------------------------------------------------------

export const zoomIn = message('zoomIn')
export const zoomOut = message('zoomOut')
export const zoomReset = message('zoomReset')

// Window state ----------------------------------------------------------------

export const minimizeWindow = message('minimizeWindow')
export const maximizeWindow = message('maximizeWindow')
export const toggleFullScreen = message('toggleFullScreen')
export const togglePictureInPicture = message('togglePictureInPicture')

// Create tabs -----------------------------------------------------------------

export const openNewTab = message('openNewTab')
export const openNewTabRight = message('openNewTabRight')
export const openNewWindow = message('openNewWindow')
export const openNewIncognitoWindow = message('openNewIncognitoWindow')

// Close tabs ------------------------------------------------------------------

export const closeTab = message('closeTab')
export const closeOtherTabs = message('closeOtherTabs')
export const closeRightTabs = message('closeRightTabs')
export const closeWindow = message('closeWindow')
export const restoreTab = message('restoreTab')

// Tab state -------------------------------------------------------------------

export const duplicateTab = message('duplicateTab')
export const togglePinTab = message('togglePinTab')
export const toggleGroupTab = message('toggleGroupTab')
export const toggleCollapseTabGroups = message('toggleCollapseTabGroups')
export const toggleMuteTab = message('toggleMuteTab')
export const discardTab = message('discardTab')

// Organize tabs ---------------------------------------------------------------

export const sortTabsByName = message('sortTabsByName')
export const sortTabsByURL = message('sortTabsByURL')
export const sortTabsByRecency = message('sortTabsByRecency')
export const reverseTabOrder = message('reverseTabOrder')
export const groupTabsByDomain = message('groupTabsByDomain')

// Manage tab groups -----------------------------------------------------------

export const collapseTabGroup = message('collapseTabGroup')
export const renameTabGroup = message('renameTabGroup')
export const cycleTabGroupColorForward = message('cycleTabGroupColorForward')
export const cycleTabGroupColorBackward = message('cycleTabGroupColorBackward')

// Switch tabs -----------------------------------------------------------------

export const activateAudibleTab = message('activateAudibleTab')
export const activateNextTab = message('activateNextTab')
export const activatePreviousTab = message('activatePreviousTab')
export const activateFirstTab = message('activateFirstTab')
export const activateSecondTab = message('activateSecondTab')
export const activateThirdTab = message('activateThirdTab')
export const activateFourthTab = message('activateFourthTab')
export const activateFifthTab = message('activateFifthTab')
export const activateSixthTab = message('activateSixthTab')
export const activateSeventhTab = message('activateSeventhTab')
export const activateEighthTab = message('activateEighthTab')
export const activateLastTab = message('activateLastTab')
export const activateLastActiveTab = message('activateLastActiveTab')
export const activateSecondLastActiveTab = message('activateSecondLastActiveTab')
export const activateThirdLastActiveTab = message('activateThirdLastActiveTab')
export const activateFourthLastActiveTab = message('activateFourthLastActiveTab')
export const activateFifthLastActiveTab = message('activateFifthLastActiveTab')
export const activateSixthLastActiveTab = message('activateSixthLastActiveTab')
export const activateSeventhLastActiveTab = message('activateSeventhLastActiveTab')
export const activateEighthLastActiveTab = message('activateEighthLastActiveTab')
export const activateNinthLastActiveTab = message('activateNinthLastActiveTab')
export const activateNextWindow = message('activateNextWindow')
export const activatePreviousWindow = message('activatePreviousWindow')

// Move tabs -------------------------------------------------------------------

export const grabTab = message('grabTab')
export const moveTabLeft = message('moveTabLeft')
export const moveTabRight = message('moveTabRight')
export const moveTabFirst = message('moveTabFirst')
export const moveTabLast = message('moveTabLast')
export const moveTabNewWindow = message('moveTabNewWindow')
export const moveTabPreviousWindow = message('moveTabPreviousWindow')

// Select tabs -----------------------------------------------------------------

export const selectActiveTab = message('selectActiveTab')
export const selectPreviousTab = message('selectPreviousTab')
export const selectNextTab = message('selectNextTab')
export const selectRelatedTabs = message('selectRelatedTabs')
export const selectTabsInGroup = message('selectTabsInGroup')
export const selectAllTabs = message('selectAllTabs')
export const selectRightTabs = message('selectRightTabs')
export const moveTabSelectionFaceBackward = message('moveTabSelectionFaceBackward')
export const moveTabSelectionFaceForward = message('moveTabSelectionFaceForward')

// Bookmarks -------------------------------------------------------------------

export const bookmarkTab = message('bookmarkTab')
export const bookmarkSession = message('bookmarkSession')

// Reading list ----------------------------------------------------------------

export const addTabToReadingList = message('addTabToReadingList')

// Folders ---------------------------------------------------------------------

export const openDownloadsFolder = message('openDownloadsFolder')

// Chrome URLs -----------------------------------------------------------------

export const openBrowsingHistory = message('openBrowsingHistory')
export const openSyncedTabsPage = message('openSyncedTabsPage')
export const openClearBrowserDataOptions = message('openClearBrowserDataOptions')
export const openDownloadHistory = message('openDownloadHistory')
export const openBookmarkManager = message('openBookmarkManager')
export const openSettings = message('openSettings')
export const openAppearanceSettings = message('openAppearanceSettings')
export const openPasswordManager = message('openPasswordManager')
export const openPaymentMethodSettings = message('openPaymentMethodSettings')
export const openAddressSettings = message('openAddressSettings')
export const openSearchEngineSettings = message('openSearchEngineSettings')
export const openAppsPage = message('openAppsPage')
export const openExtensionsPage = message('openExtensionsPage')
export const openExtensionShortcutsPage = message('openExtensionShortcutsPage')
export const openExperimentalSettings = message('openExperimentalSettings')
export const openAboutChromePage = message('openAboutChromePage')
export const openAboutChromeVersionPage = message('openAboutChromeVersionPage')
export const openWhatsNewPage = message('openWhatsNewPage')
