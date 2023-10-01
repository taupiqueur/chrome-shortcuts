// This class provides the functionality to manage a cache of the most recently used tabs.
// It keeps track of and maintains a list of recently used tabs within the extension.
// Cache replacement policies: https://en.wikipedia.org/wiki/Cache_replacement_policies

import MRU from './lib/mru.js'

// Constants
const { WINDOW_ID_NONE } = chrome.windows

class MostRecentlyUsedTabsManager {
  // Creates a new MRU tabs manager.
  constructor() {
    // The MRU cache.
    this.cache = new MRU
  }

  // Sets the most recently used tab.
  setMostRecentTab(tabId) {
    this.cache.add(tabId)
  }

  // Removes a specified tab from the list of recently used tabs.
  removeTabFromCache(tabId) {
    this.cache.delete(tabId)
  }

  // Retrieves the list of tabs from the cache, in the order of most recently used.
  getMostRecentTabs() {
    return Array.from(this.cache.values())
  }

  // Saves state into the session storage area.
  async saveState() {
    await chrome.storage.session.set({ mostRecentlyUsedTabs: this.getMostRecentTabs() })
  }

  // Restores state from the session storage area.
  async restoreState() {
    const sessionStorage = await chrome.storage.session.get({
      mostRecentlyUsedTabs: []
    })
    for (let index = sessionStorage.mostRecentlyUsedTabs.length - 1; index >= 0; index--) {
      const tabId = sessionStorage.mostRecentlyUsedTabs[index]
      this.setMostRecentTab(tabId)
    }
  }

  // Handles the service worker initialization
  // (e.g., upon the service worker’s wake-up).
  async onStartup() {
    await this.restoreState()
  }

  // Handles the service worker unloading, just before it goes dormant.
  // This gives the extension an opportunity to save its current state.
  // Reference: https://developer.chrome.com/docs/extensions/reference/runtime/#event-onSuspend
  async onSuspend() {
    await this.saveState()
  }

  // Handles tab activation, when the active tab in a window changes.
  // Note window activation does not change the active tab.
  // Reference: https://developer.chrome.com/docs/extensions/reference/tabs/#event-onActivated
  async onTabActivated(activeInfo) {
    this.setMostRecentTab(activeInfo.tabId)
    await this.saveState()
  }

  // Handles tab closing, when a tab is closed or a window is being closed.
  // Reference: https://developer.chrome.com/docs/extensions/reference/tabs/#event-onRemoved
  async onTabRemoved(tabId, removeInfo) {
    this.removeTabFromCache(tabId)
    await this.saveState()
  }

  // Handles window activation, when the currently focused window changes.
  // Will be `WINDOW_ID_NONE` if all Chrome windows have lost focus.
  // Note: On some window managers (e.g., Sway), `WINDOW_ID_NONE` will always be sent immediately preceding a switch from one Chrome window to another.
  // Reference: https://developer.chrome.com/docs/extensions/reference/windows/#event-onFocusChanged
  async onWindowFocusChanged(windowId) {
    if (windowId === WINDOW_ID_NONE) {
      return
    }
    const [activeTab] = await chrome.tabs.query({ active: true, windowId })
    if (activeTab) {
      this.setMostRecentTab(activeTab.id)
      await this.saveState()
    }
  }
}

export default MostRecentlyUsedTabsManager
