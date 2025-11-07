// This module contains commands to add keyboard shortcuts.
//
// Commands are parameter-less actions that can be performed with a tab context.
// Their main use is for key bindings. Commands are defined by adding properties
// to the `"commands"` object in the extension’s manifest. The command signature
// must be a function of one argument (a context received by the service worker).
//
// Manifest: https://developer.chrome.com/docs/extensions/reference/manifest
// Commands: https://developer.chrome.com/docs/extensions/reference/api/commands

/**
 * @typedef {object} CommandContext
 * @property {chrome.tabs.Tab} tab
 * @property {RecentTabsManager} recentTabsManager
 * @property {string} manualPage
 * @property {string} shortcutsPage
 */

import {
  chunk,
  clamp,
  dropWhile,
  getISODateString,
  modulo,
  range,
  splitWhile,
  takeWhile,
} from './utils.js'

import {
  blurActiveElement,
  clickPageElement,
  cyclePageElements,
  getSelectedText,
  prompt,
  readTextFromClipboard,
  scrollBy,
  scrollByPages,
  scrollTo,
  scrollToMax,
  togglePictureInPicture as togglePictureInPictureInjectableFunction,
  writeTextToClipboard,
} from './injectable_scripts.js'

// Language-sensitive string comparison
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator
const { compare: localeCompare } = new Intl.Collator

// Constants -------------------------------------------------------------------

const { TAB_GROUP_ID_NONE } = chrome.tabGroups
const { NEW_TAB: NEW_TAB_DISPOSITION } = chrome.search.Disposition

/**
 * List of tab group colors.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/tabGroups#type-Color
 *
 * @type {string[]}
 */
const TAB_GROUP_COLORS = Object.values(chrome.tabGroups.Color)

/**
 * List of invalid filename characters.
 *
 * https://developer.chrome.com/docs/extensions/reference/api/downloads#property-DownloadOptions-filename
 *
 * @type {RegExp}
 */
