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
import { modulo, clamp } from './lib/math.js'
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

// Moves selected tabs left/right.
// Skips hidden tabs—the ones whose are in collapsed tab groups.
async function moveTabDirection(context, direction) {
  let focusIndex, anchorIndex, focusOffset, anchorOffset, reduceMethod, moveGroupToTab, ungroupTabs
  switch (direction) {
    case Direction.Backward:
      focusIndex = 0
      anchorIndex = -1
      focusOffset = -1
      anchorOffset = 1
      reduceMethod = 'reduce'
      // Note: Chrome does not behave correctly when moving multiple tabs to the right,
      // hence moving the group at the end of the window beforehand.
      moveGroupToTab = async (sourceTab, destinationTab) => {
        await chrome.tabGroups.move(sourceTab.groupId, { index: -1 })
        destinationTab = await chrome.tabs.get(destinationTab.id)
        return chrome.tabGroups.move(sourceTab.groupId, { index: destinationTab.index + anchorOffset })
      }
      ungroupTabs = (tabs) => {
        const tabIds = tabs.map(tab => tab.id)
        return chrome.tabs.ungroup(tabIds)
      }
      break
    case Direction.Forward:
      focusIndex = -1
      anchorIndex = 0
      focusOffset = 1
      anchorOffset = 0
      reduceMethod = 'reduceRight'
      moveGroupToTab = (sourceTab, destinationTab) => {
        return chrome.tabGroups.move(sourceTab.groupId, { index: destinationTab.index })
      }
      // Note: Chrome ungroups tabs sequentially,
      // hence reversing tab IDs to preserve order.
      ungroupTabs = (tabs) => {
        const tabIds = tabs.map((_, index) => tabs.at(-index - 1).id)
        return chrome.tabs.ungroup(tabIds)
      }
      break
  }

  const isSelected = tab => tab.highlighted
  const byGroup = tab => tab.groupId

  // Partition pinned tabs and group tabs by group.
  const allTabs = await getAllTabs(context)
  const allTabsByGroup = allTabs.group(byGroup)
  const startIndex = allTabs.findIndex(tab => !tab.pinned)
  const [pinnedTabs, otherTabs] = startIndex === -1
    ? [allTabs, []]
    : [allTabs.slice(0, startIndex), allTabs.slice(startIndex)]

  // Determine whose tabs are hidden.
  // A tab in a collapsed group is considered hidden.
  const tabGroups = await getAllTabGroups(context)
  const collapsedInfo = Object.fromEntries(tabGroups.map((tabGroup) => [tabGroup.id, tabGroup.collapsed]))

  // Move chunked tabs.
  const pinnedChunks = chunk(pinnedTabs, isSelected)
  const otherChunks = chunk(otherTabs, isSelected)
  // Handle the left/right boundary.
  // Do nothing if the first chunk to proceed is selected.
  // This also ensures that selected tabs are always preceded/followed by another tab.
  if (pinnedChunks.length > 0 && pinnedChunks.at(focusIndex)[0]) {
    pinnedChunks.splice(focusIndex, 1)
  }
  if (otherChunks.length > 0 && otherChunks.at(focusIndex)[0]) {
    const [[_, selectedTabs]] = otherChunks.splice(focusIndex, 1)
    const [[groupId, tabs], ...otherGroups] = selectedTabs.groupToMap(byGroup)
    const singleGroup = otherGroups.length === 0
    const fullySelected = groupId !== TAB_GROUP_ID_NONE && tabs.length === allTabsByGroup[groupId].length
    // Only ungroup tabs if the selection
    // spawns a single group and is not fully selected.
    if (singleGroup && !fullySelected) {
      await ungroupTabs(tabs)
    }
  }
  await Promise.all([
    // Move pinned tabs.
    pinnedChunks[reduceMethod]((previousPromise, [highlighted, tabs]) => previousPromise.then((value) => {
      if (!highlighted) {
        return previousPromise
      }
      const focusTab = tabs.at(focusIndex)
      const anchorTab = tabs.at(anchorIndex)
      const targetTab = allTabs[focusTab.index + focusOffset]
      return chrome.tabs.move(targetTab.id, { index: anchorTab.index })
    }), Promise.resolve()),

    // Move other tabs.
    otherChunks[reduceMethod](async (previousPromise, [highlighted, tabs]) => {
      await previousPromise

      if (!highlighted) {
        return previousPromise
      }

      // Get some info about the tab selection,
      // whether it spawns multiple groups, entirely selected.
      const groupChunks = chunk(tabs, byGroup)
      const groupCount = groupChunks.length
      const singleGroup = groupCount === 1
      const manyGroups = groupCount > 1
      const [groupId, anchorGroup] = groupChunks.at(anchorIndex)
      const fullySelected = groupId !== TAB_GROUP_ID_NONE && anchorGroup.length === allTabsByGroup[groupId].length

      // Get some info about the range of selected tabs.
      const focusTab = tabs.at(focusIndex)
      const anchorTab = tabs.at(anchorIndex)
      const anchorTabIsInGroup = isTabInGroup(anchorTab)

      // Get some info about the target tab.
      // Determine whether the target tab is hidden.
      // A tab in a collapsed group is considered hidden.
      const targetTab = allTabs[focusTab.index + focusOffset]
      const targetTabIsInGroup = isTabInGroup(targetTab)
      const targetTabIsHidden = collapsedInfo[targetTab.groupId]

      // Move selected tabs, tabs in group or tab group left/right.
      // Only move tab group if fully selected.
      // Skips hidden tabs—the ones whose are in collapsed tab groups.
      //
      // Tab strip—before/after:
      // Backward: [A] __[B] [B] [B]__ => __[B] [B] [B]__ [A]
      // Forward: __[A] [A] [A]__ [B] => [B] __[A] [A] [A]__
      if (!targetTabIsInGroup && singleGroup && !anchorTabIsInGroup) {
        return chrome.tabs.move(targetTab.id, { index: anchorTab.index })
      }
      // Backward: [A] [__[B] [B]__ [...]] => [A] __[B] [B]__ [[...]]
      // Forward: [[...] __[A] [A]__] [B] => [[...]] __[A] [A]__ [B]
      else if (!targetTabIsInGroup && singleGroup && !fullySelected) {
        return ungroupTabs(tabs)
      }
      // Backward: [A] __[[B] [B] [B]]__ => __[[B] [B] [B]]__ [A]
      // Forward: __[[A] [A] [A]]__ [B] => [B] __[[A] [A] [A]]__
      else if (!targetTabIsInGroup && singleGroup && fullySelected) {
        return chrome.tabs.move(targetTab.id, { index: anchorTab.index })
      }
      // Backward: [A] __[[B] [B] [B]] [C] [C] [C]__ => __[[B] [B] [B]] [C] [C] [C]__ [A]
      // Forward: __[A] [A] [A] [[B] [B] [B]]__ [C] => [C] __[A] [A] [A] [[B] [B] [B]]__
      else if (!targetTabIsInGroup && manyGroups && !anchorTabIsInGroup) {
        return chrome.tabs.move(targetTab.id, { index: anchorTab.index })
      }
      // Backward: [A] __[B] [B] [B] [[C] [C]__ [...]] => __[B] [B] [B] [C] [C]__ [A] [[...]]
      // Forward: [[...] __[A] [A]] [B] [B] [B]__ [C] => [[...]] [C] __[A] [A] [B] [B] [B]__
      else if (!targetTabIsInGroup && manyGroups && !fullySelected) {
        await ungroupTabs(anchorGroup)
        return chrome.tabs.move(targetTab.id, { index: anchorTab.index })
      }
      // Backward: [A] __[B] [B] [B] [[C] [C] [C]]__ => __[B] [B] [B] [[C] [C] [C]]__ [A]
      // Forward: __[[A] [A] [A]] [B] [B] [B]__ [C] => [C] __[[A] [A] [A]] [B] [B] [B]__
      else if (!targetTabIsInGroup && manyGroups && fullySelected) {
        return chrome.tabs.move(targetTab.id, { index: anchorTab.index })
      }
      // Backward: [[A] __[B]] [C] [C]__ => [[A] __[B] [C] [C]__]
      // Forward: __[A] [A] [[B]__ [C]] => [__[A] [A] [B]__ [C]]
      else if (targetTab.groupId === focusTab.groupId && targetTab.groupId !== anchorTab.groupId) {
        return groupTabs(tabs, { id: targetTab.groupId })
      }
      // Backward: [[A] __[B] [B] [B]__] => [__[B] [B] [B]__ [A]]
      // Forward: [__[A] [A] [A]__ [B]] => [[B] __[A] [A] [A]__]
      else if (targetTab.groupId === focusTab.groupId && targetTab.groupId === anchorTab.groupId) {
        return chrome.tabs.move(targetTab.id, { index: anchorTab.index })
      }
      // Backward: [[A]] __[B] [B] [B]__ => [[A] __[B] [B] [B]__]
      // Forward: __[A] [A] [A]__ [[B]] => [__[A] [A] [A]__ [B]]
      else if (!targetTabIsHidden && singleGroup && !anchorTabIsInGroup) {
        return groupTabs(tabs, { id: targetTab.groupId })
      }
      // Backward: [[...]] __[B] [B] [B]__ => __[B] [B] [B]__ [[...]]
      // Forward: __[A] [A] [A]__ [[...]] => [[...]] __[A] [A] [A]__
      else if (targetTabIsHidden && singleGroup && !anchorTabIsInGroup) {
        await moveGroupToTab(targetTab, anchorTab)
      }
      // Backward: [[A]] [__[B] [B]__ [...]] => [[A]] __[B] [B]__ [[...]]
      // Forward: [[...] __[A] [A]__] [[B]] => [[...]] __[A] [A]__ [[B]]
      else if (targetTabIsInGroup && singleGroup && !fullySelected) {
        return ungroupTabs(tabs)
      }
      // Backward: [[A]] __[[B] [B] [B]]__ => __[[B] [B] [B]]__ [[A]]
      // Forward: __[[A] [A] [A]]__ [[B]] => [[B]] __[[A] [A] [A]]__
      else if (targetTabIsInGroup && singleGroup && fullySelected) {
        await moveGroupToTab(targetTab, anchorTab)
      }
      // Backward: [[A]] __[[B] [B] [B]] [C] [C] [C]__ => __[[B] [B] [B]] [C] [C] [C]__ [[A]]
      // Forward: __[A] [A] [A] [[B] [B] [B]]__ [[C]] => [[C]] __[A] [A] [A] [[B] [B] [B]]__
      else if (targetTabIsInGroup && manyGroups && !anchorTabIsInGroup) {
        await moveGroupToTab(targetTab, anchorTab)
      }
      // Backward: [[A]] __[B] [B] [B] [[C] [C]__ [...]] => __[B] [B] [B] [C] [C]__ [[A]] [[...]]
      // Forward: [[...] __[A] [A]] [B] [B] [B]__ [[C]] => [[...]] [[C]] __[A] [A] [B] [B] [B]__
      else if (targetTabIsInGroup && manyGroups && !fullySelected) {
        await ungroupTabs(anchorGroup)
        await moveGroupToTab(targetTab, anchorTab)
      }
      // Backward: [[A]] __[B] [B] [B] [[C] [C] [C]]__ => __[B] [B] [B] [[C] [C] [C]]__ [[A]]
      // Forward: __[[A] [A] [A]] [B] [B] [B]__ [[C]] => [[C]] __[[A] [A] [A]] [B] [B] [B]__
      else if (targetTabIsInGroup && manyGroups && fullySelected) {
        await moveGroupToTab(targetTab, anchorTab)
      }
    }, Promise.resolve())
  ])
}

