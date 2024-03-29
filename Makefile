# General options
name = chrome-shortcuts
version = $(shell git describe --tags --always)

all: assets/shortcuts-logo@16px.png assets/shortcuts-logo@32px.png assets/shortcuts-logo@48px.png assets/shortcuts-logo@128px.png

assets/shortcuts-logo@16px.png: assets/shortcuts-logo.svg
	inkscape $< -o $@ -w 16 -h 16

assets/shortcuts-logo@32px.png: assets/shortcuts-logo.svg
	inkscape $< -o $@ -w 32 -h 32

assets/shortcuts-logo@48px.png: assets/shortcuts-logo.svg
	inkscape $< -o $@ -w 48 -h 48

assets/shortcuts-logo@128px.png: assets/shortcuts-logo.svg
	inkscape $< -o $@ -w 128 -h 128

build: all
	npm install

release: clean build
	7z a releases/$(name)-$(version).zip manifest.json src assets

clean:
	git clean -d -f -X
