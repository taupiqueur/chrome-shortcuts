# Manual

> [!IMPORTANT]
> Requires either Chrome 127+, [Chrome Dev] or [Chrome Canary] for sticky popup—to keep the popup open after entering a command.
> See https://issues.chromium.org/issues/40057101 and [Chrome 127: New `action.openPopup` API] for more information.

[Chrome Dev]: https://google.com/chrome/dev/
[Chrome Canary]: https://google.com/chrome/canary/
[Chrome 127: New `action.openPopup` API]: https://developer.chrome.com/docs/extensions/whats-new#chrome_127_new_actionopenpopup_api

## Usage

`Alt+Space` (`Ctrl+Space` on Windows) is the main keyboard shortcut.
Use it to open the extension’s popup—aka “Vim” mode.
Press `Slash` to search commands and `Escape` to cancel.

If you need explanations of the shortcuts—Right-click the Shortcuts toolbar button and select “Documentation”.

The keyboard shortcuts are fully customizable.

### Command palette

The command palette is the main way to search functionality in Shortcuts.

1. To open the command palette—Press either `Slash`, `Control+KeyF` or click the search field in the extension’s popup.
2. In the search field, type what you’re looking for—results appear as you type.
3. Choose a suggestion and press `Enter` to activate the selection.

### Configure keyboard shortcuts

Navigate to `chrome://extensions/shortcuts` to configure global keyboard shortcuts.

You can for example bind `Ctrl+Y` to open a new tab to the right, `Ctrl+B` to duplicate the current tab,
or change the default shortcut—to open the popup—to `Alt+J`.

You can also configure the popup keys by importing and exporting settings
in the “Options” page—Right-click the Shortcuts toolbar button and select “Options”.

<details>

<summary>Example configuration</summary>

