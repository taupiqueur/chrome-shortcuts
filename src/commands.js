// This module contains commands to add keyboard shortcuts.
//
// Commands are parameter-less actions that can be performed with a tab context.
// Their main use is for key bindings.
// Commands are defined by adding properties to the `commands` object in the extension’s manifest.
// The command signature must be a function of one argument (a tab context).
//
// Manifest: https://developer.chrome.com/docs/extensions/mv3/manifest/
// Commands: https://developer.chrome.com/docs/extensions/reference/commands/

import { chunk } from './lib/array.js'
import { modulo } from './lib/math.js'
import { clickPageElement, focusPageElement, blurActiveElement, writeTextToClipboard, getSelectedText, scrollBy, scrollByPages, scrollTo, scrollToMax, prompt } from './script.js'
import { focusTabById, focusTab, isTabInGroup, getTabGroup, executeScript, updateTabs, updateTabGroups, reloadTabs, moveTabs, closeTabs, duplicateTabs, discardTabs, groupTabs, ungroupTabs, highlightTabs, sendNotification } from './lib/browser.js'
import { findTabIndex, getSelectedTabs, getTabsInGroup, getAllTabs, getAllTabGroups, getVisibleTabs, getNextTab, getNextOpenTab, getCurrentWindow, getNextWindow, getPreviousWindow } from './context.js'

// Language-sensitive string comparison
// Reference: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator
const { compare: localeCompare } = new Intl.Collator

// List of tab group colors
// Reference: https://developer.chrome.com/docs/extensions/reference/tabGroups/#type-Color
const tabGroupColors = Object.values(chrome.tabGroups.Color)

// Constants -------------------------------------------------------------------

const { TAB_GROUP_ID_NONE } = chrome.tabGroups
const { NEW_TAB: NEW_TAB_DISPOSITION } = chrome.search.Disposition

// Enums -----------------------------------------------------------------------

// Enum representing a direction.
const Direction = { Backward: -1, Forward: 1 }

// Navigation ------------------------------------------------------------------

// Goes back to the previous page in tab’s history.
export async function goBack(context) {
  await chrome.tabs.goBack(context.tab.id)
}

// Goes forward to the next page in tab’s history.
export async function goForward(context) {
  await chrome.tabs.goForward(context.tab.id)
}

// Reloads selected tabs.
export async function reloadTab(context) {
  const tabs = await getSelectedTabs(context)
  await reloadTabs(tabs)
}

// Reloads selected tabs, ignoring cached content.
export async function reloadTabWithoutCache(context) {
  const tabs = await getSelectedTabs(context)
  await reloadTabs(tabs, { bypassCache: true })
}

// Goes to the next page in the series, if one is available.
// Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel#attr-next
export async function goToNextPage(context) {
  await executeScript(context.tab, clickPageElement, '[rel="next"]')
}

// Goes to the previous page in the series, if one is available.
// Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel#attr-prev
export async function goToPreviousPage(context) {
  await executeScript(context.tab, clickPageElement, '[rel="prev"]')
}

// Navigates at the URL specified.
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/Location/assign
async function assignURL(context, func) {
  const baseURL = new URL(context.tab.url)
  const relativeURL = func(baseURL)
  const navigateURL = new URL(relativeURL, baseURL)
  await chrome.tabs.update(context.tab.id, { url: navigateURL.toString() })
}

// Removes any URL parameters.
export async function removeURLParams(context) {
  await assignURL(context, url => url.pathname)
}

// Goes up in the URL hierarchy.
export async function goUp(context) {
  await assignURL(context, url => url.pathname.endsWith('/') ? '..' : '.')
}

// Goes to the root URL.
export async function goToRoot(context) {
  await assignURL(context, url => '/')
}

// Accessibility ---------------------------------------------------------------

// Focuses the first input, if any.
// Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
export async function focusInput(context) {
  await executeScript(context.tab, focusPageElement, 'input')
}

// Focuses the first text area, if any.
// Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea
export async function focusTextArea(context) {
  await executeScript(context.tab, focusPageElement, 'textarea')
}

// Focuses the first video, if any.
// Reference: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
export async function focusVideo(context) {
  await executeScript(context.tab, focusPageElement, 'video')
}

