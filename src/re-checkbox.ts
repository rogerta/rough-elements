import { css, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { ButtonElement } from './re-button.js'
import { IconElement } from './re-icon.js'
import { fire } from './internal/re-element.js'

@customElement('re-checkbox')
export class CheckboxElement extends ButtonElement {
  @property({ type: Boolean, reflect: true }) checked = false
  @property({ type: Boolean, reflect: true }) indeterminate = false

  private caret_?: IconElement

  static styles = [
    ...super.styles,
    css`
      :host {
        --font: inherit;
      }
      :host(:not([disabled]):focus-within) ::slotted([slot=prefix]) {
        --color: var(--re-primary-color);
      }
      button {
        --text-transform: none;
      }
    `
  ]

  constructor() {
    super()
    this.variant = 'text'
    this.fillStyle = 'none'
    this.borderStyle = 'none'
  }

  override firstUpdated(props: PropertyValues) {
    super.firstUpdated(props)

    // Insert a prefix to the button by adding an icon to the light DOM.
    this.caret_ = this.ownerDocument.createElement('re-icon')
    if (this.caret_) {
      this.caret_.name = 'checkbox-outline-blank'
      this.caret_.slot = 'prefix'
      this.append(this.caret_)
    }

    this.renderRoot.addEventListener('click', e => {
      if (this.disabled) {
        e.preventDefault()
        return
      }

      this.checked = !this.checked
      this.indeterminate = false

      // TODO: from the outside these events should be fired after the click
      // event, but it seems they are fired first.  Need to investigate.
      this.updateComplete.then(() => {
        fire(this, 'input', {bubbles: true, composed: true})
        fire(this, 'change', {bubbles: true})
      })
    })
  }

  protected override updated(props: PropertyValues) {
    super.updated(props)
    if (this.caret_) {
      this.caret_.name = this.checked ? 'checkbox'
          : (this.indeterminate ? 'checkbox-indeterminate'
              : 'checkbox-outline-blank')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-checkbox': CheckboxElement
  }
}
