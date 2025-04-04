// This module contains suggestion providers.

// Open tab suggestions --------------------------------------------------------

/**
 * @typedef {object} OpenTabSuggestion
 * @property {"openTab"} type
 * @property {number} tabId
 * @property {number} windowId
 * @property {string} title
 * @property {string} url
 */

/**
 * Creates a new open tab suggestion.
 *
 * @param {chrome.tabs.Tab} tab
 * @returns {OpenTabSuggestion}
 */
const newOpenTabSuggestion = tab => ({
  type: 'openTab',
  tabId: tab.id,
  windowId: tab.windowId,
  title: tab.title,
  url: tab.url
})

/**
 * Retrieves open tab suggestions.
 * Results are ordered by recency and
 * the current tab is not included.
 *
 * NOTE: Search text is ignored for this suggestion type.
 *
 * @param {string} searchText
 * @param {RecentTabsManager} recentTabsManager
 * @returns {Promise<OpenTabSuggestion[]>}
 */
export async function getOpenTabSuggestions(searchText, recentTabsManager) {
  const tabs = await chrome.tabs.query({})

  const recentTabs = recentTabsManager.getRecentTabs()

  const tabMap = new Map

  for (const tabId of recentTabs) {
    tabMap.set(tabId, null)
  }

  for (const tab of tabs) {
    tabMap.set(tab.id, tab)
  }

  for (const tabId of recentTabs) {
    if (tabMap.get(tabId) === null) {
      tabMap.delete(tabId)
    }
  }

  tabMap.delete(recentTabs[0])

  return Array.from(
    tabMap.values(),
    newOpenTabSuggestion
  )
}

// Closed tab suggestions ------------------------------------------------------

/**
 * @typedef {object} ClosedTabSuggestion
 * @property {"closedTab"} type
 * @property {number} sessionId
 * @property {string} title
 * @property {string} url
 */

/**
 * Creates a new closed tab suggestion.
 *
 * @param {chrome.sessions.Session} tabSession
 * @returns {ClosedTabSuggestion}
 */
const newClosedTabSuggestion = tabSession => ({
  type: 'closedTab',
  sessionId: tabSession.tab.sessionId,
  title: tabSession.tab.title,
  url: tabSession.tab.url
})

/**
 * Retrieves recently closed tab suggestions.
 *
 * NOTE: Search text is ignored for this suggestion type.
 *
 * @param {string} searchText
 * @returns {Promise<ClosedTabSuggestion[]>}
 */
export async function getRecentlyClosedTabSuggestions(searchText) {
  const sessions = await chrome.sessions.getRecentlyClosed()
  const suggestions = []
  for (const session of sessions) {
    switch (true) {
      case 'tab' in session:
        suggestions.push(
          newClosedTabSuggestion(session)
        )
        break

      case 'window' in session:
        const { lastModified } = session
        for (const tab of session.window.tabs) {
          suggestions.push(
            newClosedTabSuggestion({
              tab,
              lastModified
            })
          )
        }
        break
    }
  }
  return suggestions
}

// Synced tab suggestions ------------------------------------------------------

/**
 * @typedef {object} SyncedTabSuggestion
 * @property {"syncedTab"} type
 * @property {string} deviceName
 * @property {number} sessionId
 * @property {string} title
 * @property {string} url
 */

/**
 * Creates a new synced tab suggestion.
 *
 * @param {string} deviceName
 * @param {chrome.sessions.Session} tabSession
 * @returns {SyncedTabSuggestion}
 */
const newSyncedTabSuggestion = (deviceName, tabSession) => ({
  type: 'syncedTab',
  deviceName,
  sessionId: tabSession.tab.sessionId,
  title: tabSession.tab.title,
  url: tabSession.tab.url
})

/**
 * Retrieves synced tab suggestions.
 *
 * NOTE: Search text is ignored for this suggestion type.
 *
 * @param {string} searchText
 * @returns {Promise<SyncedTabSuggestion[]>}
 */
export async function getSyncedTabSuggestions(searchText) {
  const devices = await chrome.sessions.getDevices()

  return devices.flatMap((device) =>
    device.sessions.flatMap((session) =>
      session.window.tabs.map((tab) =>
        newSyncedTabSuggestion(device.deviceName, {
          tab,
          lastModified: session.lastModified
        })
      )
    )
  )
}

// Bookmark suggestions --------------------------------------------------------

/**
 * @typedef {object} BookmarkSuggestion
 * @property {"bookmark"} type
 * @property {string} title
 * @property {string} url
 */

