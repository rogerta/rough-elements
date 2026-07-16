import { css, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { IconElement } from './re-icon.js'
import { ButtonBaseElement } from './internal/re-button-base.js'
import { fire } from './internal/re-element.js'

/**
 * Checkboxes are toggleable controls that allows the user to make "Yes" or
 * "No" choices.  Checkboxes may be programmatically set to an indeterminate
 * states to indicate that no choice has been made.
 *
 * The checkbox `prefix` slot is used internally to render an icon that
 * represents the yes/no/indeterminate state.  Adding more content to this
 * slot may cause unexpected results.  It's possible to style the icon using
 * CSS like the following:
 * ```
 *  re-checkbox#myid [slot=prefix] {
 *    --color: purple;
 *    transition: transform 0.75s ease;
 *  }
 *  re-checkbox#myid[checked] [slot=prefix] {
 *    --color: pink;
 *    transform: rotate(1turn);
 *  }
 * ```
 * `<re-checkbox>` participates in forms just like the stardard HTML
 * `<input type="checkbox"/>`.
 *
 * @cssproperty --color - The colour of the checkbox icon.
 *    Defaults to `--primary-color`.
 *
 * @event input - Fires when the value has been changed as a direct result of
 *    a user action to checking or uncheck the checkbox.
 * @event change - Fires when the value has been changed and committed by the
 *    user. Unlike the input event, the change event is not necessarily fired
 *    for each alteration to an element's value.
 */
@customElement('re-checkbox')
export class CheckboxElement extends ButtonBaseElement {
  static formAssociated = true

  /**
   * True if the checkbox is "checked" and false otherwise.
   */
  @property({ type: Boolean, reflect: true }) checked = false

  /**
   * When true the checkbox renders in a way to indicate to the user that
   * no choice has been made.  However this has no effect on the `checked`
   * property, and programmtically the checkbox is always either checked
   * or not.
   */
  @property({ type: Boolean }) indeterminate = false

  /**
   * If true, the checkbox must be checked before its form can be submitted.
   */
  @property({ type: Boolean }) required = false

  /**
   * Value to be returned for this checkbox when its form is submitted.  If
   * no value is specified, the default value of "on" is used.  If the checkbox
   * is not checked, no value is submitted.
   */
  @property({}) value?: string

  private prefix_?: IconElement

  static styles = [
    ...super.styles,
    css`
      :host {
        padding: 0.25rem 0.5rem;
      }
      /* This does not set the font-weight to bold since that affects the
       * width of the control, which is annoying. */
      :host(:not([disabled]):focus-within) button {
        text-shadow: 0.5px 0 0 currentcolor, -0.5px 0 0 currentcolor;
      }

      :host(:not([disabled]):active) button,
      :host(:not([disabled]).is-active) button {
        transform: scale(0.9);
      }

      :host([checked]) slot[name=prefix]::slotted(*) {
        --color: var(--primary-color);
      }

      slot[name=suffix]::slotted(*) {
        margin-right: -0.25rem;
      }

      button {
        background-color: transparent;
      }
    `
  ]

  constructor() {
    super()
    this.fillStyle = 'none'
    this.borderStyle = 'none'
  }

  private validate_() {
    const validity: ValidityStateFlags = {}
    let message: string | undefined
    if (this.required && !this.checked) {
      validity.valueMissing = true
      message = 'Must be checked'
    }
    const anchor = this.renderRoot.querySelector('button')
    this.setValidity(validity, message, anchor ?? undefined)
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

    if (props.has('checked')) {
      this.setFormValue(this.checked ? (this.value ?? 'on') : null)
      this.validate_()
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-checkbox': CheckboxElement
  }
}
