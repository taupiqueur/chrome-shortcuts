// This module contains the service worker for the “sponsorship.html” page,
// which communicates with the page via messages
// to verify a user’s sponsorship.
//
// GitHub Apps documentation: https://docs.github.com/en/apps
// GitHub Sponsors documentation: https://docs.github.com/en/sponsors

/**
 * @typedef {object} SponsorFlowContext
 * @property {string} clientId
 * @property {Set<string>} maintainerLogins
 * @property {(accessToken: string) => void} onDeviceFlowCompleted
 * @property {() => void} onSponsorFlowCompleted
 */

/**
 * @typedef {StartSponsorFlowMessage} SponsorFlowMessage
 *
 * @typedef {object} StartSponsorFlowMessage
 * @property {"startSponsorFlow"} type
 */

/**
 * @typedef {object} DeviceCodeResponse
 * @property {string} device_code
 * @property {string} user_code
 * @property {string} verification_uri
 * @property {number} expires_in
 * @property {number} interval
 */

/**
 * @typedef {object} AccessTokenResponse
 * @property {string} access_token
 */

/**
 * @typedef {object} ViewerInfo
 * @property {string} viewerLogin
 * @property {number} sponsorshipCount
 */

const KEEP_ALIVE_INTERVAL = 29_000

const API_REQUEST_INTERVAL = 5_000

const API_REQUEST_TIMEOUT = 900_000

/**
 * Handles a new connection, when opening the “sponsorship.html” page.
 *
 * @param {chrome.runtime.Port} port
 * @param {SponsorFlowContext} cx
 * @returns {void}
 */
function onConnect(
  port,
  cx,
) {
  const abortController = new AbortController

  const abortSignal = abortController.signal

  const keepAliveIntervalId = setInterval(
    () => {
      port.postMessage({
        type: 'keepAlive',
      })
    },
    KEEP_ALIVE_INTERVAL,
  )

  port.onDisconnect.addListener((port) => {
    onDisconnect(
      port,
      abortController,
      keepAliveIntervalId,
    )
  })

  port.onMessage.addListener((message, port) => {
    onMessage(
      message,
      port,
      abortSignal,
      cx,
    )
  })
}

/**
 * Handles disconnection, when closing the “sponsorship.html” page.
 *
 * @param {chrome.runtime.Port} port
 * @param {AbortController} abortController
 * @param {number} keepAliveIntervalId
 * @returns {void}
 */
function onDisconnect(
  port,
  abortController,
  keepAliveIntervalId,
) {
  abortController.abort(
    new Error(
      'Sponsorship page closed',
    ),
  )

  clearInterval(
    keepAliveIntervalId,
  )
}

/**
 * Handles messages from the “sponsorship.html” page.
 *
 * @param {SponsorFlowMessage} message
 * @param {chrome.runtime.Port} port
 * @param {AbortSignal} signal
 * @param {SponsorFlowContext} cx
 * @returns {void}
 */
function onMessage(
  message,
  port,
  signal,
  cx,
) {
  switch (message.type) {
    case 'startSponsorFlow':
      startSponsorFlow(
        port,
        signal,
        cx,
      ).catch(
        showSponsorFlowError.bind(
          null,
          port,
        ),
      )
      break

    default:
      port.postMessage({
        type: 'error',
        message: 'Unknown request',
      })
  }
}

/**
 * Starts sponsorship flow.
 *
 * @param {chrome.runtime.Port} port
 * @param {AbortSignal} signal
 * @param {SponsorFlowContext} cx
 * @returns {Promise<void>}
 */
async function startSponsorFlow(
  port,
  signal,
  cx,
) {
  const deviceCode = await requestDeviceCode({
    clientId: cx.clientId,
    signal,
  })

  port.postMessage({
    type: 'userCode',
    userCode: deviceCode.user_code,
    verificationURI: deviceCode.verification_uri,
  })

  const accessToken = await pollForToken({
    clientId: cx.clientId,
    deviceCode: deviceCode.device_code,
    interval: deviceCode.interval * 1_000,
    signal: AbortSignal.any([
      signal,
      AbortSignal.timeout(
        deviceCode.expires_in * 1_000,
      ),
    ]),
  })

  cx.onDeviceFlowCompleted(
    accessToken.access_token,
  )

  port.postMessage({
    type: 'deviceFlowCompleted',
  })

  const viewerLogin = await getViewerLogin({
    accessToken: accessToken.access_token,
    signal,
  })

  if (!cx.maintainerLogins.has(viewerLogin)) {
    await pollForSponsorship({
      accessToken: accessToken.access_token,
      maintainerLogins: Array.from(
        cx.maintainerLogins,
      ),
      interval: API_REQUEST_INTERVAL,
      signal: AbortSignal.any([
        signal,
        AbortSignal.timeout(
          API_REQUEST_TIMEOUT,
        ),
      ]),
    })
  }

  cx.onSponsorFlowCompleted()

  port.postMessage({
    type: 'sponsorFlowCompleted',
  })
}

/**
 * Retrieves device code.
 *
 * @param {object} properties
 * @param {string} properties.clientId
 * @param {AbortSignal} [properties.signal]
 * @returns {Promise<DeviceCodeResponse>}
 */
async function requestDeviceCode({
  clientId,
  signal,
}) {
  const response = await fetch('https://github.com/login/device/code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
    }),
    signal,
  })

  if (!response.ok) {
    throw new Error(
      `Response status: ${response.status}`,
    )
  }

  return response.json()
}

