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
`goBack` | Go back to the previous page in tab’s history | `⌥ ←` | `⌘ [`, `⌘ ←` | `⌥ KeyH`
`goForward` | Go forward to the next page in tab’s history | `⌥ →` | `⌘ ]`, `⌘ →` | `⌥ KeyL`
`reloadTab` | Reload selected tabs | `F5`, `⌃ R` | `⌘ R` | `KeyR`
`reloadTabWithoutCache` | Reload selected tabs, ignoring cached content | `⇧ F5`, `⌃ ⇧ R` | `⇧ ⌘ R` | `⇧ KeyR`
`goToNextPage` | Go to the next page in the series | | | `⇧ Period`
`goToPreviousPage` | Go to the previous page in the series | | | `⇧ Comma`
`removeURLParams` | Remove any URL parameters | | | `⇧ Slash`
`goUp` | Go up in the URL hierarchy | | | `Period`
`goToRoot` | Go to the root URL | | | `Slash`

### Accessibility

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`focusTextInput` | Cycle through text fields | | | `KeyI`
`focusMediaPlayer` | Cycle through media players | | | `KeyV`
`blurElement` | Blur the active element | | | `⇧ Escape`

### Clipboard

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`copyURL` | Copy URL of selected tabs | | | `KeyY`
`copyTitle` | Copy title of selected tabs | | | `⌥ KeyY`
`copyTitleAndURL` | Copy title and URL of selected tabs | | | `⇧ KeyY`

> [!NOTE]
> If Chrome notifications are enabled,
> Shortcuts will show you a message for copied text.

### Web search

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`openWebSearchForSelectedText` | Perform a web search for selected text | | | `⌥ KeyW`

### Scroll

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`scrollDown` | Scroll down | `↓` | `↓` | `KeyJ`
`scrollUp` | Scroll up | `↑` | `↑` | `KeyK`
`scrollLeft` | Scroll left | `←` | `←` | `KeyH`
`scrollRight` | Scroll right | `→` | `→` | `KeyL`
`scrollPageDown` | Scroll one page down | `Space`, `⇟` | `Space`, `⇟` | `Space`
`scrollPageUp` | Scroll one page up | `⇧ Space`, `⇞` | `⇧ Space`, `⇞` | `⇧ Space`
`scrollHalfPageDown` | Scroll half page down | | | `⇧ KeyJ`
`scrollHalfPageUp` | Scroll half page up | | | `⇧ KeyK`
`scrollToTop` | Scroll to the top of the page | `↖`, `⌃ ↑` | `↖`, `⌘ ↑` | `KeyG`
`scrollToBottom` | Scroll to the bottom of the page | `↘`, `⌃ ↓` | `↘`, `⌘ ↓` | `KeyE`

### Zoom

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`zoomIn` | Zoom in | `⌃ Equal` | `⌘ Equal` | `Equal`
`zoomOut` | Zoom out | `⌃ Minus` | `⌘ Minus` | `Minus`
`zoomReset` | Reset the zoom factor | `⌃ 0` | `⌘ 0` | `Digit0`
`toggleFullScreen` | Turn full-screen mode on or off | `F11` | `🌐 F`, `⌃ ⌘ F` | `KeyF`

### Create tabs

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`openNewTab` | Open and activate a new tab | `⌃ T` | `⌘ T` | `KeyT`
`openNewTabRight` | Open and activate a new tab to the right | | | `KeyO`
`openNewWindow` | Open a new window | `⌃ N` | `⌘ N` | `KeyN`
`openNewIncognitoWindow` | Open a new window in Incognito mode | `⌃ ⇧ N` | `⇧ ⌘ N` | `⇧ KeyN`

### Close tabs

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`closeTab` | Close selected tabs | `⌃ W`, `⌃ F4` | `⌘ W` | `KeyX`
`closeWindow` | Close the window that contains the tab | `⌃ ⇧ W`, `⌥ F4` | `⇧ ⌘ W` | `⇧ KeyX`
`restoreTab` | Reopen previously closed tabs | `⌃ ⇧ T` | `⇧ ⌘ T` | `KeyU`

### Tab state

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`duplicateTab` | Duplicate selected tabs | | | `KeyB`
`togglePinTab` | Pin or unpin selected tabs | | | `KeyP`
`toggleGroupTab` | Group or ungroup selected tabs | | | `⇧ KeyP`
`toggleCollapseTabGroups` | Collapse or uncollapse tab groups | | | `KeyC`
`toggleMuteTab` | Mute or unmute selected tabs | | | `KeyM`
`discardTab` | Discard selected tabs | | | `KeyD`

### Organize tabs

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`sortTabsByURL` | Sort selected tabs by URL | | | `⇧ Digit1`
`groupTabsByDomain` | Group selected tabs by domain | | | `⇧ Digit2`

### Manage tab groups

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`renameTabGroup` | Rename tab group | | | `⌥ KeyR`
`cycleTabGroupColorForward` | Cycle forward through tab group colors | | | `⌥ KeyA`
`cycleTabGroupColorBackward` | Cycle backward through tab group colors | | | `⌥ ⇧ KeyA`

