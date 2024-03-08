# Privacy

## Single purpose

Performs common tasks with your keyboard.

## Permission justification

Permission | Justification
--- | ---
[`"activeTab"`] | This permission is used in conjunction with the `"scripting"` permission for commands interacting with web pages, and commands requiring some context about the current URL, such as opening Chrome pages, to fill the “New Tab” page slot.
[`"bookmarks"`] | This permission is used to save your tabs and current session as bookmarks.
[`"clipboardWrite"`] | This permission is used for the “Clipboard” commands. Without this permission, a runtime permission is asked for every new site you use the commands.
[`"downloads"`] | This permission is used to open the “Downloads” folder.
[`"notifications"`] | This permission is used to give users feedback after copying text and creating bookmarks.
[`"readingList"`] | This permission is used to add tabs to your reading list.
[`"scripting"`] | This permission is used to interact with web pages and write text to the system clipboard.
[`"search"`] | This permission is used to perform a web search.
[`"sessions"`] | This permission is used to reopen closed tabs.
[`"storage"`] | This permission is used to save your options and persist some states in memory, related to the MRU and the popup interface.
[`"tabGroups"`] | This permission is used to manage tab groups and determine whose tabs are hidden. The latter is used for many tab-related commands, to do the correct action (e.g., to “Activate the next open tab”, we skip tabs in collapsed groups).
[`"tabs"`] | This permission is used to access the `url` and `title` properties of tabs in the currently focused window (e.g., to “Copy title and URL of selected tabs”, “Sort selected tabs by URL” or “Save the current session as bookmarks”).
[`"webNavigation"`] | This permission is used for the “sticky popup” functionality. Specifically, `chrome.webNavigation.onCommitted` is used to eliminate a race condition for commands causing a web navigation, to reopen the extension’s popup after it goes away (e.g., to “Go back to the previous page in tab’s history”). We want to make sure the navigation is committed when the command resolves, so that we can reopen the popup afterwards.
[`"host_permissions"`] | This permission is used to keep access to the `chrome.scripting` API after reopening the extension’s popup programmatically. In many cases, the `"activeTab"` permission has been revoked due to a web navigation or tab activation. Such permission enables users, e.g., to scroll down after activating the next tab from the extension’s popup.

[`"activeTab"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#activeTab
[`"bookmarks"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#bookmarks
[`"clipboardWrite"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#clipboardWrite
[`"downloads"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#downloads
[`"notifications"`]: https://developer.chrome.com/docs/extensions/reference/permissions-list#notifications
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
