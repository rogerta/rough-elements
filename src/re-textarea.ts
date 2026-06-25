import { css, html, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { Mixin as BgMixin } from './internal/re-background-mixin.js'
import { Mixin as BorderMixin } from './internal/re-border-mixin.js'
import { fire, ReElement } from './internal/re-element.js'
import './re-icon-button.js'

/**
 * TextArea element captures multi-line text data entered by the user.
 * It draws a rough background and border.
 *
 * @cssproperty --color - The text color. Defaults to `ButtonText`.
 * @cssproperty --re-input-background-color - The background color of the textarea control. Defaults to `ButtonFace`.
 */
@customElement('re-textarea')
export class TextAreaElement extends BorderMixin(BgMixin(ReElement)) {
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
  @property({ type: Boolean, reflect: true }) autocorrect = false
  @property({ type: Boolean, reflect: true }) autofocus = false
  @property({ type: Number }) cols = 20
  @property({ type: Boolean, reflect: true }) disabled = false
  @property() form = ''
  @property({ type: Number }) maxlength?: number
  @property({ type: Number }) minlength?: number
  @property() placeholder = ''
  @property({ type: Boolean, reflect: true }) readonly = false
  @property({ type: Number }) rows = 2

  @property({state: true}) showPassword_ = false

  /**
   * Gets the value of the textarea control.
   *
   * @return {string} The text content of the textarea.
   */
  get value() {
    const textarea = this.renderRoot.querySelector('textarea')
    return textarea?.value ?? ''
  }

  /**
   * Sets the value of the textarea control.
   *
   * @param {string} text - The text content to set.
   */
  set value(text: string) {
    const textarea = this.renderRoot.querySelector('textarea')
    if (textarea) {
      textarea.value = text
    }
  }

  constructor() {
    super()
    this.fillStyle = 'solid'
  }

  override firstUpdated(props: PropertyValues) {
    super.firstUpdated(props)
    const textarea = this.renderRoot.querySelector('textarea')
    textarea?.addEventListener('blur', this)
    textarea?.addEventListener('change', this)
    textarea?.addEventListener('input', this)
    this.setInitialValueFromSlot_()
  }

  handleEvent(e: Event) {
    switch (e.type) {
      case 'blur':
        // TODO: fire only if the textarea was changed.
        fire(this, 'change', {bubbles: true})
        break
      case 'change':
      case 'input': {
        const ta = e.target as HTMLTextAreaElement
        this.value = ta.value
        break
      }
      default:
        break
    }
  }

  private setInitialValueFromSlot_() {
    const slot =
        this.renderRoot.querySelector<HTMLSlotElement>('#hiddenslot slot')
    const nodes = slot?.assignedNodes()
    if (nodes) {
      const text = nodes.reduce(
          (acc, node) => acc + (node.textContent?.trim() ?? ''), '')
      const ta = this.renderRoot.querySelector('textarea')
      if (ta) {
        ta.value = text
      }
    }
  }

  override render() {
    if (this.enableDebugging) {
      console.log(`render type=${this.type}`)
    }
    return [
      this.renderRoughSvg(),
      html`
        <!-- Slot positioned before the textarea. -->
        <slot name="prefix"></slot>

        <!-- The native HTML textarea control. -->
        <textarea part="textarea"
            name="${ifDefined(this.name)}"
            autocapitalize="${this.autocapitalize}"
            autocomplete="${this.autocomplete}"
            ?autocorrect="${this.autocorrect}"
            ?autofocus="${this.autofocus}"
            cols="${this.cols}"
            ?disabled="${this.disabled}"
            form="${this.form}"
            maxlength="${ifDefined(this.maxlength)}"
            minlength="${ifDefined(this.minlength)}"
            placeholder="${ifDefined(this.placeholder)}"
            ?readonly="${this.readonly}"
            ></textarea>

        <!-- Slot positioned after the textarea. Often used for suffix icons. -->
        <slot name="suffix"></slot>
        <!-- Internal slot used to capture initial child text node value. -->
        <div id="hiddenslot"><slot></slot></div>
      `,
    ]
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
        padding: 0.25rem 0 0.25rem 0.5rem;
      }
      :host([disabled]) {
        opacity: 0.5;
      }
      :host(:not([disabled]):focus-within) {
        --re-stroke-width: 2px;
      }

      slot[name="prefix"]::slotted(*) {
        margin-left: -0.25rem;
        margin-right: 0.25rem;
      }
      slot[name="suffix"]::slotted(*) {
        margin-left: 0.25rem;
        margin-right: 0.25rem;
      }

      textarea {
        border: none;
        padding: 0;
        margin: 0;
        height: min-content;
        background-color: var(--re-input-background-color, ButtonFace);
        color: inherit;
      }
      /* Removes the focus ring only for mouse/touch interactions */
      textarea:focus {
        outline: none;
      }

      #hiddenslot {
        display: none;
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
    're-textarea': TextAreaElement
  }
}
