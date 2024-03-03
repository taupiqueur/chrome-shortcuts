import MRU from './lib/mru.js'

const { WINDOW_ID_NONE } = chrome.windows

/**
 * This class provides the functionality to manage a cache of the most recently used tabs.
 * It keeps track of and maintains a list of recently used tabs within the extension.
 *
 * Cache replacement policies: https://en.wikipedia.org/wiki/Cache_replacement_policies
 */
class RecentTabsManager {
  /**
   * Creates a new MRU tabs manager.
   */
  constructor() {
    /**
     * The MRU cache.
     *
     * @type {MRU}
     */
    this.cache = new MRU
  }

  /**
   * Sets the most recently used tab.
   *
   * @param {number} tabId
   * @returns {void}
   */
  setMostRecentTab(tabId) {
    this.cache.add(tabId)
  }

  /**
   * Removes a specified tab from the list of recently used tabs.
   *
   * @param {number} tabId
   * @returns {void}
   */
  removeTabFromCache(tabId) {
    this.cache.delete(tabId)
  }

  /**
   * Retrieves the list of tabs from the cache,
   * in the order of most recently used.
   *
   * @returns {number[]}
   */
  getRecentTabs() {
    return Array.from(this.cache.values())
  }

  /**
   * Saves state into the session storage area.
   *
   * @returns {Promise<void>}
   */
  async saveState() {
    await chrome.storage.session.set({
      recentTabs: this.getRecentTabs()
    })
  }

  /**
   * Restores state from the session storage area.
   *
   * @returns {Promise<void>}
   */
  async restoreState() {
    const sessionStorage = await chrome.storage.session.get({
      recentTabs: []
    })

    for (const tabId of sessionStorage.recentTabs.toReversed()) {
      this.setMostRecentTab(tabId)
    }
  }

  /**
   * Handles the service worker initialization
   * (e.g., upon the service worker’s wake-up).
   *
   * @returns {Promise<void>}
   */
  async onStartup() {
    await this.restoreState()
  }

  /**
   * Handles tab activation, when the active tab in a window changes.
   * Note window activation does not change the active tab.
   *
   * https://developer.chrome.com/docs/extensions/reference/api/tabs#event-onActivated
   *
   * @param {object} activeInfo
   * @returns {Promise<void>}
   */
  async onTabActivated(activeInfo) {
    this.setMostRecentTab(activeInfo.tabId)
    await this.saveState()
  }

  /**
   * Handles tab closing, when a tab is closed or a window is being closed.
   *
   * https://developer.chrome.com/docs/extensions/reference/api/tabs#event-onRemoved
   *
   * @param {number} tabId
   * @param {object} removeInfo
   * @returns {Promise<void>}
   */
  async onTabRemoved(tabId, removeInfo) {
    this.removeTabFromCache(tabId)
    await this.saveState()
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
   * @returns {Promise<void>}
   */
  async onWindowFocusChanged(windowId) {
    if (windowId === WINDOW_ID_NONE) {
      return
    }

    const tabs = await chrome.tabs.query({
      active: true,
      windowId
    })

    if (tabs.length > 0) {
      const tabInfo = tabs[0]

      this.setMostRecentTab(tabInfo.id)
      await this.saveState()
    }
  }
}

export default RecentTabsManager
