# Manual

## Usage

`Alt+Space` (`Ctrl+Space` on Windows) is the main keyboard shortcut.
Use it to open the extension’s popup—aka “Vim” mode.
Press `Escape` to cancel.

If you need explanations of the shortcuts—Right-click the Shortcuts toolbar button and select “Documentation”.

The keyboard shortcuts are fully customizable.

### Configure keyboard shortcuts

Navigate to `chrome://extensions/shortcuts` to configure global keyboard shortcuts.

You can for example bind `Ctrl+Y` to open a new tab to the right, `Ctrl+B` to duplicate the current tab,
or change the default shortcut—to open the popup—to `Alt+J`.

You can also configure the popup keys by importing and exporting settings
in the “Options” page—Right-click the Shortcuts toolbar button and select “Options”.

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

### Navigation

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`goBack` | Go back to the previous page in tab’s history | `Alt+ArrowLeft` | `Command+BracketLeft`, `Command+ArrowLeft` | `Alt+KeyH`
`goForward` | Go forward to the next page in tab’s history | `Alt+ArrowRight` | `Command+BracketRight`, `Command+ArrowRight` | `Alt+KeyL`
`reloadTab` | Reload selected tabs | `F5`, `Control+R` | `Command+R` | `KeyR`
`reloadTabWithoutCache` | Reload selected tabs, ignoring cached content | `Shift+F5`, `Control+Shift+R` | `Shift+Command+R` | `Shift+KeyR`
`goToNextPage` | Go to the next page in the series | | | `Shift+Period`
`goToPreviousPage` | Go to the previous page in the series | | | `Shift+Comma`
`removeURLParams` | Remove any URL parameters | | | `Shift+Slash`
`goUp` | Go up in the URL hierarchy | | | `Period`
`goToRoot` | Go to the root URL | | | `Slash`

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
`openDownloadsPage` | Open the “Downloads” page | `Control+J` | `Option+Command+L` | `Control+KeyJ`
`openBookmarksPage` | Open the “Bookmarks” page | `Control+Shift+O` | `Option+Command+B` | `Control+KeyO`
`openSettingsPage` | Open the “Settings” page | | `Command+Comma` | `Comma`
`openPasswordsPage` | Open the “Passwords” page | | | `Control+KeyY`
`openSearchEnginesPage` | Open the “Search engines” page | | | `Control+Slash`
`openExtensionsPage` | Open the “Extensions” page | | | `Control+KeyA`
`openExtensionShortcutsPage` | Open the “Extensions > Keyboard shortcuts” page | | | `Shift+Equal`
`openExperimentsPage` | Open the “Experiments” page | | | `Control+Comma`

### Popup

These commands are only available in the extension’s popup.

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`closePopup` | Close the popup window | | | `Escape`, `KeyQ`

For more keyboard shortcuts, see the [Google Chrome documentation][Chrome keyboard shortcuts].

[Chrome keyboard shortcuts]: https://support.google.com/chrome/answer/157179

## Tips and tricks

- **To close right tabs**—Select tabs to the right with `Tab`, `Shift+KeyS`, then close selection with `KeyX`.
- **To close other tabs**—Move the tab you want to keep to the far left with the `Home` key, then close tabs to the right.
- **To move tab groups**—Select all tabs in group with `KeyA`, then use a move action, such as `ArrowLeft` / `ArrowRight` for horizontal movements.
- **To merge windows**—Select all tabs with `Shift+KeyA`, then press the `Down` key to move selected tabs to the previous window.

For more tips, see the [Google Chrome documentation][Chrome tips].

[Chrome tips]: https://google.com/chrome/tips/
