# Manual

## Usage

- Press `Alt+Space` (`Ctrl+Space` on Windows) to open the extension’s popup.
- Navigate to `chrome://extensions/shortcuts` to configure keyboard shortcuts.
You can for example bind `Ctrl+Y` to open a new tab to the right, `Ctrl+B` to duplicate the current tab,
or change the default shortcut—to open the popup—to `Alt+J`.
You can also configure the popup keys by importing and exporting settings in the **Options** page.

### In practice?

`Alt+J` / `Alt+K` are the main keyboard shortcuts I use for navigating to open Shortcuts and click using [Link Hints].

[Link Hints]: https://lydell.github.io/LinkHints/

Finally, to complement the built-in keyboard shortcuts,
I’ve configured `Ctrl+Y` to open a new tab to the right, `Ctrl+B` to duplicate the current tab, `Alt+W` to web search selected text, `Alt+Y` to copy URLs, and `Alt+I` to focus text fields.

## Commands

[Commands] are actions that can be performed with keyboard shortcuts or mouse clicks in the extension’s popup.

[Commands]: https://developer.chrome.com/docs/extensions/reference/commands/

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

### Navigation

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`goBack` | Go back to the previous page in tab’s history | `⌥ ←` | `⌘ [`, `⌘ ←` | `BracketLeft`, `⌥ KeyH`
`goForward` | Go forward to the next page in tab’s history | `⌥ →` | `⌘ ]`, `⌘ →` | `BracketRight`, `⌥ KeyL`
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
`focusInput` | Focus the first input | | | `KeyI`
`focusTextArea` | Focus the first text area | | | `⇧ KeyI`
`focusVideo` | Focus the first video | | | `KeyV`
`blurElement` | Blur the active element | | | `⇧ Escape`

### Clipboard

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`copyURL` | Copy URL of selected tabs | | | `KeyY`
`copyTitle` | Copy title of selected tabs | | | `⌥ KeyY`
`copyTitleAndURL` | Copy title and URL of selected tabs | | | `⇧ KeyY`

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
`scrollToTop` | Scroll to the top of the page | `↖` | `↖` | `KeyG`
`scrollToBottom` | Scroll to the bottom of the page | `↘` | `↘` | `KeyE`, `⇧ KeyG`

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
`openNewTab` | Open and activate a new tab | `⌃ T` | `⌘ T` | `KeyO`, `⇧ KeyT`
`openNewTabRight` | Open and activate a new tab to the right | | | `KeyT`
`openNewWindow` | Open a new window | `⌃ N` | `⌘ N` | `KeyN`
`openNewIncognitoWindow` | Open a new window in Incognito mode | `⌃ ⇧ N` | `⇧ ⌘ N` | `⇧ KeyN`

### Close tabs

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`closeTab` | Close selected tabs | `⌃ W` | `⌘ W` | `KeyX`
`closeWindow` | Close the window that contains the tab | `⌃ ⇧ W` | `⇧ ⌘ W` | `⇧ KeyX`
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
`sortTabsByURL` | Sort tabs by URL | | | `⇧ Digit1`
`groupTabsByDomain` | Group tabs by domain | | | `⇧ Digit2`

### Manage tab groups

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`renameTabGroupPrompt` | Rename tab group | | | `⌥ ⇧ KeyP`
`cycleTabGroupColorForward` | Cycle forward through tab group colors | | | `⌥ KeyA`
`cycleTabGroupColorBackward` | Cycle backward through tab group colors | | | `⌥ ⇧ KeyA`