// Blurs the active element.
// Reference: https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement
export async function blurElement(context) {
  await executeScript(context.tab, blurActiveElement)
}

// Clipboard -------------------------------------------------------------------

async function copy_impl(context, func, message) {
  const tabs = await getSelectedTabs(context)
  const text = tabs.map(func).join('\n')
  await executeScript(context.tab, writeTextToClipboard, text)
  await sendNotification(message)
}

// Copies URL of selected tabs.
export async function copyURL(context) {
  await copy_impl(context, tab => tab.url, 'URL copied to clipboard')
}

// Copies title of selected tabs.
export async function copyTitle(context) {
  await copy_impl(context, tab => tab.title, 'Title copied to clipboard')
}

// Copies title and URL of selected tabs.
export async function copyTitleAndURL(context) {
  await copy_impl(context, ({title, url}) => `[${title}](${url})`, 'Title and URL copied to clipboard')
}

// Web search ------------------------------------------------------------------

// Performs a search for selected text using the default search engine.
// The results will be displayed in a new tab.
export async function openWebSearchForSelectedText(context) {
  const [{ result: selectedText }] = await executeScript(context.tab, getSelectedText)

  // Bail out if there is nothing to search.
  if (!selectedText) {
    return
  }

  // Perform a search using the default search engine.
  // The results will be displayed in a new tab.
  await chrome.search.query({ text: selectedText, disposition: NEW_TAB_DISPOSITION })

  // Post-fix the created tab state.
  const openerTab = context.tab
  const createdTab = await chrome.tabs.update({ openerTabId: openerTab.id }).then(tab => chrome.tabs.move(tab.id, { index: openerTab.index + 1 }))

  // Add the new tab to the opener tab’s group, if it has one.
  if (isTabInGroup(openerTab)) {
    await chrome.tabs.group({ tabIds: [createdTab.id], groupId: openerTab.groupId })
  }
}

// Scroll ----------------------------------------------------------------------

// Scrolls down.
export async function scrollDown(context) {
  await executeScript(context.tab, scrollBy, { top: 70, behavior: 'instant' })
}

// Scrolls up.
export async function scrollUp(context) {
  await executeScript(context.tab, scrollBy, { top: -70, behavior: 'instant' })
}

// Scrolls left.
export async function scrollLeft(context) {
  await executeScript(context.tab, scrollBy, { left: -70, behavior: 'instant' })
}

// Scrolls right.
export async function scrollRight(context) {
  await executeScript(context.tab, scrollBy, { left: 70, behavior: 'instant' })
}

// Scrolls one page down.
export async function scrollPageDown(context) {
  await executeScript(context.tab, scrollByPages, { top: 0.9, behavior: 'instant' })
}

// Scrolls one page up.
export async function scrollPageUp(context) {
  await executeScript(context.tab, scrollByPages, { top: -0.9, behavior: 'instant' })
}

// Scrolls half page down.
export async function scrollHalfPageDown(context) {
  await executeScript(context.tab, scrollByPages, { top: 0.5, behavior: 'instant' })
}

// Scrolls half page up.
export async function scrollHalfPageUp(context) {
  await executeScript(context.tab, scrollByPages, { top: -0.5, behavior: 'instant' })
}

// Scrolls to the top of the page.
// Uses smooth scrolling for long jumps.
export async function scrollToTop(context) {
  await executeScript(context.tab, scrollTo, { top: 0, left: 0, behavior: 'smooth' })
}

// Scrolls to the bottom of the page.
// Uses smooth scrolling for long jumps.
export async function scrollToBottom(context) {
  await executeScript(context.tab, scrollToMax, { left: 0, behavior: 'smooth' })
}

// Zoom ------------------------------------------------------------------------

// Zooms in.
export async function zoomIn(context) {
  const zoomFactor = await chrome.tabs.getZoom(context.tab.id)
  await chrome.tabs.setZoom(context.tab.id, zoomFactor + 0.1)
}

// Zooms out.
export async function zoomOut(context) {
  const zoomFactor = await chrome.tabs.getZoom(context.tab.id)
  await chrome.tabs.setZoom(context.tab.id, zoomFactor - 0.1)
}

