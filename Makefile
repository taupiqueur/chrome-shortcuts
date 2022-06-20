# General options
name = chrome-shortcuts
version = $(shell git describe --tags --always)

all: assets/chrome-logo@16px.png assets/chrome-logo@32px.png assets/chrome-logo@48px.png assets/chrome-logo@128px.png

assets/chrome-logo.svg:
	curl -sSL -z $@ --create-dirs -o $@ https://google.com/chrome/static/images/chrome-logo.svg

assets/chrome-logo@16px.png: assets/chrome-logo.svg
	inkscape $< -o $@ -w 16 -h 16

assets/chrome-logo@32px.png: assets/chrome-logo.svg
	inkscape $< -o $@ -w 32 -h 32

assets/chrome-logo@48px.png: assets/chrome-logo.svg
	inkscape $< -o $@ -w 48 -h 48

assets/chrome-logo@128px.png: assets/chrome-logo.svg
	inkscape $< -o $@ -w 128 -h 128

build: all

release: clean build
	7z a releases/$(name)-$(version).zip manifest.json src assets

clean:
	git clean -d -f -X
