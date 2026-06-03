import { css, html, nothing, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { live } from 'lit/directives/live.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { Mixin as BgMixin } from './re-background-mixin.js'
import { Mixin as BorderMixin } from './re-border-mixin.js'
import { ReElement } from './re-element.js'
import './re-icon-button.js'

// Some useful info that needs to be documented:
//
// --color CSS prop sets the color of the icon.
// --re-primary-color CSS prop sets the hover color.
/**
 * The Input element captures data entered by the user.
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

  @property() autocapitalize = ''
  @property({ type: Boolean }) autocomplete = false
  @property({ type: Boolean }) autofocus = false
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

  override firstUpdated(props: PropertyValues) {
    super.firstUpdated(props)
    this.fillStyle = 'solid'
    const input = this.renderRoot.querySelector('input')
    input?.addEventListener('blur', this)
    input?.addEventListener('change', this)
    input?.addEventListener('input', this)
  }

  handleEvent(e: Event) {
    switch (e.type) {
      case 'blur':
        this.classList.remove('is-active')
        break
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

  get valueAsNumber() {
    const input = this.renderRoot.querySelector('input')
    return input?.valueAsNumber
  }

  get valueAsDate() {
    const input = this.renderRoot.querySelector('input')
    return input?.valueAsDate
  }

  protected override updated(_: PropertyValues) {
    ;['prefix', 'suffix'].forEach(part => {
      const slot =
          this.renderRoot.querySelector<HTMLSlotElement>(`slot[part=${part}]`)!
      const hasChildren = slot.assignedNodes({flatten: true}).length > 0
      if (this.enableDebugging) {
        console.log(`type=${this.type} part=${part} hc=${hasChildren}`)
      }
      slot.classList.toggle('hidden', !hasChildren)
    })
  }

  override render() {
    if (this.enableDebugging) {
      console.log(`render type=${this.type}`)
    }
    return [
      this.renderRoughSvg(),
      html`
        <!-- The element that prefixes the input control. -->
        <slot class="hidden" name="prefix" part="prefix"></slot>

        <!-- The input control. -->
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
            @input="${this.onInputChanged_}"
            />

        <!-- The element that suffixes the input control. -->
        <slot class="hidden" name="suffix" part="suffix">
          ${this.type === 'password'
              ? html`<re-icon-button name="${this.renderPasswordIconName_()}"
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
        --border-color: ButtonBorder;
        --background-color: canvas;
        padding: 0.25rem 0.5rem;
      }
      :host([disabled]) {
        opacity: 0.5;
      }

      slot.hidden {
        display: none;
      }
      slot[name="prefix"] {
        margin-left: -0.25rem;
        margin-right: 0.25rem;
      }
      slot[name="suffix"] {
        margin-left: 0.25rem;
        margin-right: -0.25rem;
      }

      input {
        border: none;
        padding: 0;
        margin: 0;
        height: min-content;
        background: transparent;
        color: inherit;
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