// Resets the zoom factor.
export async function zoomReset(context) {
  await chrome.tabs.setZoom(context.tab.id, 0)
}

// Turns full-screen mode on or off.
export async function toggleFullScreen(context) {
  const currentWindow = await getCurrentWindow(context)
  const nextWindowState = currentWindow.state === 'fullscreen' ? 'normal' : 'fullscreen'
  await chrome.windows.update(currentWindow.id, { state: nextWindowState })
}

// Create tabs -----------------------------------------------------------------

// Opens and activates a new tab.
export async function openNewTab(context) {
  await chrome.tabs.create({ active: true, openerTabId: context.tab.id })
}

// Opens and activates a new tab to the right.
export async function openNewTabRight(context) {
  const openerTab = context.tab
  const createdTab = await chrome.tabs.create({ active: true, index: openerTab.index + 1, openerTabId: openerTab.id })

  // Add the new tab to the opener tab’s group, if it has one.
  if (isTabInGroup(openerTab)) {
    await chrome.tabs.group({ tabIds: [createdTab.id], groupId: openerTab.groupId })
  }
}

// Opens a new window.
export async function openNewWindow(context) {
  await chrome.windows.create()
}

// Opens a new window in Incognito mode.
export async function openNewIncognitoWindow(context) {
  await chrome.windows.create({ incognito: true })
}

// Close tabs ------------------------------------------------------------------

// Closes selected tabs.
export async function closeTab(context) {
  const tabs = await getSelectedTabs(context)
  await closeTabs(tabs)
}

// Closes the window that contains the tab.
export async function closeWindow(context) {
  await chrome.windows.remove(context.tab.windowId)
}

// Reopens previously closed tabs.
export async function restoreTab(context) {
  await chrome.sessions.restore()
}

// Tab state -------------------------------------------------------------------

// Duplicates selected tabs.
export async function duplicateTab(context) {
  const tabs = await getSelectedTabs(context)
  const duplicatedTabs = await duplicateTabs(tabs)
  await highlightTabs(duplicatedTabs)
}

// Pins or unpins selected tabs.
export async function togglePinTab(context) {
  const tabs = await getSelectedTabs(context)
  const someTabsNotPinned = tabs.some((tab) => !tab.pinned)
  await updateTabs(tabs, { pinned: someTabsNotPinned })
}

// Groups or ungroups selected tabs.
export async function toggleGroupTab(context) {
  const tabs = await getSelectedTabs(context)
  const someTabsNotInGroup = tabs.some((tab) => !isTabInGroup(tab))
  const groupAction = someTabsNotInGroup ? groupTabs : ungroupTabs
  await groupAction(tabs)
}

// Collapses or uncollapses tab groups.
export async function toggleCollapseTabGroups(context) {
  const tabGroups = await getAllTabGroups(context)
  const someTabGroupsNotCollapsed = tabGroups.some((tabGroup) => !tabGroup.collapsed)
  await updateTabGroups(tabGroups, { collapsed: someTabGroupsNotCollapsed })
}

// Mutes or unmutes selected tabs.
export async function toggleMuteTab(context) {
  const tabs = await getSelectedTabs(context)
  const someTabsNotMuted = tabs.some((tab) => !tab.mutedInfo.muted)
  await updateTabs(tabs, { muted: someTabsNotMuted })
}

// Discards selected tabs.
export async function discardTab(context) {
  const tabs = await getSelectedTabs(context)
  await discardTabs(tabs)
}

// Organize tabs ---------------------------------------------------------------

// Sorts tabs by URL.
export async function sortTabsByURL(context) {
  const tabs = await getSelectedTabs(context)
  const tabChunks = chunk(tabs, (tab) => tab.pinned || tab.groupId)

  // Sort chunked tabs by URL.
  await Promise.all(
    tabChunks.map(([key, tabs]) => {
      // Sort tabs and keep a reference to the original tab indices.
      const tabIndices = tabs.map(tab => tab.index)
      const sortedTabs = tabs.sort((tab, otherTab) => localeCompare(tab.url, otherTab.url))

      // Move tabs to their post-sort locations.
      return Promise.all(
        sortedTabs.map((tab, index) => chrome.tabs.move(tab.id, { index: tabIndices[index] }))
      )
    })
  )
}

