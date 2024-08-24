// This module contains the service worker for man pages.
//
// Service workers: https://developer.chrome.com/docs/extensions/develop/concepts/service-workers
// Long-lived connections: https://developer.chrome.com/docs/extensions/develop/concepts/messaging#connect

const KEEP_ALIVE_INTERVAL = 29000
const { TAB_GROUP_ID_NONE } = chrome.tabGroups

/**
 * Handles a new connection when opening man pages.
 *
 * @param {chrome.runtime.Port} port
 * @returns {void}
 */
function onConnect(port) {
  const keepAliveIntervalId = setInterval(() => {
    port.postMessage({
      type: 'keepAlive'
    })
  }, KEEP_ALIVE_INTERVAL)
  port.onDisconnect.addListener((port) => {
    onDisconnect(port, keepAliveIntervalId)
  })
  port.onMessage.addListener(onMessage)
}

/**
 * Handles disconnection by clearing the keep-alive interval.
 *
 * @param {chrome.runtime.Port} port
 * @param {number} keepAliveIntervalId
 * @returns {void}
 */
function onDisconnect(port, keepAliveIntervalId) {
  clearInterval(keepAliveIntervalId)
}

/**
 * Handles message by using a discriminator field. Each message has a `type` field,
 * and the rest of the fields, and their meaning, depend on its value.
 *
 * https://crystal-lang.org/api/master/JSON/Serializable.html#discriminator-field
 *
 * @param {object} message
 * @param {chrome.runtime.Port} port
 * @returns {void}
 */
function onMessage(message, port) {
  switch (message.type) {
    case 'openNewTab':
      openNewTabRight(port.sender.tab.id, message.url)
      break

    default:
      port.postMessage({
        type: 'error',
        message: 'Unknown request'
      })
  }
}

/**
 * Opens and activates a new tab to the right.
 *
 * @param {number} openerTabId
 * @param {string} url
 * @returns {Promise<void>}
 */
async function openNewTabRight(openerTabId, url) {
  const openerTab = await chrome.tabs.get(openerTabId)
  const createdTab = await chrome.tabs.create({
    active: true,
    url,
    index: openerTab.index + 1,
    openerTabId,
    windowId: openerTab.windowId
  })

  if (openerTab.groupId !== TAB_GROUP_ID_NONE) {
    await chrome.tabs.group({
      groupId: openerTab.groupId,
      tabIds: [
        createdTab.id
      ]
    })
  }
}

export default { onConnect }