### Switch tabs

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`focusAudibleTab` | Activate the first audible tab | | | `⇧ Digit3`
`focusNextTab` | Activate the next open tab | `⌃ ⇥`, `⌃ ⇟` | `⌃ ⇥`, `⌥ ⌘ →` | `Tab`, `⌥ KeyK`
`focusPreviousTab` | Activate the previous open tab | `⌃ ⇧ ⇥`, `⌃ ⇞` | `⌃ ⇧ ⇥`, `⌥ ⌘ ←` | `⇧ Tab`, `⌥ KeyJ`
`focusFirstTab` | Activate the leftmost open tab | `⌃ 1` | `⌘ 1` | `Digit1`
`focusSecondTab` | Activate the second leftmost open tab | `⌃ 2` | `⌘ 2` | `Digit2`
`focusThirdTab` | Activate the third leftmost open tab | `⌃ 3` | `⌘ 3` | `Digit3`
`focusFourthTab` | Activate the fourth leftmost open tab | `⌃ 4` | `⌘ 4` | `Digit4`
`focusFifthTab` | Activate the fifth leftmost open tab | `⌃ 5` | `⌘ 5` | `Digit5`
`focusSixthTab` | Activate the sixth leftmost open tab | `⌃ 6` | `⌘ 6` | `Digit6`
`focusSeventhTab` | Activate the seventh leftmost open tab | `⌃ 7` | `⌘ 7` | `Digit7`
`focusEighthTab` | Activate the eighth leftmost open tab | `⌃ 8` | `⌘ 8` | `Digit8`
`focusLastTab` | Activate the rightmost open tab | `⌃ 9` | `⌘ 9` | `Digit9`
`focusNextWindow` | Activate the next window | | | `KeyW`
`focusPreviousWindow` | Activate the previous window | | | `⇧ KeyW`

### Move tabs

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`grabTab` | Grab selected tabs | | | `⌥ KeyG`
`moveTabLeft` | Move selected tabs left | `⌃ ⇧ ⇞` | `⌃ ⇧ ⇞` | `ArrowLeft`
`moveTabRight` | Move selected tabs right | `⌃ ⇧ ⇟` | `⌃ ⇧ ⇟` | `ArrowRight`
`moveTabFirst` | Move selected tabs to the far left | | | `Home`
`moveTabLast` | Move selected tabs to the far right | | | `End`
`moveTabNewWindow` | Move selected tabs to a new window | | | `ArrowUp`
`moveTabPreviousWindow` | Move selected tabs to the previous window | | | `ArrowDown`

### Select tabs

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`selectTab` | Deselect all other tabs | | | `KeyS`
`selectPreviousTab` | Select the previous tab | | | `BracketLeft`
`selectNextTab` | Select the next tab | | | `BracketRight`
`selectRelatedTabs` | Select related tabs | | | `Backquote`
`selectTabsInGroup` | Select tabs in group | | | `KeyA`
`selectAllTabs` | Select all tabs | | | `⇧ KeyA`
`selectRightTabs` | Select tabs to the right | | | `⇧ KeyS`
`flipTabSelection` | Flip tab selection | | | `⌥ Tab`

**Tip**: Selecting tabs in group can be used for ungrouped tabs.

### Folders

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`openDownloadsFolder` | Open the **Downloads** folder | | | `⌃ KeyK`

### Chrome URLs

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`openHistoryPage` | Open the **History** page | `⌃ H` | `⌘ Y` | `⌃ KeyH`
`openDownloadsPage` | Open the **Downloads** page | `⌃ J` | `⌥ ⌘ L` | `⌃ KeyJ`
`openBookmarksPage` | Open the **Bookmarks** page | `⌃ ⇧ O` | `⌥ ⌘ B` | `⌃ KeyO`
`openSettingsPage` | Open the **Settings** page | | `⌘ ,` | `Comma`
`openPasswordsPage` | Open the **Passwords** page | | | `⌃ KeyY`
`openSearchEnginesPage` | Open the **Search engines** page | | | `⌃ Slash`
`openExtensionsPage` | Open the **Extensions** page | | | `⌃ KeyA`
`openShortcutsPage` | Open the **Extensions > Keyboard shortcuts** page | | | `⇧ Equal`
`openExperimentsPage` | Open the **Experiments** page | | | `⌃ Comma`

### Popup

These commands are only available in the extension’s popup.

Command | Description | Windows and Linux key | macOS key | Popup key
--- | --- | --- | --- | ---
`closePopup` | Close the popup window | | | `Escape`, `KeyQ`

For more keyboard shortcuts, see the [Google Chrome documentation][Chrome keyboard shortcuts].

[Chrome keyboard shortcuts]: https://support.google.com/chrome/answer/157179
