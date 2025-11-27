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
- Includes a Vim mode and searchable command palette in the extension’s popup.
- Actions are accessible using text input, keyboard shortcuts or mouse clicks.

###### What is Shortcuts _not_?

Here are some features that Shortcuts won’t implement.

- Vim-like keyboard shortcuts outside the popup.
- Custom actions.
- Link hinting. See the excellent [Link Hints] extension.

[Link Hints]: https://lydell.github.io/LinkHints/

## Installation

### Chrome Web Store

[Add to Chrome](https://chromewebstore.google.com/detail/shortcuts/kblochbjinbdokphljadjabpkbcibenj)

### Nightly builds

Download the [Nightly builds].

[Nightly builds]: https://github.com/taupiqueur/chrome-shortcuts/releases/nightly

### Build from source

Install [curl] and [Playwright] to get and build the images.

[curl]: https://curl.se
[Playwright]: https://playwright.dev

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

Shortcuts is also documented via the extension’s internal pages—Right-click the Shortcuts toolbar button
and select “Documentation”.

## Contributing

Report bugs on the [issue tracker],
ask questions on the [IRC channel],
send patches on the [mailing list].

[Issue tracker]: https://github.com/taupiqueur/chrome-shortcuts/issues
[IRC channel]: https://web.libera.chat/gamja/#taupiqueur
[Mailing list]: https://github.com/taupiqueur/chrome-shortcuts/pulls
