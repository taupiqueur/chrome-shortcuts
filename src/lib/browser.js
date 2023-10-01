// This module contains Chrome API functions.
// Reference: https://developer.chrome.com/docs/extensions/reference/

// Returns the currently focused tab.
// Reference: https://developer.chrome.com/docs/extensions/reference/tabs/#get-the-current-tab
export async function getCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
  return tab
}

// Returns the tab ID of specified tabs.
function getTabIds(tabs) {
  return tabs.map(tab => tab.id)
}

// Focuses the specified tab.
export async function focusTab(tab) {
  // Focus window and activate tab.
  await chrome.tabs.update(tab.id, { active: true })
  await chrome.windows.update(tab.windowId, { focused: true })
}

// Returns `true` if the specified tab is in a group.
export function isTabInGroup(tab) {
  return tab.groupId !== chrome.tabGroups.TAB_GROUP_ID_NONE
}

// Returns the tab group of the given tab, if any.
export async function getTabGroup(tab) {
  return isTabInGroup(tab) ? chrome.tabGroups.get(tab.groupId) : null
}

// Injects a script into the specified tab.
// Returns a `Promise` with details about the injection results.
// Reference: https://developer.chrome.com/docs/extensions/reference/scripting/#method-executeScript
export async function executeScript(tab, func, ...args) {
  return chrome.scripting.executeScript({ func, args, target: { tabId: tab.id } })
}

// Modifies the properties of specified tabs.
// Returns a `Promise` with details about the updated tabs.
// Reference: https://developer.chrome.com/docs/extensions/reference/tabs/#method-update
export async function updateTabs(tabs, updateProperties) {
  return Promise.all(
    tabs.map((tab) => chrome.tabs.update(tab.id, updateProperties))
  )
}

// Modifies the properties of specified tab groups.
// Returns a `Promise` with details about the updated tab groups.
// Reference: https://developer.chrome.com/docs/extensions/reference/tabGroups/#method-update
export async function updateTabGroups(tabGroups, updateProperties) {
  return Promise.all(
    tabGroups.map((tabGroup) => chrome.tabGroups.update(tabGroup.id, updateProperties))
  )
}

// Reloads specified tabs.
// Returns a void `Promise`.
// Reference: https://developer.chrome.com/docs/extensions/reference/tabs/#method-reload
export async function reloadTabs(tabs, reloadProperties) {
  return Promise.all(
    tabs.map((tab) => chrome.tabs.reload(tab.id, reloadProperties))
  )
}

// Moves specified tabs.
// Returns a `Promise` with details about the moved tabs.
// Reference: https://developer.chrome.com/docs/extensions/reference/tabs/#method-move
//
// Notes:
// > chrome.tabs.move([], { index: 0 })
// Error: No tabs given.
// > chrome.tabs.move([42], { index: 0 })
// Returns a `Promise` with `Tab` instead of `Array` of `Tab`.
export async function moveTabs(tabs, moveProperties) {
  switch (tabs.length) {
    case 0:
      return []
    case 1:
      return chrome.tabs.move(tabs[0].id, moveProperties).then(tab => [tab])
    default:
      return chrome.tabs.move(getTabIds(tabs), moveProperties)
  }
}

// Closes specified tabs.
// Returns a void `Promise`.
// Reference: https://developer.chrome.com/docs/extensions/reference/tabs/#method-remove
export async function closeTabs(tabs) {
  return chrome.tabs.remove(getTabIds(tabs))
}

// Duplicates specified tabs.
// Returns a `Promise` with details about the duplicated tabs.
// Reference: https://developer.chrome.com/docs/extensions/reference/tabs/#method-duplicate
export async function duplicateTabs(tabs) {
  return Promise.all(
    tabs.map((tab) => chrome.tabs.duplicate(tab.id))
  )
}

// Discards specified tabs.
// Returns a `Promise` with details about the discarded tabs.
// Reference: https://developer.chrome.com/docs/extensions/reference/tabs/#method-discard
export async function discardTabs(tabs) {
  return Promise.all(
    tabs.map((tab) => chrome.tabs.discard(tab.id))
  )
}

// Adds specified tabs to the given group.
// If no group is specified, adds the given tabs to a newly created group.
// Returns a `Promise` with the ID of the group that the tabs were added to.
// Reference: https://developer.chrome.com/docs/extensions/reference/tabs/#method-group
export async function groupTabs(tabs, tabGroup = {}) {
  return chrome.tabs.group({ tabIds: getTabIds(tabs), groupId: tabGroup.id })
}

// Removes specified tabs from their respective groups.
// If any groups become empty, they are deleted.
// Returns a void `Promise`.
// Reference: https://developer.chrome.com/docs/extensions/reference/tabs/#method-ungroup
export async function ungroupTabs(tabs) {
  return chrome.tabs.ungroup(getTabIds(tabs))
}

// Highlights the given tabs and focuses on the first of group.
// Returns a `Promise` with details about the window whose tabs were highlighted.
// Reference: https://developer.chrome.com/docs/extensions/reference/tabs/#method-highlight
export async function highlightTabs(tabs) {
  const activeTab = tabs[0]
  const tabIndices = tabs.map(tab => tab.index)
  return chrome.tabs.highlight({ tabs: tabIndices, windowId: activeTab.windowId })
}

// Creates and displays a notification.
// Returns a `Promise` with the ID of the created notification.
// Reference: https://developer.chrome.com/docs/extensions/reference/notifications/#method-create
export async function sendNotification(message) {
  return chrome.notifications.create({ title: 'Chrome', message, type: 'basic', iconUrl: '/assets/chrome-logo@128px.png' })
}

// Waits for a specific navigation event.
// Reference: https://developer.chrome.com/docs/extensions/reference/webNavigation/#event
export async function waitForNavigation(tabId, eventType) {
  const event = chrome.webNavigation[eventType]

  return new Promise((resolve) => {
    event.addListener(
      function fireAndForget(details) {
        if (details.tabId === tabId) {
          event.removeListener(fireAndForget)
          resolve()
        }
      }
    )
  })
}