// Groups tabs by domain.
export async function groupTabsByDomain(context) {
  const tabs = await getSelectedTabs(context)
  const tabsByDomain = tabs.groupToMap(tab => new URL(tab.url).hostname)

  // Get all tab groups and group them by title.
  const tabGroups = await getAllTabGroups(context)
  const tabGroupsByTitle = tabGroups.group(tabGroup => tabGroup.title)

  // Group tabs by domain.
  await Promise.all(
    Array.from(tabsByDomain, ([hostname, tabs]) => {
      const tabGroups = tabGroupsByTitle[hostname]

      // Add tabs to an existing group if possible.
      return tabGroups
        ? groupTabs(tabs, tabGroups[0])
        : groupTabs(tabs).then(groupId => chrome.tabGroups.update(groupId, { title: hostname }))
    })
  )
}

// Manage tab groups -----------------------------------------------------------

// Renames tab group (prompts for a new name).
// Tags: args
export async function renameTabGroupPrompt(context) {
  const tabGroup = await getTabGroup(context.tab)

  // Fail-fast if there is no tab group.
  if (!tabGroup) {
    return
  }

  // Prompt for a new name.
  const [{ result: tabGroupTitle }] = await executeScript(context.tab, prompt, 'Name this group', tabGroup.title)

  // Bail out if there is no new name.
  if (tabGroupTitle === null || tabGroupTitle === tabGroup.title) {
    return
  }

  // Update tab group title.
  await chrome.tabGroups.update(tabGroup.id, { title: tabGroupTitle })
}

// Cycles forward through tab group colors.
// Tags: args
export async function cycleTabGroupColorForward(context, count = 1) {
  const tabGroup = await getTabGroup(context.tab)

  // Fail-fast if there is no tab group.
  if (!tabGroup) {
    return
  }

  // Get the next color.
  const colorIndex = tabGroupColors.indexOf(tabGroup.color)
  const nextColorIndex = modulo(colorIndex + count, tabGroupColors.length)
  const nextColor = tabGroupColors[nextColorIndex]

  // Cycle through tab group colors.
  await chrome.tabGroups.update(tabGroup.id, { color: nextColor })
}

// Cycles backward through tab group colors.
// Tags: args
export async function cycleTabGroupColorBackward(context, count = 1) {
  await cycleTabGroupColorForward(context, -count)
}

// Switch tabs -----------------------------------------------------------------

// Activates the first audible tab.
export async function focusAudibleTab(context) {
  const [audibleTab] = await chrome.tabs.query({ audible: true })
  if (audibleTab) {
    await focusTab(audibleTab)
  }
}

// Activates the next open tab.
// Skips hidden tabs—the ones whose are in collapsed tab groups.
// Tags: args
export async function focusNextTab(context, count = 1) {
  const nextTab = await getNextOpenTab(context, count)
  await focusTab(nextTab)
}

// Activates the previous open tab.
// Skips hidden tabs—the ones whose are in collapsed tab groups.
// Tags: args
export async function focusPreviousTab(context, count = 1) {
  await focusNextTab(context, -count)
}

// Activates a tab by its index.
// Skips hidden tabs—the ones whose are in collapsed tab groups.
// Tags: args, hidden
export async function focusTabByIndex(context, index) {
  const tabs = await getVisibleTabs(context)
  const targetTab = tabs.at(index)

  if (targetTab) {
    await focusTab(targetTab)
  }
}

// Activates the leftmost open tab.
// Skips hidden tabs—the ones whose are in collapsed tab groups.
export async function focusFirstTab(context) {
  await focusTabByIndex(context, 0)
}

// Activates the second leftmost open tab.
// Skips hidden tabs—the ones whose are in collapsed tab groups.
export async function focusSecondTab(context) {
  await focusTabByIndex(context, 1)
}

// Activates the third leftmost open tab.
// Skips hidden tabs—the ones whose are in collapsed tab groups.
export async function focusThirdTab(context) {
  await focusTabByIndex(context, 2)
}

