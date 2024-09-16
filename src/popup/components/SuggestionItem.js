// This module defines a custom suggestion element.

const suggestionTypeDisplay = {
  openTab: 'Open tab',
  closedTab: 'Recently closed',
  syncedTab: 'Synced tab',
  bookmark: 'Bookmark',
  readingList: 'Reading list',
  history: 'Recently visited',
  download: 'Download',
}

const templateElement = document.createElement('template')

templateElement.innerHTML = `
  <span part="label">
    <slot name="label"></slot>
  </span>
  <span part="title">
    <slot name="title"></slot>
  </span>
  <span part="domain">
    <slot name="domain"></slot>
  </span>
`

/**
 * @extends {HTMLElement}
 */
class SuggestionItem extends HTMLElement {
  constructor() {
    super()

    this.attachShadow({
      mode: 'open'
    })

    this.shadowRoot.append(
      templateElement.content.cloneNode(true)
    )

    this.slotElements = this.shadowRoot.querySelectorAll('slot')
  }

  connectedCallback() {
    for (const slotElement of this.slotElements) {
      for (const slottedElement of slotElement.assignedElements()) {
        slottedElement.remove()
      }
    }

    const labelElement = document.createElement('span')
    labelElement.slot = 'label'
    labelElement.textContent = suggestionTypeDisplay[this.dataset.type]

    const titleElement = document.createElement('span')
    titleElement.slot = 'title'
    titleElement.textContent = this.dataset.title

    const domainElement = document.createElement('span')
    domainElement.slot = 'domain'
    domainElement.textContent = new URL(this.dataset.url).hostname

    this.append(labelElement, ' ', titleElement, ' ', domainElement)
  }
}

customElements.define('suggestion-item', SuggestionItem)

export default SuggestionItem
