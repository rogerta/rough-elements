import { css, html, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { BackgroundMixin } from './internal/re-background-mixin.js'
import { BorderMixin } from './internal/re-border-mixin.js'
import { fire, ReElement } from './internal/re-element.js'
import { FormControlMixin } from './internal/re-form-control-mixin.js'

import './re-icon-button.js'

/**
 * TextAreas collect multi-line text data entered by the user.
 *
 * Text areas can optionally show an icon to the left and/or right of the input
 * area.  By default neither is shown.
 *
 * `<re-textarea>` is meant as a drop in replacement for `<textarea>`.  Most of
 * the properties listed below mirror the properties of `<textarea>` with the
 * same name.

 * `<re-textarea>` participates in forms just like the stardard HTML
 * `<textarea>`.
 */
@customElement('re-textarea')
export class TextAreaElement extends
    BorderMixin(BackgroundMixin(FormControlMixin(ReElement))) {
  static formAssociated = true

  /**
   * Name used when this button is part of a form submission.
   */
  @property() name = ''

  /**
   * The type of the input.
   */
  @property() type: 'date' | 'datetime-local' | 'email' | 'number' |
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
   * The visible width of the text control, in average character widths. If it
   * is specified, it must be a positive integer.
   */
  @property({ type: Number }) cols = 20

  /**
   * If true the input does not respond to user actions.  Disabled inputs are
   * not sumbitted as part of a form.
   */
  @property({ type: Boolean, reflect: true }) disabled = false

  /**
   * Maximum length (number of characters) of value.
   */
  @property({ type: Number }) maxlength?: number

  /**
   * Minimum length (number of characters) of value.
   */
  @property({ type: Number }) minlength?: number

  /**
   * Text that appears in the form control when it has no value set.
   */
  @property() placeholder = ''

  /**
   * Boolean. The value is not editable.
   */
  @property({ type: Boolean, reflect: true }) readonly = false

  /**
   * If true, the checkbox must be checked before its form can be submitted.
   */
  @property({ type: Boolean }) required? = false

  /**
   * The number of visible text lines for the control. If it is specified, it
   * must be a positive integer.
   */
  @property({ type: Number }) rows = 2

  /**
   * The value of the control.
   */
  @property({}) value = ''

  // /**
  //  * Sets the value of the textarea control.
  //  *
  //  * @param text - The text content to set.
  //  */
  // @property({})
  // set value(text: string) {
  //   const textarea = this.renderRoot.querySelector('textarea')
  //   if (textarea) {
  //     textarea.value = text
  //   }
  // }

  // /**
  //  * Gets the value of the textarea control.
  //  *
  //  * @return The text content of the textarea.
  //  */
  // get value() {
  //   const textarea = this.renderRoot.querySelector('textarea')
  //   return textarea?.value ?? ''
  // }

  constructor() {
    super()
    this.fillStyle = 'solid'
  }

  private validate_() {
    const validity: ValidityStateFlags = {}
    let message: string | undefined
    if (this.required && !this.value) {
      validity.valueMissing = true
      message = 'Text cannot be empty'
    }
    const anchor = this.renderRoot.querySelector('textarea')
    this.setValidity(validity, message, anchor ?? undefined)
  }

  override firstUpdated(props: PropertyValues) {
    super.firstUpdated(props)
    const textarea = this.renderRoot.querySelector('textarea')
    textarea?.addEventListener('blur', this)
    textarea?.addEventListener('change', this)
    textarea?.addEventListener('input', this)
    this.setInitialValueFromSlot_()
  }

  override updated(props: PropertyValues) {
    super.updated(props)

    if (props.has('value')) {
      this.setFormValue(this.value)
      this.validate_()
    }
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
            autocorrect="${this.autocorrect ? 'on' : 'off'}"
            ?autofocus="${this.autofocus}"
            cols="${this.cols}"
            ?disabled="${this.disabled}"
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
        --color: var(--border-color);
      }
      slot[name="suffix"]::slotted(*) {
        margin-left: 0.25rem;
        margin-right: 0.25rem;
        --color: var(--border-color);
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
