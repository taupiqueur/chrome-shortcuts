chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'keyboardLayout':
      navigator.keyboard.getLayoutMap()
        .then(Object.fromEntries)
        .then(sendResponse)
        .catch((error) => {
          console.error(
            'Cannot get keyboard layout map.',
            error
          )
          sendResponse({})
        })
      return true
  }
})
