# General options
name = chrome-shortcuts
version = $(shell git describe --tags --always)

all: assets/shortcuts-logo@16px.png assets/shortcuts-logo@32px.png assets/shortcuts-logo@48px.png assets/shortcuts-logo@128px.png assets/keyboard_codes_alphanumeric.svg extra/chrome-web-store/assets/shortcuts-screenshot-01.png extra/chrome-web-store/assets/shortcuts-screenshot-02.png extra/chrome-web-store/assets/shortcuts-screenshot-03.png extra/chrome-web-store/assets/shortcuts-small-promo-tile.png extra/chrome-web-store/assets/shortcuts-marquee-promo-tile.png extra/chrome-web-store/assets/shortcuts-screenshot-01.fr.png extra/chrome-web-store/assets/shortcuts-screenshot-02.fr.png extra/chrome-web-store/assets/shortcuts-screenshot-03.fr.png

assets/shortcuts-logo@16px.png: assets/shortcuts-logo.svg svg-converter/node_modules
	node svg-converter/svg-converter.js $< $@ 16 16

assets/shortcuts-logo@32px.png: assets/shortcuts-logo.svg svg-converter/node_modules
	node svg-converter/svg-converter.js $< $@ 32 32

assets/shortcuts-logo@48px.png: assets/shortcuts-logo.svg svg-converter/node_modules
	node svg-converter/svg-converter.js $< $@ 48 48

assets/shortcuts-logo@128px.png: assets/shortcuts-logo.svg svg-converter/node_modules
	node svg-converter/svg-converter.js $< $@ 128 128

assets/keyboard_codes_alphanumeric.svg:
	curl -sSL -z $@ --create-dirs -o $@ https://w3c.github.io/uievents-code/images/keyboard-codes-alphanum1.svg

extra/chrome-web-store/assets/shortcuts-screenshot-01.png: extra/chrome-web-store/assets/shortcuts-screenshot-01.svg extra/chrome-web-store/assets/screenshot_2025-01-07_11-47-29.png svg-converter/node_modules
	node svg-converter/svg-converter.js $< $@ 1280 800

extra/chrome-web-store/assets/screenshot_2025-01-07_11-47-29.png:
	curl -sSL -z $@ --create-dirs -o $@ https://raw.githubusercontent.com/taupiqueur/chrome-shortcuts/d1f20daf47f5f89caa7fdd780b29e69e4c5e7169/screenshot_2025-01-07_11:47:29.png

extra/chrome-web-store/assets/shortcuts-screenshot-02.png: extra/chrome-web-store/assets/shortcuts-screenshot-02.svg extra/chrome-web-store/assets/screenshot_2025-01-07_11-51-16.png svg-converter/node_modules
	node svg-converter/svg-converter.js $< $@ 1280 800

extra/chrome-web-store/assets/screenshot_2025-01-07_11-51-16.png:
	curl -sSL -z $@ --create-dirs -o $@ https://raw.githubusercontent.com/taupiqueur/chrome-shortcuts/d1f20daf47f5f89caa7fdd780b29e69e4c5e7169/screenshot_2025-01-07_11:51:16.png

extra/chrome-web-store/assets/shortcuts-screenshot-03.png: extra/chrome-web-store/assets/shortcuts-screenshot-03.svg extra/chrome-web-store/assets/screenshot_2025-01-07_19-37-31.png svg-converter/node_modules
	node svg-converter/svg-converter.js $< $@ 1280 800

extra/chrome-web-store/assets/screenshot_2025-01-07_19-37-31.png:
	curl -sSL -z $@ --create-dirs -o $@ https://raw.githubusercontent.com/taupiqueur/chrome-shortcuts/d1f20daf47f5f89caa7fdd780b29e69e4c5e7169/screenshot_2025-01-07_19:37:31.png

extra/chrome-web-store/assets/shortcuts-small-promo-tile.png: extra/chrome-web-store/assets/shortcuts-small-promo-tile.svg svg-converter/node_modules
	node svg-converter/svg-converter.js $< $@ 440 280

extra/chrome-web-store/assets/shortcuts-marquee-promo-tile.png: extra/chrome-web-store/assets/shortcuts-marquee-promo-tile.svg svg-converter/node_modules
	node svg-converter/svg-converter.js $< $@ 1400 560

extra/chrome-web-store/assets/shortcuts-screenshot-01.fr.png: extra/chrome-web-store/assets/shortcuts-screenshot-01.fr.svg extra/chrome-web-store/assets/screenshot_2025-03-26_10-46-39.png svg-converter/node_modules
	node svg-converter/svg-converter.js $< $@ 1280 800

extra/chrome-web-store/assets/screenshot_2025-03-26_10-46-39.png:
	curl -sSL -z $@ --create-dirs -o $@ https://raw.githubusercontent.com/taupiqueur/chrome-shortcuts/d1f20daf47f5f89caa7fdd780b29e69e4c5e7169/screenshot_2025-03-26_10:46:39.png

extra/chrome-web-store/assets/shortcuts-screenshot-02.fr.png: extra/chrome-web-store/assets/shortcuts-screenshot-02.fr.svg extra/chrome-web-store/assets/screenshot_2025-03-26_12-25-43.png svg-converter/node_modules
	node svg-converter/svg-converter.js $< $@ 1280 800

extra/chrome-web-store/assets/screenshot_2025-03-26_12-25-43.png:
	curl -sSL -z $@ --create-dirs -o $@ https://raw.githubusercontent.com/taupiqueur/chrome-shortcuts/d1f20daf47f5f89caa7fdd780b29e69e4c5e7169/screenshot_2025-03-26_12:25:43.png

extra/chrome-web-store/assets/shortcuts-screenshot-03.fr.png: extra/chrome-web-store/assets/shortcuts-screenshot-03.fr.svg extra/chrome-web-store/assets/screenshot_2025-03-26_12-43-35.png svg-converter/node_modules
	node svg-converter/svg-converter.js $< $@ 1280 800

extra/chrome-web-store/assets/screenshot_2025-03-26_12-43-35.png:
	curl -sSL -z $@ --create-dirs -o $@ https://raw.githubusercontent.com/taupiqueur/chrome-shortcuts/d1f20daf47f5f89caa7fdd780b29e69e4c5e7169/screenshot_2025-03-26_12:43:35.png

build: all
	npm install

release: clean build
	7z a releases/$(name)-$(version).zip manifest.json src assets _locales

clean:
	git clean -d -f -X

svg-converter/node_modules:
	cd svg-converter && npm install
