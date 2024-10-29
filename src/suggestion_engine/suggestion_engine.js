// This module contains the suggestion engine.

import {
  getOpenTabSuggestions,
  getRecentlyClosedTabSuggestions,
  getSyncedTabSuggestions,
  getBookmarkSuggestions,
  getReadingListSuggestions,
  getRecentlyVisitedPageSuggestions,
  getDownloadSuggestions,
} from './suggestion_providers.js'

/**
 * @typedef {OpenTabSuggestion | ClosedTabSuggestion | BookmarkSuggestion | ReadingListSuggestion | HistorySuggestion | DownloadSuggestion} Suggestion
 */

const { TAB_GROUP_ID_NONE } = chrome.tabGroups

// Enum representing a suggestion type.
export const SuggestionType = {
  OpenTab: 'openTab',
  ClosedTab: 'closedTab',
  SyncedTab: 'syncedTab',
  Bookmark: 'bookmark',
  ReadingList: 'readingList',
  History: 'history',
  Download: 'download',
  Combined: 'combined',
}

/**
 * This class provides the functionality to search and activate suggestions.
 */
class SuggestionEngine {
  /**
   * Creates a new suggestion engine.
   *
   * @param {object} options
   * @param {RecentTabsManager} options.recentTabsManager
   */
  constructor({
    recentTabsManager
  }) {
    /**
     * A recent tabs manager instance.
     *
     * @type {RecentTabsManager}
     */
    this.recentTabsManager = recentTabsManager
  }

  /**
   * Searches for suggestions matching the given search text.
   * Specify an empty search text (`""`) to retrieve all suggestions.
   *
   * NOTE: Search text is ignored for some suggestion types.
   *
   * @param {{ mode: SuggestionType, query: string }} queryInfo
   * @returns {Promise<Suggestion[]>}
   */
  async search({
    mode: suggestionType,
    query: searchText
  }) {
    switch (suggestionType) {
      case SuggestionType.OpenTab:
        return getOpenTabSuggestions(searchText, this.recentTabsManager)

      case SuggestionType.ClosedTab:
        return getRecentlyClosedTabSuggestions(searchText)

      case SuggestionType.SyncedTab:
        return getSyncedTabSuggestions(searchText)

      case SuggestionType.Bookmark:
        return getBookmarkSuggestions(searchText)

      case SuggestionType.ReadingList:
        return getReadingListSuggestions(searchText)

      case SuggestionType.History:
        return getRecentlyVisitedPageSuggestions(searchText)

      case SuggestionType.Download:
        return getDownloadSuggestions(searchText)

      case SuggestionType.Combined: {
        const suggestionResults = await Promise.all([
          getOpenTabSuggestions(searchText, this.recentTabsManager),
          getRecentlyClosedTabSuggestions(searchText),
          getSyncedTabSuggestions(searchText),
          getBookmarkSuggestions(searchText),
          getReadingListSuggestions(searchText),
          getRecentlyVisitedPageSuggestions(searchText),
          getDownloadSuggestions(searchText),
        ])
        return suggestionResults.flat()
      }

      default:
        throw new TypeError(
          `Invalid mode: "${suggestionType}"`
        )
    }
  }

  /**
   * Activates a given suggestion.
   *
   * @param {Suggestion} suggestion
   * @param {chrome.tabs.Tab} tab
   * @returns {Promise<void>}
   */
  async activate(suggestion, tab) {
    switch (suggestion.type) {
      case SuggestionType.OpenTab:
        await chrome.tabs.update(suggestion.tabId, {
          active: true
        })
        await chrome.windows.update(suggestion.windowId, {
          focused: true
        })
        break

      case SuggestionType.ClosedTab:
        await chrome.sessions.restore(suggestion.sessionId)
        break

      case SuggestionType.SyncedTab:
        await chrome.sessions.restore(suggestion.sessionId)
        break

      case SuggestionType.Bookmark:
        await openNewTab({
          active: true,
          url: suggestion.url,
          openerTabId: tab.id,
        })
        break

      case SuggestionType.ReadingList:
        await openNewTab({
          active: true,
          url: suggestion.url,
          openerTabId: tab.id,
        })
        break

      case SuggestionType.History:
        await openNewTab({
          active: true,
          url: suggestion.url,
          openerTabId: tab.id,
        })
        break

      case SuggestionType.Download:
        await chrome.downloads.show(suggestion.downloadId)
        break

      default:
        console.error(
          'Activation not yet implemented for suggestions of type: "%s"',
          suggestion.type
        )
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

export default SuggestionEngine