// Activates the fourth leftmost open tab.
// Skips hidden tabs—the ones whose are in collapsed tab groups.
export async function focusFourthTab(context) {
  await focusTabByIndex(context, 3)
}

// Activates the fifth leftmost open tab.
// Skips hidden tabs—the ones whose are in collapsed tab groups.
export async function focusFifthTab(context) {
  await focusTabByIndex(context, 4)
}

// Activates the sixth leftmost open tab.
// Skips hidden tabs—the ones whose are in collapsed tab groups.
export async function focusSixthTab(context) {
  await focusTabByIndex(context, 5)
}

// Activates the seventh leftmost open tab.
// Skips hidden tabs—the ones whose are in collapsed tab groups.
export async function focusSeventhTab(context) {
  await focusTabByIndex(context, 6)
}

// Activates the eighth leftmost open tab.
// Skips hidden tabs—the ones whose are in collapsed tab groups.
export async function focusEighthTab(context) {
  await focusTabByIndex(context, 7)
}

// Activates the rightmost open tab.
// Skips hidden tabs—the ones whose are in collapsed tab groups.
export async function focusLastTab(context) {
  await focusTabByIndex(context, -1)
}

// Activates the next window.
// Tags: args
export async function focusNextWindow(context, count = 1) {
  const nextWindow = await getNextWindow(context, count)
  await chrome.windows.update(nextWindow.id, { focused: true })
}

// Activates the previous window.
// Tags: args
export async function focusPreviousWindow(context, count = 1) {
  await focusNextWindow(context, -count)
}

// Move tabs -------------------------------------------------------------------

// Grabs selected tabs.
// Moves selected tabs to the current tab.
export async function grabTab(context) {
  const tabs = await getSelectedTabs(context)

  const currentTab = context.tab
  const currentTabIndex = findTabIndex(context, tabs)

  const leftTabs = tabs.slice(0, currentTabIndex)
  const rightTabs = tabs.slice(currentTabIndex + 1)

  // Move selected tabs to the current tab.
  const currentTabPromise = Promise.resolve(currentTab)
  await Promise.all([
    leftTabs.reduceRight((previousTabPromise, currentTab) =>
      previousTabPromise.then((previousTab) =>
        chrome.tabs.move(currentTab.id, { index: previousTab.index - 1 })), currentTabPromise
    ),
    rightTabs.reduce((previousTabPromise, currentTab) =>
      previousTabPromise.then((previousTab) =>
        chrome.tabs.move(currentTab.id, { index: previousTab.index + 1 })), currentTabPromise
    )
  ])

  // Add selected tabs—except pinned tabs—to the current tab’s group.
  const tabIds = tabs.flatMap(tab => tab.pinned ? [] : tab.id)
  await isTabInGroup(currentTab)
    ? chrome.tabs.group({ tabIds, groupId: currentTab.groupId })
    : chrome.tabs.ungroup(tabIds)
}

