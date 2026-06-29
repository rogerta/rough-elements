import { css, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { ButtonElement } from './re-button.js'
import { IconElement } from './re-icon.js'
import { fire } from './internal/re-element.js'

/**
 * Radio element is a toggleable control that allows users to select a single option
 * from a group of named options. It inherits from ButtonElement and manages group selection.
 *
 * @cssproperty --color - Sets the color of the text and radio button icon. Defaults to `ButtonText`.
 */
@customElement('re-radio')
export class RadioElement extends ButtonElement {
  @property({ type: Boolean, reflect: true }) checked = false
  @property({ type: Boolean }) required? = false

  private prefix_?: IconElement

  static styles = [
    ...super.styles,
    css`
      :host(:not([disabled]):focus-within) button {
        font-weight: bold;
      }
      button {
        background-color: transparent;
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

  private validate_(isRequired: boolean) {
    const validity: ValidityStateFlags = {}
    let message: string | undefined
    if (isRequired && !this.checked) {
      validity.valueMissing = true
      message = 'Must be checked'
    }
    this.setValidity(validity, message)
  }

  override firstUpdated(props: PropertyValues) {
    super.firstUpdated(props)

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

      this.checked = true
      fire(this, 'change', {bubbles: true})
    })

    if (this.checked) {
      this.uncheckOtherRadio_()
    }
  }

  // Uhcheck all othe radio buttons with the same name in the same root
  // as this radio button.  As a side effect, returns a boolean indicating
  // whether this radio group is required or not.
  private uncheckOtherRadio_() {
    const root = this.getRootNode()
    let isRequired = false
    if (root instanceof ShadowRoot || root instanceof Document) {
      root.querySelectorAll('re-radio').forEach(radio => {
        if (radio !== this && radio.name === this.name) {
          radio.checked = false
          isRequired ||= radio.required ?? false
        }
      })
    }

    return isRequired
  }

  protected override updated(props: PropertyValues<this>) {
    super.updated(props)
    if (this.prefix_) {
      this.prefix_.name = this.checked ? 'radio-button-checked'
          : 'radio-button-unchecked'
    }

    if (props.has('checked') && this.checked) {
      const isRequired = this.uncheckOtherRadio_()
      this.setFormValue(this.value ?? 'on')
      this.validate_(isRequired)
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-radio': RadioElement
  }
}
