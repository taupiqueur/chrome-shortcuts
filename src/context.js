// This module contains tab context related functions.

import { modulo } from './lib/math.js'

// Returns the index of the current tab in tabs.
export function findTabIndex(context, tabs) {
  return tabs.findIndex((tab) => tab.id === context.tab.id)
}

// Returns highlighted tabs.
export async function getSelectedTabs(context) {
  return chrome.tabs.query({ highlighted: true, windowId: context.tab.windowId })
}

// Returns all tabs.
export async function getAllTabs(context) {
  return chrome.tabs.query({ windowId: context.tab.windowId })
}

// Returns all tab groups.
export async function getAllTabGroups(context) {
  return chrome.tabGroups.query({ windowId: context.tab.windowId })
}

// Returns visible tabs in the tab strip.
// Skips hidden tabs—the ones whose are in collapsed tab groups.
export async function getVisibleTabs(context) {
  // Determine whose tabs are hidden.
  // A tab in a collapsed group is considered hidden.
  const tabGroups = await getAllTabGroups(context)
  const collapsedInfo = Object.fromEntries(tabGroups.map((tabGroup) => [tabGroup.id, tabGroup.collapsed]))

  const tabs = await getAllTabs(context)
  const visibleTabs = tabs.filter((tab) => !collapsedInfo[tab.groupId])

  return visibleTabs
}

// Returns an open tab relative to the current tab.
// Skips hidden tabs—the ones whose are in collapsed tab groups—
// and wraps around.
export async function getOpenTabRelative(context, delta) {
  const tabs = await getVisibleTabs(context)
  const tabIndex = findTabIndex(context, tabs)
  const index = modulo(tabIndex + delta, tabs.length)
  const tab = tabs[index]

  return tab
}

// Returns the current window.
export async function getCurrentWindow(context) {
  return chrome.windows.get(context.tab.windowId)
}

// Returns an open window relative to the current window.
// Skips minimized windows and wraps around.
export async function getOpenWindowRelative(context, delta) {
  const allWindows = await chrome.windows.getAll()
  const windows = allWindows.filter((window) => window.state !== 'minimized')
  const windowIndex = windows.findIndex((window) => window.id === context.tab.windowId)
  const index = modulo(windowIndex + delta, windows.length)
  const window = windows[index]

  return window
}