async function moveTabDirection(context, direction) {
  const currentTab = context.tab
  const currentTabIsInGroup = isTabInGroup(currentTab)

  let offsetIndex, tabGroupIndex
  switch (direction) {
    case Direction.Backward:
      offsetIndex = -1
      tabGroupIndex = 0
      break
    case Direction.Forward:
      offsetIndex = 1
      tabGroupIndex = -1
      break
  }

  // Get the next tab, if any.
  const nextTab = await getNextTab(context, offsetIndex)

  // Tab strip—before/after:
  // [[...] [A]] => [[...]] [A]
  if (currentTabIsInGroup && !nextTab) {
    await chrome.tabs.ungroup(currentTab.id)
  }

  // Fail-fast if there is no next tab.
  if (!nextTab) {
    return
  }

  // Get some info about the next tab.
  const nextTabIsInGroup = isTabInGroup(nextTab)
  let nextTabIsHidden = false

  // Determine whether the next tab is hidden.
  // A tab in a collapsed group is considered hidden.
  if (nextTabIsInGroup) {
    const tabGroup = await getTabGroup(nextTab)
    nextTabIsHidden = tabGroup.collapsed
  }

  // Tab strip—before/after:
  // [A] [B] => [B] [A]
  if (!currentTabIsInGroup && !nextTabIsInGroup) {
    await chrome.tabs.move(currentTab.id, { index: nextTab.index })
  }
  // [[A] [B]] => [[B] [A]]
  else if (currentTab.groupId === nextTab.groupId) {
    await chrome.tabs.move(currentTab.id, { index: nextTab.index })
  }
  // [A] [[B]] => [[A] [B]]
  else if (!currentTabIsInGroup && nextTabIsInGroup && !nextTabIsHidden) {
    await chrome.tabs.group({ tabIds: [currentTab.id], groupId: nextTab.groupId })
  }
  // [[A]] [B] => [A] [B]
  else if (currentTabIsInGroup && !nextTabIsInGroup) {
    await chrome.tabs.ungroup(currentTab.id)
  }
  // [[A]] [[B]] => [A] [[B]]
  else if (currentTabIsInGroup && nextTabIsInGroup && currentTab.groupId !== nextTab.groupId) {
    await chrome.tabs.ungroup(currentTab.id)
  }
  // [A] [[...]] [C] => [[...]] [A] [C]
  else if (!currentTabIsInGroup && nextTabIsHidden) {
    // Find the tab right after the rightmost tab in group.
    const tabsInGroup = await chrome.tabs.query({ groupId: nextTab.groupId })
    const targetTab = tabsInGroup.at(tabGroupIndex)
    await chrome.tabs.move(currentTab.id, { index: targetTab.index })
  }
}

// Moves tab left.
// Skips hidden tabs—the ones whose are in collapsed tab groups.
export async function moveTabLeft(context) {
  await moveTabDirection(context, Direction.Backward)
}

// Moves tab right.
// Skips hidden tabs—the ones whose are in collapsed tab groups.
export async function moveTabRight(context) {
  await moveTabDirection(context, Direction.Forward)
}

async function moveTabEdgeDirection(context, direction) {
  const currentTab = context.tab

  let tabIndex
  switch (direction) {
    case Direction.Backward:
      tabIndex = 0
      break
    case Direction.Forward:
      tabIndex = -1
      break
  }

  // Adjust the edge, if in a group.
  if (isTabInGroup(currentTab)) {
    const tabsInGroup = await getTabsInGroup(context)
    tabIndex = tabsInGroup.at(tabIndex).index
  }

  // Move the current tab to the edge.
  await chrome.tabs.move(currentTab.id, { index: tabIndex })
}

// Moves tab to the far left.
export async function moveTabFirst(context) {
  await moveTabEdgeDirection(context, Direction.Backward)
}

// Moves tab to the far right.
export async function moveTabLast(context) {
  await moveTabEdgeDirection(context, Direction.Forward)
}

// Moves selected tabs to the specified window.
async function moveTabsToWindow(context, windowId) {
  // Prevent moving tabs to the same window.
  if (context.tab.windowId === windowId) {
    return
  }

  const tabs = await getAllTabs(context)
  const startIndex = tabs.findIndex(tab => !tab.pinned)
  const [pinnedTabs, otherTabs] = startIndex === -1
    ? [tabs, []]
    : [tabs.slice(0, startIndex), tabs.slice(startIndex)]

  // Move chunked tabs.
  const isSelected = tab => tab.highlighted
  const byGroup = tab => tab.groupId
  const moveProperties = { windowId, index: -1 }
  const movedTabChunks = await Promise.all([
    // Move pinned tabs.
    moveTabs(pinnedTabs.filter(isSelected), moveProperties).then(tabs => updateTabs(tabs, { pinned: true })),

    // Move other tabs.
    ...chunk(otherTabs, byGroup).map(([groupId, tabs]) => {
      const selectedTabs = tabs.filter(isSelected)
      // Only move tab group if fully selected.
      return groupId !== TAB_GROUP_ID_NONE && selectedTabs.length === tabs.length
        ? chrome.tabGroups.move(groupId, moveProperties).then(tabGroup => chrome.tabs.query({ groupId }))
        : moveTabs(selectedTabs, moveProperties)
    })
  ])

  // Focus window and select tabs.
  const activeTab = await chrome.tabs.get(context.tab.id)
  await chrome.windows.update(windowId, { focused: true })
  await highlightTabs([activeTab].concat(...movedTabChunks))
}

