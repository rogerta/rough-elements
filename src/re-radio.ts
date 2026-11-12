/**
 * Radio elements are a control that allows users to choose a single option
 * from a group of related options.  All radio buttons with the same `name`
 * (and importantly in the same shadow root or light DOM) are part of the same
 * group.
 * @module
 */

import { css, CSSResult, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { ButtonBaseElement } from './internal/re-button-base.ts'
import { fire } from './internal/re-element.ts'

import type { IconElement } from './re-icon.ts'
import './re-icon.ts'

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
 *    transition-property: transform, scale;
 *    transition-duration: 0.75s;
 *  }
 *  re-radio#myid[checked] [slot=prefix] {
 *    --color: pink;
 *    transform: rotate(1turn);
 *  }
 * ```
 * `<re-radio>` participates in forms just like the stardard HTML
 * `<input type="radio"/>`.
 *
 * NOTE: It's important to include "scale" in the `transition-property` list
 * since the radio icon is scaled down when the radio button is clicked.  If
 * scale is not included, the icon will not scale on click.
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
// The default of the `checked` property and of the initial checked state
// captured on first render must always be the same.
const DEFAULT_CHECKED = false

@customElement('re-radio')
export class RadioElement extends ButtonBaseElement {
  static formAssociated = true

  /**
   * True if the radio button is "checked" and false otherwise.
   */
  @property({ type: Boolean, reflect: true })
  accessor checked: boolean = DEFAULT_CHECKED

  /**
   * If true, the radio button must be checked before its form can be submitted.
   * Note that only one radio button of any group with the given name can and
   * needs to be checked.
   */
  @property({ type: Boolean })
  accessor required = false

  /**
   * Value to be returned for this radio button when its form is submitted.  If
   * no value is specified, the default value of "on" is used.  If the radio
   * button is not checked, no value is submitted.
   */
  @property({})
  accessor value: string | undefined = undefined

  private prefix_?: IconElement

  /** The checked state of the element when it was first rendered. */
  private initialChecked_ = DEFAULT_CHECKED

  static styles: CSSResult[] = [
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

      :host slot[name=prefix]::slotted(*),
      :host slot[name=suffix]::slotted(*) {
        transition-property: scale;
        transition-duration: 0.2s;
        transition-timing-function: ease;
      }

      :host(:not([disabled]):active) slot[name=prefix]::slotted(*),
      :host(:not([disabled]).is-active) slot[name=prefix]::slotted(*) {
        scale: 0.9;
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
    `,
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

    // The error bubble is anchored to the inner button, and not the host,
    // because the host is not focusable.  The browser uses the anchor as both
    // the target of the bubble and of the focus when interactive validation
    // fails.  As required by the spec, the anchor is within this element's
    // shadow tree, so the encapsulation of the form identity is maintained.
    const anchor = this.renderRoot.querySelector('button')
    this.setValidity(validity, message, anchor ?? undefined)
  }

  override firstUpdated(props: PropertyValues): void {
    super.firstUpdated(props)

    // Capture the initial checked state before it can be changed, so the
    // form reset lifecycle callback can restore it later.
    this.initialChecked_ = this.checked

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
      fire(this, 'change', { bubbles: true })
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

  protected override updated(props: PropertyValues<this>): void {
    super.updated(props)
    if (this.prefix_) {
      this.prefix_.name = this.checked
        ? 'radio-button-checked'
        : 'radio-button-unchecked'
    }

    if (props.has('checked')) {
      // Only a radio that becomes checked makes the other radios in its
      // group unchecked and revalidates them directly.  Unchecked radios
      // take care of themselves below: otherwise a radio that becomes
      // unchecked would keep the form value it had while it was checked,
      // and the group would submit multiple entries under the same name.
      if (this.checked) {
        this.forEachOtherRadio_(radio => radio.checked = false)
      }

      this.setFormValue(this.checked ? (this.value ?? 'on') : null)
      this.validate_()

      if (this.checked) {
        this.forEachOtherRadio_(radio => radio.validate_())
      }
    }
  }

  protected override onFormReset_(): void {
    // The updated() method restores the form value when the checked property
    // changes, whether it is checked or unchecked.
    this.checked = this.initialChecked_
  }

  protected override onFormStateRestore_(
    state: FormData | File | string | null,
  ): void {
    // The state saved by the browser for a radio button is the value
    // submitted when it is checked, or null when it is not checked.  The
    // updated() method restores the form value when the checked property
    // changes.
    this.checked = state === (this.value ?? 'on')
  }
}