### Switch tabs

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`activateAudibleTab` | Activate the first audible tab | | | `⇧ Digit3`
`activateNextTab` | Activate the next open tab | `⌃ ⇥`, `⌃ ⇟` | `⌃ ⇥`, `⌥ ⌘ →` | `Tab`, `⌥ KeyK`
`activatePreviousTab` | Activate the previous open tab | `⌃ ⇧ ⇥`, `⌃ ⇞` | `⌃ ⇧ ⇥`, `⌥ ⌘ ←` | `⇧ Tab`, `⌥ KeyJ`
`activateFirstTab` | Activate the leftmost open tab | `⌃ 1` | `⌘ 1` | `Digit1`
`activateSecondTab` | Activate the second leftmost open tab | `⌃ 2` | `⌘ 2` | `Digit2`
`activateThirdTab` | Activate the third leftmost open tab | `⌃ 3` | `⌘ 3` | `Digit3`
`activateFourthTab` | Activate the fourth leftmost open tab | `⌃ 4` | `⌘ 4` | `Digit4`
`activateFifthTab` | Activate the fifth leftmost open tab | `⌃ 5` | `⌘ 5` | `Digit5`
`activateSixthTab` | Activate the sixth leftmost open tab | `⌃ 6` | `⌘ 6` | `Digit6`
`activateSeventhTab` | Activate the seventh leftmost open tab | `⌃ 7` | `⌘ 7` | `Digit7`
`activateEighthTab` | Activate the eighth leftmost open tab | `⌃ 8` | `⌘ 8` | `Digit8`
`activateLastTab` | Activate the rightmost open tab | `⌃ 9` | `⌘ 9` | `Digit9`
`activateLastActiveTab` | Activate the last active tab | | | `⌥ Digit1`
`activateSecondLastActiveTab` | Activate the second last active tab | | | `⌥ Digit2`
`activateThirdLastActiveTab` | Activate the third last active tab | | | `⌥ Digit3`
`activateFourthLastActiveTab` | Activate the fourth last active tab | | | `⌥ Digit4`
`activateFifthLastActiveTab` | Activate the fifth last active tab | | | `⌥ Digit5`
`activateSixthLastActiveTab` | Activate the sixth last active tab | | | `⌥ Digit6`
`activateSeventhLastActiveTab` | Activate the seventh last active tab | | | `⌥ Digit7`
`activateEighthLastActiveTab` | Activate the eighth last active tab | | | `⌥ Digit8`
`activateNinthLastActiveTab` | Activate the ninth last active tab | | | `⌥ Digit9`
`activateNextWindow` | Activate the next open window | | | `KeyW`
`activatePreviousWindow` | Activate the previous open window | | | `⇧ KeyW`

### Move tabs

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`grabTab` | Grab selected tabs | | | `⌥ KeyG`
`moveTabLeft` | Move selected tabs left | `⌃ ⇧ ⇞` | `⌃ ⇧ ⇞` | `ArrowLeft`
`moveTabRight` | Move selected tabs right | `⌃ ⇧ ⇟` | `⌃ ⇧ ⇟` | `ArrowRight`
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
`selectAllTabs` | Select all tabs | | | `⇧ KeyA`
`selectRightTabs` | Select tabs to the right | | | `⇧ KeyS`
`moveTabSelectionFaceBackward` | Move tab selection’s face backward | | | `⇧ BracketLeft`
`moveTabSelectionFaceForward` | Move tab selection’s face forward | | | `⇧ BracketRight`

> [!TIP]
> Selecting tabs in group can be used for ungrouped tabs.

### Bookmarks

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`bookmarkTab` | Save selected tabs as bookmarks | `⌃ D` | `⌘ D` | `⇧ KeyD`
`bookmarkSession` | Save the current session as bookmarks | `⌃ ⇧ D` | `⇧ ⌘ D` | `⇧ KeyB`

> [!NOTE]
> If Chrome notifications are enabled,
> Shortcuts will show you a message for created bookmarks.

### Reading list

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`addTabToReadingList` | Add selected tabs to your reading list | | | `⌥ KeyD`

> [!NOTE]
> If Chrome notifications are enabled,
> Shortcuts will show you a message for pages added to your reading list.

### Folders

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`openDownloadsFolder` | Open the “Downloads” folder | | | `⌃ KeyK`

### Chrome URLs

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`openHistoryPage` | Open the “History” page | `⌃ H` | `⌘ Y` | `⌃ KeyH`
`openDownloadsPage` | Open the “Downloads” page | `⌃ J` | `⌥ ⌘ L` | `⌃ KeyJ`
`openBookmarksPage` | Open the “Bookmarks” page | `⌃ ⇧ O` | `⌥ ⌘ B` | `⌃ KeyO`
`openSettingsPage` | Open the “Settings” page | | `⌘ ,` | `Comma`
`openPasswordsPage` | Open the “Passwords” page | | | `⌃ KeyY`
`openSearchEnginesPage` | Open the “Search engines” page | | | `⌃ Slash`
`openExtensionsPage` | Open the “Extensions” page | | | `⌃ KeyA`
`openExtensionShortcutsPage` | Open the “Extensions > Keyboard shortcuts” page | | | `⇧ Equal`
`openExperimentsPage` | Open the “Experiments” page | | | `⌃ Comma`

### Popup

These commands are only available in the extension’s popup.

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`closePopup` | Close the popup window | | | `Escape`, `KeyQ`

For more keyboard shortcuts, see the [Google Chrome documentation][Chrome keyboard shortcuts].

[Chrome keyboard shortcuts]: https://support.google.com/chrome/answer/157179

## Tips and tricks

- **To close right tabs**—Select tabs to the right with `Tab`, `⇧ KeyS`, then close selection with `KeyX`.
- **To close other tabs**—Move the tab you want to keep to the far left with the `Home` key, then close tabs to the right.
- **To move tab groups**—Select all tabs in group with `KeyA`, then use a move action, such as `ArrowLeft` / `ArrowRight` for horizontal movements.
- **To merge windows**—Select all tabs with `⇧ KeyA`, then press the `Down` key to move selected tabs to the previous window.

For more tips, see the [Google Chrome documentation][Chrome tips].

[Chrome tips]: https://google.com/chrome/tips/
