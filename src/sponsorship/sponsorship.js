// This module contains the code for the “sponsorship.html” page,
// which communicates with the service worker via messages
// to verify a user’s sponsorship.
//
// GitHub Apps documentation: https://docs.github.com/en/apps
// GitHub Sponsors documentation: https://docs.github.com/en/sponsors

const SPONSORSHIP_VERIFICATION_ROUTE =
  '#sign_in_with_github_to_verify_your_sponsorship'

const buttonElements = document.querySelectorAll('button')
const userCodeElement = document.getElementById('user-code')
const verificationURIElement = document.getElementById('verification-uri')
const spinnerElement = document.getElementById('spinner')
const deviceFlowCompletedCheckbox = document.getElementById('device-flow-completed-checkbox')
const sponsorFlowCompletedCheckbox = document.getElementById('sponsor-flow-completed-checkbox')
const sponsorFlowCompletedPopover = document.getElementById('sponsor-flow-completed-popover')
const sponsorFlowErrorPopover = document.getElementById('sponsor-flow-error-popover')
const sponsorFlowErrorDetails = document.getElementById('sponsor-flow-error-details')

const sponsorFlowStartedAbortController = new AbortController

const port = chrome.runtime.connect({
  name: 'sponsorship',
})

port.onMessage.addListener((message) => {
  switch (message.type) {
    case 'userCode':
      userCodeElement.textContent = message.userCode
      verificationURIElement.href = message.verificationURI
      verificationURIElement.textContent = message.verificationURI
      deviceFlowCompletedCheckbox.checked = false
      sponsorFlowCompletedCheckbox.checked = false
      spinnerElement.dataset.paused = 'false'
      sponsorFlowStartedAbortController.abort(
        new Error(
          'Sponsor flow started',
        ),
      )
      break

    case 'deviceFlowCompleted':
      deviceFlowCompletedCheckbox.checked = true
      break

    case 'sponsorFlowCompleted':
      sponsorFlowCompletedCheckbox.checked = true
      spinnerElement.dataset.paused = 'true'
      showSponsorFlowCompleted()
      break

    case 'sponsorFlowAborted':
      spinnerElement.dataset.paused = 'true'
      showSponsorFlowError(
        message.reason,
      )
      break

    case 'keepAlive':
      break

    default:
      port.postMessage({
        type: 'error',
        message: 'Unknown request',
      })
  }
})

for (const buttonElement of buttonElements) {
  const actionName = buttonElement.dataset.action

  switch (actionName) {
    case 'startSponsorFlow':
      buttonElement.addEventListener(
        'click',
        () => {
          startSponsorFlow()
        },
      )
      break

    default:
      console.error(
        'Unknown action: "%s"',
        actionName,
      )
  }
}

window.addEventListener(
  'hashchange',
  () => {
    handleRoute(
      window.location.hash,
    )
  },
  {
    signal: sponsorFlowStartedAbortController.signal,
  },
)

handleRoute(
  window.location.hash,
)

/**
 * Routes sponsor flow navigation.
 *
 * @param {string} route
 * @returns {void}
 */
function handleRoute(
  route,
) {
  switch (route) {
    case SPONSORSHIP_VERIFICATION_ROUTE:
      startSponsorFlow()
      break
  }
}

/**
 * Starts sponsorship flow.
 *
 * @returns {void}
 */
function startSponsorFlow() {
  port.postMessage({
    type: 'startSponsorFlow',
  })
}

/**
 * Shows “sponsor flow completed” popover.
 *
 * @returns {void}
 */
function showSponsorFlowCompleted() {
  sponsorFlowCompletedPopover.showPopover()
}

/**
 * Shows “sponsor flow error” popover.
 *
 * @param {string} errorDetails
 * @returns {void}
 */
function showSponsorFlowError(
  errorDetails,
) {
  sponsorFlowErrorDetails.textContent = errorDetails
  sponsorFlowErrorPopover.showPopover()
}