``` json
{
  "popupConfig": {
    "commandBindings": {
      "openShortcutsManual": [
        {
          "code": "F1"
        }
      ],
      "openShortcutsOptionsPage": [
        {
          "code": "F2"
        }
      ],
      "openCommandPalette": [
        {
          "code": "Slash"
        },
        {
          "ctrlKey": true,
          "code": "KeyF"
        }
      ],
      "closePopup": [
        {
          "code": "Escape"
        },
        {
          "ctrlKey": true,
          "code": "KeyC"
        },
        {
          "code": "KeyQ"
        }
      ],
      "goBack": [
        {
          "altKey": true,
          "code": "KeyH"
        }
      ],
      "goForward": [
        {
          "altKey": true,
          "code": "KeyL"
        }
      ],
      "reloadTab": [
        {
          "code": "KeyR"
        }
      ],
      "reloadTabWithoutCache": [
        {
          "shiftKey": true,
          "code": "KeyR"
        }
      ],
      "goToNextPage": [
        {
          "shiftKey": true,
          "code": "Period"
        }
      ],
      "goToPreviousPage": [
        {
          "shiftKey": true,
          "code": "Comma"
        }
      ],
      "removeURLParams": [
        {
          "shiftKey": true,
          "code": "KeyU"
        }
      ],
      "goUp": [
        {
          "altKey": true,
          "code": "KeyU"
        }
      ],
      "goToRoot": [
        {
          "altKey": true,
          "shiftKey": true,
          "code": "KeyU"
        }
      ],
      "focusTextInput": [
        {
          "code": "KeyI"
        }
      ],
      "focusMediaPlayer": [
        {
          "code": "KeyV"
        }
      ],
      "blurElement": [
        {
          "shiftKey": true,
          "code": "Escape"
        }
      ],
      "copyURL": [
        {
          "code": "KeyY"
        }
      ],
      "copyTitle": [
        {
          "altKey": true,
          "code": "KeyY"
        }
      ],
      "copyTitleAndURL": [
        {
          "shiftKey": true,
          "code": "KeyY"
        }
      ],
      "savePage": [
        {
          "ctrlKey": true,
          "code": "KeyS"
        }
      ],
      "savePageAsMHTML": [
        {
          "ctrlKey": true,
          "shiftKey": true,
          "code": "KeyS"
        }
      ],
      "openWebSearchForSelectedText": [
        {
          "altKey": true,
          "code": "KeyW"
        }
      ],
      "scrollDown": [
        {
          "code": "KeyJ"
        }
      ],
      "scrollUp": [
        {
          "code": "KeyK"
        }
      ],
      "scrollLeft": [
        {
          "code": "KeyH"
        }
      ],
      "scrollRight": [
        {
          "code": "KeyL"
        }
      ],
      "scrollPageDown": [
        {
          "code": "Space"
        }
      ],
      "scrollPageUp": [
        {
          "shiftKey": true,
          "code": "Space"
        }
      ],
      "scrollHalfPageDown": [
        {
          "shiftKey": true,
          "code": "KeyJ"
        }
      ],
      "scrollHalfPageUp": [
        {
          "shiftKey": true,
          "code": "KeyK"
        }
      ],
      "scrollToTop": [
        {
          "code": "KeyG"
        }
      ],
      "scrollToBottom": [
        {
          "code": "KeyE"
        }
      ],
      "zoomIn": [
        {
          "code": "Equal"
        }
      ],
      "zoomOut": [
        {
          "code": "Minus"
        }
      ],
      "zoomReset": [
        {
          "code": "Digit0"
        }
      ],
      "toggleFullScreen": [
        {
          "code": "KeyF"
        }
      ],
      "openNewTab": [
        {
          "code": "KeyT"
        }
      ],
      "openNewTabRight": [
        {
          "code": "KeyO"
        }
      ],
      "openNewWindow": [
        {
          "code": "KeyN"
        }
      ],
      "openNewIncognitoWindow": [
        {
          "shiftKey": true,
          "code": "KeyN"
        }
      ],
      "closeTab": [
        {
          "code": "KeyX"
        }
      ],
      "closeOtherTabs": [
        {
          "altKey": true,
          "code": "KeyX"
        }
      ],
      "closeRightTabs": [
        {
          "altKey": true,
          "shiftKey": true,
          "code": "KeyX"
        }
      ],
      "closeWindow": [
        {
          "shiftKey": true,
          "code": "KeyX"
        }
      ],
      "restoreTab": [
        {
          "code": "KeyU"
        }
      ],
      "duplicateTab": [
        {
          "code": "KeyB"
        }
      ],
      "togglePinTab": [
        {
          "code": "KeyP"
        }
      ],
      "toggleGroupTab": [
        {
          "shiftKey": true,
          "code": "KeyP"
        }
      ],
      "toggleCollapseTabGroups": [
        {
          "code": "KeyC"
        }
      ],
      "toggleMuteTab": [
        {
          "code": "KeyM"
        }
      ],
      "discardTab": [
        {
          "code": "KeyD"
        }
      ],
      "sortTabsByURL": [
        {
          "shiftKey": true,
          "code": "Digit1"
        }
      ],
      "groupTabsByDomain": [
        {
          "shiftKey": true,
          "code": "Digit2"
        }
      ],
      "renameTabGroup": [
        {
          "altKey": true,
          "code": "KeyR"
        }
      ],
      "cycleTabGroupColorForward": [
        {
          "altKey": true,
          "code": "KeyA"
        }
      ],
      "cycleTabGroupColorBackward": [
        {
          "altKey": true,
          "shiftKey": true,
          "code": "KeyA"
        }
      ],
      "activateAudibleTab": [
        {
          "shiftKey": true,
          "code": "Digit3"
        }
      ],
      "activateNextTab": [
        {
          "code": "Tab"
        },
        {
          "altKey": true,
          "code": "KeyK"
        }
      ],
      "activatePreviousTab": [
        {
          "shiftKey": true,
          "code": "Tab"
        },
        {
          "altKey": true,
          "code": "KeyJ"
        }
      ],
      "activateFirstTab": [
        {
          "code": "Digit1"
        }
      ],
      "activateSecondTab": [
        {
          "code": "Digit2"
        }
      ],
      "activateThirdTab": [
        {
          "code": "Digit3"
        }
      ],
      "activateFourthTab": [
        {
          "code": "Digit4"
        }
      ],
      "activateFifthTab": [
        {
          "code": "Digit5"
        }
      ],
      "activateSixthTab": [
        {
          "code": "Digit6"
        }
      ],
      "activateSeventhTab": [
        {
          "code": "Digit7"
        }
      ],
      "activateEighthTab": [
        {
          "code": "Digit8"
        }
      ],
      "activateLastTab": [
        {
          "code": "Digit9"
        }
      ],
      "activateLastActiveTab": [
        {
          "altKey": true,
          "code": "Digit1"
        }
      ],
      "activateSecondLastActiveTab": [
        {
          "altKey": true,
          "code": "Digit2"
        }
      ],
      "activateThirdLastActiveTab": [
        {
          "altKey": true,
          "code": "Digit3"
        }
      ],
      "activateFourthLastActiveTab": [
        {
          "altKey": true,
          "code": "Digit4"
        }
      ],
      "activateFifthLastActiveTab": [
        {
          "altKey": true,
          "code": "Digit5"
        }
      ],
      "activateSixthLastActiveTab": [
        {
          "altKey": true,
          "code": "Digit6"
        }
      ],
      "activateSeventhLastActiveTab": [
        {
          "altKey": true,
          "code": "Digit7"
        }
      ],
      "activateEighthLastActiveTab": [
        {
          "altKey": true,
          "code": "Digit8"
        }
      ],
      "activateNinthLastActiveTab": [
        {
          "altKey": true,
          "code": "Digit9"
        }
      ],
      "activateNextWindow": [
        {
          "code": "KeyW"
        }
      ],
      "activatePreviousWindow": [
        {
          "shiftKey": true,
          "code": "KeyW"
        }
      ],
      "grabTab": [
        {
          "altKey": true,
          "code": "KeyG"
        }
      ],
      "moveTabLeft": [
        {
          "code": "ArrowLeft"
        }
      ],
      "moveTabRight": [
        {
          "code": "ArrowRight"
        }
      ],
      "moveTabFirst": [
        {
          "code": "Home"
        }
      ],
      "moveTabLast": [
        {
          "code": "End"
        }
      ],
      "moveTabNewWindow": [
        {
          "code": "ArrowUp"
        }
      ],
      "moveTabPreviousWindow": [
        {
          "code": "ArrowDown"
        }
      ],
      "selectActiveTab": [
        {
          "code": "KeyS"
        }
      ],
      "selectPreviousTab": [
        {
          "code": "BracketLeft"
        }
      ],
      "selectNextTab": [
        {
          "code": "BracketRight"
        }
      ],
      "selectRelatedTabs": [
        {
          "code": "Backquote"
        }
      ],
      "selectTabsInGroup": [
        {
          "code": "KeyA"
        }
      ],
      "selectAllTabs": [
        {
          "shiftKey": true,
          "code": "KeyA"
        }
      ],
      "selectRightTabs": [
        {
          "shiftKey": true,
          "code": "KeyS"
        }
      ],
      "moveTabSelectionFaceBackward": [
        {
          "shiftKey": true,
          "code": "BracketLeft"
        }
      ],
      "moveTabSelectionFaceForward": [
        {
          "shiftKey": true,
          "code": "BracketRight"
        }
      ],
      "bookmarkTab": [
        {
          "shiftKey": true,
          "code": "KeyD"
        }
      ],
      "bookmarkSession": [
        {
          "shiftKey": true,
          "code": "KeyB"
        }
      ],
      "addTabToReadingList": [
        {
          "altKey": true,
          "code": "KeyD"
        }
      ],
      "openDownloadsFolder": [
        {
          "ctrlKey": true,
          "code": "KeyK"
        }
      ],
      "openHistoryPage": [
        {
          "ctrlKey": true,
          "code": "KeyH"
        }
      ],
      "openSyncedTabsPage": [
        {
          "ctrlKey": true,
          "code": "KeyT"
        }
      ],
      "openClearBrowserDataPage": [
        {
          "ctrlKey": true,
          "code": "Delete"
        }
      ],
      "openDownloadsPage": [
        {
          "ctrlKey": true,
          "code": "KeyJ"
        }
      ],
      "openBookmarksPage": [
        {
          "ctrlKey": true,
          "code": "KeyO"
        }
      ],
      "openSettingsPage": [
        {
          "code": "Comma"
        }
      ],
      "openPasswordsPage": [
        {
          "ctrlKey": true,
          "code": "KeyY"
        }
      ],
      "openPaymentsPage": [
      ],
      "openAddressesPage": [
      ],
      "openSearchEnginesPage": [
        {
          "ctrlKey": true,
          "code": "Slash"
        }
      ],
      "openExtensionsPage": [
        {
          "ctrlKey": true,
          "code": "KeyA"
        }
      ],
      "openExtensionShortcutsPage": [
        {
          "shiftKey": true,
          "code": "Equal"
        }
      ],
      "openExperimentsPage": [
        {
          "ctrlKey": true,
          "code": "Comma"
        }
      ],
      "openAboutChromePage": [
      ],
      "openAboutChromeVersionPage": [
      ],
      "openWhatsNewPage": [
      ]
    },
    "paletteBindings": {
      "selectNextItem": [
        {
          "code": "ArrowDown"
        },
        {
          "ctrlKey": true,
          "code": "KeyN"
        },
        {
          "code": "Tab"
        }
      ],
      "selectPreviousItem": [
        {
          "code": "ArrowUp"
        },
        {
          "ctrlKey": true,
          "code": "KeyP"
        },
        {
          "shiftKey": true,
          "code": "Tab"
        }
      ],
      "activateSelectedItem": [
        {
          "code": "Enter"
        }
      ],
      "movePageDown": [
        {
          "code": "PageDown"
        },
        {
          "ctrlKey": true,
          "code": "KeyD"
        }
      ],
      "movePageUp": [
        {
          "code": "PageUp"
        },
        {
          "ctrlKey": true,
          "code": "KeyU"
        }
      ],
      "closeCommandPalette": [
        {
          "code": "Escape"
        },
        {
          "ctrlKey": true,
          "code": "KeyC"
        }
      ]
    }
  }
}
```

