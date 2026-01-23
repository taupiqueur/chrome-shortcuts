# Manual

## Usage

`Alt+Space` (`Control+Space` on Windows) is the main keyboard shortcut.
Use it to open the extension’s popup—aka “Vim” mode.
Press `Slash` to search commands and `Escape` to cancel.

If you need explanations of the shortcuts—Right-click the Shortcuts toolbar button and select “Documentation”.

The keyboard shortcuts are fully customizable.

### Command palette

The command palette is the main way to search functionality in Shortcuts.

1. To open the command palette—Press either `Slash`, `Control+KeyF` or click the search field in the extension’s popup.
2. In the search field, type what you’re looking for—results appear as you type.
3. Choose a suggestion and press `Enter` to activate the selection.

### Search keyboard shortcuts

The command palette includes both the shortcuts you configure in Shortcuts
and the keyboard shortcuts defined in Chrome’s “Extension shortcuts” interface.
These shortcuts are synced and translated to key codes
when the extension first starts up.

### Search by the type of items

You can use keywords to specify the type of items you’re searching for, such as tabs or bookmarks.

To specify the type of item, add the text “[_type of item_]” to your search.
For example, to search for tabs that mention Shortcuts, enter “shortcuts tab”.

Type of item | Keyword | Action
--- | --- | ---
`OpenTabSuggestion` | Open tab | Activate suggestion in the tab strip
`ClosedTabSuggestion` | Recently closed | Reopen suggestion in a new tab
`SyncedTabSuggestion` | Synced tab | Open and activate suggestion in a new tab
`BookmarkSuggestion` | Bookmark | Open and activate suggestion in a new tab
`ReadingListSuggestion` | Reading list | Open and activate suggestion in a new tab
`HistorySuggestion` | Recently visited | Open and activate suggestion in a new tab
`DownloadSuggestion` | Download | Show suggestion in its folder in a file manager
`ExtensionSuggestion` | Extension | Open and activate suggestion in a new tab

### Configure keyboard shortcuts