/**
 * Creates a new bookmark suggestion.
 *
 * @param {chrome.bookmarks.BookmarkTreeNode} bookmark
 * @returns {BookmarkSuggestion}
 */
const newBookmarkSuggestion = bookmark => ({
  type: 'bookmark',
  title: bookmark.title,
  url: bookmark.url
})

/**
 * Retrieves bookmark suggestions.
 *
 * @param {string} searchText
 * @returns {Promise<BookmarkSuggestion[]>}
 */
export async function getBookmarkSuggestions(searchText) {
  const bookmarks = await chrome.bookmarks.search({
    query: searchText === ''
      ? null
      : searchText
  })
  return bookmarks
    .filter((bookmark) => bookmark.url)
    .map(newBookmarkSuggestion)
}

// Reading list suggestions ----------------------------------------------------

/**
 * @typedef {object} ReadingListSuggestion
 * @property {"readingList"} type
 * @property {string} title
 * @property {string} url
 */

/**
 * Creates a new reading list suggestion.
 *
 * @param {chrome.readingList.ReadingListEntry} item
 * @returns {ReadingListSuggestion}
 */
const newReadingListSuggestion = item => ({
  type: 'readingList',
  title: item.title,
  url: item.url
})

/**
 * Retrieves reading list suggestions.
 *
 * NOTE: Search text is ignored for this suggestion type.
 *
 * @param {string} searchText
 * @returns {Promise<ReadingListSuggestion[]>}
 */
export async function getReadingListSuggestions(searchText) {
  const items = await chrome.readingList.query({})
  return items.map(newReadingListSuggestion)
}

// History suggestions ---------------------------------------------------------

/**
 * @typedef {object} HistorySuggestion
 * @property {"history"} type
 * @property {string} title
 * @property {string} url
 */

/**
 * Creates a new history suggestion.
 *
 * @param {chrome.history.HistoryItem} historyItem
 * @returns {HistorySuggestion}
 */
const newHistorySuggestion = historyItem => ({
  type: 'history',
  title: historyItem.title,
  url: historyItem.url
})

/**
 * Retrieves recently visited page suggestions.
 *
 * @param {string} searchText
 * @returns {Promise<HistorySuggestion[]>}
 */
export async function getRecentlyVisitedPageSuggestions(searchText) {
  const historyItems = await chrome.history.search({
    text: searchText
  })
  return historyItems.map(newHistorySuggestion)
}

// Download suggestions --------------------------------------------------------

/**
 * @typedef {object} DownloadSuggestion
 * @property {"download"} type
 * @property {number} downloadId
 * @property {string} title
 * @property {string} url
 */

/**
 * Creates a new download suggestion.
 *
 * @param {chrome.downloads.DownloadItem} downloadItem
 * @returns {DownloadSuggestion}
 */
const newDownloadSuggestion = downloadItem => ({
  type: 'download',
  downloadId: downloadItem.id,
  title: downloadItem.filename.substring(downloadItem.filename.lastIndexOf('/') + 1),
  url: downloadItem.finalUrl
})

/**
 * Retrieves download suggestions.
 *
 * @param {string} searchText
 * @returns {Promise<DownloadSuggestion[]>}
 */
export async function getDownloadSuggestions(searchText) {
  const downloadItems = await chrome.downloads.search({
    state: 'complete',
    exists: true,
    query: [searchText]
  })
  return downloadItems.map(newDownloadSuggestion)
}

// Extension suggestions -------------------------------------------------------

/**
 * @typedef {object} ExtensionSuggestion
 * @property {"extension"} type
 * @property {string} title
 * @property {string} url
 */

/**
 * Creates a new extension suggestion.
 *
 * @param {chrome.management.ExtensionInfo} extensionInfo
 * @returns {ExtensionSuggestion}
 */
const newExtensionSuggestion = extensionInfo => ({
  type: 'extension',
  title: `${extensionInfo.name} ${extensionInfo.version}`,
  url: `chrome://extensions/?id=${extensionInfo.id}`
})

/**
 * Retrieves installed extension suggestions.
 *
 * NOTE: Search text is ignored for this suggestion type.
 *
 * @param {string} searchText
 * @returns {Promise<ExtensionSuggestion[]>}
 */
export async function getInstalledExtensionSuggestions(searchText) {
  const installedExtensions = await chrome.management.getAll()
  return installedExtensions
    .filter((extensionInfo) => extensionInfo.type === 'extension')
    .map(newExtensionSuggestion)
}