const INVALID_FILENAME_CHARS = /^\.|["*\/:<>?\\|]/g

/**
 * List of zoom presets.
 *
 * https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/common/page/page_zoom.cc
 *
 * @type {number[]}
 */
const PRESET_ZOOM_FACTORS = [
  0.25,
  1 / 3.0,
  0.5,
  2 / 3.0,
  0.75,
  0.8,
  0.9,
  1.0,
  1.1,
  1.25,
  1.5,
  1.75,
  2.0,
  2.5,
  3.0,
  4.0,
  5.0,
]

/**
 * Epsilon value for comparing two floating-point zoom values.
 *
 * https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/common/page/page_zoom.cc
 *
 * @type {number}
 */
const PAGE_ZOOM_EPSILON = 0.001

const SHORT_THROW_FRAME_CALIBRATION = [0.2, 0.2, 0.2, 0.2, 0.2]
const LONG_THROW_FRAME_CALIBRATION = [0.001, 0.002, 0.003, 0.004, 0.99]

// Enums -----------------------------------------------------------------------

// Enum representing a direction.
const Direction = { Backward: -1, Forward: 1 }

// Utils -----------------------------------------------------------------------

/**
 * @param {{ id: number }} object
 * @returns {number}
 */
const _id = ({ id }) => id

/**
 * @param {{ index: number }} object
 * @returns {number}
 */
const _index = ({ index }) => index

/**
 * @param {{ highlighted: boolean }} object
 * @returns {boolean}
 */
const _highlighted = ({ highlighted }) => highlighted

/**
 * @param {{ pinned: boolean }} object
 * @returns {boolean}
 */
const _pinned = ({ pinned }) => pinned

/**
 * @param {{ groupId: number }} object
 * @returns {number}
 */
const _groupId = ({ groupId }) => groupId

/**
 * @param {{ title: string }} object
 * @returns {string}
 */
const _title = ({ title }) => title

/**
 * @param {{ url: string }} object
 * @returns {string}
 */
const _url = ({ url }) => url

/**
 * @param {{ url: string }} object
 * @returns {string}
 */
const _hostname = ({ url }) => new URL(url).hostname

/**
 * @param {{ pinned: boolean, groupId: number }} object
 * @returns {boolean | number}
 */
const _weakGroup = ({ pinned, groupId }) => pinned || groupId

/**
 * @template T
 * @param {(x: T) => any} f
 * @returns {(x: T) => boolean}
 */
const not = (f) => (x) => !f(x)

/**
 * @template T
 * @param {(x: T) => any} f
 * @returns {(a: T, b: T) => boolean}
 */
const compare = (f) => (a, b) => f(a) === f(b)

/**
 * @param {{ groupId: number }} object
 * @returns {boolean}
 */
const hasGroup = ({ groupId }) => groupId !== TAB_GROUP_ID_NONE

/**
 * @param {{ groupId: number }} object
 * @param {{ groupId: number }} otherObject
 * @returns {boolean}
 */
const sameGroup = compare(_groupId)

// Shortcuts -------------------------------------------------------------------

/**
 * Opens the Shortcuts manual.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openShortcutsManual(cx) {
  await openChromePage(cx, cx.manualPage)
}

/**
 * Opens the Shortcuts “Options” page.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openShortcutsOptionsPage(cx) {
  await chrome.runtime.openOptionsPage()
}

/**
 * Opens the Shortcuts “Keyboard shortcuts” page.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openShortcutsShortcutsPage(cx) {
  await openChromePage(cx, cx.shortcutsPage)
}

// Navigation ------------------------------------------------------------------

/**
 * Goes back to the previous page in tab’s history.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function goBack(cx) {
  await chrome.tabs.goBack(cx.tab.id)
}

/**
 * Goes forward to the next page in tab’s history.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function goForward(cx) {
  await chrome.tabs.goForward(cx.tab.id)
}

/**
 * Reloads selected tabs.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function reloadTab(cx) {
  const tabs = await chrome.tabs.query({
    highlighted: true,
    windowId: cx.tab.windowId
  })

  await Promise.all(
    tabs.map((tab) =>
      chrome.tabs.reload(tab.id)
    )
  )
}

/**
 * Reloads selected tabs, ignoring cached content.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function reloadTabWithoutCache(cx) {
  const tabs = await chrome.tabs.query({
    highlighted: true,
    windowId: cx.tab.windowId
  })

  await Promise.all(
    tabs.map((tab) =>
      chrome.tabs.reload(tab.id, {
        bypassCache: true
      })
    )
  )
}

/**
 * Goes to the next page in the series, if one is available.
 *
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel#attr-next
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function goToNextPage(cx) {
  await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id
    },
    func: clickPageElement,
    args: ['[rel="next"]']
  })
}

/**
 * Goes to the previous page in the series, if one is available.
 *
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel#attr-prev
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function goToPreviousPage(cx) {
  await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id
    },
    func: clickPageElement,
    args: ['[rel="prev"]']
  })
}

/**
 * Navigates at the URL specified.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Location/assign
 *
 * @param {CommandContext} cx
 * @param {(url: URL) => string} func
 * @returns {Promise<void>}
 */
async function assignURL(cx, func) {
  const baseURL = new URL(cx.tab.url)
  const navigateURL = new URL(func(baseURL), baseURL)

  await chrome.tabs.update(cx.tab.id, {
    url: navigateURL.toString()
  })
}

/**
 * Removes any URL parameters.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function removeURLParams(cx) {
  await assignURL(cx, (url) => url.pathname)
}

/**
 * Goes up in the URL hierarchy.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function goUp(cx) {
  await assignURL(cx, (url) => url.pathname.endsWith('/') ? '..' : '.')
}

/**
 * Goes to the root URL.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function goToRoot(cx) {
  await assignURL(cx, (url) => '/')
}

// Accessibility ---------------------------------------------------------------

/**
 * Cycles through text fields.
 *
 * - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
 * - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/textarea
 * - https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/contenteditable
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function focusTextInput(cx) {
  await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id
    },
    func: cyclePageElements,
    args: [
      `
        input[type="date"]:not([disabled], [readonly]),
        input[type="datetime-local"]:not([disabled], [readonly]),
        input[type="email"]:not([disabled], [readonly]),
        input[type="month"]:not([disabled], [readonly]),
        input[type="number"]:not([disabled], [readonly]),
        input[type="password"]:not([disabled], [readonly]),
        input[type="search"]:not([disabled], [readonly]),
        input[type="tel"]:not([disabled], [readonly]),
        input[type="text"]:not([disabled], [readonly]),
        input[type="time"]:not([disabled], [readonly]),
        input[type="url"]:not([disabled], [readonly]),
        input[type="week"]:not([disabled], [readonly]),
        textarea:not([disabled], [readonly]),
        [contenteditable="true"],
        [contenteditable=""],
        [contenteditable="plaintext-only"]
      `
    ]
  })
}

/**
 * Cycles through media players.
 *
 * - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
 * - https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function focusMediaPlayer(cx) {
  await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id,
      allFrames: true,
    },
    func: cyclePageElements,
    args: ['video, audio']
  })
}

/**
 * Blurs the active element.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function blurElement(cx) {
  await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id
    },
    func: blurActiveElement
  })
}

// Clipboard -------------------------------------------------------------------

/**
 * Copies URL of selected tabs.
 *
 * NOTE: If Chrome notifications are enabled,
 * Shortcuts will show you a message for copied text.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function copyURL(cx) {
  const tabs = await chrome.tabs.query({
    highlighted: true,
    windowId: cx.tab.windowId
  })

  const text = tabs.map(_url).join('\n')

  await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id
    },
    func: writeTextToClipboard,
    args: [text]
  })

  await sendNotification(
    chrome.i18n.getMessage('copyURLNotificationTitle'),
    chrome.i18n.getMessage('copyURLNotificationMessage', tabs.length.toString())
  )
}

/**
 * Copies title of selected tabs.
 *
 * NOTE: If Chrome notifications are enabled,
 * Shortcuts will show you a message for copied text.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function copyTitle(cx) {
  const tabs = await chrome.tabs.query({
    highlighted: true,
    windowId: cx.tab.windowId
  })

  const text = tabs.map(_title).join('\n')

  await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id
    },
    func: writeTextToClipboard,
    args: [text]
  })

  await sendNotification(
    chrome.i18n.getMessage('copyTitleNotificationTitle'),
    chrome.i18n.getMessage('copyTitleNotificationMessage', tabs.length.toString())
  )
}

/**
 * Copies title and URL of selected tabs.
 *
 * NOTE: If Chrome notifications are enabled,
 * Shortcuts will show you a message for copied text.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function copyTitleAndURL(cx) {
  const tabs = await chrome.tabs.query({
    highlighted: true,
    windowId: cx.tab.windowId
  })

  const text = tabs.map(({ title, url }) => `[${title}](${url})`).join('\n')

  await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id
    },
    func: writeTextToClipboard,
    args: [text]
  })

  await sendNotification(
    chrome.i18n.getMessage('copyTitleAndURLNotificationTitle'),
    chrome.i18n.getMessage('copyTitleAndURLNotificationMessage', tabs.length.toString())
  )
}

/**
 * Opens and activates new tabs from the system clipboard.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openNewTabsFromClipboard(cx) {
  const [{ result: clipboardContents }] = await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id
    },
    func: readTextFromClipboard
  })

  const createdTabs = await openNewTabs(
    cx.tab.id,
    clipboardContents
      .split('\n')
      .filter((url) =>
        URL.canParse(url)
      )
  )

  await chrome.tabs.highlight({
    windowId: cx.tab.windowId,
    tabs: createdTabs.map(_index)
  })
}

// Save pages ------------------------------------------------------------------

/**
 * Saves the content of selected tabs.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function savePage(cx) {
  const tabs = await chrome.tabs.query({
    highlighted: true,
    windowId: cx.tab.windowId
  })

  await Promise.all(
    tabs.map((tab) =>
      chrome.downloads.download({
        url: tab.url
      })
    )
  )
}

/**
 * Saves the content of selected tabs as MHTML.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function savePageAsMHTML(cx) {
  const tabs = await chrome.tabs.query({
    highlighted: true,
    windowId: cx.tab.windowId
  })

  await Promise.allSettled(
    tabs.map((tab) =>
      chrome.pageCapture
        .saveAsMHTML({
          tabId: tab.id
        })
        .then((file) =>
          readFileAsDataURL(file)
        )
        .then((url) =>
          chrome.downloads.download({
            url,
            filename: getFilenameSuggestion(`${tab.title}.mhtml`)
          })
        )
    )
  )
}

/**
 * Reads file as data URL.
 *
 * @param {File} file
 * @returns {Promise<string>}
 */
async function readFileAsDataURL(file) {
  return new Promise((resolve) => {
    const fileReader = new FileReader
    fileReader.addEventListener('load', () => {
      resolve(fileReader.result)
    })
    fileReader.readAsDataURL(file)
  })
}

/**
 * Returns a suitable filename for downloads.
 *
 * @param {string} filename
 * @returns {string}
 */
function getFilenameSuggestion(filename) {
  return filename.replace(INVALID_FILENAME_CHARS, '_')
}

// Web search ------------------------------------------------------------------

/**
 * Performs a search for selected text using the default search engine.
 * The results will be displayed in a new tab.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openWebSearchForSelectedText(cx) {
  const [{ result: text }] = await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id
    },
    func: getSelectedText
  })

  if (text === null) {
    return
  }

  // Unfortunately, the method doesn’t return a value
  // to determine the tab being created.
  await chrome.search.query({
    disposition: NEW_TAB_DISPOSITION,
    text
  })

  const [createdTab] = await chrome.tabs.query({
    active: true,
    windowId: cx.tab.windowId
  })

  await Promise.all([
    chrome.tabs.update(createdTab.id, {
      openerTabId: cx.tab.id
    }),

    chrome.tabs.move(createdTab.id, {
      index: cx.tab.index + 1
    }),
  ])

  if (hasGroup(cx.tab)) {
    await chrome.tabs.group({
      groupId: cx.tab.groupId,
      tabIds: [
        createdTab.id
      ]
    })
  }
}

// Scroll ----------------------------------------------------------------------

/**
 * Scrolls down.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function scrollDown(cx) {
  await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id
    },
    func: scrollBy,
    args: [{
      deltaX: 0,
      deltaY: 70,
      frameCalibration: SHORT_THROW_FRAME_CALIBRATION,
      cancelable: false,
    }]
  })
}

/**
 * Scrolls up.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function scrollUp(cx) {
  await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id
    },
    func: scrollBy,
    args: [{
      deltaX: 0,
      deltaY: -70,
      frameCalibration: SHORT_THROW_FRAME_CALIBRATION,
      cancelable: false,
    }]
  })
}

/**
 * Scrolls left.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function scrollLeft(cx) {
  await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id
    },
    func: scrollBy,
    args: [{
      deltaX: -70,
      deltaY: 0,
      frameCalibration: SHORT_THROW_FRAME_CALIBRATION,
      cancelable: false,
    }]
  })
}

/**
 * Scrolls right.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function scrollRight(cx) {
  await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id
    },
    func: scrollBy,
    args: [{
      deltaX: 70,
      deltaY: 0,
      frameCalibration: SHORT_THROW_FRAME_CALIBRATION,
      cancelable: false,
    }]
  })
}

/**
 * Scrolls one page down.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function scrollPageDown(cx) {
  await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id
    },
    func: scrollByPages,
    args: [{
      pageFactor: 0.9,
      frameCalibration: SHORT_THROW_FRAME_CALIBRATION,
      cancelable: false,
    }]
  })
}

/**
 * Scrolls one page up.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function scrollPageUp(cx) {
  await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id
    },
    func: scrollByPages,
    args: [{
      pageFactor: -0.9,
      frameCalibration: SHORT_THROW_FRAME_CALIBRATION,
      cancelable: false,
    }]
  })
}

/**
 * Scrolls half page down.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function scrollHalfPageDown(cx) {
  await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id
    },
    func: scrollByPages,
    args: [{
      pageFactor: 0.5,
      frameCalibration: SHORT_THROW_FRAME_CALIBRATION,
      cancelable: false,
    }]
  })
}

/**
 * Scrolls half page up.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function scrollHalfPageUp(cx) {
  await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id
    },
    func: scrollByPages,
    args: [{
      pageFactor: -0.5,
      frameCalibration: SHORT_THROW_FRAME_CALIBRATION,
      cancelable: false,
    }]
  })
}

/**
 * Scrolls to the top of the page.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function scrollToTop(cx) {
  await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id
    },
    func: scrollTo,
    args: [{
      scrollLeft: 0,
      scrollTop: 0,
      frameCalibration: LONG_THROW_FRAME_CALIBRATION,
      cancelable: false,
    }]
  })
}

/**
 * Scrolls to the bottom of the page.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function scrollToBottom(cx) {
  await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id
    },
    func: scrollToMax,
    args: [{
      scrollLeft: 0,
      frameCalibration: LONG_THROW_FRAME_CALIBRATION,
      cancelable: false,
    }]
  })
}

// Zoom ------------------------------------------------------------------------

/**
 * Zooms in.
 *
 * https://source.chromium.org/chromium/chromium/src/+/main:components/zoom/page_zoom.cc
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function zoomIn(cx) {
  const zoomFactor = await chrome.tabs.getZoom(cx.tab.id)

  const nextHigherZoomFactor =
    PRESET_ZOOM_FACTORS.find((presetZoomFactor) =>
      presetZoomFactor > zoomFactor &&
      !zoomValuesEqual(presetZoomFactor, zoomFactor)
    )

  if (nextHigherZoomFactor) {
    await chrome.tabs.setZoom(cx.tab.id, nextHigherZoomFactor)
  }
}

/**
 * Zooms out.
 *
 * https://source.chromium.org/chromium/chromium/src/+/main:components/zoom/page_zoom.cc
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function zoomOut(cx) {
  const zoomFactor = await chrome.tabs.getZoom(cx.tab.id)

  const nextLowerZoomFactor =
    PRESET_ZOOM_FACTORS.findLast((presetZoomFactor) =>
      presetZoomFactor < zoomFactor &&
      !zoomValuesEqual(presetZoomFactor, zoomFactor)
    )

  if (nextLowerZoomFactor) {
    await chrome.tabs.setZoom(cx.tab.id, nextLowerZoomFactor)
  }
}

/**
 * Compares page zoom factors.
 *
 * https://source.chromium.org/chromium/chromium/src/+/main:third_party/blink/common/page/page_zoom.cc
 *
 * @param {number} zoomFactor
 * @param {number} otherZoomFactor
 * @returns {boolean}
 */
function zoomValuesEqual(zoomFactor, otherZoomFactor) {
  return Math.abs(zoomFactor - otherZoomFactor) <= PAGE_ZOOM_EPSILON
}

/**
 * Resets the zoom factor.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function zoomReset(cx) {
  await chrome.tabs.setZoom(cx.tab.id, 0)
}

// Window state ----------------------------------------------------------------

/**
 * Minimizes the current window.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function minimizeWindow(cx) {
  await chrome.windows.update(cx.tab.windowId, {
    state: 'minimized'
  })
}

/**
 * Maximizes the current window.
 *
 * NOTE: If the window is already maximized,
 * restores its normal state.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function maximizeWindow(cx) {
  const windowInfo = await chrome.windows.get(cx.tab.windowId)

  await chrome.windows.update(windowInfo.id, {
    state: windowInfo.state === 'maximized' ? 'normal' : 'maximized'
  })
}

/**
 * Turns full-screen mode on or off.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function toggleFullScreen(cx) {
  const windowInfo = await chrome.windows.get(cx.tab.windowId)

  await chrome.windows.update(windowInfo.id, {
    state: windowInfo.state === 'fullscreen' ? 'normal' : 'fullscreen'
  })
}

/**
 * Turns picture-in-picture mode on or off.
 *
 * Shortcuts will attempt to open the most relevant video on the page
 * into a picture-in-picture window, or will close it if already open.
 *
 * IMPORTANT: Entering picture-in-picture mode requires a user gesture.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/Picture-in-Picture_API
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function togglePictureInPicture(cx) {
  await chrome.scripting.executeScript({
    target: {
      tabId: cx.tab.id,
      allFrames: true,
    },
    func: togglePictureInPictureInjectableFunction,
  })
}

// Create tabs -----------------------------------------------------------------

/**
 * Opens and activates a new tab.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openNewTab(cx) {
  await chrome.tabs.create({
    active: true,
    openerTabId: cx.tab.id,
    windowId: cx.tab.windowId
  })
}

/**
 * Opens a bunch of tabs to the right,
 * and activates the first of them.
 *
 * @param {number} openerTabId
 * @param {string[]} urls
 * @returns {Promise<chrome.tabs.Tab[]>}
 */
async function openNewTabs(openerTabId, urls) {
  const {
    index: openerTabIndex,
    groupId,
    windowId,
  } = await chrome.tabs.get(openerTabId)

  const createdTabs = await Promise.all(
    urls.map((url, index) =>
      chrome.tabs.create({
        active: index === 0,
        url,
        index: openerTabIndex + index + 1,
        openerTabId,
        windowId,
      })
    )
  )

  if (groupId !== TAB_GROUP_ID_NONE) {
    await chrome.tabs.group({
      groupId,
      tabIds: createdTabs.map(_id)
    })
  }

  return createdTabs
}

/**
 * Opens and activates a new tab to the right.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openNewTabRight(cx) {
  await openNewTabs(cx.tab.id, ['chrome://newtab/'])
}

/**
 * Opens a new window.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openNewWindow(cx) {
  await chrome.windows.create({
    focused: true
  })
}

/**
 * Opens a new window in Incognito mode.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openNewIncognitoWindow(cx) {
  await chrome.windows.create({
    focused: true,
    incognito: true
  })
}

// Close tabs ------------------------------------------------------------------

/**
 * Closes selected tabs.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function closeTab(cx) {
  const tabs = await chrome.tabs.query({
    highlighted: true,
    windowId: cx.tab.windowId
  })

  await chrome.tabs.remove(
    tabs.map(_id)
  )
}

/**
 * Closes other tabs.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function closeOtherTabs(cx) {
  const tabs = await chrome.tabs.query({
    highlighted: false,
    pinned: false,
    windowId: cx.tab.windowId
  })

  await chrome.tabs.remove(
    tabs.map(_id)
  )
}

/**
 * Closes tabs to the right.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function closeRightTabs(cx) {
  const tabs = await chrome.tabs.query({
    windowId: cx.tab.windowId
  })

  await chrome.tabs.remove(
    tabs
      .slice(tabs.findLast(_highlighted).index + 1)
      .filter(not(_pinned))
      .map(_id)
  )
}

/**
 * Closes the window that contains the tab.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function closeWindow(cx) {
  await chrome.windows.remove(cx.tab.windowId)
}

/**
 * Reopens previously closed tabs.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function restoreTab(cx) {
  await chrome.sessions.restore()
}

// Tab state -------------------------------------------------------------------

/**
 * Duplicates selected tabs.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function duplicateTab(cx) {
  const tabs = await chrome.tabs.query({
    highlighted: true,
    windowId: cx.tab.windowId
  })

  const duplicatedTabs = await Promise.all(
    tabs.map((tab) =>
      chrome.tabs.duplicate(tab.id)
    )
  )

  const highlightInfo = getHighlightInfo(cx.tab.id, tabs)

  for (const index in tabs) {
    highlightInfo.set(
      tabs[index].id,
      duplicatedTabs[index].index
    )
  }

  await chrome.tabs.highlight({
    windowId: cx.tab.windowId,
    tabs: Array.from(
      highlightInfo.values()
    )
  })
}

/**
 * Pins or unpins selected tabs.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function togglePinTab(cx) {
  const tabs = await chrome.tabs.query({
    highlighted: true,
    windowId: cx.tab.windowId
  })

  const someTabsNotPinned = tabs.some(not(_pinned))

  await Promise.all(
    tabs.map((tab) =>
      chrome.tabs.update(tab.id, {
        pinned: someTabsNotPinned
      })
    )
  )
}

/**
 * Groups or ungroups selected tabs.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function toggleGroupTab(cx) {
  const tabs = await chrome.tabs.query({
    highlighted: true,
    windowId: cx.tab.windowId
  })

  if (tabs.some(not(hasGroup))) {
    const groupId = await chrome.tabs.group({
      tabIds: tabs.map(_id)
    })

    const groupedTabs = await chrome.tabs.query({
      groupId
    })

    await chrome.tabs.highlight({
      windowId: cx.tab.windowId,
      tabs: Array.from(
        getHighlightInfo(cx.tab.id, groupedTabs).values()
      )
    })
  } else {
    await chrome.tabs.ungroup(
      tabs.map(_id)
    )
  }
}

/**
 * Collapses or uncollapses tab groups.
 *
 * NOTE: Active groups are not collapsible.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function toggleCollapseTabGroups(cx) {
  const tabs = await chrome.tabs.query({
    highlighted: true,
    windowId: cx.tab.windowId
  })

  const tabGroups = await chrome.tabGroups.query({
    windowId: cx.tab.windowId
  })

  // Determine whose groups are active.
  // A group that contains highlighted tabs is considered active.
  const activeGroups = new Set(
    tabs.map(_groupId)
  )

  activeGroups.delete(TAB_GROUP_ID_NONE)

  // Active groups are not collapsible.
  const collapsibleGroups = tabGroups.filter((tabGroup) =>
    !activeGroups.has(tabGroup.id)
  )

  const someGroupsExpanded = collapsibleGroups.some(
    (tabGroup) => !tabGroup.collapsed
  )

  await Promise.all(
    collapsibleGroups.map((tabGroup) =>
      chrome.tabGroups.update(tabGroup.id, {
        collapsed: someGroupsExpanded
      })
    )
  )
}

/**
 * Mutes or unmutes selected tabs.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function toggleMuteTab(cx) {
  const tabs = await chrome.tabs.query({
    highlighted: true,
    windowId: cx.tab.windowId
  })

  const someTabsNotMuted = tabs.some(
    (tab) => !tab.mutedInfo.muted
  )

  await Promise.all(
    tabs.map((tab) =>
      chrome.tabs.update(tab.id, {
        muted: someTabsNotMuted
      })
    )
  )
}

/**
 * Discards selected tabs.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function discardTab(cx) {
  const tabs = await chrome.tabs.query({
    highlighted: true,
    discarded: false,
    windowId: cx.tab.windowId
  })

  await Promise.all(
    tabs.map((tab) =>
      chrome.tabs.discard(tab.id)
    )
  )
}

// Organize tabs ---------------------------------------------------------------

/**
 * Sorts selected tabs.
 *
 * @param {CommandContext} cx
 * @param {(tab: chrome.tabs.Tab, otherTab: chrome.tabs.Tab) => number} compareTabs
 * @returns {Promise<void>}
 */
async function sortTabs(cx, compareTabs) {
  const tabs = await chrome.tabs.query({
    highlighted: true,
    windowId: cx.tab.windowId
  })

  await Promise.all(
    chunk(tabs, _weakGroup).map(([, tabs]) => {
      const sortedTabs = tabs.toSorted(compareTabs)

      return Promise.all(
        sortedTabs.map((tab, index) =>
          chrome.tabs.move(tab.id, {
            index: tabs[index].index
          })
        )
      )
    })
  )
}

/**
 * Sorts selected tabs by name.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function sortTabsByName(cx) {
  await sortTabs(cx, (tab, otherTab) =>
    localeCompare(tab.title, otherTab.title)
  )
}

/**
 * Sorts selected tabs by URL.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function sortTabsByURL(cx) {
  await sortTabs(cx, (tab, otherTab) =>
    localeCompare(tab.url, otherTab.url)
  )
}

/**
 * Sorts selected tabs by recency.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function sortTabsByRecency(cx) {
  await sortTabs(cx, (tab, otherTab) =>
    tab.lastAccessed - otherTab.lastAccessed
  )
}

/**
 * Reverses the order of selected tabs.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function reverseTabOrder(cx) {
  const tabs = await chrome.tabs.query({
    highlighted: true,
    windowId: cx.tab.windowId
  })

  await Promise.all(
    chunk(tabs, _weakGroup).map(([, tabs]) => {
      return Promise.all(
        tabs.map((tab, index) =>
          chrome.tabs.move(tab.id, {
            index: tabs.at(-index - 1).index
          })
        )
      )
    })
  )
}

/**
 * Groups selected tabs by domain.
 * Uses an existing group if possible.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function groupTabsByDomain(cx) {
  const tabs = await chrome.tabs.query({
    highlighted: true,
    windowId: cx.tab.windowId
  })

  const tabGroups = await chrome.tabGroups.query({
    windowId: cx.tab.windowId
  })

  const tabsByDomain = Map.groupBy(tabs, _hostname)

  const tabGroupsByTitle = Map.groupBy(tabGroups, _title)

  const tabInfo = new Set(
    tabs.map(_id)
  )

  const groupIds = await Promise.all(
    Array.from(tabsByDomain, ([hostname, tabs]) => {
      if (tabGroupsByTitle.has(hostname)) {
        return chrome.tabs.group({
          groupId: tabGroupsByTitle.get(hostname)[0].id,
          tabIds: tabs.map(_id)
        })
      } else {
        return chrome.tabs.group({
          tabIds: tabs.map(_id)
        }).then((groupId) =>
          chrome.tabGroups.update(groupId, {
            title: hostname
          })
        ).then(_id)
      }
    })
  )

  const groupedTabsByDomain = await Promise.all(
    groupIds.map((groupId) =>
      chrome.tabs.query({
        groupId
      })
    )
  )

  const tabSelection = groupedTabsByDomain.flatMap((tabs) =>
    tabs.filter((tab) =>
      tabInfo.has(tab.id)
    )
  )

  await chrome.tabs.highlight({
    windowId: cx.tab.windowId,
    tabs: Array.from(
      getHighlightInfo(cx.tab.id, tabSelection).values()
    )
  })
}

// Manage tab groups -----------------------------------------------------------

/**
 * Collapses tab groups that contain highlighted tabs.
 *
 * NOTE: If the current tab belongs to a group,
 * switches to the nearest non hidden tab, or
 * creates a new tab.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function collapseTabGroup(cx) {
  const tabs = await chrome.tabs.query({
    windowId: cx.tab.windowId
  })

  const activeGroups = new Set

  for (const tab of tabs) {
    if (tab.highlighted) {
      activeGroups.add(tab.groupId)
    }
  }

  activeGroups.delete(TAB_GROUP_ID_NONE)

  await Promise.all(
    Array.from(activeGroups, (groupId) =>
      chrome.tabGroups.update(groupId, {
        collapsed: true
      })
    )
  )

  if (cx.tab.groupId === TAB_GROUP_ID_NONE) {
    await chrome.tabs.highlight({
      windowId: cx.tab.windowId,
      tabs: [
        cx.tab.index
      ]
    })
  } else {
    const tabGroups = await chrome.tabGroups.query({
      windowId: cx.tab.windowId
    })

    const collapseInfo = getCollapseInfo(tabGroups)

    const nextActiveTab =
      tabs
        .slice(cx.tab.index + 1)
        .find((tab) =>
          !collapseInfo.get(tab.groupId)
        ) ||
      tabs
        .slice(0, cx.tab.index)
        .findLast((tab) =>
          !collapseInfo.get(tab.groupId)
        )

    if (nextActiveTab) {
      await chrome.tabs.update(nextActiveTab.id, {
        active: true
      })
    } else {
      await chrome.tabs.create({
        active: true,
        openerTabId: cx.tab.id,
        windowId: cx.tab.windowId
      })
    }
  }
}

/**
 * Renames tab group (prompts for a new name).
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function renameTabGroup(cx) {
  if (hasGroup(cx.tab)) {
    const tabGroup = await chrome.tabGroups.get(cx.tab.groupId)

    const [{ result: title }] = await chrome.scripting.executeScript({
      target: {
        tabId: cx.tab.id
      },
      func: prompt,
      args: ['Name this group', tabGroup.title]
    })

    if (
      title !== null &&
      title !== tabGroup.title
    ) {
      await chrome.tabGroups.update(tabGroup.id, {
        title
      })
    }
  }
}

/**
 * Cycles through tab group colors.
 *
 * @param {CommandContext} cx
 * @param {number} delta
 * @returns {Promise<void>}
 */
async function cycleTabGroupColor(cx, delta) {
  if (hasGroup(cx.tab)) {
    const tabGroup = await chrome.tabGroups.get(cx.tab.groupId)

    const nextColor = TAB_GROUP_COLORS[
      modulo(
        TAB_GROUP_COLORS.indexOf(tabGroup.color) + delta,
        TAB_GROUP_COLORS.length
      )
    ]

    await chrome.tabGroups.update(tabGroup.id, {
      color: nextColor
    })
  }
}

/**
 * Cycles forward through tab group colors.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function cycleTabGroupColorForward(cx) {
  await cycleTabGroupColor(cx, 1)
}

/**
 * Cycles backward through tab group colors.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function cycleTabGroupColorBackward(cx) {
  await cycleTabGroupColor(cx, -1)
}

// Switch tabs -----------------------------------------------------------------

/**
 * Cycles through audible tabs.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function activateAudibleTab(cx) {
  const tabs = await chrome.tabs.query({
    audible: true
  })

  if (tabs.length > 0) {
    const tabIndex = tabs.findIndex(
      (tab) => tab.id === cx.tab.id
    )

    const tabInfo = tabs[
      modulo(
        tabIndex + 1,
        tabs.length
      )
    ]

    await chrome.tabs.update(tabInfo.id, {
      active: true
    })

    await chrome.windows.update(tabInfo.windowId, {
      focused: true
    })
  }
}

/**
 * Activates an open tab relative to the current tab.
 * Skips hidden tabs—the ones whose are in collapsed tab groups—and wraps around.
 *
 * @param {CommandContext} cx
 * @param {number} delta
 * @returns {Promise<void>}
 */
async function activateTabRelative(cx, delta) {
  const tabs = await getOpenTabs(cx.tab.windowId)

  const tabIndex = tabs.findIndex(
    (tab) => tab.id === cx.tab.id
  )

  const tabInfo = tabs[
    modulo(
      tabIndex + delta,
      tabs.length
    )
  ]

  await chrome.tabs.update(tabInfo.id, {
    active: true
  })

  await chrome.windows.update(tabInfo.windowId, {
    focused: true
  })
}

/**
 * Activates the next open tab.
 * Skips hidden tabs—the ones whose are in collapsed tab groups—and wraps around.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function activateNextTab(cx) {
  await activateTabRelative(cx, 1)
}

/**
 * Activates the previous open tab.
 * Skips hidden tabs—the ones whose are in collapsed tab groups—and wraps around.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function activatePreviousTab(cx) {
  await activateTabRelative(cx, -1)
}

/**
 * Activates a tab by its index.
 * Skips hidden tabs—the ones whose are in collapsed tab groups.
 *
 * @param {CommandContext} cx
 * @param {number} index
 * @returns {Promise<void>}
 */
async function activateTabAtIndex(cx, index) {
  const tabs = await getOpenTabs(cx.tab.windowId)

  const tabInfo = tabs.at(index)

  if (tabInfo) {
    await chrome.tabs.update(tabInfo.id, {
      active: true
    })

    await chrome.windows.update(tabInfo.windowId, {
      focused: true
    })
  }
}

/**
 * Activates the leftmost open tab.
 * Skips hidden tabs—the ones whose are in collapsed tab groups.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function activateFirstTab(cx) {
  await activateTabAtIndex(cx, 0)
}

/**
 * Activates the second leftmost open tab.
 * Skips hidden tabs—the ones whose are in collapsed tab groups.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function activateSecondTab(cx) {
  await activateTabAtIndex(cx, 1)
}

/**
 * Activates the third leftmost open tab.
 * Skips hidden tabs—the ones whose are in collapsed tab groups.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function activateThirdTab(cx) {
  await activateTabAtIndex(cx, 2)
}

/**
 * Activates the fourth leftmost open tab.
 * Skips hidden tabs—the ones whose are in collapsed tab groups.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function activateFourthTab(cx) {
  await activateTabAtIndex(cx, 3)
}

/**
 * Activates the fifth leftmost open tab.
 * Skips hidden tabs—the ones whose are in collapsed tab groups.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function activateFifthTab(cx) {
  await activateTabAtIndex(cx, 4)
}

/**
 * Activates the sixth leftmost open tab.
 * Skips hidden tabs—the ones whose are in collapsed tab groups.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function activateSixthTab(cx) {
  await activateTabAtIndex(cx, 5)
}

/**
 * Activates the seventh leftmost open tab.
 * Skips hidden tabs—the ones whose are in collapsed tab groups.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function activateSeventhTab(cx) {
  await activateTabAtIndex(cx, 6)
}

/**
 * Activates the eighth leftmost open tab.
 * Skips hidden tabs—the ones whose are in collapsed tab groups.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function activateEighthTab(cx) {
  await activateTabAtIndex(cx, 7)
}

/**
 * Activates the rightmost open tab.
 * Skips hidden tabs—the ones whose are in collapsed tab groups.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function activateLastTab(cx) {
  await activateTabAtIndex(cx, -1)
}

/**
 * Activates the nth most recently used tab among your open tabs.
 *
 * @param {CommandContext} cx
 * @param {number} index
 * @returns {Promise<void>}
 */
async function activateMostRecentTabAtIndex(cx, index) {
  const tabIds = cx.recentTabsManager.getRecentTabs()

  if (tabIds.length > index) {
    const tabInfo = await chrome.tabs.get(
      tabIds[index]
    )

    await chrome.tabs.update(tabInfo.id, {
      active: true
    })

    await chrome.windows.update(tabInfo.windowId, {
      focused: true
    })
  }
}

/**
 * Activates the last active tab.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function activateLastActiveTab(cx) {
  await activateMostRecentTabAtIndex(cx, 0)
}

/**
 * Activates the second last active tab.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function activateSecondLastActiveTab(cx) {
  await activateMostRecentTabAtIndex(cx, 1)
}

/**
 * Activates the third last active tab.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function activateThirdLastActiveTab(cx) {
  await activateMostRecentTabAtIndex(cx, 2)
}

/**
 * Activates the fourth last active tab.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function activateFourthLastActiveTab(cx) {
  await activateMostRecentTabAtIndex(cx, 3)
}

/**
 * Activates the fifth last active tab.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function activateFifthLastActiveTab(cx) {
  await activateMostRecentTabAtIndex(cx, 4)
}

/**
 * Activates the sixth last active tab.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function activateSixthLastActiveTab(cx) {
  await activateMostRecentTabAtIndex(cx, 5)
}

/**
 * Activates the seventh last active tab.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function activateSeventhLastActiveTab(cx) {
  await activateMostRecentTabAtIndex(cx, 6)
}

/**
 * Activates the eighth last active tab.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function activateEighthLastActiveTab(cx) {
  await activateMostRecentTabAtIndex(cx, 7)
}

/**
 * Activates the ninth last active tab.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function activateNinthLastActiveTab(cx) {
  await activateMostRecentTabAtIndex(cx, 8)
}

/**
 * Activates an open window relative to the current window.
 * Skips minimized windows and wraps around.
 *
 * @param {CommandContext} cx
 * @param {number} delta
 * @returns {Promise<void>}
 */
async function activateWindowRelative(cx, delta) {
  const windows = await getOpenWindows(cx.tab.incognito)

  const windowIndex = windows.findIndex(
    (windowInfo) => windowInfo.id === cx.tab.windowId
  )

  const windowInfo = windows[
    modulo(
      windowIndex + delta,
      windows.length
    )
  ]

  await chrome.windows.update(windowInfo.id, {
    focused: true
  })
}

/**
 * Activates the next open window.
 * Skips minimized windows and wraps around.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function activateNextWindow(cx) {
  await activateWindowRelative(cx, 1)
}

/**
 * Activates the previous open window.
 * Skips minimized windows and wraps around.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function activatePreviousWindow(cx) {
  await activateWindowRelative(cx, -1)
}

// Move tabs -------------------------------------------------------------------

/**
 * Grabs selected tabs.
 * Moves selected tabs to the current tab.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function grabTab(cx) {
  const tabs = await chrome.tabs.query({
    highlighted: true,
    windowId: cx.tab.windowId
  })

  const tabIndex = tabs.findIndex(
    (tab) => tab.id === cx.tab.id
  )

  const leftTabs = tabs.slice(0, tabIndex)
  const rightTabs = tabs.slice(tabIndex + 1)

  const movedTabs = await Promise.all(
    [].concat(
      leftTabs.map((tab) =>
        chrome.tabs.move(tab.id, {
          index: cx.tab.index - 1
        })
      ),

      rightTabs.toReversed().map((tab) =>
        chrome.tabs.move(tab.id, {
          index: cx.tab.index + 1
        })
      )
    )
  )

  if (hasGroup(cx.tab)) {
    await chrome.tabs.group({
      groupId: cx.tab.groupId,
      tabIds: movedTabs.flatMap((tab) =>
        tab.pinned
          ? []
          : [tab.id]
      )
    })
  }
}

/**
 * Moves selected tabs left/right.
 * Skips hidden tabs—the ones whose are in collapsed tab groups.
 *
 * @param {CommandContext} cx
 * @param {Direction} direction
 * @returns {Promise<void>}
 */
async function moveTabDirection(cx, direction) {
  /**
   * @type {number}
   */
  let focusIndex

  /**
   * @type {number}
   */
  let anchorIndex

  /**
   * @type {number}
   */
  let focusOffset

  /**
   * @type {number}
   */
  let anchorOffset

  /**
   * @param {number} groupId
   * @param {number} groupSize
   * @param {number} tabIndex
   * @returns {Promise<chrome.tabGroups.TabGroup>}
   */
  let moveTabGroup

  /**
   * @param {number[]} tabIds
   * @returns {Promise<void>}
   */
  let ungroupTabs

  switch (direction) {
    case Direction.Backward:
      focusIndex = 0
      anchorIndex = -1
      focusOffset = -1
      anchorOffset = 1

      moveTabGroup = (groupId, groupSize, tabIndex) =>
        chrome.tabGroups.move(groupId, {
          index: -1
        }).then(() =>
          chrome.tabGroups.move(groupId, {
            // Chrome does not take the tab group’s size
            // into account when moving tabs, but will happily throw
            // “Cannot move the group to an index that is
            // in the middle of another group”, hence the two passes.
            index: tabIndex - groupSize
          })
        )

      ungroupTabs = (tabIds) =>
        chrome.tabs.ungroup(tabIds)
      break

    case Direction.Forward:
      focusIndex = -1
      anchorIndex = 0
      focusOffset = 1
      anchorOffset = 0

      moveTabGroup = (groupId, groupSize, tabIndex) =>
        chrome.tabGroups.move(groupId, {
          index: tabIndex
        })

      ungroupTabs = (tabIds) =>
        chrome.tabs.ungroup(
          // Chrome ungroups tabs sequentially,
          // hence reversing tab IDs to preserve order.
          tabIds.toReversed()
        )
      break
  }

  const tabs = await chrome.tabs.query({
    windowId: cx.tab.windowId
  })

  const tabGroups = await chrome.tabGroups.query({
    windowId: cx.tab.windowId
  })

  const tabsByGroup = Map.groupBy(tabs, _groupId)

  const collapseInfo = getCollapseInfo(tabGroups)

  /**
   * @param {chrome.tabs.Tab[]} tabs
   * @returns {Promise<void>}
   */
  async function moveTabs(tabs) {
    const chunkedSelections = chunk(tabs, _highlighted)
      .flatMap(([isHighlighted, tabs]) =>
        isHighlighted
          ? [tabs]
          : []
      )

    // Get an array containing the edge slice, if any.
    // All elements in the returned slice are spliced out from `chunkedSelections`,
    // thus mutating it. This ensures selected tabs are always preceded/followed
    // by another tab when moving tabs.
    const chunkedSelections_atEdge = (
      tabs.length > 0 &&
      tabs.at(focusIndex).highlighted
    )
      ? chunkedSelections.splice(focusIndex, 1)
      : []

    const tabsByIndex = new Map(
      tabs.map((tab) => [tab.index, tab])
    )

    await Promise.all(
      [].concat(
        chunkedSelections_atEdge.map((tabs) => {
          const anchorTab = tabs.at(anchorIndex)
          const anchorGroup = tabsByGroup.get(anchorTab.groupId)
          const chunkedGroupSelections = chunk(tabs, _groupId)
          const anchorGroupSelection = chunkedGroupSelections.at(anchorIndex)[1]
          const anchorGroup_allHighlighted = anchorGroupSelection.length === anchorGroup.length

          if (
            hasGroup(anchorTab) &&
            !anchorGroup_allHighlighted
          ) {
            return ungroupTabs(
              anchorGroupSelection.map(_id)
            )
          }
        }),

        chunkedSelections.map((tabs) => {
          const focusTab = tabs.at(focusIndex)
          const anchorTab = tabs.at(anchorIndex)
          const targetTab = tabsByIndex.get(focusTab.index + focusOffset)
          const anchorGroup = tabsByGroup.get(anchorTab.groupId)
          const targetGroup = tabsByGroup.get(targetTab.groupId)
          const chunkedGroupSelections = chunk(tabs, _groupId)
          const anchorGroupSelection = chunkedGroupSelections.at(anchorIndex)[1]
          const groupCount = chunkedGroupSelections.length
          const anchorGroup_allHighlighted = anchorGroupSelection.length === anchorGroup.length

          if (
            groupCount === 1 &&
            hasGroup(anchorTab) &&
            !sameGroup(targetTab, focusTab) &&
            !anchorGroup_allHighlighted
          ) {
            return ungroupTabs(
              anchorGroupSelection.map(_id)
            )
          } else if (
            groupCount === 1 &&
            !hasGroup(anchorTab) &&
            hasGroup(targetTab) &&
            !collapseInfo.get(targetTab.groupId)
          ) {
            return chrome.tabs.group({
              groupId: targetTab.groupId,
              tabIds: anchorGroupSelection.map(_id)
            })
          } else if (
            hasGroup(anchorTab) &&
            hasGroup(targetTab) &&
            !sameGroup(targetTab, focusTab) &&
            anchorGroup_allHighlighted ||

            groupCount === 1 &&
            !hasGroup(anchorTab) &&
            hasGroup(targetTab) &&
            collapseInfo.get(targetTab.groupId) ||

            groupCount > 1 &&
            !hasGroup(anchorTab) &&
            hasGroup(targetTab) &&
            !sameGroup(targetTab, focusTab)
          ) {
            return moveTabGroup(
              targetTab.groupId,
              targetGroup.length,
              anchorTab.index + anchorOffset
            )
          } else if (
            groupCount > 1 &&
            hasGroup(anchorTab) &&
            !hasGroup(targetTab) &&
            !anchorGroup_allHighlighted ||

            groupCount > 1 &&
            hasGroup(anchorTab) &&
            hasGroup(targetTab) &&
            sameGroup(targetTab, focusTab) &&
            !anchorGroup_allHighlighted
          ) {
            return ungroupTabs(
              anchorGroupSelection.map(_id)
            ).then(() =>
              chrome.tabs.move(targetTab.id, {
                index: anchorTab.index
              })
            )
          } else if (
            groupCount > 1 &&
            hasGroup(anchorTab) &&
            hasGroup(targetTab) &&
            !sameGroup(targetTab, focusTab) &&
            !anchorGroup_allHighlighted
          ) {
            return ungroupTabs(
              anchorGroupSelection.map(_id)
            ).then(() =>
              moveTabGroup(
                targetTab.groupId,
                targetGroup.length,
                anchorTab.index + anchorOffset
              )
            )
          } else {
            return chrome.tabs.move(targetTab.id, {
              index: anchorTab.index
            })
          }
        })
      )
    )
  }

  const [pinnedTabs, otherTabs] = splitWhile(tabs, _pinned)

  await Promise.all([
    moveTabs(pinnedTabs),
    moveTabs(otherTabs)
  ])
}

/**
 * Moves selected tabs left.
 * Skips hidden tabs—the ones whose are in collapsed tab groups.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function moveTabLeft(cx) {
  await moveTabDirection(cx, Direction.Backward)
}

/**
 * Moves selected tabs right.
 * Skips hidden tabs—the ones whose are in collapsed tab groups.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function moveTabRight(cx) {
  await moveTabDirection(cx, Direction.Forward)
}

/**
 * Moves selected tabs to the far left/right.
 *
 * @param {CommandContext} cx
 * @param {Direction} direction
 * @returns {Promise<void>}
 */
async function moveTabEdgeDirection(cx, direction) {
  /**
   * @type {number}
   */
  let tabIndex

  switch (direction) {
    case Direction.Backward:
      tabIndex = 0
      break

    case Direction.Forward:
      tabIndex = -1
      break
  }

  const tabs = await chrome.tabs.query({
    highlighted: true,
    windowId: cx.tab.windowId
  })

  const tabsByGroup = Map.groupBy(tabs, _groupId)

  tabsByGroup.delete(TAB_GROUP_ID_NONE)

  // We cannot move pinned tabs and non pinned tabs together,
  // because it will cause the tabs to collapse to the
  // leftmost/rightmost pinned tab.
  await Promise.allSettled(
    splitWhile(tabs, _pinned).map((tabs) =>
      chrome.tabs.move(tabs.map(_id), {
        index: tabIndex
      })
    )
  )

  await Promise.all(
    Array.from(tabsByGroup, ([groupId, tabs]) =>
      chrome.tabs.group({
        groupId,
        tabIds: tabs.map(_id)
      })
    )
  )
}

/**
 * Moves selected tabs to the far left.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function moveTabFirst(cx) {
  await moveTabEdgeDirection(cx, Direction.Backward)
}

/**
 * Moves selected tabs to the far right.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function moveTabLast(cx) {
  await moveTabEdgeDirection(cx, Direction.Forward)
}

/**
 * Moves selected tabs to the specified window.
 *
 * @param {CommandContext} cx
 * @param {number} windowId
 * @returns {Promise<void>}
 */
async function moveTabsToWindow(cx, windowId) {
  const moveProperties = {
    windowId,
    index: -1
  }

  const tabs = await chrome.tabs.query({
    windowId: cx.tab.windowId
  })

  const selectedTabs = tabs.filter(_highlighted)

  const tabsByGroup = Map.groupBy(tabs, _groupId)

  const movedTabsByGroup = await Promise.all(
    chunk(selectedTabs, _groupId).map(([groupId, tabs]) => {
      if (
        groupId !== TAB_GROUP_ID_NONE &&
        tabs.length === tabsByGroup.get(groupId).length
      ) {
        return chrome.tabGroups.move(
          groupId,
          moveProperties
        ).then(() =>
          chrome.tabs.query({
            groupId
          })
        )
      } else {
        return chrome.tabs.move(
          tabs.map(_id),
          moveProperties
        )
      }
    })
  )

  await chrome.tabs.highlight({
    windowId,
    tabs: Array.from(
      getHighlightInfo(cx.tab.id, movedTabsByGroup.flat()).values()
    )
  })

  // Unfortunately, Chrome does not maintain the pinned state
  // when moving tabs between windows.
  await Promise.all(
    takeWhile(selectedTabs, _pinned).map((tab) =>
      chrome.tabs.update(tab.id, {
        pinned: true
      })
    )
  )

  await chrome.windows.update(windowId, {
    focused: true
  })
}

/**
 * Moves selected tabs to a new window.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function moveTabNewWindow(cx) {
  // Create a new window and keep a reference to the created tab
  // (the “New Tab” page) in order to delete it later.
  const createdWindow = await chrome.windows.create({
    focused: true,
    incognito: cx.tab.incognito
  })
  const createdTab = createdWindow.tabs[0]

  await moveTabsToWindow(cx, createdWindow.id)
  await chrome.tabs.remove(createdTab.id)
}

/**
 * Moves selected tabs to the previous open window, if any.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function moveTabPreviousWindow(cx) {
  const windows = await getOpenWindows(cx.tab.incognito)

  if (windows.length < 2) {
    return
  }

  const windowIndex = windows.findIndex(
    (windowInfo) => windowInfo.id === cx.tab.windowId
  )

  await moveTabsToWindow(cx, windows.at(windowIndex - 1).id)
}

// Select tabs -----------------------------------------------------------------

/**
 * Deselects all other tabs.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function selectActiveTab(cx) {
  await chrome.tabs.highlight({
    windowId: cx.tab.windowId,
    tabs: [
      cx.tab.index
    ]
  })
}

/**
 * Selects the next/previous tab.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
async function selectTabDirection(cx, direction) {
  /**
   * @type {number}
   */
  let focusOffset

  switch (direction) {
    case Direction.Backward:
      focusOffset = -1
      break

    case Direction.Forward:
      focusOffset = 1
      break
  }

  const tabs = await chrome.tabs.query({
    windowId: cx.tab.windowId
  })

  const tabCount = tabs.length

  // Causes selection to expand or shrink,
  // depending on the direction.
  const [anchorIndex, focusIndex] = tabs[cx.tab.index + 1]?.highlighted
    ? [0, -1]
    : [-1, 0]

  const newRange = chunk(tabs, _highlighted)
    .flatMap(([isHighlighted, tabs]) =>
      isHighlighted
        ? [tabs]
        : []
    )
    .flatMap((tabs) =>
      range(tabs.at(anchorIndex).index, clamp(tabs.at(focusIndex).index + focusOffset, 0, tabCount - 1))
    )

  await chrome.tabs.highlight({
    windowId: cx.tab.windowId,
    tabs: [
      cx.tab.index,
      ...newRange
    ]
  })
}