/**
 * Polls GitHub’s access token endpoint at a specified interval
 * until the user approves access.
 *
 * @param {object} properties
 * @param {string} properties.clientId
 * @param {string} properties.deviceCode
 * @param {number} properties.interval
 * @param {AbortSignal} [properties.signal]
 * @returns {Promise<AccessTokenResponse>}
 */
async function pollForToken({
  clientId,
  deviceCode,
  interval,
  signal,
}) {
  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      device_code: deviceCode,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
    }),
    signal,
  })

  if (!response.ok) {
    throw new Error(
      `Response status: ${response.status}`,
    )
  }

  const data = await response.json()

  if (data.error) {
    switch (data.error) {
      case 'authorization_pending':
        await new Promise((resolve) => {
          setTimeout(
            resolve,
            interval,
          )
        })

        return pollForToken({
          clientId,
          deviceCode,
          interval,
          signal,
        })

      case 'slow_down': {
        const newInterval = data.interval * 1_000

        await new Promise((resolve) => {
          setTimeout(
            resolve,
            newInterval,
          )
        })

        return pollForToken({
          clientId,
          deviceCode,
          interval: newInterval,
          signal,
        })
      }

      case 'access_denied':
        throw new Error(
          `access_denied: ${data.error_description}`,
        )

      case 'expired_token':
        throw new Error(
          `expired_token: ${data.error_description}`,
        )

      default:
        throw new Error(
          `${data.error}: ${data.error_description}`,
        )
    }
  }

  return data
}

/**
 * Polls GitHub’s GraphQL endpoint at a specified interval
 * until the user’s sponsorship has been verified.
 *
 * @param {object} properties
 * @param {string} properties.accessToken
 * @param {string[]} properties.maintainerLogins
 * @param {number} properties.interval
 * @param {AbortSignal} [properties.signal]
 * @returns {Promise<void>}
 */
async function pollForSponsorship({
  accessToken,
  maintainerLogins,
  interval,
  signal,
}) {
  const sponsorshipCount = await getSponsorshipCount({
    accessToken,
    maintainerLogins,
    signal,
  })

  if (sponsorshipCount < 1) {
    await new Promise((resolve) => {
      setTimeout(
        resolve,
        interval,
      )
    })

    return pollForSponsorship({
      accessToken,
      maintainerLogins,
      interval,
      signal,
    })
  }
}

/**
 * Retrieves the viewer’s login.
 *
 * @param {object} properties
 * @param {string} properties.accessToken
 * @param {AbortSignal} [properties.signal]
 * @returns {Promise<string>}
 */
async function getViewerLogin({
  accessToken,
  signal,
}) {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query {
          viewer {
            login
          }
        }
      `,
    }),
    signal,
  })

  if (!response.ok) {
    throw new Error(
      `Response status: ${response.status}`,
    )
  }

  const data = await response.json()

  if (data.errors) {
    const errorDetails = data.errors[0]

    throw new Error(
      `${errorDetails.type}: ${errorDetails.message}`,
    )
  }

  return data.data.viewer.login
}

/**
 * Retrieves the viewer’s sponsorship count for the specified maintainers.
 *
 * @param {object} properties
 * @param {string} properties.accessToken
 * @param {string[]} properties.maintainerLogins
 * @param {AbortSignal} [properties.signal]
 * @returns {Promise<number>}
 */
async function getSponsorshipCount({
  accessToken,
  maintainerLogins,
  signal,
}) {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query(
          $maintainerLogins: [String!]
        ) {
          viewer {
            sponsorshipsAsSponsor(
              maintainerLogins: $maintainerLogins
            ) {
              totalCount
            }
          }
        }
      `,
      variables: {
        maintainerLogins,
      },
    }),
    signal,
  })

  if (!response.ok) {
    throw new Error(
      `Response status: ${response.status}`,
    )
  }

  const data = await response.json()

  if (data.errors) {
    const errorDetails = data.errors[0]

    throw new Error(
      `${errorDetails.type}: ${errorDetails.message}`,
    )
  }

  return data.data.viewer.sponsorshipsAsSponsor.totalCount
}

/**
 * Retrieves the viewer’s information.
 *
 * @param {object} properties
 * @param {string} properties.accessToken
 * @param {string[]} properties.maintainerLogins
 * @param {AbortSignal} [properties.signal]
 * @returns {Promise<ViewerInfo>}
 */
async function getViewerInfo({
  accessToken,
  maintainerLogins,
  signal,
}) {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: `
        query(
          $maintainerLogins: [String!]
        ) {
          viewer {
            login
            sponsorshipsAsSponsor(
              maintainerLogins: $maintainerLogins
            ) {
              totalCount
            }
          }
        }
      `,
      variables: {
        maintainerLogins,
      },
    }),
    signal,
  })

  if (!response.ok) {
    throw new Error(
      `Response status: ${response.status}`,
    )
  }

  const data = await response.json()

  if (data.errors) {
    const errorDetails = data.errors[0]

    throw new Error(
      `${errorDetails.type}: ${errorDetails.message}`,
    )
  }

  return {
    viewerLogin: data.data.viewer.login,
    sponsorshipCount: data.data.viewer.sponsorshipsAsSponsor.totalCount,
  }
}

/**
 * Sends a message to the “sponsorship.html” page
 * that indicates the abort reason.
 *
 * @param {chrome.runtime.Port} port
 * @param {Error} errorDetails
 * @returns {void}
 */
function showSponsorFlowError(
  port,
  errorDetails,
) {
  port.postMessage({
    type: 'sponsorFlowAborted',
    reason: errorDetails.toString(),
  })
}

export default {
  onConnect,
  getViewerInfo,
}
