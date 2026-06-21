import { css, html, nothing, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { Mixin as BgMixin } from './internal/re-background-mixin.js'
import { Mixin as BorderMixin } from './internal/re-border-mixin.js'
import type { VARIANTS } from './internal/re-common.js'
import { ReElement } from './internal/re-element.js'
import './re-icon.js'

// Some useful info that needs to be documented:
//
// --color CSS prop sets the color of the icon.
// --re-primary-color CSS prop sets the hover color.
/**
 * The Button element is an interactive element activated by a user with a
 * mouse, keyboard, finger, voice command, or other assistive technology.
 * Once activated, it then performs an action, such as submitting a form or
 * opening a dialog.
 *
 * A Button's style can change using CSS variables.
 */
@customElement('re-button')
export class ButtonElement extends BorderMixin(BgMixin(ReElement)) {
  /**
   * Name used when this button is part of a form submission.
   */
  @property() name = ''

  /**
   * When not empty, the button will act like an <a> element with the
   * specified value of href.
   */
  @property() href = ''

  /**
   * If href is not empty, specifies the target window to open the link.
   */
  @property() target = ''

  /**
   * If href is not empty, the browser will download the linked file to a
   * file named by this property.
   */
  @property() download = ''

  /**
   * If true, a caret <re-icon> will be suffixed to this button.  This is
   * used to indicate that the button will open some kind of submenu.
   */
  @property({ type: Boolean, reflect: true }) caret = false

  /**
   * If true the button will render with a round border instead of a rectangular
   * one.  Usually the default slot is filled with a single <re-icon>.
   */
  @property({ type: Boolean, reflect: true }) circle = false

  /**
   * If true the button is disabled and does not respond to user actions.
   */
  @property({ type: Boolean, reflect: true }) disabled = false

  /**
   * A theme variant for the button, mostly affectings its colours.
   */
  @property({ reflect: true }) variant: VARIANTS | 'text' | '' = ''

  constructor() {
    super()
    this.fillStyle = 'solid'
  }

  override firstUpdated(props: PropertyValues) {
    super.firstUpdated(props)
    const button = this.renderRoot.querySelector('button')
    button?.addEventListener('keydown', this)
    button?.addEventListener('keyup', this)
    button?.addEventListener('blur', this)
  }

  /**
   * Sets this button to be a trigger for a popover element once the button
   * finishes it's update cycle (that is, it's `updateComplete` promise
   * resolves).
   *
   * `setPopoverTarget` is needed to allow targets from different shawdow root
   * boundaries to be used.
   *
   * @param target The popover target element.  This element is expected to
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

  protected override updated(props: PropertyValues) {
    super.updated(props)

    const isTextButton = this.variant === 'text'
    this.borderStyle = isTextButton ? 'none'
        : (this.circle ? 'circle' : 'rectangle')
    this.fillStyle = isTextButton || this.circle ? 'none' : 'solid'
  }

  override render() {
    return [
      this.renderRoughSvg(),
      html`
        <button name="${this.name}" ?disabled="${this.disabled}" part="button">
          <!-- The element that prefixes the button text. -->
          <slot name="prefix" part="prefix"></slot>
          <!-- The button's main body, usually just some text. -->
          <slot part="label"></slot>
          <!-- The element that suffixes the button text. -->
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