/**
 * Selects the previous tab.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function selectPreviousTab(cx) {
  await selectTabDirection(cx, Direction.Backward)
}

/**
 * Selects the next tab.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function selectNextTab(cx) {
  await selectTabDirection(cx, Direction.Forward)
}

/**
 * Selects related tabs.
 * Skips hidden tabs—the ones whose are in collapsed tab groups.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function selectRelatedTabs(cx) {
  const tabs = await getOpenTabs(cx.tab.windowId)

  const tabsByDomain = Map.groupBy(tabs, _hostname)

  const tabSelection = chunk(tabs.filter(_highlighted), _hostname)
    .flatMap(([hostname]) =>
      tabsByDomain.get(hostname)
    )

  await chrome.tabs.highlight({
    windowId: cx.tab.windowId,
    tabs: Array.from(
      getHighlightInfo(cx.tab.id, tabSelection).values()
    )
  })
}

/**
 * Selects tabs in group.
 *
 * NOTE: Selecting tabs in group can be used for ungrouped tabs.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function selectTabsInGroup(cx) {
  const tabs = await chrome.tabs.query({
    windowId: cx.tab.windowId
  })

  const tabsByGroup = Map.groupBy(tabs, _weakGroup)

  const tabSelection = chunk(tabs.filter(_highlighted), _weakGroup)
    .flatMap(([groupId]) =>
      tabsByGroup.get(groupId)
    )

  await chrome.tabs.highlight({
    windowId: cx.tab.windowId,
    tabs: Array.from(
      getHighlightInfo(cx.tab.id, tabSelection).values()
    )
  })
}

/**
 * Selects all tabs.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function selectAllTabs(cx) {
  const tabs = await chrome.tabs.query({
    windowId: cx.tab.windowId
  })

  await chrome.tabs.highlight({
    windowId: cx.tab.windowId,
    tabs: Array.from(
      getHighlightInfo(cx.tab.id, tabs).values()
    )
  })
}

/**
 * Selects tabs to the right.
 * Starts from the leftmost selected tab.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function selectRightTabs(cx) {
  const tabs = await chrome.tabs.query({
    windowId: cx.tab.windowId
  })

  const rightTabs = dropWhile(tabs, not(_highlighted))

  await chrome.tabs.highlight({
    windowId: cx.tab.windowId,
    tabs: Array.from(
      getHighlightInfo(cx.tab.id, rightTabs).values()
    )
  })
}

/**
 * Moves tab selection’s face backward/forward.
 *
 * @param {CommandContext} cx
 * @param {Direction} direction
 * @returns {Promise<void>}
 */
