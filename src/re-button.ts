import { css, html, nothing, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { BackgroundMixin } from './internal/re-background-mixin.js'
import { BorderMixin } from './internal/re-border-mixin.js'
import { ReFormControlMixin } from './internal/re-form-control-mixin.js'
import type { VARIANTS } from './internal/re-common.js'
import { ReElement } from './internal/re-element.js'
import './re-icon.js'
import { ifDefined } from 'lit/directives/if-defined.js'

/**
 * Buttons are interactive elements activated by the user with a mouse,
 * keyboard, finger, voice command, or other mechanism.  Once activated, the
 * button fires an event that tiggers an application specific action.
 *
 * Rough buttons can be used as popover element triggers.  See the
 * `setPopoverTarget()` method.
 *
 * To control the border and background refer to the Border & Background
 * documentation.
 *
 * `<re-button>`is meant as a drop in replacement for `<button>` or `<a>`.
 *
 * @cssproperty --color - Sets the colour of the button text as well as
 *    prefix and suffix. Defaults to `ButtonText`.  The colour of the
 *    prefix and suffix can be set indivudally by styling the corresponding
 *    parts.
 */
@customElement('re-button')
export class ButtonElement extends
    BorderMixin(BackgroundMixin(ReFormControlMixin(ReElement))) {
  static formAssociated = true
  static shadowRootOptions: ShadowRootInit = {
    ...super.shadowRootOptions,
    delegatesFocus: true,
  }

  /**
   * When not empty, the button behaves like an <a> element with the
   * specified value of `href`.  The default behaviour is to open the link
   * specified by `href` in the target window.
   */
  @property() href = ''

  /**
   * If `href` is not empty, specifies the target window to open the link.
   */
  @property() target = ''

  /**
   * If `href` is not empty, the browser will download the linked file to a
   * file named by this property.
   */
  @property() download = ''

  /**
   * If true, a caret `<re-icon>` will be suffixed to this button.  This is
   * used to indicate that the button will open some kind of submenu.
   */
  @property({ type: Boolean, reflect: true }) caret = false

  /**
   * If true the button will render with a round border instead of a rectangular
   * one.  Usually the default slot is filled with a single `<re-icon>`.
   */
  @property({ type: Boolean, reflect: true }) circle = false

  /**
   * If true the button does not respond to user actions.
   */
  @property({ type: Boolean, reflect: true }) disabled = false

  /**
   * A theme variant for the button, mostly affectings its colours.
   */
  @property({ reflect: true }) variant: VARIANTS | 'text' | '' = ''

  // Form specific properties.

  /**
   * Name used when this button is part of a form submission.
   */
  @property({}) type = 'button'
  @property({}) formaction?: string
  @property({}) formenctype?: string
  @property({}) formmethod = 'post'
  @property({}) formnovalidate?: string
  @property({}) formtarget = '_self'
  @property({}) value?: string

  constructor() {
    super()
    this.fillStyle = 'solid'
  }

  /**
   * Sets this button to be a trigger for a popover element. The popover will
   * be displayed once the button finishes it's update cycle (that is, once
   * `updateComplete` promise resolves).
   *
   * `setPopoverTarget` is needed to allow targets from different shawdow root
   * boundaries to be used.
   *
   * @param target The popover element.  This element is expected to
   *    have the `popover` attribute.  It's anchor will be set this button.
   */
  setPopoverTarget(target: HTMLElement) {
    this.updateComplete.then(() => {
      const button = this.renderRoot.querySelector('button')
      if (button) {
        button.popoverTargetElement = target
      }
    })
  }

  handleEvent(e: Event) {
    switch (e.type) {
      case 'click':
        // If this is a submit button as part of a form, submit the form.
        if (this.type === 'submit') {
          if (this.name && this.value) {
            this.setFormValue(this.value)
          }

          // TODO: eventually the/a button should be passed to `submitForm()`
          // so that the submitter properties can be used.
          this.submitForm()
        }
        break
      case 'keydown': {
        const ke = e as KeyboardEvent
        if (ke.key === ' ') {
          this.classList.add('is-active')
        }
        break
      }
      case 'keyup': {
        const ke = e as KeyboardEvent
        if (ke.key === ' ') {
          this.classList.remove('is-active')
        }
        break
      }
      case 'blur':
        this.classList.remove('is-active')
        break
      default:
        break
    }
  }

  // Using willUpdate() instead of updated() to avoid a double update cycle.
  protected override willUpdate(props: PropertyValues) {
    super.willUpdate(props)

    if (props.has('variant') || props.has('circle')) {
      const isTextButton = this.variant === 'text'
      this.borderStyle = isTextButton ? 'none'
          : (this.circle ? 'circle' : 'rectangle')
      this.fillStyle = isTextButton || this.circle ? 'none' : 'solid'
    }
  }

  override firstUpdated(props: PropertyValues) {
    super.firstUpdated(props)
    const button = this.renderRoot.querySelector('button')
    button?.addEventListener('keydown', this)
    button?.addEventListener('keyup', this)
    button?.addEventListener('blur', this)
    this.setAttribute('tabindex', '0')
  }

  override render() {
    return [
      this.renderRoughSvg(),
      html`
        <button autofocus ?disabled="${this.disabled}" part="button"
            name="${ifDefined(this.name)}" @click="${this.handleEvent}">
          <!-- A prefix for the label.  An \`<re-icon>\` is often used here. -->
          <slot name="prefix" part="prefix"></slot>
          <!-- The main label of the button. Typically holds text. -->
          <slot part="label"></slot>
          <!-- A suffix for the label.  An \`<re-icon>\` is often used here. -->
          <slot name="suffix" part="suffix"></slot>
          ${this.caret ? html`<re-icon name="keyboard-arrow-down"></re-icon>`
              : nothing }
        </button>
      `,
    ]
  }

  static styles = [
    ...super.styles,
    css`
      :host {
        display: inline-block;
        color: var(--color, ButtonText);
        user-select: none;
        cursor: pointer;
        --button-text-shadow-color: rgb(from black R G B / 0.1);
      }
      :host(:not([variant=text])) {
        --text-transform: uppercase;
      }
      :host * {
        cursor: pointer;
      }
      :host([disabled]) {
        opacity: 0.5;
      }
      :host([variant=primary]) {
        color: white;
        --re-background-color: var(--re-primary-color);
        --button-text-shadow-color: white;
      }
      :host([variant=success]) {
        color: white;
        --re-background-color: var(--re-success-color);
        --button-text-shadow-color: white;
      }
      :host([variant=neutral]) {
        color: white;
        --re-background-color: var(--re-neutral-color);
        --button-text-shadow-color: white;
      }
      :host([variant=warning]) {
        color: white;
        --re-background-color: var(--re-warning-color);
        --button-text-shadow-color: white;
      }
      :host([variant=danger]) {
        color: white;
        --re-background-color: var(--re-danger-color);
        --button-text-shadow-color: white;
      }

      slot[name=prefix]::slotted(*) {
        margin-left: -0.25rem;
      }
      :host(:not([caret])) slot[name=suffix]::slotted(*) {
        margin-right: -0.25rem;
      }
      re-icon[name=keyboard-arrow-down] {
        margin-right: -0.25rem;
      }

      /* NOTE: an important side effect of setting the button display to flex is
       * that the browser does not add extra width and/or height due to
       * template whitespace nodes or descender gaps for inline-block. */
      button {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        border: none;
        padding: 0;
        margin: 0;
        height: min-content;
        background-color: transparent;
        color: inherit;
        -webkit-tap-highlight-color: transparent;
        transition: transform 0.2s ease;
        font-family: var(--re-input-font-family);
        text-transform: var(--text-transform);
      }
      :host(:not([circle])) {
        padding: 0.25rem 0.5rem;
      }
      /* Removes the focus ring only for mouse/touch interactions */
      button:focus {
        outline: none;
      }

      :host(:not([disabled]):focus-within) {
        --re-stroke-width: 2px;
      }

      :host([variant=text]:not([disabled]):focus-within) button {
          font-weight: bold;
        }
      }

      #rough {
        color: inherit;
        transition: transform 0.2s ease;
      }

      /* Button press animation */
      :host(:not([disabled]):active) #rough,
      :host(:not([disabled]).is-active) #rough {
        transform: scale(0.95);
      }
      :host([variant=text]:not([disabled]):active) button,
      :host([variant=text]:not([disabled]).is-active) button {
        transform: scale(0.9);
      }

      @media (hover: hover) {
        :host(:hover:not([disabled])) button {
          text-shadow: 0 0 3px var(--button-text-shadow-color);
          filter: drop-shadow(0px 0px 4px rgb(from var(--re-primary-color) R G B / 0.8));
        }
        :host(:hover:active:not([disabled])) button {
          text-shadow: 0 0 3px var(--button-text-shadow-color);
          filter: drop-shadow(0px 0px 4px rgb(from var(--re-primary-color) R G B / 0.8));
        }
      }
    `,
  ]
}

declare global {
  interface HTMLElementTagNameMap {
    're-button': ButtonElement
  }
}