// Moves selected tabs left.
// Skips hidden tabs—the ones whose are in collapsed tab groups.
export async function moveTabLeft(context) {
  await moveTabDirection(context, Direction.Backward)
}

// Moves selected tabs right.
// Skips hidden tabs—the ones whose are in collapsed tab groups.
export async function moveTabRight(context) {
  await moveTabDirection(context, Direction.Forward)
}

// Moves selected tabs to the far left/right.
async function moveTabEdgeDirection(context, direction) {
  let tabIndex, reduceMethod
  switch (direction) {
    case Direction.Backward:
      tabIndex = 0
      reduceMethod = 'reduce'
      break
    case Direction.Forward:
      tabIndex = -1
      reduceMethod = 'reduceRight'
      break
  }

  // Partition pinned tabs.
  const tabs = await getAllTabs(context)
  const startIndex = tabs.findIndex(tab => !tab.pinned)
  const [pinnedTabs, otherTabs] = startIndex === -1
    ? [tabs, []]
    : [tabs.slice(0, startIndex), tabs.slice(startIndex)]

  // Move chunked tabs.
  const isSelected = tab => tab.highlighted
  const byGroup = tab => tab.groupId
  const moveProperties = { index: tabIndex }
  await Promise.all([
    // Move pinned tabs.
    moveTabs(pinnedTabs.filter(isSelected), moveProperties),

    // Move other tabs.
    chunk(otherTabs, byGroup)[reduceMethod]((previousPromise, [groupId, tabs]) => previousPromise.then((value) => {
      const selectedTabs = tabs.filter(isSelected)
      // Move selected tabs, tabs in group or tab group to the far left/right.
      // Only move tab group if fully selected.
      return selectedTabs.length && groupId !== TAB_GROUP_ID_NONE
        ? selectedTabs.length === tabs.length
        // Handle pinned tabs.
        // Error: Cannot move the group to an index that is in the middle of pinned tabs.
        ? chrome.tabGroups.move(groupId, { index: tabIndex || pinnedTabs.length })
        : moveTabs(selectedTabs, moveProperties).then(tabs => groupTabs(tabs, { id: groupId }))
        : moveTabs(selectedTabs, moveProperties)
    }), Promise.resolve())
  ])
}

