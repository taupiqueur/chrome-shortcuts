// This module contains the “options_ui” service worker
// to set the HTML document to be opened as an options page.
//
// Embedded options: https://developer.chrome.com/docs/extensions/develop/ui/options-page#embedded_options
// Service workers: https://developer.chrome.com/docs/extensions/develop/concepts/service-workers
// Long-lived connections: https://developer.chrome.com/docs/extensions/develop/concepts/messaging#connect

/**
 * @typedef {object} OptionsUIContext
 * @property {string} optionsPage
 */

/**
 * Handles a new connection when opening the “options_ui” page.
 *
 * @param {chrome.runtime.Port} port
 * @param {OptionsUIContext} cx
 * @returns {void}
 */
function onConnect(port, cx) {
  port.postMessage({
    type: 'optionsPage',
    optionsPage: cx.optionsPage,
  })
}

export default { onConnect }
