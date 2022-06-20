// This module contains Chrome API functions.
// Reference: https://developer.chrome.com/docs/extensions/reference/

import { modulo } from './math.js'

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

// Focuses a tab by its ID.
export async function focusTabById(tabId) {
  const tab = await chrome.tabs.get(tabId)
  return focusTab(tab)
}

// Focuses the specified tab.
export async function focusTab(tab) {
  // Focus window and activate tab.
  await chrome.windows.update(tab.windowId, { focused: true })
  return chrome.tabs.update(tab.id, { active: true })
}

// Returns visible tabs in the tab strip of the given window.
// Skips hidden tabs—the ones whose are in collapsed tab groups.
export async function getVisibleTabs(windowId) {
  // Determine whose tabs are hidden.
  // A tab in a collapsed group is considered hidden.
  const tabGroups = await chrome.tabGroups.query({ windowId })
  const collapsedInfo = Object.fromEntries(tabGroups.map((tabGroup) => [tabGroup.id, tabGroup.collapsed]))

  const tabs = await chrome.tabs.query({ windowId })
  const visibleTabs = tabs.filter((tab) => !collapsedInfo[tab.groupId])

  return visibleTabs
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
export async function moveTabs(tabs, moveProperties) {
  return chrome.tabs.move(getTabIds(tabs), moveProperties)
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