// Moves selected tabs to the far left.
export async function moveTabFirst(context) {
  await moveTabEdgeDirection(context, Direction.Backward)
}

// Moves selected tabs to the far right.
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

// Select tabs -----------------------------------------------------------------

// Deselects all other tabs.
export async function selectTab(context) {
  await highlightTabs([context.tab])
}

// Selects the next/previous tab.
async function selectTabDirection(context, direction) {
  const currentTab = context.tab
  const allTabs = await getAllTabs(context)

  // Shrink or expand selection, depending on the direction.
  let anchorIndex, focusIndex, focusOffset
  switch (direction) {
    case Direction.Backward:
      [anchorIndex, focusIndex] = currentTab.index < allTabs.length - 1 && allTabs[currentTab.index + 1].highlighted
        ? [0, -1]
        : [-1, 0]
      focusOffset = -1
      break
    case Direction.Forward:
      [anchorIndex, focusIndex] = currentTab.index > 0 && allTabs[currentTab.index - 1].highlighted
        ? [-1, 0]
        : [0, -1]
      focusOffset = 1
      break
  }

  // Only iterate selected tabs.
  const tabsToHighlight = [currentTab]
  const tabSelection = chunk(allTabs, (tab) => tab.highlighted)
  for (let index = tabSelection[0][0] ? 0 : 1; index < tabSelection.length; index += 2) {
    const selectedTabs = tabSelection[index][1]
    const anchorTabIndex = selectedTabs.at(anchorIndex).index
    const focusTabIndex = clamp(selectedTabs.at(focusIndex).index + focusOffset, 0, allTabs.length - 1)

    // Make Array.slice() work regardless of the selection direction.
    // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Selection
    const [startIndex, endIndex] = anchorTabIndex < focusTabIndex
      ? [anchorTabIndex, focusTabIndex]
      : [focusTabIndex, anchorTabIndex]

    // Create a new slice which represents the range of selected tabs.
    const tabs = allTabs.slice(startIndex, endIndex + 1)
    tabsToHighlight.push(...tabs)
  }
  // Update selection ranges.
  await highlightTabs(tabsToHighlight)
}

