// This module contains tab context related functions.

import { modulo } from './lib/math.js'
import { getVisibleTabs as _getVisibleTabs } from './lib/browser.js'

// Returns the index of the current tab in tabs.
export function findTabIndex(context, tabs) {
  return tabs.findIndex((tab) => tab.id === context.tab.id)
}

// Returns highlighted tabs.
export async function getSelectedTabs(context) {
  return chrome.tabs.query({ highlighted: true, windowId: context.tab.windowId })
}

// Returns tabs in the same group than the one in the specified context.
// Note: Can be used for ungrouped tabs.
export async function getTabsInGroup(context) {
  return chrome.tabs.query({ pinned: false, groupId: context.tab.groupId, windowId: context.tab.windowId })
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
  return _getVisibleTabs(context.tab.windowId)
}

// Returns the next tab, if any.
export async function getNextTab(context, count = 1) {
  const [nextTab] = await chrome.tabs.query({ index: context.tab.index + count, windowId: context.tab.windowId })
  return nextTab
}

// Returns the previous tab, if any.
export async function getPreviousTab(context, count = 1) {
  return getNextTab(context, -count)
}

// Returns the next open tab.
// Skips hidden tabs—the ones whose are in collapsed tab groups—
// and wraps around.
export async function getNextOpenTab(context, count = 1) {
  const tabs = await getVisibleTabs(context)
  const tabIndex = findTabIndex(context, tabs)
  const nextTabIndex = modulo(tabIndex + count, tabs.length)
  const nextTab = tabs[nextTabIndex]

  return nextTab
}

// Returns the previous open tab.
// Skips hidden tabs—the ones whose are in collapsed tab groups—
// and wraps around.
export async function getPreviousOpenTab(context, count = 1) {
  return getNextOpenTab(context, -count)
}

// Returns the current window.
export async function getCurrentWindow(context) {
  return chrome.windows.get(context.tab.windowId)
}

// Returns the next open window.
// Skips minimized windows and wraps around.
export async function getNextOpenWindow(context, count = 1) {
  const allWindows = await chrome.windows.getAll()
  const windows = allWindows.filter((window) => window.state !== 'minimized')
  const currentWindowIndex = windows.findIndex((window) => window.id === context.tab.windowId)
  const nextWindowIndex = modulo(currentWindowIndex + count, windows.length)
  const nextWindow = windows[nextWindowIndex]

  return nextWindow
}

// Returns the previous open window.
// Skips minimized windows and wraps around.
export async function getPreviousOpenWindow(context, count = 1) {
  return getNextOpenWindow(context, -count)
}
