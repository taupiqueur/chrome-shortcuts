# Shortcuts for Chrome

Shortcuts is a browser extension that lets you perform common tasks with your keyboard.

## Features

- Lets you bind actions to keyboard shortcuts by using the native [Commands UI].
- Actions can be performed with keyboard shortcuts or mouse clicks in the extension’s popup.
- Implements a self-contained “Vim” mode in the extension’s popup.
[Content scripts] are not injected into every tab, and you can skim through Chrome URLs in the tab strip.

[Commands UI]: https://developer.chrome.com/docs/extensions/mv3/user_interface/#commands
[Content scripts]: https://developer.chrome.com/docs/extensions/mv3/content_scripts/

###### What is Shortcuts _not_?

Here are some features that Shortcuts won’t implement.

- Vim-like keyboard shortcuts outside the popup.
- Custom actions.
- Link hinting. See the excellent [Link Hints] extension.

[Link Hints]: https://lydell.github.io/LinkHints/

## Installation

**Experimental**: Requires [Chrome Dev] or [Chrome Canary] with **Experimental JavaScript** features enabled—tweakable at `chrome://flags/#enable-javascript-harmony`—for sticky popup and grouping tabs.

[Chrome Dev]: https://google.com/chrome/dev/
[Chrome Canary]: https://google.com/chrome/canary/

### Nightly builds

Download the [Nightly builds].

[Nightly builds]: https://github.com/taupiqueur/chrome-shortcuts/releases/nightly

### Build from source

Install [curl] and [Inkscape] to get and build the images.

[curl]: https://curl.se
[Inkscape]: https://inkscape.org

``` sh
git clone https://github.com/taupiqueur/chrome-shortcuts.git
cd chrome-shortcuts
make build
```

### Load an unpacked extension

1. Navigate to `chrome://extensions`.
2. Enable **Developer mode**.
3. Click **Load unpacked** and select the extension directory.

## Documentation

See the [manual] for setup and usage instructions.

[Manual]: docs/manual.md
