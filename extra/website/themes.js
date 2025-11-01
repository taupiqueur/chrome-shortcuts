const extensionIdElement = document.getElementById('extension-id')
const themeSyncErrorPopover = document.getElementById('theme-sync-error-popover')
const themeSyncErrorDetails = document.getElementById('theme-sync-error-details')

import basicTheme from './basic_theme.json' with {
  type: 'json'
}

import classicTheme from './classic_theme.json' with {
  type: 'json'
}

import theWorldTheme from './the_world_theme.css' with {
  type: 'css'
}

const themeRadioButtons = document.querySelectorAll(`
  input[type="radio"][name="theme"]
`)

for (const themeRadioButton of themeRadioButtons) {
  themeRadioButton.addEventListener('change', () => {
    switch (themeRadioButton.value) {
      case 'basic':
        sendThemeSyncMessage(
          basicTheme.popupStyleSheet
        ).catch(
          showThemeSyncError
        )
        break

      case 'classic':
        sendThemeSyncMessage(
          classicTheme.popupStyleSheet
        ).catch(
          showThemeSyncError
        )
        break

      case 'the-world': {
        const popupStyleSheet = []

        for (const cssRule of theWorldTheme.cssRules) {
          popupStyleSheet.push(
            cssRule.cssText
          )
        }

        sendThemeSyncMessage(
          popupStyleSheet
        ).catch(
          showThemeSyncError
        )
        break
      }
    }
  })
}

async function sendThemeSyncMessage(popupStyleSheet) {
  await chrome.runtime.sendMessage(extensionIdElement.value, {
    type: 'themeSync',
    popupStyleSheet
  })
}

function showThemeSyncError(errorDetails) {
  themeSyncErrorDetails.textContent = errorDetails
  themeSyncErrorPopover.showPopover()
}
