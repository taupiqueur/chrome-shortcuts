# Shortcuts for Chrome

<img src="assets/shortcuts-logo.svg" alt="" width="96" height="96" align="left">

Shortcuts is a browser extension that lets you perform common tasks with your keyboard.

**[Documentation] | [Changelog] | [Contributing]**

**[Add to Chrome]**

[Documentation]: docs/manual.md
[Changelog]: CHANGELOG.md
[Contributing]: CONTRIBUTING.md
[Add to Chrome]: https://chromewebstore.google.com/detail/shortcuts/kblochbjinbdokphljadjabpkbcibenj

## Features

- Lets you bind actions to keyboard shortcuts by using the “Extension shortcuts” interface.
- Actions can be performed with keyboard shortcuts or mouse clicks in the extension’s popup.
- Implements a self-contained “Vim” mode in the extension’s popup.

###### What is Shortcuts _not_?

Here are some features that Shortcuts won’t implement.

- Vim-like keyboard shortcuts outside the popup.
- Custom actions.
- Link hinting. See the excellent [Link Hints] extension.

[Link Hints]: https://lydell.github.io/LinkHints/

## Installation

> [!IMPORTANT]
> Requires [Chrome Dev] or [Chrome Canary] for sticky popup—to keep the popup open after entering a command.
> See https://issues.chromium.org/issues/40057101 for more information.

[Chrome Dev]: https://google.com/chrome/dev/
[Chrome Canary]: https://google.com/chrome/canary/

### Chrome Web Store

[Add to Chrome](https://chromewebstore.google.com/detail/shortcuts/kblochbjinbdokphljadjabpkbcibenj)

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
2. Enable “Developer mode”.
3. Click “Load unpacked” and select the extension directory.

## Documentation

See the [manual] for setup and usage instructions.

[Manual]: docs/manual.md

## Contributing

Report bugs on the [issue tracker],
ask questions on the [IRC channel],
send patches on the [mailing list].

[Issue tracker]: https://github.com/taupiqueur/chrome-shortcuts/issues
[IRC channel]: https://web.libera.chat/gamja/#taupiqueur
[Mailing list]: https://github.com/taupiqueur/chrome-shortcuts/pulls