async function moveTabSelectionFaceDirection(cx, direction) {
  /**
   * @type {number}
   */
  let focusOffset

  switch (direction) {
    case Direction.Backward:
      focusOffset = -1
      break

    case Direction.Forward:
      focusOffset = 1
      break
  }

  const tabs = await chrome.tabs.query({
    windowId: cx.tab.windowId
  })

  let tabIndex = cx.tab.index

  while (tabs[tabIndex + focusOffset]?.highlighted) {
    tabIndex += focusOffset
  }

  await chrome.tabs.highlight({
    windowId: cx.tab.windowId,
    tabs: Array.from(
      getHighlightInfo(tabs[tabIndex].id, tabs.filter(_highlighted)).values()
    )
  })
}

/**
 * Moves tab selection’s face backward.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function moveTabSelectionFaceBackward(cx) {
  await moveTabSelectionFaceDirection(cx, Direction.Backward)
}

/**
 * Moves tab selection’s face forward.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function moveTabSelectionFaceForward(cx) {
  await moveTabSelectionFaceDirection(cx, Direction.Forward)
}

// Bookmarks -------------------------------------------------------------------

/**
 * Saves selected tabs as bookmarks.
 * Ensures not to bookmark a page twice.
 *
 * NOTE: If Chrome notifications are enabled,
 * Shortcuts will show you a message for created bookmarks.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function bookmarkTab(cx) {
  const tabs = await chrome.tabs.query({
    highlighted: true,
    windowId: cx.tab.windowId
  })

  const bookmarks = await chrome.bookmarks.search({})

  const tabsByURL = Map.groupBy(tabs, _url)

  const bookmarkInfo = new Set(
    bookmarks.map(_url)
  )

  const createdBookmarks = await Promise.all(
    Array.from(tabsByURL)
      .flatMap(([url, tabs]) =>
        bookmarkInfo.has(url)
          ? []
          : [tabs[0]]
      )
      .map((tab) =>
        chrome.bookmarks.create({
          title: tab.title,
          url: tab.url
        })
      )
  )

  await sendNotification(
    chrome.i18n.getMessage('bookmarkTabNotificationTitle'),
    chrome.i18n.getMessage('bookmarkTabNotificationMessage', createdBookmarks.length.toString())
  )
}

/**
 * Saves the current session as bookmarks.
 *
 * NOTE: If Chrome notifications are enabled,
 * Shortcuts will show you a message for created bookmarks.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function bookmarkSession(cx) {
  const tabs = await chrome.tabs.query({
    windowId: cx.tab.windowId
  })

  const tabGroups = await chrome.tabGroups.query({
    windowId: cx.tab.windowId
  })

  const dateString = getISODateString(new Date)

  const baseFolder = await chrome.bookmarks.create({
    title: chrome.i18n.getMessage('bookmarkSessionFolderTitle', dateString)
  })

  const createdFolders = await Promise.all(
    tabGroups.map((tabGroup) =>
      chrome.bookmarks.create({
        parentId: baseFolder.id,
        title: tabGroup.title
      })
    )
  )

  const groupToFolder = new Map

  groupToFolder.set(TAB_GROUP_ID_NONE, baseFolder.id)

  for (const index in tabGroups) {
    groupToFolder.set(
      tabGroups[index].id,
      createdFolders[index].id
    )
  }

  const createdBookmarks = await Promise.all(
    tabs.map((tab) =>
      chrome.bookmarks.create({
        parentId: groupToFolder.get(tab.groupId),
        title: tab.title,
        url: tab.url
      })
    )
  )

  await openChromePage(cx, `chrome://bookmarks/?id=${baseFolder.id}`)
  await sendNotification(
    chrome.i18n.getMessage('bookmarkSessionNotificationTitle'),
    chrome.i18n.getMessage('bookmarkSessionNotificationMessage', [createdBookmarks.length.toString(), baseFolder.title])
  )
}

// Reading list ----------------------------------------------------------------

/**
 * Adds selected tabs to your reading list.
 *
 * NOTE: If Chrome notifications are enabled,
 * Shortcuts will show you a message for pages added to your reading list.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function addTabToReadingList(cx) {
  const readingListURLPattern = new URLPattern({
    protocol: 'http{s}?'
  })

  const tabs = await chrome.tabs.query({
    highlighted: true,
    windowId: cx.tab.windowId
  })

  const items = await chrome.readingList.query({})

  const tabsByURL = Map.groupBy(tabs, _url)

  const readingListInfo = new Set(
    items.map(_url)
  )

  const createdItems = await Promise.all(
    Array.from(tabsByURL)
      .flatMap(([url, tabs]) =>
        !readingListURLPattern.test(url) ||
        readingListInfo.has(url)
          ? []
          : [tabs[0]]
      )
      .map((tab) =>
        chrome.readingList.addEntry({
          title: tab.title,
          url: tab.url,
          hasBeenRead: false
        })
      )
  )

  await sendNotification(
    chrome.i18n.getMessage('addTabToReadingListNotificationTitle'),
    chrome.i18n.getMessage('addTabToReadingListNotificationMessage', createdItems.length.toString())
  )
}

// Folders ---------------------------------------------------------------------

/**
 * Opens the “Downloads” folder.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openDownloadsFolder(cx) {
  await chrome.downloads.showDefaultFolder()
}

// Chrome URLs -----------------------------------------------------------------

/**
 * Opens a Chrome page at the URL specified.
 *
 * @param {CommandContext} cx
 * @param {string} navigateURL
 * @returns {Promise<void>}
 */
