# Privacy

## Single purpose

Performs common tasks with your keyboard.

## Permission justification

Permission | Justification
--- | ---
[`"activeTab"`] | This permission is used in conjunction with the `"scripting"` permission for commands interacting with web pages, and commands requiring some context about the current URL, such as opening Chrome pages, to fill the “New Tab” page slot.
[`"bookmarks"`] | This permission is used to save your tabs and current session as bookmarks, and get bookmark suggestions.
[`"clipboardRead"`] | This permission is used for opening new tabs from the system clipboard. Without this permission, a runtime permission is asked for every new site you use the command.
[`"clipboardWrite"`] | This permission is used for the “Clipboard” commands. Without this permission, a runtime permission is asked for every new site you use the commands.
[`"contextMenus"`] | This permission is used to add the “Documentation” and “Support Chat” buttons to the Shortcuts toolbar.
[`"debugger"`] | This permission is used to save pages as PNG, JPEG or WebP.
[`"downloads"`] | This permission is used to save your tabs, open the “Downloads” folder, get and activate download suggestions.
[`"history"`] | This permission is used to get recently visited page suggestions.
[`"management"`] | This permission is used to get installed extension suggestions.
[`"notifications"`] | This permission is used to give users feedback after copying text and creating bookmarks.
[`"offscreen"`] | This permission is used to retrieve keyboard layout maps to augment command bindings with shortcuts in the “Extension shortcuts” interface.
[`"pageCapture"`] | This permission is used to save pages as MHTML.
[`"readingList"`] | This permission is used to add tabs to your reading list and get reading list suggestions.
[`"scripting"`] | This permission is used to interact with web pages and write text to the system clipboard.
[`"search"`] | This permission is used to perform a web search.
[`"sessions"`] | This permission is used to reopen closed tabs, get and activate recently closed and synced tab suggestions.
[`"storage"`] | This permission is used to save your options and persist some states in memory, related to the MRU, localization, and command bindings.
[`"tabGroups"`] | This permission is used to manage tab groups and determine whose tabs are hidden. The latter is used for many tab-related commands, to do the correct action (e.g., to “Activate the next open tab”, we skip tabs in collapsed groups).
[`"tabs"`] | This permission is used to access the `url` and `title` properties of tabs in the currently focused window (e.g., to “Copy title and URL of selected tabs”, “Sort selected tabs by URL” or “Save the current session as bookmarks”) and get open tab suggestions.
[`"webNavigation"`] | This permission is used for the “sticky popup” functionality. Specifically, `chrome.webNavigation.onCommitted` is used to eliminate a race condition for commands causing a web navigation, to reopen the extension’s popup after it goes away (e.g., to “Go back to the previous page in tab’s history”). We want to make sure the navigation is committed when the command resolves, so that we can reopen the popup afterwards.
[`"host_permissions"`] | This permission is used to keep access to the `chrome.scripting` API after reopening the extension’s popup programmatically. In many cases, the `"activeTab"` permission has been revoked due to a web navigation or tab activation. Such permission enables users, e.g., to scroll down after activating the next tab from the extension’s popup.

[`"activeTab"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#activeTab
[`"bookmarks"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#bookmarks
[`"clipboardRead"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#clipboardRead
[`"clipboardWrite"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#clipboardWrite
[`"contextMenus"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#contextMenus
[`"debugger"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#debugger
[`"downloads"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#downloads
[`"history"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#history
[`"management"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#management
[`"notifications"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#notifications
[`"offscreen"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#offscreen
[`"pageCapture"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#pageCapture
[`"readingList"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#readingList
[`"scripting"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#scripting
[`"search"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#search
[`"sessions"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#sessions
[`"storage"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#storage
[`"tabGroups"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#tabGroups
[`"tabs"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#tabs
[`"webNavigation"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#webNavigation
[`"host_permissions"`]: https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions#host-permissions

Learn more about [CWS Dashboard Privacy].

[CWS Dashboard Privacy]: https://developer.chrome.com/docs/webstore/cws-dashboard-privacy