// Moves selected tabs to a new window.
export async function moveTabNewWindow(context) {
  // Create a new window
  // and keep a reference to the created tab (the New Tab page) in order to delete it later.
  const createdWindow = await chrome.windows.create()
  const createdTab = createdWindow.tabs[0]

  // Move selected tabs to the created window.
  await moveTabsToWindow(context, createdWindow.id)
  await chrome.tabs.remove(createdTab.id)
}

// Moves selected tabs to the previous window, if any.
export async function moveTabPreviousWindow(context) {
  const previousWindow = await getPreviousWindow(context)
  await moveTabsToWindow(context, previousWindow.id)
}

// Moves tab group left.
export async function moveTabGroupLeft(context) {
  const tabGroup = await getTabGroup(context.tab)

  // Fail-fast if there is no tab group.
  if (!tabGroup) {
    return
  }

  // Determine the previous tab in the tab strip.
  // [previousTab] [[firstTabInGroup] [...]]
  const [firstTabInGroup] = await getTabsInGroup(context)
  let [previousTab] = await chrome.tabs.query({ index: firstTabInGroup.index - 1, windowId: tabGroup.windowId })

  // Fail-fast if there is no previous tab.
  if (!previousTab) {
    return
  }

  // Adjust the actual previous tab in the tab strip, if in a group.
  // [[...] [previousTab]] => [[previousTab] [...]]
  if (isTabInGroup(previousTab)) {
    [previousTab] = await chrome.tabs.query({ groupId: previousTab.groupId })
  }

  // Move tab group left.
  await chrome.tabGroups.move(tabGroup.id, { index: previousTab.index })
}

// Moves tab group right.
// Note: Chrome does not behave correctly when moving multiple tabs to the right,
// hence not unifying moveTabGroupLeft() and moveTabGroupRight() under moveTabGroupDirection().
export async function moveTabGroupRight(context) {
  const tabGroup = await getTabGroup(context.tab)

  // Fail-fast if there is no tab group.
  if (!tabGroup) {
    return
  }

  // Determine the next tab in the tab strip.
  // [[firstTabInGroup] [...] [lastTabInGroup]] [nextTab]
  const tabsInGroup = await getTabsInGroup(context)
  const firstTabInGroup = tabsInGroup.at(0)
  const lastTabInGroup = tabsInGroup.at(-1)
  const [nextTab] = await chrome.tabs.query({ index: lastTabInGroup.index + 1, windowId: tabGroup.windowId })

  // Fail-fast if there is no next tab.
  if (!nextTab) {
    return
  }

  // Move the next tab or tab group left.
  if (!isTabInGroup(nextTab)) {
    await chrome.tabs.move(nextTab.id, { index: firstTabInGroup.index })
  } else {
    await chrome.tabGroups.move(nextTab.groupId, { index: firstTabInGroup.index })
  }
}

// Moves tab group to the far left.
export async function moveTabGroupFirst(context) {
  const tabGroup = await getTabGroup(context.tab)

  // Fail-fast if there is no tab group.
  if (!tabGroup) {
    return
  }

  // Handle pinned tabs.
  // Error: Cannot move the group to an index that is in the middle of pinned tabs.
  const pinnedTabs = await chrome.tabs.query({ pinned: true, windowId: tabGroup.windowId })
  const offsetIndex = pinnedTabs.length

  // Move tab group to the far left.
  await chrome.tabGroups.move(tabGroup.id, { index: offsetIndex })
}

// Moves tab group to the far right.
export async function moveTabGroupLast(context) {
  const tabGroup = await getTabGroup(context.tab)

  // Fail-fast if there is no tab group.
  if (!tabGroup) {
    return
  }

  await chrome.tabGroups.move(tabGroup.id, { index: -1 })
}

// Moves tab group to a new window.
export async function moveTabGroupNewWindow(context) {
  const tabGroup = await getTabGroup(context.tab)

  // Fail-fast if there is no tab group.
  if (!tabGroup) {
    return
  }

  // Create a new window
  // and keep a reference to the created tab (the New Tab page) in order to delete it later.
  const createdWindow = await chrome.windows.create()
  const createdTab = createdWindow.tabs[0]

  // Move the tab group to the created window.
  await chrome.tabGroups.move(tabGroup.id, { windowId: createdWindow.id, index: -1 })
  await chrome.tabs.remove(createdTab.id)
}