async function openChromePage(cx, navigateURL) {
  const baseURL = new URL('/', navigateURL)

  const tabs = await chrome.tabs.query({
    windowId: cx.tab.windowId,
    url: `${baseURL}*`
  })

  // If you click the three dots, then “Extensions > Manage Extensions”,
  // you will see Chrome attempts to focus an existing Chrome page or use
  // the “New Tab” page slot if possible. Otherwise, it creates a new tab.
  if (tabs.length > 0) {
    const tabInfo = tabs[0]

    if (tabInfo.url === navigateURL) {
      await chrome.tabs.update(tabInfo.id, {
        active: true
      })
    } else {
      await chrome.tabs.update(tabInfo.id, {
        active: true,
        url: navigateURL
      })
    }
  } else {
    if (cx.tab.url === 'chrome://newtab/') {
      await chrome.tabs.update(cx.tab.id, {
        active: true,
        url: navigateURL
      })
    } else {
      await chrome.tabs.create({
        active: true,
        url: navigateURL,
        openerTabId: cx.tab.id,
        windowId: cx.tab.windowId
      })
    }
  }
}

/**
 * Opens the browsing history.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openBrowsingHistory(cx) {
  await openChromePage(cx, 'chrome://history/')
}

/**
 * Opens the “Tabs from other devices” page.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openSyncedTabsPage(cx) {
  await openChromePage(cx, 'chrome://history/syncedTabs')
}

/**
 * Opens the “Delete browsing data” options.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openClearBrowserDataOptions(cx) {
  await openChromePage(cx, 'chrome://settings/clearBrowserData')
}

/**
 * Opens the download history.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openDownloadHistory(cx) {
  await openChromePage(cx, 'chrome://downloads/')
}

/**
 * Opens the bookmark manager.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openBookmarkManager(cx) {
  await openChromePage(cx, 'chrome://bookmarks/')
}

/**
 * Opens settings.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openSettings(cx) {
  await openChromePage(cx, 'chrome://settings/')
}

/**
 * Opens appearance settings.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openAppearanceSettings(cx) {
  await openChromePage(cx, 'chrome://settings/appearance')
}

/**
 * Opens the password manager.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openPasswordManager(cx) {
  await openChromePage(cx, 'chrome://password-manager/passwords')
}

/**
 * Opens payment method settings.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openPaymentMethodSettings(cx) {
  await openChromePage(cx, 'chrome://settings/payments')
}

/**
 * Opens address settings.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openAddressSettings(cx) {
  await openChromePage(cx, 'chrome://settings/addresses')
}

/**
 * Opens search engine settings.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openSearchEngineSettings(cx) {
  await openChromePage(cx, 'chrome://settings/searchEngines')
}

/**
 * Opens the “Apps” page.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openAppsPage(cx) {
  await openChromePage(cx, 'chrome://apps/')
}

/**
 * Opens the “Extensions” page.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openExtensionsPage(cx) {
  await openChromePage(cx, 'chrome://extensions/')
}

/**
 * Opens the “Extension shortcuts” page.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openExtensionShortcutsPage(cx) {
  await openChromePage(cx, 'chrome://extensions/shortcuts')
}

/**
 * Opens experimental settings.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openExperimentalSettings(cx) {
  await openChromePage(cx, 'chrome://flags/')
}

/**
 * Opens the “About Chrome” page.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openAboutChromePage(cx) {
  await openChromePage(cx, 'chrome://settings/help')
}

/**
 * Opens the “About Chrome version” page.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openAboutChromeVersionPage(cx) {
  await openChromePage(cx, 'chrome://version/')
}

/**
 * Opens the “What’s new in Chrome” page.
 *
 * @param {CommandContext} cx
 * @returns {Promise<void>}
 */
