import { css, html, nothing, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { live } from 'lit/directives/live.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { Mixin as BgMixin } from './internal/re-background-mixin.js'
import { Mixin as BorderMixin } from './internal/re-border-mixin.js'
import { fire, ReElement } from './internal/re-element.js'
import './re-icon-button.js'

/**
 * Input element captures text or numeric data entered by the user.
 * It supports password visibility toggle and prefix/suffix slots,
 * and draws a rough background and border.
 *
 * @cssproperty --color - Sets the color of the text and icons. Defaults to `ButtonText`.
 * @cssproperty --re-input-background-color - Sets the background color of the input control. Defaults to `ButtonFace`.
 */
@customElement('re-input')
export class InputElement extends BorderMixin(BgMixin(ReElement)) {
  /**
   * Name used when this button is part of a form submission.
   */
  @property() name = ''

  /**
   * The type of the input.
   */
  @property() type: 'date' | 'datetime-local' | 'email' | 'number' |
      'password' | 'search' | 'tel' | 'text' | 'time' | 'url' = 'text'

  @property({ reflect: true }) autocapitalize = ''
  @property({ type: Boolean, reflect: true }) autocomplete = false
  @property({ type: Boolean, reflect: true }) autofocus = false
  @property({ type: Boolean, reflect: true }) disabled = false
  @property() form = ''
  @property() list = ''
  @property({ type: Number }) max?: number
  @property({ type: Number }) maxlength?: number
  @property({ type: Number }) min?: number
  @property({ type: Number }) minlength?: number
  @property({ type: Boolean, reflect: true }) multiple = ''
  @property() placeholder = ''
  @property({ type: Boolean, reflect: true }) readonly = false
  @property({ type: Number }) step?: number = 1
  @property() value = ''

  @property({state: true}) showPassword_ = false

  constructor() {
    super()
    this.fillStyle = 'solid'
  }

  override firstUpdated(props: PropertyValues) {
    super.firstUpdated(props)
    const input = this.renderRoot.querySelector('input')
    input?.addEventListener('change', this)
    input?.addEventListener('input', this)
  }

  handleEvent(e: Event) {
    switch (e.type) {
      case 'change':
      case 'input': {
        const input = e.target as HTMLInputElement
        this.value = input.value
        break
      }
      default:
        break
    }
  }

  /**
   * Gets the input value as a number.
   *
   * @return {number | undefined} The numeric value of the input, or undefined if not a number.
   */
  get valueAsNumber() {
    const input = this.renderRoot.querySelector('input')
    return input?.valueAsNumber
  }

  /**
   * Gets the input value as a Date object.
   *
   * @return {Date | null | undefined} The date value of the input, or null/undefined if not a date.
   */
  get valueAsDate() {
    const input = this.renderRoot.querySelector('input')
    return input?.valueAsDate
  }

  override render() {
    if (this.enableDebugging) {
      console.log(`render type=${this.type}`)
    }
    return [
      this.renderRoughSvg(),
      html`
        <!-- Slot positioned before the input control. -->
        <slot name="prefix"></slot>

        <!-- The native HTML input control. -->
        <input part="input" type="${this.renderInputType_()}"
            name="${ifDefined(this.name)}"
            autocapitalize="${this.autocapitalize}"
            autocomplete="${this.autocomplete}"
            ?autofocus="${this.autofocus}"
            ?disabled="${this.disabled}"
            form="${this.form}"
            list="${this.list}"
            max="${this.max}"
            min="${this.min}"
            maxlength="${ifDefined(this.maxlength)}"
            minlength="${ifDefined(this.minlength)}"
            multiple="${this.multiple}"
            placeholder="${ifDefined(this.placeholder)}"
            ?readonly="${this.readonly}"
            step="${ifDefined(this.step)}"
            .value="${live(this.value)}"
            @change="${this.onInputChanged_}"
            />
          <!-- No need to catch and re-fire input events since they bubble
               and are composed by default. -->

        <!-- Slot positioned after the input control. Often used for suffix icons or the password visibility toggle button. -->
        <slot name="suffix">
          ${this.type === 'password'
              ? html`
                    <!-- The toggle button to show/hide password text. -->
                    <re-icon-button part="password-icon"
                    name="${this.renderPasswordIconName_()}"
                    ?disabled="${this.disabled}"
                    @click="${this.onVisibility_}"></re-icon-button>`
              : nothing }
        </slot>
      `,
    ]
  }

  private renderInputType_() {
    return this.type === 'password' && this.showPassword_ ? 'text' : this.type
  }

  private renderPasswordIconName_() {
    return this.showPassword_ ? 'visibility-off' : 'visibility'
  }

  private onVisibility_(_: Event) {
    this.showPassword_ = !this.showPassword_
  }

  onInputChanged_(e: Event) {
    fire(this, 'change')
  }

  static styles = [
    ...super.styles,
    css`
      :host {
        display: inline-flex;
        flex-direction: row;
        justify-content: start;
        align-items: center;
        color: var(--color, ButtonText);
        padding: 0.25rem 0.5rem;
        font-family: var(--re-input-font-family);
      }
      :host([disabled]) {
        opacity: 0.5;
      }

      slot[name="prefix"]::slotted(*) {
        margin-left: -0.25rem;
        margin-right: 0.25rem;
      }
      slot[name="suffix"]::slotted(*) {
        margin-left: 0.25rem;
        margin-right: -0.25rem;
      }

      input {
        border: none;
        padding: 0;
        margin: 0;
        height: min-content;
        background-color: var(--re-input-background-color, ButtonFace);
        color: inherit;
        font-family: var(--re-input-font-family);
      }
      /* Removes the focus ring only for mouse/touch interactions */
      input:focus {
        outline: none;
      }

      :host(:not([disabled]):focus-within) {
        --re-stroke-width: 2px;
      }

      #rough {
        color: inherit;
        transition: all 0.2s ease;
      }
    `,
  ]
}

declare global {
  interface HTMLElementTagNameMap {
    're-input': InputElement
  }
}
