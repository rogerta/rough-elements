import { css, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { ButtonElement } from './re-button.js'
import { IconElement } from './re-icon.js'

@customElement('re-radio')
export class RadioElement extends ButtonElement {
  @property({ type: Boolean, reflect: true }) checked = false

  private prefix_?: IconElement

    static styles = [
      ...super.styles,
      css`
        :host(:not([disabled]):focus-within) ::slotted([slot=prefix]) {
          --color: var(--re-primary-color);
        }
      `
    ]

  override firstUpdated(props: PropertyValues) {
    super.firstUpdated(props)

    this.variant = 'text'
    this.fillStyle = 'none'
    this.borderStyle = 'none'

    // Insert a prefix to the button by adding an icon to the light DOM.
    this.prefix_ = this.ownerDocument.createElement('re-icon')
    if (this.prefix_) {
      this.prefix_.name = 'radio-button-unchecked'
      this.prefix_.slot = 'prefix'
      this.append(this.prefix_)
    }

    this.renderRoot.addEventListener('click', e => {
      if (this.disabled) {
        e.preventDefault()
        return
      }

      this.uncheckOtherRadio_()
      this.checked = true
    })

    if (this.checked) {
      this.uncheckOtherRadio_()
    }
  }

  // Uhcheck all othe radio buttons with the same name in the same root
  // as this radio button.
  private uncheckOtherRadio_() {
    const root = this.getRootNode()
    if (root instanceof ShadowRoot || root instanceof Document) {
      root.querySelectorAll('re-radio').forEach(radio => {
        if (radio !== this && radio.name === this.name) {
          radio.checked = false
        }
      })
    }
  }

  protected override updated(props: PropertyValues) {
    super.updated(props)
    if (this.prefix_) {
      this.prefix_.name = this.checked ? 'radio-button-checked'
          : 'radio-button-unchecked'
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-radio': RadioElement
  }
}