export async function openWhatsNewPage(cx) {
  await openChromePage(cx, 'chrome://whats-new/')
}

/**
 * Determines whose tabs are hidden.
 * A tab in a collapsed group is considered hidden.
 *
 * @param {chrome.tabGroups.TabGroup[]} tabGroups
 * @returns {Map<number, boolean>}
 */
function getCollapseInfo(tabGroups) {
  const collapseInfo = new Map

  collapseInfo.set(TAB_GROUP_ID_NONE, false)

  for (const tabGroup of tabGroups) {
    collapseInfo.set(tabGroup.id, tabGroup.collapsed)
  }

  return collapseInfo
}

/**
 * Returns highlight info.
 * Ensures index of specified tab to be the first of group.
 *
 * @param {number} tabId
 * @param {chrome.tabs.Tab[]} tabs
 * @returns {Map<number, number>}
 */
function getHighlightInfo(tabId, tabs) {
  const highlightInfo = new Map

  highlightInfo.set(tabId, null)

  for (const tab of tabs) {
    highlightInfo.set(tab.id, tab.index)
  }

  return highlightInfo
}

/**
 * Returns open tabs in the tab strip.
 * Skips hidden tabs—the ones whose are in collapsed tab groups.
 *
 * @param {number} windowId
 * @returns {Promise<chrome.tabs.Tab[]>}
 */
async function getOpenTabs(windowId) {
  const tabs = await chrome.tabs.query({
    windowId
  })

  const tabGroups = await chrome.tabGroups.query({
    windowId
  })

  const collapseInfo = getCollapseInfo(tabGroups)

  return tabs.filter((tab) =>
    collapseInfo.get(tab.groupId) === false
  )
}

/**
 * Returns open windows.
 * Skips minimized windows.
 *
 * @param {boolean} incognito
 * @returns {Promise<chrome.windows.Window[]>}
 */
async function getOpenWindows(incognito) {
  const windows = await chrome.windows.getAll()

  return windows.filter((windowInfo) =>
    windowInfo.incognito === incognito &&
    windowInfo.state !== 'minimized'
  )
}

/**
 * Creates and displays a notification.
 * Returns the created notification’s ID.
 *
 * @param {string} title
 * @param {string} message
 * @returns {Promise<string>}
 */
async function sendNotification(title, message) {
  return chrome.notifications.create({
    type: 'basic',
    iconUrl: '/assets/shortcuts-logo@128px.png',
    title,
    message
  })
}
