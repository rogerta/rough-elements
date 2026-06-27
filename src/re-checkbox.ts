import { css, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { ButtonElement } from './re-button.js'
import { IconElement } from './re-icon.js'
import { fire } from './internal/re-element.js'

/**
 * Checkboxes are toggleable controls that allows the user to make a "Yes" or
 * "No" choice.  Checkboxes may be programmatically set to an indeterminate
 * states to indicate that no choice has been made.
 *
 * Because `<re-checkbox>` dervices from `<re-button>` it exposes the
 * prefix/default/suffix slots.  However the prefix slot is used to render an
 * icon that represents the yes/no/indeterminate state.  Adding more content to
 * the prefix slot may cause unexpected results.  However, the
 * prefix/label/suffix parts can still be used to style the corresponding
 * slot content.
 *
 * @cssproperty --color - Sets the color of the text and checkbox icon.
 *    Defaults to `ButtonText`.
 */
@customElement('re-checkbox')
export class CheckboxElement extends ButtonElement {
  /**
   * True if the checkbox is "checked" and false otherwise.
   */
  @property({ type: Boolean }) checked = false

  /**
   * When true the checkbox renders in a way to indicate to the user that
   * no choice has been made.  However this has no effect on the `checked`
   * property, and programmtically the checkbox is always either checked
   * or not.
   */
  @property({ type: Boolean }) indeterminate = false

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

  override getFormValue(): string | Blob | undefined {
    return this.checked ? (this.value ?? 'on') : undefined
  }

  override firstUpdated(props: PropertyValues) {
    super.firstUpdated(props)

    // Insert a prefix to the button by adding an icon to the light DOM.
    this.prefix_ = this.ownerDocument.createElement('re-icon')
    if (this.prefix_) {
      this.prefix_.name = 'checkbox-outline-blank'
      this.prefix_.slot = 'prefix'
      this.append(this.prefix_)
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
    if (this.prefix_) {
      this.prefix_.name = this.indeterminate ? 'checkbox-indeterminate'
          : (this.checked ? 'checkbox' : 'checkbox-outline-blank')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-checkbox': CheckboxElement
  }
}