// Selects the previous tab.
export async function selectPreviousTab(context) {
  await selectTabDirection(context, Direction.Backward)
}

// Selects the next tab.
export async function selectNextTab(context) {
  await selectTabDirection(context, Direction.Forward)
}

// Selects related tabs.
export async function selectRelatedTabs(context) {
  const isSelected = tab => tab.highlighted
  const byGroup = tab => tab.pinned || tab.groupId
  const byDomain = tab => new URL(tab.url).hostname

  // Partition tabs and select related tabs for each group.
  const allTabs = await getAllTabs(context)
  const tabsToHighlight = [context.tab]
  for (const [_, tabPartition] of chunk(allTabs, byGroup)) {
    for (const [_, tabs] of tabPartition.groupToMap(byDomain)) {
      if (tabs.some(isSelected)) {
        tabsToHighlight.push(...tabs)
      }
    }
  }
  await highlightTabs(tabsToHighlight)
}

// Selects tabs in group.
// Note: Can be used for ungrouped tabs.
export async function selectTabsInGroup(context) {
  const isSelected = tab => tab.highlighted
  const byGroup = tab => tab.pinned || tab.groupId

  // Partition tabs and extend each selection to the whole group.
  const allTabs = await getAllTabs(context)
  const tabsToHighlight = [context.tab]
  for (const [_, tabs] of chunk(allTabs, byGroup)) {
    if (tabs.some(isSelected)) {
      tabsToHighlight.push(...tabs)
    }
  }
  await highlightTabs(tabsToHighlight)
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