// Moves tab group to the previous window, if any.
export async function moveTabGroupPreviousWindow(context) {
  const tabGroup = await getTabGroup(context.tab)

  // Fail-fast if there is no tab group.
  if (!tabGroup) {
    return
  }

  const previousWindow = await getPreviousWindow(context)

  // Prevent moving tab group to the same window.
  if (previousWindow.id === tabGroup.windowId) {
    return
  }

  // Move the tab group to the previous window.
  await chrome.tabGroups.move(tabGroup.id, { windowId: previousWindow.id, index: -1 })
  await focusTabById(context.tab.id)
}

// Select tabs -----------------------------------------------------------------

// Deselects all other tabs.
export async function selectTab(context) {
  await highlightTabs([context.tab])
}

// Selects tabs in group.
// Note: Can be used for ungrouped tabs.
export async function selectTabsInGroup(context) {
  const tabsInGroup = await getTabsInGroup(context)
  await highlightTabs([context.tab, ...tabsInGroup])
}

// Selects all tabs.
export async function selectAllTabs(context) {
  const tabs = await getAllTabs(context)
  await highlightTabs([context.tab, ...tabs])
}

// Selects tabs to the right.
export async function selectRightTabs(context) {
  const tabs = await getAllTabs(context)
  const rightTabs = tabs.slice(context.tab.index)
  await highlightTabs(rightTabs)
}

// Folders ---------------------------------------------------------------------

// Opens the Downloads folder.
export async function openDownloadsFolder(context) {
  await chrome.downloads.showDefaultFolder()
}

// Chrome URLs -----------------------------------------------------------------

// Opens a Chrome page at the URL specified.
// Note: Chrome attempts to focus an existing tab or create a new tab,
// using an existing slot—the New Tab page—if possible.
async function openChromePage(context, navigateURL) {
  const baseURL = new URL('/', navigateURL)
  // Search a tab by its URL.
  const [matchingTab] = await chrome.tabs.query({ url: baseURL + '*', windowId: context.tab.windowId })

  if (matchingTab) {
    // Switch to the tab.
    await focusTab(matchingTab)

    // Refresh URL?
    // Only if the URL to navigate the tab to does not match.
    if (matchingTab.url !== navigateURL) {
      await chrome.tabs.update(matchingTab.id, { url: navigateURL })
    }
  } else {
    // Is the current tab a new tab?
    // Use the New Tab page as a placeholder, instead of opening a new tab.
    if (context.tab.url === 'chrome://newtab/') {
      await chrome.tabs.update(context.tab.id, { url: navigateURL })
    } else {
      await chrome.tabs.create({ url: navigateURL, active: true, openerTabId: context.tab.id })
    }
  }
}

// Opens the History page.
export async function openHistoryPage(context) {
  await openChromePage(context, 'chrome://history/')
}

// Opens the Downloads page.
export async function openDownloadsPage(context) {
  await openChromePage(context, 'chrome://downloads/')
}

// Opens the Bookmarks page.
export async function openBookmarksPage(context) {
  await openChromePage(context, 'chrome://bookmarks/')
}

// Opens the Settings page.
export async function openSettingsPage(context) {
  await openChromePage(context, 'chrome://settings/')
}

// Opens the Passwords page.
export async function openPasswordsPage(context) {
  await openChromePage(context, 'chrome://settings/passwords')
}

// Opens the Search engines page.
export async function openSearchEnginesPage(context) {
  await openChromePage(context, 'chrome://settings/searchEngines')
}

// Opens the Extensions page.
export async function openExtensionsPage(context) {
  await openChromePage(context, 'chrome://extensions/')
}

// Opens the Extensions > Keyboard shortcuts page.
export async function openShortcutsPage(context) {
  await openChromePage(context, 'chrome://extensions/shortcuts')
}

// Opens the Experiments page.
export async function openExperimentsPage(context) {
  await openChromePage(context, 'chrome://flags/')
}
