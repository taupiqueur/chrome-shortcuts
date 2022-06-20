import * as actions from './actions.js'

const buttonElements = document.querySelectorAll('button')

// Handles a single action.
async function handleAction(actionName) {
  await actions[actionName]()
}

// Add action to buttons.
for (const buttonElement of buttonElements) {
  const actionName = buttonElement.dataset.action
  buttonElement.addEventListener('click', handleAction.bind(null, actionName))
}
