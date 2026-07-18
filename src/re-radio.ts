import { css, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { fire } from './internal/re-element.js'
import { ButtonBaseElement } from './internal/re-button-base.js'

import { IconElement } from './re-icon.js'

/**
 * Radio elements are a control that allows users to choose a single option
 * from a group of related options.  All radio buttons with the same `name`
 * (and importantly in the same shadow root or light DOM) are part of the same
 * group.
 *
 * When a radio button is checked in order to choose that option, all other
 * radio buttons in the same group are automatically unchecked.
 *
 * The `--border-color` CSS property is used as the default colour of any icons
 * used as prefixes or suffixes.  See the next paragraph on how to override
 * this default behaviour.
 *
 * The radio button `prefix` slot is used internally to render an icon that
 * represents the chosen or not state. Adding more content to this slot may
 * cause unexpected results.  It's possible to style the icon using
 * CSS like the following:
 * ```
 *  re-radio#myid [slot=prefix] {
 *    --color: purple;
 *    transition: transform 0.75s ease;
 *  }
 *  re-radio#myid[checked] [slot=prefix] {
 *    --color: pink;
 *    transform: rotate(1turn);
 *  }
 * ```
 * `<re-radio>` participates in forms just like the stardard HTML
 * `<input type="radio"/>`.
 *
 * @cssproperty --color - The colour of the radio button text.
 *    Defaults to `--primary-color`.
 * @cssproperty --re-input-font-family - The font of the radio button text.
 *    Defaults to `--font-sans-family`.
 * @cssproperty --hover-shadow-color - The colour of shadow used when the
 *    button is hovered.
 *
 * @event change - Fires when the value has been changed and committed by the
 *    user. Unlike the input event, the change event is not necessarily fired
 *    for each alteration to an element's value.
 */
@customElement('re-radio')
export class RadioElement extends ButtonBaseElement {
  static formAssociated = true

  /**
   * True if the radio button is "checked" and false otherwise.
   */
  @property({ type: Boolean, reflect: true }) checked = false

  /**
   * If true, the radio button must be checked before its form can be submitted.
   * Note that only one radio button of any group with the given name can and
   * needs to be checked.
   */
  @property({ type: Boolean }) required = false

  /**
   * Value to be returned for this radio button when its form is submitted.  If
   * no value is specified, the default value of "on" is used.  If the radio
   * button is not checked, no value is submitted.
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
      let atLeastOneChecked = false
      this.forEachOtherRadio_(radio => atLeastOneChecked ||= radio.checked)

      if (!atLeastOneChecked) {
        validity.valueMissing = true
        message = `At least one "${this.name}" radio button must be chosen`
      }
    }

    const anchor = this.renderRoot.querySelector('button')
    this.setValidity(validity, message, anchor ?? undefined)
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
      this.forEachOtherRadio_(radio => radio.checked = false)
    }

    // If this radio button is required but not checked, make sure to set
    // its validity to invalid.
    if (this.required && !this.checked) {
      this.validate_()
    }
  }

  private forEachOtherRadio_(cb: (radio: RadioElement) => void) {
    const root = this.getRootNode()
    if (root instanceof ShadowRoot || root instanceof Document) {
      root.querySelectorAll('re-radio').forEach(radio => {
        if (radio !== this && radio.name === this.name) {
          cb(radio)
        }
      })
    }
  }

  protected override updated(props: PropertyValues<this>) {
    super.updated(props)
    if (this.prefix_) {
      this.prefix_.name = this.checked ? 'radio-button-checked'
          : 'radio-button-unchecked'
    }

    if (props.has('checked') && this.checked) {
      this.forEachOtherRadio_(radio => radio.checked = false)
      this.setFormValue(this.value ?? 'on')
      this.validate_()
      this.forEachOtherRadio_(radio => radio.validate_())
    }
  }
}
