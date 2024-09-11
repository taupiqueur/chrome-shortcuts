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
 * Retrieves suggestions of specified type.
 * Specify an empty search text (`""`) to retrieve all suggestions.
 *
 * NOTE: Search text is ignored for some suggestion types.
 *
 * @param {SuggestionType} suggestionType
 * @param {string} searchText
 * @param {Context} cx
 * @returns {Promise<Suggestion[]>}
 */
export async function getSuggestions(suggestionType, searchText, cx) {
  switch (suggestionType) {
    case SuggestionType.OpenTab:
      return getOpenTabSuggestions(searchText, cx)

    case SuggestionType.ClosedTab:
      return getRecentlyClosedTabSuggestions(searchText, cx)

    case SuggestionType.SyncedTab:
      return getSyncedTabSuggestions(searchText, cx)

    case SuggestionType.Bookmark:
      return getBookmarkSuggestions(searchText, cx)

    case SuggestionType.ReadingList:
      return getReadingListSuggestions(searchText, cx)

    case SuggestionType.History:
      return getRecentlyVisitedPageSuggestions(searchText, cx)

    case SuggestionType.Download:
      return getDownloadSuggestions(searchText, cx)

    case SuggestionType.Combined: {
      const suggestionResults = await Promise.all([
        getOpenTabSuggestions(searchText, cx),
        getRecentlyClosedTabSuggestions(searchText, cx),
        getSyncedTabSuggestions(searchText, cx),
        getBookmarkSuggestions(searchText, cx),
        getReadingListSuggestions(searchText, cx),
        getRecentlyVisitedPageSuggestions(searchText, cx),
        getDownloadSuggestions(searchText, cx),
      ])
      return suggestionResults.flat()
    }

    default:
      console.error(
        'Suggestion provider not yet implemented for suggestions of type: "%s"',
        suggestionType
      )
  }
}

/**
 * Activates a given suggestion.
 *
 * @param {Suggestion} suggestion
 * @param {Context} cx
 * @returns {Promise<void>}
 */
export async function activateSuggestion(suggestion, cx) {
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
      await openNewTabRight(cx, suggestion.url)
      break

    case SuggestionType.ReadingList:
      await openNewTabRight(cx, suggestion.url)
      break

    case SuggestionType.History:
      await openNewTabRight(cx, suggestion.url)
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

/**
 * Opens and activates a new tab to the right.
 *
 * @param {Context} cx
 * @param {string} url
 * @returns {Promise<void>}
 */
async function openNewTabRight(cx, url) {
  const createdTab = await chrome.tabs.create({
    active: true,
    url,
    index: cx.tab.index + 1,
    openerTabId: cx.tab.id,
    windowId: cx.tab.windowId
  })

  if (cx.tab.groupId !== TAB_GROUP_ID_NONE) {
    await chrome.tabs.group({
      groupId: cx.tab.groupId,
      tabIds: [
        createdTab.id
      ]
    })
  }
}