Navigate to `chrome://extensions/shortcuts` to configure global keyboard shortcuts.
For example, you can bind `Control+Y` to open a new tab to the right.
You can also bind shortcuts to duplicate tabs, copy page URLs and more.
[See all available actions.](#commands)

You can also configure the popup keys by importing and exporting settings
in the “Options” page—Right-click the Shortcuts toolbar button and select “Options”.

<details>

<summary>Example configuration</summary>

``` json
{
  "commandBindings": [
    { "command": "openShortcutsManual", "key": { "code": "F1" } },
    { "command": "openShortcutsOptionsPage", "key": { "code": "F2" } },
    { "command": "openShortcutsShortcutsPage", "key": { "code": "F3" } },
    { "command": "openShortcutsThemeStore", "key": { "code": "F4" } },
    { "command": "openCommandPalette", "key": { "code": "Slash" } },
    { "command": "openCommandPalette", "key": { "ctrlKey": true, "code": "KeyF" } },
    { "command": "closePopup", "key": { "code": "Escape" } },
    { "command": "closePopup", "key": { "ctrlKey": true, "code": "KeyC" } },
    { "command": "closePopup", "key": { "code": "KeyQ" } },
    { "command": "goBack", "key": { "altKey": true, "code": "KeyH" } },
    { "command": "goForward", "key": { "altKey": true, "code": "KeyL" } },
    { "command": "reloadTab", "key": { "code": "KeyR" } },
    { "command": "reloadTabWithoutCache", "key": { "shiftKey": true, "code": "KeyR" } },
    { "command": "goToNextPage", "key": { "shiftKey": true, "code": "Period" } },
    { "command": "goToPreviousPage", "key": { "shiftKey": true, "code": "Comma" } },
    { "command": "removeURLParams", "key": { "shiftKey": true, "code": "KeyU" } },
    { "command": "goUp", "key": { "altKey": true, "code": "KeyU" } },
    { "command": "goToRoot", "key": { "altKey": true, "shiftKey": true, "code": "KeyU" } },
    { "command": "focusTextInput", "key": { "code": "KeyI" } },
    { "command": "focusMediaPlayer", "key": { "code": "KeyV" } },
    { "command": "blurElement", "key": { "shiftKey": true, "code": "Escape" } },
    { "command": "toggleAutoDarkMode", "key": { "shiftKey": true, "code": "Backquote" } },
    { "command": "copyURL", "key": { "code": "KeyY" } },
    { "command": "copyTitle", "key": { "altKey": true, "code": "KeyY" } },
    { "command": "copyTitleAndURL", "key": { "shiftKey": true, "code": "KeyY" } },
    { "command": "openNewTabsFromClipboard", "key": { "shiftKey": true, "code": "KeyV" } },
    { "command": "savePage", "key": { "ctrlKey": true, "code": "KeyS" } },
    { "command": "savePageAsMHTML", "key": { "ctrlKey": true, "shiftKey": true, "code": "KeyS" } },
    { "command": "savePageAsPNG", "key": { "ctrlKey": true, "altKey": true, "code": "KeyS" } },
    { "command": "openWebSearchForSelectedText", "key": { "altKey": true, "code": "KeyW" } },
    { "command": "scrollDown", "key": { "code": "KeyJ" } },
    { "command": "scrollUp", "key": { "code": "KeyK" } },
    { "command": "scrollLeft", "key": { "code": "KeyH" } },
    { "command": "scrollRight", "key": { "code": "KeyL" } },
    { "command": "scrollPageDown", "key": { "code": "Space" } },
    { "command": "scrollPageUp", "key": { "shiftKey": true, "code": "Space" } },
    { "command": "scrollHalfPageDown", "key": { "shiftKey": true, "code": "KeyJ" } },
    { "command": "scrollHalfPageUp", "key": { "shiftKey": true, "code": "KeyK" } },
    { "command": "scrollToTop", "key": { "code": "KeyG" } },
    { "command": "scrollToBottom", "key": { "code": "KeyE" } },
    { "command": "zoomIn", "key": { "code": "Equal" } },
    { "command": "zoomOut", "key": { "code": "Minus" } },
    { "command": "zoomReset", "key": { "code": "Digit0" } },
    { "command": "minimizeWindow", "key": { "ctrlKey": true, "code": "KeyM" } },
    { "command": "maximizeWindow", "key": { "ctrlKey": true, "shiftKey": true, "code": "KeyM" } },
    { "command": "toggleFullScreen", "key": { "code": "KeyF" } },
    { "command": "togglePictureInPicture", "key": { "altKey": true, "code": "KeyV" } },
    { "command": "openNewTab", "key": { "code": "KeyT" } },
    { "command": "openNewTabRight", "key": { "code": "KeyO" } },
    { "command": "openNewWindow", "key": { "code": "KeyN" } },
    { "command": "openNewIncognitoWindow", "key": { "shiftKey": true, "code": "KeyN" } },
    { "command": "closeTab", "key": { "code": "KeyX" } },
    { "command": "closeOtherTabs", "key": { "altKey": true, "code": "KeyX" } },
    { "command": "closeRightTabs", "key": { "altKey": true, "shiftKey": true, "code": "KeyX" } },
    { "command": "closeWindow", "key": { "shiftKey": true, "code": "KeyX" } },
    { "command": "restoreTab", "key": { "code": "KeyU" } },
    { "command": "duplicateTab", "key": { "code": "KeyB" } },
    { "command": "togglePinTab", "key": { "code": "KeyP" } },
    { "command": "toggleGroupTab", "key": { "shiftKey": true, "code": "KeyP" } },
    { "command": "toggleCollapseTabGroups", "key": { "code": "KeyC" } },
    { "command": "toggleMuteTab", "key": { "code": "KeyM" } },
    { "command": "discardTab", "key": { "code": "KeyD" } },
    { "command": "sortTabsByName", "key": { "shiftKey": true, "code": "Digit1" } },
    { "command": "sortTabsByURL", "key": { "shiftKey": true, "code": "Digit2" } },
    { "command": "sortTabsByRecency", "key": { "shiftKey": true, "code": "Digit3" } },
    { "command": "reverseTabOrder", "key": { "shiftKey": true, "code": "Digit4" } },
    { "command": "groupTabsByDomain", "key": { "shiftKey": true, "code": "Digit5" } },
    { "command": "collapseTabGroup", "key": { "shiftKey": true, "code": "KeyC" } },
    { "command": "renameTabGroup", "key": { "altKey": true, "code": "KeyR" } },
    { "command": "cycleTabGroupColorForward", "key": { "altKey": true, "code": "KeyA" } },
    { "command": "cycleTabGroupColorBackward", "key": { "altKey": true, "shiftKey": true, "code": "KeyA" } },
    { "command": "activateAudibleTab", "key": { "shiftKey": true, "code": "Digit6" } },
    { "command": "activateNextTab", "key": { "code": "Tab" } },
    { "command": "activateNextTab", "key": { "altKey": true, "code": "KeyK" } },
    { "command": "activatePreviousTab", "key": { "shiftKey": true, "code": "Tab" } },
    { "command": "activatePreviousTab", "key": { "altKey": true, "code": "KeyJ" } },
    { "command": "activateFirstTab", "key": { "code": "Digit1" } },
    { "command": "activateSecondTab", "key": { "code": "Digit2" } },
    { "command": "activateThirdTab", "key": { "code": "Digit3" } },
    { "command": "activateFourthTab", "key": { "code": "Digit4" } },
    { "command": "activateFifthTab", "key": { "code": "Digit5" } },
    { "command": "activateSixthTab", "key": { "code": "Digit6" } },
    { "command": "activateSeventhTab", "key": { "code": "Digit7" } },
    { "command": "activateEighthTab", "key": { "code": "Digit8" } },
    { "command": "activateLastTab", "key": { "code": "Digit9" } },
    { "command": "activateLastActiveTab", "key": { "altKey": true, "code": "Digit1" } },
    { "command": "activateSecondLastActiveTab", "key": { "altKey": true, "code": "Digit2" } },
    { "command": "activateThirdLastActiveTab", "key": { "altKey": true, "code": "Digit3" } },
    { "command": "activateFourthLastActiveTab", "key": { "altKey": true, "code": "Digit4" } },
    { "command": "activateFifthLastActiveTab", "key": { "altKey": true, "code": "Digit5" } },
    { "command": "activateSixthLastActiveTab", "key": { "altKey": true, "code": "Digit6" } },
    { "command": "activateSeventhLastActiveTab", "key": { "altKey": true, "code": "Digit7" } },
    { "command": "activateEighthLastActiveTab", "key": { "altKey": true, "code": "Digit8" } },
    { "command": "activateNinthLastActiveTab", "key": { "altKey": true, "code": "Digit9" } },
    { "command": "activateNextWindow", "key": { "code": "KeyW" } },
    { "command": "activatePreviousWindow", "key": { "shiftKey": true, "code": "KeyW" } },
    { "command": "grabTab", "key": { "altKey": true, "code": "KeyG" } },
    { "command": "moveTabLeft", "key": { "code": "ArrowLeft" } },
    { "command": "moveTabRight", "key": { "code": "ArrowRight" } },
    { "command": "moveTabFirst", "key": { "code": "Home" } },
    { "command": "moveTabLast", "key": { "code": "End" } },
    { "command": "moveTabNewWindow", "key": { "code": "ArrowUp" } },
    { "command": "moveTabPreviousWindow", "key": { "code": "ArrowDown" } },
    { "command": "selectActiveTab", "key": { "code": "KeyS" } },
    { "command": "selectPreviousTab", "key": { "code": "BracketLeft" } },
    { "command": "selectNextTab", "key": { "code": "BracketRight" } },
    { "command": "selectRelatedTabs", "key": { "code": "Backquote" } },
    { "command": "selectTabsInGroup", "key": { "code": "KeyA" } },
    { "command": "selectAllTabs", "key": { "shiftKey": true, "code": "KeyA" } },
    { "command": "selectRightTabs", "key": { "shiftKey": true, "code": "KeyS" } },
    { "command": "moveTabSelectionFaceBackward", "key": { "shiftKey": true, "code": "BracketLeft" } },
    { "command": "moveTabSelectionFaceForward", "key": { "shiftKey": true, "code": "BracketRight" } },
    { "command": "bookmarkTab", "key": { "shiftKey": true, "code": "KeyD" } },
    { "command": "bookmarkSession", "key": { "shiftKey": true, "code": "KeyB" } },
    { "command": "addTabToReadingList", "key": { "altKey": true, "code": "KeyD" } },
    { "command": "openDownloadsFolder", "key": { "ctrlKey": true, "code": "KeyK" } },
    { "command": "openBrowsingHistory", "key": { "ctrlKey": true, "code": "KeyH" } },
    { "command": "openSyncedTabsPage", "key": { "ctrlKey": true, "code": "KeyT" } },
    { "command": "openClearBrowserDataOptions", "key": { "ctrlKey": true, "code": "Delete" } },
    { "command": "openDownloadHistory", "key": { "ctrlKey": true, "code": "KeyJ" } },
    { "command": "openBookmarkManager", "key": { "ctrlKey": true, "code": "KeyO" } },
    { "command": "openSettings", "key": { "code": "Comma" } },
    { "command": "openPasswordManager", "key": { "ctrlKey": true, "code": "KeyY" } },
    { "command": "openSearchEngineSettings", "key": { "ctrlKey": true, "code": "Slash" } },
    { "command": "openAppsPage", "key": { "ctrlKey": true, "shiftKey": true, "code": "KeyA" } },
    { "command": "openExtensionsPage", "key": { "ctrlKey": true, "code": "KeyA" } },
    { "command": "openExtensionShortcutsPage", "key": { "shiftKey": true, "code": "Equal" } },
    { "command": "openExperimentalSettings", "key": { "ctrlKey": true, "code": "Comma" } }
  ],
  "paletteBindings": [
    { "command": "selectNextItem", "key": { "code": "ArrowDown" } },
    { "command": "selectNextItem", "key": { "ctrlKey": true, "code": "KeyN" } },
    { "command": "selectNextItem", "key": { "code": "Tab" } },
    { "command": "selectPreviousItem", "key": { "code": "ArrowUp" } },
    { "command": "selectPreviousItem", "key": { "ctrlKey": true, "code": "KeyP" } },
    { "command": "selectPreviousItem", "key": { "shiftKey": true, "code": "Tab" } },
    { "command": "activateSelectedItem", "key": { "code": "Enter" } },
    { "command": "openSelectedItemInCurrentTab", "key": { "altKey": true, "code": "Enter" } },
    { "command": "openSelectedItemInNewBackgroundTab", "key": { "ctrlKey": true, "code": "Enter" } },
    { "command": "openSelectedItemInNewBackgroundTab", "key": { "metaKey": true, "code": "Enter" } },
    { "command": "openSelectedItemInNewForegroundTab", "key": { "ctrlKey": true, "shiftKey": true, "code": "Enter" } },
    { "command": "openSelectedItemInNewForegroundTab", "key": { "shiftKey": true, "metaKey": true, "code": "Enter" } },
    { "command": "openSelectedItemInNewWindow", "key": { "shiftKey": true, "code": "Enter" } },
    { "command": "movePageDown", "key": { "code": "PageDown" } },
    { "command": "movePageDown", "key": { "ctrlKey": true, "code": "KeyD" } },
    { "command": "movePageUp", "key": { "code": "PageUp" } },
    { "command": "movePageUp", "key": { "ctrlKey": true, "code": "KeyU" } },
    { "command": "closeCommandPalette", "key": { "code": "Escape" } },
    { "command": "closeCommandPalette", "key": { "ctrlKey": true, "code": "KeyC" } }
  ],
  "pageBindings": [
  ]
}
```

</details>

### Single-key keyboard shortcuts

Single-key keyboard shortcuts are only available in the context of web pages
where browser extensions are allowed.

You can bind `Escape` to open the extension’s popup
and `Shift+Escape` to simulate pressing the `Escape` key.

To enable these keyboard shortcuts—Right-click the Shortcuts toolbar button and select “Options”.
There, you’ll see a checkbox that allows you to enable “Vim mode”.

<details>

<summary>Example configuration</summary>

``` json
{
  "pageBindings": [
    { "command": "openPopup", "key": { "code": "Escape" } },
    { "command": "sendEscapeKey", "key": { "shiftKey": true, "code": "Escape" } }
  ]
}
```

</details>

### Appearance and custom themes

You can customize the extension’s popup appearance with CSS overrides.

To import a theme:

1. Right-click the Shortcuts toolbar button and select “Options”.
2. Click “Import”, select the file that contains the theme, then click “Open”.

To restore the default theme:

1. Right-click the Shortcuts toolbar button and select “Options”.
2. Choose “Basic theme”.

<details>

<summary>Example configuration</summary>

``` json
{
  "popupStyleSheet": [
    ":root {",
    "--background-color: light-dark(white, black);",
    "--foreground-color: light-dark(black, white);",
    "--scrollbar-thumb-color: light-dark(lightgray, dimgray);",
    "--scrollbar-track-color: light-dark(white, black);",
    "--text-field-background-color: light-dark(whitesmoke, var(--light-black-color));",
    "--text-field-border-color: light-dark(transparent, transparent);",
    "--placeholder-text-color: light-dark(silver, gray);",
    "--primary-button-text-color: light-dark(white, white);",
    "--primary-button-background-color: light-dark(royalblue, royalblue);",
    "--primary-button-active-background-color: light-dark(var(--dark-blue-color), var(--light-blue-color));",
    "--selected-text-color: light-dark(white, white);",
    "--selected-text-background-color: light-dark(royalblue, royalblue);",
    "--control-accent-color: light-dark(royalblue, royalblue);",
    "--keyboard-focus-indicator-color: light-dark(royalblue, royalblue);",
    "--label-color: light-dark(black, white);",
    "--secondary-label-color: light-dark(silver, gray);",
    "--tertiary-label-color: light-dark(silver, gray);",
    "--disabled-control-text-color: light-dark(silver, gray);",
    "--separator-color: light-dark(var(--light-gray-color), var(--light-black-color));",
    "--shadow-color: light-dark(lightgray, black);",
    "--popover-background-color: light-dark(white, black);",
    "--popover-text-color: light-dark(black, white);",
    "--popover-border-color: light-dark(lightgray, lightgray);",
    "--tag-pill-background-color: light-dark(royalblue, royalblue);",
    "--tag-pill-text-color: light-dark(white, white);",
    "--light-black-color: oklch(from black calc(l + 0.3) c h);",
    "--light-gray-color: oklch(from lightgray calc(l + 0.05) c h);",
    "--light-blue-color: oklch(from royalblue calc(l + 0.05) c h);",
    "--dark-blue-color: oklch(from royalblue calc(l - 0.05) c h);",
    "}"
  ]
}
```

</details>

### Authoring and sharing custom themes

Developers can create and share their own “Theme Store”.

To allow web pages to communicate with the Shortcuts extension:

1. Right-click the Shortcuts toolbar button and select “Options”.
2. Click “Import”, select the file that contains the list of `"externallyConnectableMatches"` values, then click “Open”.

By default, only `"https://taupiqueur.github.io/chrome-shortcuts/themes.html"`
and `"https://taupiqueur.github.io/chrome-shortcuts/fr/themes.html"` web pages
are allowed to communicate with the Shortcuts extension.

To install a theme from one of these web pages:

1. Open [Shortcuts themes] or select “Theme Store” in the extension’s menu.
2. Choose a theme.
3. Click “Install”.

[Shortcuts themes]: https://taupiqueur.github.io/chrome-shortcuts/themes.html

<details>

<summary>Example configuration</summary>

``` json
{
  "externallyConnectableMatches": [
    "https://taupiqueur.github.io/chrome-shortcuts/themes.html",
    "https://taupiqueur.github.io/chrome-shortcuts/fr/themes.html"
  ]
}
```

</details>

See [URL Pattern API] for more information on the match pattern syntax.

[URL Pattern API]: https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API

### In practice?

`Alt+J` and `Alt+K` are the two shortcuts I’ve configured to
open the Shortcuts menu—in the “Extension shortcuts” interface—and
click using [Link Hints]—in the “Keyboard shortcuts” options.

[Link Hints]: https://lydell.github.io/LinkHints/

Finally, to complement the built-in keyboard shortcuts, I’ve assigned
`Control+Y` to open a new tab to the right,
`Control+B` to duplicate tabs,
`Alt+W` to perform web searches,
`Alt+Y` to copy page URLs, and
`Alt+I` to focus text fields.

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
> You can click on the keys with code values to show the keys to press
> (e.g., clicking on `KeyJ` will show “j” on a US keyboard).

### Shortcuts commands

These commands are only available in the extension’s popup.

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`openShortcutsManual` | Open the Shortcuts manual | | | `F1`
`openShortcutsOptionsPage` | Open the Shortcuts “Options” page | | | `F2`
`openShortcutsShortcutsPage` | Open the Shortcuts “Keyboard shortcuts” page | | | `F3`
`openShortcutsThemeStore` | Open the Shortcuts “Theme Store” page | | | `F4`
`openCommandPalette` | Open the command palette | | | `Slash`, `Control+KeyF`
`closePopup` | Close the popup window | | | `Escape`, `Control+KeyC`, `KeyQ`

### Command palette commands

These commands are only available in the command palette.

Command | Description | Windows and Linux key | macOS key | Palette key
--- | --- | --- | --- | ---
`selectNextItem` | Select the next item | | | `ArrowDown`, `Control+KeyN`, `Tab`
`selectPreviousItem` | Select the previous item | | | `ArrowUp`, `Control+KeyP`, `Shift+Tab`
`activateSelectedItem` | Activate selected item | | | `Enter`
`openSelectedItemInCurrentTab` | Open selected item in the current tab | | | `Alt+Enter`
`openSelectedItemInNewBackgroundTab` | Open selected item in a new background tab | | | `Control+Enter`, `Command+Enter`
`openSelectedItemInNewForegroundTab` | Open selected item in a new foreground tab | | | `Control+Shift+Enter`, `Shift+Command+Enter`
`openSelectedItemInNewWindow` | Open selected item in a new window | | | `Shift+Enter`
`movePageDown` | Move page down | | | `PageDown`, `Control+KeyD`
`movePageUp` | Move page up | | | `PageUp`, `Control+KeyU`
`closeCommandPalette` | Close the command palette | | | `Escape`, `Control+KeyC`

### Web pages commands

These commands are only available in the context of web pages
where browser extensions are allowed.

Command | Description | Windows and Linux key | macOS key | Page key
--- | --- | --- | --- | ---
`openPopup` | Open the extension’s popup | | | Suggested key: `Escape`
`sendEscapeKey` | Simulate pressing the `Escape` key | | | Suggested key: `Shift+Escape`

### Navigation commands

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

### Accessibility commands

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`focusTextInput` | Cycle through text fields | | | `KeyI`
`focusMediaPlayer` | Cycle through media players | | | `KeyV`
`blurElement` | Blur the active element | | | `Shift+Escape`
`toggleAutoDarkMode` | Turn automatic dark mode on or off | | | `Shift+Backquote`

### Clipboard commands

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`copyURL` | Copy URL of selected tabs | | | `KeyY`
`copyTitle` | Copy title of selected tabs | | | `Alt+KeyY`
`copyTitleAndURL` | Copy title and URL of selected tabs | | | `Shift+KeyY`
`openNewTabsFromClipboard` | Open and activate new tabs from the system clipboard | | | `Shift+KeyV`

> [!NOTE]
> If Chrome notifications are enabled,
> Shortcuts will show you a message for copied text.

### Save pages commands

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`savePage` | Save the content of selected tabs | `Control+S` | `Command+S` | `Control+KeyS`
`savePageAsMHTML` | Save the content of selected tabs as MHTML | | | `Control+Shift+KeyS`
`savePageAsPNG` | Save the content of selected tabs as PNG | | | `Control+Alt+KeyS`
`savePageAsJPEG` | Save the content of selected tabs as JPEG | | |
`savePageAsWebP` | Save the content of selected tabs as WebP | | |

> [!NOTE]
> Shortcuts uses the Chrome DevTools Protocol to take screenshots of the entire page.
> As a result, Chrome will display the message: “Shortcuts started debugging this browser” with a “Cancel” button.
> You can wait for the operation to complete, or click “Cancel” to close the debugging session and abort the capture.

### Web search commands

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`openWebSearchForSelectedText` | Perform a web search for selected text | | | `Alt+KeyW`

### Scroll commands

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

### Zoom commands

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`zoomIn` | Zoom in | `Control+Equal` | `Command+Equal` | `Equal`
`zoomOut` | Zoom out | `Control+Minus` | `Command+Minus` | `Minus`
`zoomReset` | Reset the zoom factor | `Control+0` | `Command+0` | `Digit0`

### Window state commands

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`minimizeWindow` | Minimize the current window | `Alt+Space` then `N` | `Command+M` | `Control+KeyM`
`maximizeWindow` | Maximize the current window | `Alt+Space` then `X` | | `Control+Shift+KeyM`
`toggleFullScreen` | Turn full-screen mode on or off | `F11` | `Globe+F`, `Control+Command+F` | `KeyF`
`togglePictureInPicture` | Turn picture-in-picture mode on or off | | | `Alt+KeyV`

> [!IMPORTANT]
> Entering picture-in-picture mode requires a user gesture.

### Create tabs commands

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`openNewTab` | Open and activate a new tab | `Control+T` | `Command+T` | `KeyT`
`openNewTabRight` | Open and activate a new tab to the right | | | `KeyO`
`openNewWindow` | Open a new window | `Control+N` | `Command+N` | `KeyN`
`openNewIncognitoWindow` | Open a new window in Incognito mode | `Control+Shift+N` | `Shift+Command+N` | `Shift+KeyN`

### Close tabs commands

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`closeTab` | Close selected tabs | `Control+W`, `Control+F4` | `Command+W` | `KeyX`
`closeOtherTabs` | Close other tabs | | | `Alt+KeyX`
`closeRightTabs` | Close tabs to the right | | | `Alt+Shift+KeyX`
`closeWindow` | Close the window that contains the tab | `Control+Shift+W`, `Alt+F4` | `Shift+Command+W` | `Shift+KeyX`
`restoreTab` | Reopen previously closed tabs | `Control+Shift+T` | `Shift+Command+T` | `KeyU`

### Tab state commands

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`duplicateTab` | Duplicate selected tabs | | | `KeyB`
`togglePinTab` | Pin or unpin selected tabs | | | `KeyP`
`toggleGroupTab` | Group or ungroup selected tabs | | | `Shift+KeyP`
`toggleCollapseTabGroups` | Collapse or uncollapse tab groups | | | `KeyC`
`toggleMuteTab` | Mute or unmute selected tabs | | | `KeyM`
`discardTab` | Discard selected tabs | | | `KeyD`

### Organize tabs commands

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`sortTabsByName` | Sort selected tabs by name | | | `Shift+Digit1`
`sortTabsByURL` | Sort selected tabs by URL | | | `Shift+Digit2`
`sortTabsByRecency` | Sort selected tabs by recency | | | `Shift+Digit3`
`reverseTabOrder` | Reverse the order of selected tabs | | | `Shift+Digit4`
`groupTabsByDomain` | Group selected tabs by domain | | | `Shift+Digit5`

### Manage tab groups commands

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`collapseTabGroup` | Collapse tab groups that contain highlighted tabs | | | `Shift+KeyC`
`renameTabGroup` | Rename tab group | | | `Alt+KeyR`
`cycleTabGroupColorForward` | Cycle forward through tab group colors | | | `Alt+KeyA`
`cycleTabGroupColorBackward` | Cycle backward through tab group colors | | | `Alt+Shift+KeyA`

### Switch tabs commands

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`activateAudibleTab` | Cycle through audible tabs | | | `Shift+Digit6`
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

### Move tabs commands

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`grabTab` | Grab selected tabs | | | `Alt+KeyG`
`moveTabLeft` | Move selected tabs left | `Control+Shift+PageUp` | `Control+Shift+PageUp` | `ArrowLeft`
`moveTabRight` | Move selected tabs right | `Control+Shift+PageDown` | `Control+Shift+PageDown` | `ArrowRight`
`moveTabFirst` | Move selected tabs to the far left | | | `Home`
`moveTabLast` | Move selected tabs to the far right | | | `End`
`moveTabNewWindow` | Move selected tabs to a new window | | | `ArrowUp`
`moveTabPreviousWindow` | Move selected tabs to the previous open window | | | `ArrowDown`

### Select tabs commands

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

### Bookmarks commands

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`bookmarkTab` | Save selected tabs as bookmarks | `Control+D` | `Command+D` | `Shift+KeyD`
`bookmarkSession` | Save the current session as bookmarks | `Control+Shift+D` | `Shift+Command+D` | `Shift+KeyB`

> [!NOTE]
> If Chrome notifications are enabled,
> Shortcuts will show you a message for created bookmarks.

### Reading list commands

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`addTabToReadingList` | Add selected tabs to your reading list | | | `Alt+KeyD`

> [!NOTE]
> If Chrome notifications are enabled,
> Shortcuts will show you a message for pages added to your reading list.

### Folders commands

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`openDownloadsFolder` | Open the “Downloads” folder | | | `Control+KeyK`

### Chrome URLs commands

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`openBrowsingHistory` | Open the browsing history | `Control+H` | `Command+Y` | `Control+KeyH`
`openSyncedTabsPage` | Open the “Tabs from other devices” page | | | `Control+KeyT`
`openClearBrowserDataOptions` | Open the “Delete browsing data” options | `Control+Shift+Delete` | `Command+Shift+Delete` | `Control+Delete`
`openDownloadHistory` | Open the download history | `Control+J` | `Option+Command+L` | `Control+KeyJ`
`openBookmarkManager` | Open the bookmark manager | `Control+Shift+O` | `Option+Command+B` | `Control+KeyO`
`openSettings` | Open settings | | `Command+Comma` | `Comma`
`openAppearanceSettings` | Open appearance settings | | |
`openPasswordManager` | Open the password manager | | | `Control+KeyY`
`openPaymentMethodSettings` | Open payment method settings | | |
`openAddressSettings` | Open address settings | | |
`openSearchEngineSettings` | Open search engine settings | | | `Control+Slash`
`openAppsPage` | Open the “Apps” page | | | `Control+Shift+KeyA`
`openExtensionsPage` | Open the “Extensions” page | | | `Control+KeyA`
`openExtensionShortcutsPage` | Open the “Extension shortcuts” page | | | `Shift+Equal`
`openExperimentalSettings` | Open experimental settings | | | `Control+Comma`
`openAboutChromePage` | Open the “About Chrome” page | | |
`openAboutChromeVersionPage` | Open the “About Chrome version” page | | |
`openWhatsNewPage` | Open the “What’s new in Chrome” page | | |

### Open tab suggestions

These commands are only available in the command palette under the “Open tab” label.

Command | Description | Windows and Linux key | macOS key | Palette key
--- | --- | --- | --- | ---
`activateSuggestion(openTabSuggestion)` | Activate suggestion in the tab strip | `Control+Shift+A` or `@tabs` in the address bar | `Shift+Command+A` or `@tabs` in the address bar | `Enter`

### Recently closed tab suggestions

These commands are only available in the command palette under the “Recently closed” label.

Command | Description | Windows and Linux key | macOS key | Palette key
--- | --- | --- | --- | ---
`activateSuggestion(closedTabSuggestion)` | Reopen suggestion in a new tab | `Control+Shift+A` | `Shift+Command+A` | `Enter`

### Synced tab suggestions

These commands are only available in the command palette under the “Synced tab” label.

Command | Description | Windows and Linux key | macOS key | Palette key
--- | --- | --- | --- | ---
`activateSuggestion(syncedTabSuggestion)` | Open and activate suggestion in a new tab | | | `Enter`

### Bookmark suggestions

These commands are only available in the command palette under the “Bookmark” label.

Command | Description | Windows and Linux key | macOS key | Palette key
--- | --- | --- | --- | ---
`activateSuggestion(bookmarkSuggestion)` | Open and activate suggestion in a new tab | `@bookmarks` in the address bar | `@bookmarks` in the address bar | `Enter`

### Reading list suggestions

These commands are only available in the command palette under the “Reading list” label.

Command | Description | Windows and Linux key | macOS key | Palette key
--- | --- | --- | --- | ---
`activateSuggestion(readingListSuggestion)` | Open and activate suggestion in a new tab | | | `Enter`

### Recently visited page suggestions

These commands are only available in the command palette under the “Recently visited” label.

Command | Description | Windows and Linux key | macOS key | Palette key
--- | --- | --- | --- | ---
`activateSuggestion(historySuggestion)` | Open and activate suggestion in a new tab | `@history` in the address bar | `@history` in the address bar | `Enter`

### Download suggestions

These commands are only available in the command palette under the “Download” label.

Command | Description | Windows and Linux key | macOS key | Palette key
--- | --- | --- | --- | ---
`activateSuggestion(downloadSuggestion)` | Show suggestion in its folder in a file manager | | | `Enter`

### Installed extension suggestions

These commands are only available in the command palette under the “Extension” label.

Command | Description | Windows and Linux key | macOS key | Palette key
--- | --- | --- | --- | ---
`activateSuggestion(extensionSuggestion)` | Open and activate suggestion in a new tab | | | `Enter`

For more keyboard shortcuts, see the [Google Chrome documentation][Chrome keyboard shortcuts].

[Chrome keyboard shortcuts]: https://support.google.com/chrome/answer/157179

## Tips and tricks

- **To close right tabs**—Select tabs to the right with `Tab`, `Shift+KeyS`, then close selection with `KeyX`.
- **To close other tabs**—Move the tab you want to keep to the far left with the `Home` key, then close tabs to the right.
- **To move tab groups**—Select all tabs in group with `KeyA`, then use a move action, such as `ArrowLeft` / `ArrowRight` for horizontal movements.
- **To merge windows**—Select all tabs with `Shift+KeyA`, then press the `ArrowDown` key to move selected tabs to the previous window.
- **To copy all open tab URLs**—Select all tabs with `Shift+KeyA`, then press `KeyY` to copy the selected URLs.

For more tips, see the [Google Chrome documentation][Chrome tips].

[Chrome tips]: https://google.com/chrome/tips/
