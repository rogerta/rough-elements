import { css, html, nothing, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { live } from 'lit/directives/live.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { BackgroundMixin } from './internal/re-background-mixin.js'
import { BorderMixin } from './internal/re-border-mixin.js'
import { fire, ReElement } from './internal/re-element.js'
import { FormControlMixin } from './internal/re-form-control-mixin.js'

import './re-icon-button.js'

/**
 * Inputs collect information from the user like text, numbers, and dates.
 * The full list of supported information types is listed in the `type`
 * property.
 *
 * Inputs can optionally show an icon to the left and/or right of the input
 * area.  By default neither is shown except for the password input type which
 * shows an icon for revealing or concealing the typed password.
 *
 * `<re-input>` is meant as a drop in replacement for `<input>` for the
 * supported types.  Most of the properties listed below mirror the properties
 * of `<input>` with the same name.  Don't forget that, unlike `<input>`, a
 * closing tag `</re-input>` is required.
 *
 * `<re-input>` participates in forms just like the stardard HTML `<input>`.
 *
 * @cssproperty --color - The colour of the input text.  Defaults to
 *    `--foreground-color`.
 * @cssproperty --re-input-font-family - The font of the input text.  Defaults
 *    to `--font-sans-family`.
 * @cssproperty --re-input-background-color -  The background color of input
 *    control.  Defaults to `--background-color`.
 * @cssproperty --border-color - While used for border of `<re-input>`, this
 *    is also the default colour of any icons used as prefixes or suffixes.
 *
 * @event input - Fires when the value has been changed as a direct result of
 *    a user action.
 * @event change - Fires when the value has been changed and committed by the
 *    user. Unlike the input event, the change event is not necessarily fired
 *    for each alteration to an element's value.
 */
@customElement('re-input')
export class InputElement extends
    BorderMixin(BackgroundMixin(FormControlMixin(ReElement))) {
  static formAssociated = true

  /**
   * Name used when this button is part of a form submission.
   */
  @property({}) name = ''

  /**
   * The type of the input.
   */
  @property({}) type: 'date' | 'datetime-local' | 'email' | 'number' |
      'password' | 'search' | 'tel' | 'text' | 'time' | 'url' = 'text'

  /**
   * Controls whether inputted text is automatically capitalized and, if so,
   * in what manner. See the [autocapitalize](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/autocapitalize)
   * global attribute page for more information.
   */
  @property({ reflect: true }) autocapitalize = ''

  /**
   * A space-separated string that describes what, if any, type of autocomplete
   * functionality the input should provide. A typical implementation of
   * autocomplete recalls previous values entered in the same input field, but
   * more complex forms of autocomplete can exist.
   */
  @property({ type: Boolean, reflect: true }) autocomplete = false

  /**
   * Controls whether automatic spelling correction and processing of text is
   * enabled while the user is editing this textarea.
   */
  @property({ type: Boolean, reflect: true }) autocorrect = true

  /**
   * If present, indicates that the input should automatically have focus when
   * the page has finished loading (or when the `<dialog>` containing the
   * element has been displayed).
   */
  @property({ type: Boolean, reflect: true }) autofocus = false

  /**
   * If true the input does not respond to user actions.  Disabled inputs are
   * not sumbitted as part of a form.
   */
  @property({ type: Boolean, reflect: true }) disabled = false

  /**
   * ID attribute of the `<datalist>` of autocomplete options.  It must be
   * in the same shadow root or light DOM as the `<re-input>` element.
   */
  @property() list = ''

  /**
   * The input’s maximum value. Only applies to date and number input types.
   */
  @property({ type: Number }) max?: number

  /**
   * Maximum length (number of characters) of value.
   */
  @property({ type: Number }) maxlength?: number

  /**
   * The input’s maximum value. Only applies to date and number input types.
   */
  @property({ type: Number }) min?: number

  /**
   * Minimum length (number of characters) of value.
   */
  @property({ type: Number }) minlength?: number

  /**
   * Regular expression pattern that `value` must match to be valid.
   */
  @property({}) pattern?: string

  /**
   * Text that appears in the form control when it has no value set.
   */
  @property() placeholder = ''

  /**
   * Boolean. Whether to allow multiple values.
   */
  @property({ type: Boolean, reflect: true }) multiple = ''

  /**
   * Boolean. The value is not editable.
   */
  @property({ type: Boolean, reflect: true }) readonly = false

  /**
   * If true, the checkbox must be checked before its form can be submitted.
   */
  @property({ type: Boolean }) required? = false

  /**
   * Incremental values that are valid.
   */
  @property({ type: Number }) step? = 1

  /**
   * The value of the control. When specified in the HTML, corresponds to the
   * initial value.
   */
  @property() value = ''

  @property({ state: true }) private showPassword_ = false

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
   * @return The numeric value of the input, or undefined if not a number.
   */
  get valueAsNumber(): number | undefined {
    const input = this.renderRoot.querySelector('input')
    return input?.valueAsNumber
  }

  /**
   * Gets the input value as a Date object.
   *
   * @return The date value of the input, or null/undefined if not a date.
   */
  get valueAsDate(): Date | null | undefined {
    const input = this.renderRoot.querySelector('input')
    return input?.valueAsDate
  }

  protected override updated(props: PropertyValues) {
    super.updated(props)
    if (props.has('value')) {
      this.setFormValue(this.value)

      const input = this.renderRoot.querySelector('input')
      this.setValidity(input?.validity ?? {}, input?.validationMessage,
          input ?? undefined)
    }
  }

  override render() {
    if (this.enableDebugging) {
      console.log(`render type=${this.type}`)
    }

    // No need to catch and re-fire `input` events since they bubble
    // and are composed by default.  Only the `change` event is caught and
    // re-fired.
    return [
      this.renderRoughSvg(),
      html`
        <!-- Content before the input control.  If needed this is usually
             filled with an icon. -->
        <slot name="prefix"></slot>

        <!-- The native HTML \`<input>\` control. -->
        <input part="input" type="${this.renderInputType_()}"
            name="${ifDefined(this.name)}"
            autocapitalize="${this.autocapitalize}"
            autocomplete="${this.autocomplete}"
            autocorrect="${this.autocorrect ? 'on' : 'off'}"
            ?autofocus="${this.autofocus}"
            ?disabled="${this.disabled}"
            list="${this.list}"
            max="${this.max}"
            min="${this.min}"
            maxlength="${ifDefined(this.maxlength)}"
            minlength="${ifDefined(this.minlength)}"
            multiple="${this.multiple}"
            pattern="${ifDefined(this.pattern)}"
            placeholder="${ifDefined(this.placeholder)}"
            ?readonly="${this.readonly}"
            ?required="${ifDefined(this.required)}"
            step="${ifDefined(this.step)}"
            .value="${live(this.value)}"
            @change="${this.onInputChanged_}"
            />

        <!-- Content after the input control.  If needed this is usually
             filled with an icon.  Note that password input types already fill
             this slot by default with an icon to reveal or conceal the
             typed password. -->
        <slot name="suffix">
          ${this.type === 'password'
              ? html`
                    <!-- The toggle button to reveal/conceal password text. -->
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

  private onInputChanged_(_: Event) {
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
        color: var(--color);
        padding: 0.25rem 0.5rem;
      }
      :host([disabled]) {
        opacity: 0.5;
      }

      slot[name="prefix"]::slotted(*) {
        margin-left: -0.25rem;
        margin-right: 0.25rem;
        --color: var(--border-color);
      }
      slot[name="suffix"]::slotted(*) {
        margin-left: 0.25rem;
        margin-right: -0.25rem;
        --color: var(--border-color);
      }

      input {
        border: none;
        padding: 0;
        margin: 0;
        height: min-content;
        background-color: var(--re-input-background-color);
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