</details>

### In practice?

`Alt+J` / `Alt+K` are the main keyboard shortcuts I use for navigating to open Shortcuts and click using [Link Hints].

[Link Hints]: https://lydell.github.io/LinkHints/

Finally, to complement the built-in keyboard shortcuts,
I’ve configured `Ctrl+Y` to open a new tab to the right, `Ctrl+B` to duplicate the current tab, `Alt+W` to web search selected text, `Alt+Y` to copy URLs, and `Alt+I` to focus text fields.

## Commands

Commands are actions that can be performed with keyboard shortcuts or mouse clicks in the extension’s popup.

### About keyboard shortcuts

- `⌃` is the `Control` key.
- `⌥` is the `Alt` or `Option` key on macOS.
- `⇧` is the `Shift` key.
- `⌘` is the `Windows` or `Command` key on macOS.

Keyboard shortcuts in the extension’s popup are defined with physical keys.
These keys are shown below.
Blue keys are present on all standard keyboards while green keys are only available on some keyboards.

![The writing system keys](https://w3c.github.io/uievents-code/images/keyboard-codes-alphanum1.svg)

See [Keyboard Event `code` Value Tables] for a complete reference.
You will find the list of code values and informative symbols.

[Keyboard Event `code` Value Tables]: https://w3c.github.io/uievents-code/#code-value-tables

> [!TIP]
> You can hover over the menu commands to show the keys to press
> (e.g., hovering over `KeyJ` will show `j` on a US keyboard).

### Shortcuts

These commands are only available in the extension’s popup.

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`openShortcutsManual` | Open Shortcuts manual | | | `F1`
`openShortcutsOptionsPage` | Open Shortcuts “Options” page | | | `F2`
`openCommandPalette` | Open the command palette | | | `Slash`, `Control+KeyF`
`closePopup` | Close the popup window | | | `Escape`, `Control+KeyC`, `KeyQ`

### Command palette

These commands are only available in the command palette.

Command | Description | Windows and Linux key | macOS key | Palette key
--- | --- | --- | --- | ---
`selectNextItem` | Select the next item | | | `ArrowDown`, `Control+KeyN`, `Tab`
`selectPreviousItem` | Select the previous item | | | `ArrowUp`, `Control+KeyP`, `Shift+Tab`
`activateSelectedItem` | Activate selected item | | | `Enter`
`movePageDown` | Move page down | | | `PageDown`, `Control+KeyD`
`movePageUp` | Move page up | | | `PageUp`, `Control+KeyU`
`closeCommandPalette` | Close the command palette | | | `Escape`, `Control+KeyC`

### Navigation

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`goBack` | Go back to the previous page in tab’s history | `Alt+ArrowLeft` | `Command+BracketLeft`, `Command+ArrowLeft` | `Alt+KeyH`
`goForward` | Go forward to the next page in tab’s history | `Alt+ArrowRight` | `Command+BracketRight`, `Command+ArrowRight` | `Alt+KeyL`
`reloadTab` | Reload selected tabs | `F5`, `Control+R` | `Command+R` | `KeyR`
`reloadTabWithoutCache` | Reload selected tabs, ignoring cached content | `Shift+F5`, `Control+Shift+R` | `Shift+Command+R` | `Shift+KeyR`
`goToNextPage` | Go to the next page in the series | | | `Shift+Period`
`goToPreviousPage` | Go to the previous page in the series | | | `Shift+Comma`
`removeURLParams` | Remove any URL parameters | | | `Shift+KeyU`
`goUp` | Go up in the URL hierarchy | | | `Alt+KeyU`
`goToRoot` | Go to the root URL | | | `Alt+Shift+KeyU`

### Accessibility

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`focusTextInput` | Cycle through text fields | | | `KeyI`
`focusMediaPlayer` | Cycle through media players | | | `KeyV`
`blurElement` | Blur the active element | | | `Shift+Escape`

### Clipboard

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`copyURL` | Copy URL of selected tabs | | | `KeyY`
`copyTitle` | Copy title of selected tabs | | | `Alt+KeyY`
`copyTitleAndURL` | Copy title and URL of selected tabs | | | `Shift+KeyY`

> [!NOTE]
> If Chrome notifications are enabled,
> Shortcuts will show you a message for copied text.

### Save pages

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`savePage` | Save the content of selected tabs | `Control+S` | `Command+S` | `Control+KeyS`
`savePageAsMHTML` | Save the content of selected tabs as MHTML | | | `Control+Shift+KeyS`

### Web search

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`openWebSearchForSelectedText` | Perform a web search for selected text | | | `Alt+KeyW`

### Scroll

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`scrollDown` | Scroll down | `ArrowDown` | `ArrowDown` | `KeyJ`
`scrollUp` | Scroll up | `ArrowUp` | `ArrowUp` | `KeyK`
`scrollLeft` | Scroll left | `ArrowLeft` | `ArrowLeft` | `KeyH`
`scrollRight` | Scroll right | `ArrowRight` | `ArrowRight` | `KeyL`
`scrollPageDown` | Scroll one page down | `Space`, `PageDown` | `Space`, `PageDown` | `Space`
`scrollPageUp` | Scroll one page up | `Shift+Space`, `PageUp` | `Shift+Space`, `PageUp` | `Shift+Space`
`scrollHalfPageDown` | Scroll half page down | | | `Shift+KeyJ`
`scrollHalfPageUp` | Scroll half page up | | | `Shift+KeyK`
`scrollToTop` | Scroll to the top of the page | `Home`, `Control+ArrowUp` | `Home`, `Command+ArrowUp` | `KeyG`
`scrollToBottom` | Scroll to the bottom of the page | `End`, `Control+ArrowDown` | `End`, `Command+ArrowDown` | `KeyE`

### Zoom

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`zoomIn` | Zoom in | `Control+Equal` | `Command+Equal` | `Equal`
`zoomOut` | Zoom out | `Control+Minus` | `Command+Minus` | `Minus`
`zoomReset` | Reset the zoom factor | `Control+0` | `Command+0` | `Digit0`
`toggleFullScreen` | Turn full-screen mode on or off | `F11` | `Globe+F`, `Control+Command+F` | `KeyF`

### Create tabs

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`openNewTab` | Open and activate a new tab | `Control+T` | `Command+T` | `KeyT`
`openNewTabRight` | Open and activate a new tab to the right | | | `KeyO`
`openNewWindow` | Open a new window | `Control+N` | `Command+N` | `KeyN`
`openNewIncognitoWindow` | Open a new window in Incognito mode | `Control+Shift+N` | `Shift+Command+N` | `Shift+KeyN`

### Close tabs

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`closeTab` | Close selected tabs | `Control+W`, `Control+F4` | `Command+W` | `KeyX`
`closeOtherTabs` | Close other tabs | | | `Alt+KeyX`
`closeRightTabs` | Close tabs to the right | | | `Alt+Shift+KeyX`
`closeWindow` | Close the window that contains the tab | `Control+Shift+W`, `Alt+F4` | `Shift+Command+W` | `Shift+KeyX`
`restoreTab` | Reopen previously closed tabs | `Control+Shift+T` | `Shift+Command+T` | `KeyU`

### Tab state

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`duplicateTab` | Duplicate selected tabs | | | `KeyB`
`togglePinTab` | Pin or unpin selected tabs | | | `KeyP`
`toggleGroupTab` | Group or ungroup selected tabs | | | `Shift+KeyP`
`toggleCollapseTabGroups` | Collapse or uncollapse tab groups | | | `KeyC`
`toggleMuteTab` | Mute or unmute selected tabs | | | `KeyM`
`discardTab` | Discard selected tabs | | | `KeyD`

### Organize tabs

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`sortTabsByURL` | Sort selected tabs by URL | | | `Shift+Digit1`
`groupTabsByDomain` | Group selected tabs by domain | | | `Shift+Digit2`

### Manage tab groups

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`renameTabGroup` | Rename tab group | | | `Alt+KeyR`
`cycleTabGroupColorForward` | Cycle forward through tab group colors | | | `Alt+KeyA`
`cycleTabGroupColorBackward` | Cycle backward through tab group colors | | | `Alt+Shift+KeyA`

### Switch tabs

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`activateAudibleTab` | Activate the first audible tab | | | `Shift+Digit3`
`activateNextTab` | Activate the next open tab | `Control+Tab`, `Control+PageDown` | `Control+Tab`, `Option+Command+ArrowRight` | `Tab`, `Alt+KeyK`
`activatePreviousTab` | Activate the previous open tab | `Control+Shift+Tab`, `Control+PageUp` | `Control+Shift+Tab`, `Option+Command+ArrowLeft` | `Shift+Tab`, `Alt+KeyJ`
`activateFirstTab` | Activate the leftmost open tab | `Control+1` | `Command+1` | `Digit1`
`activateSecondTab` | Activate the second leftmost open tab | `Control+2` | `Command+2` | `Digit2`
`activateThirdTab` | Activate the third leftmost open tab | `Control+3` | `Command+3` | `Digit3`
`activateFourthTab` | Activate the fourth leftmost open tab | `Control+4` | `Command+4` | `Digit4`
`activateFifthTab` | Activate the fifth leftmost open tab | `Control+5` | `Command+5` | `Digit5`
`activateSixthTab` | Activate the sixth leftmost open tab | `Control+6` | `Command+6` | `Digit6`
`activateSeventhTab` | Activate the seventh leftmost open tab | `Control+7` | `Command+7` | `Digit7`
`activateEighthTab` | Activate the eighth leftmost open tab | `Control+8` | `Command+8` | `Digit8`
`activateLastTab` | Activate the rightmost open tab | `Control+9` | `Command+9` | `Digit9`
`activateLastActiveTab` | Activate the last active tab | | | `Alt+Digit1`
`activateSecondLastActiveTab` | Activate the second last active tab | | | `Alt+Digit2`
`activateThirdLastActiveTab` | Activate the third last active tab | | | `Alt+Digit3`
`activateFourthLastActiveTab` | Activate the fourth last active tab | | | `Alt+Digit4`
`activateFifthLastActiveTab` | Activate the fifth last active tab | | | `Alt+Digit5`
`activateSixthLastActiveTab` | Activate the sixth last active tab | | | `Alt+Digit6`
`activateSeventhLastActiveTab` | Activate the seventh last active tab | | | `Alt+Digit7`
`activateEighthLastActiveTab` | Activate the eighth last active tab | | | `Alt+Digit8`
`activateNinthLastActiveTab` | Activate the ninth last active tab | | | `Alt+Digit9`
`activateNextWindow` | Activate the next open window | | | `KeyW`
`activatePreviousWindow` | Activate the previous open window | | | `Shift+KeyW`

### Move tabs

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`grabTab` | Grab selected tabs | | | `Alt+KeyG`
`moveTabLeft` | Move selected tabs left | `Control+Shift+PageUp` | `Control+Shift+PageUp` | `ArrowLeft`
`moveTabRight` | Move selected tabs right | `Control+Shift+PageDown` | `Control+Shift+PageDown` | `ArrowRight`
`moveTabFirst` | Move selected tabs to the far left | | | `Home`
`moveTabLast` | Move selected tabs to the far right | | | `End`
`moveTabNewWindow` | Move selected tabs to a new window | | | `ArrowUp`
`moveTabPreviousWindow` | Move selected tabs to the previous open window | | | `ArrowDown`

### Select tabs

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`selectActiveTab` | Deselect all other tabs | | | `KeyS`
`selectPreviousTab` | Select the previous tab | | | `BracketLeft`
`selectNextTab` | Select the next tab | | | `BracketRight`
`selectRelatedTabs` | Select related tabs | | | `Backquote`
`selectTabsInGroup` | Select tabs in group | | | `KeyA`
`selectAllTabs` | Select all tabs | | | `Shift+KeyA`
`selectRightTabs` | Select tabs to the right | | | `Shift+KeyS`
`moveTabSelectionFaceBackward` | Move tab selection’s face backward | | | `Shift+BracketLeft`
`moveTabSelectionFaceForward` | Move tab selection’s face forward | | | `Shift+BracketRight`

> [!TIP]
> Selecting tabs in group can be used for ungrouped tabs.

### Bookmarks

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`bookmarkTab` | Save selected tabs as bookmarks | `Control+D` | `Command+D` | `Shift+KeyD`
`bookmarkSession` | Save the current session as bookmarks | `Control+Shift+D` | `Shift+Command+D` | `Shift+KeyB`

> [!NOTE]
> If Chrome notifications are enabled,
> Shortcuts will show you a message for created bookmarks.

### Reading list

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`addTabToReadingList` | Add selected tabs to your reading list | | | `Alt+KeyD`

> [!NOTE]
> If Chrome notifications are enabled,
> Shortcuts will show you a message for pages added to your reading list.

### Folders

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`openDownloadsFolder` | Open the “Downloads” folder | | | `Control+KeyK`

### Chrome URLs

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`openHistoryPage` | Open the “History” page | `Control+H` | `Command+Y` | `Control+KeyH`
`openSyncedTabsPage` | Open the “Tabs from other devices” page | | | `Control+KeyT`
`openClearBrowserDataPage` | Open the “Delete browsing data” page | `Control+Shift+Delete` | `Command+Shift+Delete` | `Control+Delete`
`openDownloadsPage` | Open the “Downloads” page | `Control+J` | `Option+Command+L` | `Control+KeyJ`
`openBookmarksPage` | Open the “Bookmarks” page | `Control+Shift+O` | `Option+Command+B` | `Control+KeyO`
`openSettingsPage` | Open the “Settings” page | | `Command+Comma` | `Comma`
`openPasswordsPage` | Open the “Password manager > Passwords” page | | | `Control+KeyY`
`openPaymentsPage` | Open the “Payment methods” page | | |
`openAddressesPage` | Open the “Addresses and more” page | | |
`openSearchEnginesPage` | Open the “Search engines” page | | | `Control+Slash`
`openExtensionsPage` | Open the “Extensions” page | | | `Control+KeyA`
`openExtensionShortcutsPage` | Open the “Extensions > Keyboard shortcuts” page | | | `Shift+Equal`
`openExperimentsPage` | Open the “Experiments” page | | | `Control+Comma`
`openAboutChromePage` | Open the “About Chrome” page | | |
`openAboutChromeVersionPage` | Open the “About Chrome version” page | | |
`openWhatsNewPage` | Open the “What’s new in Chrome” page | | |

For more keyboard shortcuts, see the [Google Chrome documentation][Chrome keyboard shortcuts].

[Chrome keyboard shortcuts]: https://support.google.com/chrome/answer/157179

## Tips and tricks

- **To close right tabs**—Select tabs to the right with `Tab`, `Shift+KeyS`, then close selection with `KeyX`.
- **To close other tabs**—Move the tab you want to keep to the far left with the `Home` key, then close tabs to the right.
- **To move tab groups**—Select all tabs in group with `KeyA`, then use a move action, such as `ArrowLeft` / `ArrowRight` for horizontal movements.
- **To merge windows**—Select all tabs with `Shift+KeyA`, then press the `Down` key to move selected tabs to the previous window.

For more tips, see the [Google Chrome documentation][Chrome tips].

[Chrome tips]: https://google.com/chrome/tips/
