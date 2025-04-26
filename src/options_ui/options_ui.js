// This module contains the code to set the HTML document
// to be opened as an options page.

const port = chrome.runtime.connect({
  name: 'options_ui'
})

port.onMessage.addListener((message) => {
  switch (message.type) {
    case 'optionsPage':
      window.location.href = message.optionsPage
      break
  }
})
