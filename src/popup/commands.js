// This module contains the popup commands.

/**
 * Creates a new function that, when called, sends a message to the service worker.
 *
 * @param {string} commandName
 * @param {boolean} passingMode
 * @param {boolean} stickyWindow
 * @returns {(port: chrome.runtime.Port) => void}
 */
function message(commandName, passingMode, stickyWindow) {
  return (port) => {
    port.postMessage({
      type: 'command',
      commandName,
      passingMode,
      stickyWindow
    })
  }
}

// Shortcuts -------------------------------------------------------------------

export const openShortcutsManual = message('openShortcutsManual')

// Navigation ------------------------------------------------------------------

export const goBack = message('goBack', false, true)
export const goForward = message('goForward', false, true)
export const reloadTab = message('reloadTab')
export const reloadTabWithoutCache = message('reloadTabWithoutCache')
export const goToNextPage = message('goToNextPage', false, true)
export const goToPreviousPage = message('goToPreviousPage', false, true)
export const removeURLParams = message('removeURLParams', false, true)
export const goUp = message('goUp', false, true)
export const goToRoot = message('goToRoot', false, true)

// Accessibility ---------------------------------------------------------------

export const focusTextInput = message('focusTextInput', true)
export const focusMediaPlayer = message('focusMediaPlayer', true)
export const blurElement = message('blurElement', true)

// Clipboard -------------------------------------------------------------------

export const copyURL = message('copyURL', true)
export const copyTitle = message('copyTitle', true)
export const copyTitleAndURL = message('copyTitleAndURL', true)

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
export const toggleFullScreen = message('toggleFullScreen', true, true)

// Create tabs -----------------------------------------------------------------

export const openNewTab = message('openNewTab')
export const openNewTabRight = message('openNewTabRight')
export const openNewWindow = message('openNewWindow')
export const openNewIncognitoWindow = message('openNewIncognitoWindow')

// Close tabs ------------------------------------------------------------------

export const closeTab = message('closeTab', false, true)
export const closeWindow = message('closeWindow')
export const restoreTab = message('restoreTab', false, true)

// Tab state -------------------------------------------------------------------

export const duplicateTab = message('duplicateTab', false, true)
export const togglePinTab = message('togglePinTab')
export const toggleGroupTab = message('toggleGroupTab')
export const toggleCollapseTabGroups = message('toggleCollapseTabGroups')
export const toggleMuteTab = message('toggleMuteTab')
export const discardTab = message('discardTab')

// Organize tabs ---------------------------------------------------------------

export const sortTabsByURL = message('sortTabsByURL')
export const groupTabsByDomain = message('groupTabsByDomain')

// Manage tab groups -----------------------------------------------------------

export const renameTabGroup = message('renameTabGroup')
export const cycleTabGroupColorForward = message('cycleTabGroupColorForward')
export const cycleTabGroupColorBackward = message('cycleTabGroupColorBackward')

// Switch tabs -----------------------------------------------------------------

export const activateAudibleTab = message('activateAudibleTab', false, true)
export const activateNextTab = message('activateNextTab', false, true)
export const activatePreviousTab = message('activatePreviousTab', false, true)
export const activateFirstTab = message('activateFirstTab', false, true)
export const activateSecondTab = message('activateSecondTab', false, true)
export const activateThirdTab = message('activateThirdTab', false, true)
export const activateFourthTab = message('activateFourthTab', false, true)
export const activateFifthTab = message('activateFifthTab', false, true)
export const activateSixthTab = message('activateSixthTab', false, true)
export const activateSeventhTab = message('activateSeventhTab', false, true)
export const activateEighthTab = message('activateEighthTab', false, true)
export const activateLastTab = message('activateLastTab', false, true)
export const activateLastActiveTab = message('activateLastActiveTab', true, true)
export const activateSecondLastActiveTab = message('activateSecondLastActiveTab', true, true)
export const activateThirdLastActiveTab = message('activateThirdLastActiveTab', true, true)
export const activateFourthLastActiveTab = message('activateFourthLastActiveTab', true, true)
export const activateFifthLastActiveTab = message('activateFifthLastActiveTab', true, true)
export const activateSixthLastActiveTab = message('activateSixthLastActiveTab', true, true)
export const activateSeventhLastActiveTab = message('activateSeventhLastActiveTab', true, true)
export const activateEighthLastActiveTab = message('activateEighthLastActiveTab', true, true)
export const activateNinthLastActiveTab = message('activateNinthLastActiveTab', true, true)
export const activateNextWindow = message('activateNextWindow', true, true)
export const activatePreviousWindow = message('activatePreviousWindow', true, true)

// Move tabs -------------------------------------------------------------------

export const grabTab = message('grabTab')
export const moveTabLeft = message('moveTabLeft')
export const moveTabRight = message('moveTabRight')
export const moveTabFirst = message('moveTabFirst')
export const moveTabLast = message('moveTabLast')
export const moveTabNewWindow = message('moveTabNewWindow', false, true)
export const moveTabPreviousWindow = message('moveTabPreviousWindow', false, true)

// Select tabs -----------------------------------------------------------------

export const selectActiveTab = message('selectActiveTab')
export const selectPreviousTab = message('selectPreviousTab')
export const selectNextTab = message('selectNextTab')
export const selectRelatedTabs = message('selectRelatedTabs')
export const selectTabsInGroup = message('selectTabsInGroup')
export const selectAllTabs = message('selectAllTabs')
export const selectRightTabs = message('selectRightTabs')
export const moveTabSelectionFaceBackward = message('moveTabSelectionFaceBackward', false, true)
export const moveTabSelectionFaceForward = message('moveTabSelectionFaceForward', false, true)

// Bookmarks -------------------------------------------------------------------

export const bookmarkTab = message('bookmarkTab')
export const bookmarkSession = message('bookmarkSession', false, true)

// Reading list ----------------------------------------------------------------

export const addTabToReadingList = message('addTabToReadingList')

// Folders ---------------------------------------------------------------------

export const openDownloadsFolder = message('openDownloadsFolder')

// Chrome URLs -----------------------------------------------------------------

export const openHistoryPage = message('openHistoryPage')
export const openSyncedTabsPage = message('openSyncedTabsPage')
export const openClearBrowserDataPage = message('openClearBrowserDataPage')
export const openDownloadsPage = message('openDownloadsPage')
export const openBookmarksPage = message('openBookmarksPage')
export const openSettingsPage = message('openSettingsPage')
export const openPasswordsPage = message('openPasswordsPage')
export const openSearchEnginesPage = message('openSearchEnginesPage')
export const openExtensionsPage = message('openExtensionsPage')
export const openExtensionShortcutsPage = message('openExtensionShortcutsPage')
export const openExperimentsPage = message('openExperimentsPage')

// Popup -----------------------------------------------------------------------

/**
 * Closes the popup window.
 *
 * @returns {void}
 */
export function closePopup() {
  window.close()
}
