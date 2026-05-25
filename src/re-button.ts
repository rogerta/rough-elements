import { css, html, nothing, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { Mixin as BgMixin } from './re-background-mixin.js'
import { Mixin as BorderMixin } from './re-border-mixin.js'
import type { VARIANTS } from './re-common.js'
import { ReElement } from './re-element.js'
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
export class Element extends BorderMixin(BgMixin(ReElement)) {
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
  @property({ type: Boolean }) caret = false

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

  override firstUpdated(props: PropertyValues) {
    super.firstUpdated(props)
    this.fillStyle = 'solid'
    const button = this.renderRoot.querySelector('button')
    button?.addEventListener('keydown', this)
    button?.addEventListener('keyup', this)
    button?.addEventListener('blur', this)
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

  protected override updated(_: PropertyValues) {
    const isTextButton = this.variant === 'text'

    this.borderStyle = isTextButton ? 'none'
        : (this.circle ? 'circle' : 'rectangle')
    this.fillStyle = isTextButton || this.circle ? 'none' : 'solid'

    ;['prefix', 'suffix'].forEach(part => {
      const slot =
          this.renderRoot.querySelector<HTMLSlotElement>(`slot[part=${part}]`)!
      const hasChildren = slot.assignedNodes().length > 0
      slot.classList.toggle('hidden', !hasChildren)
    })
  }

  override render() {
    return [
      this.renderRoughSvg(),
      html`
        <button name="${this.name}" ?disabled="${this.disabled}">
          <!-- The element that prefixes the button text. -->
          <slot class="hidden" name="prefix" part="prefix"></slot>
          <!-- The button's main body, usually just some text. -->
          <slot part="label"></slot>
          <!-- The element that suffixes the button text. -->
          <slot class="hidden" name="suffix" part="suffix"></slot>
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
        --border-color: ButtonBorder;
        --background-color: ButtonFace;
        --button-text-shadow-color: rgb(from black R G B / 0.1);
        font-size: 0.8rem;
        user-select: none;
        cursor: pointer;
      }
      :host * {
        cursor: pointer;
      }
      :host([disabled]) {
        opacity: 0.5;
      }
      :host([variant=primary]) {
        color: white;
        --background-color: var(--re-primary-color);
        --button-text-shadow-color: white;
      }
      :host([variant=success]) {
        color: white;
        --background-color: var(--re-success-color);
        --button-text-shadow-color: white;
      }
      :host([variant=neutral]) {
        color: white;
        --background-color: var(--re-neutral-color);
        --button-text-shadow-color: white;
      }
      :host([variant=warning]) {
        color: white;
        --background-color: var(--re-warning-color);
        --button-text-shadow-color: white;
      }
      :host([variant=danger]) {
        color: white;
        --background-color: var(--re-danger-color);
        --button-text-shadow-color: white;
      }

      slot {
        display: block;
      }
      slot.hidden {
        display: none;
      }
      slot[name="prefix"] {
        margin-right: 0.25rem;
      }
      slot[name="suffix"] {
        margin-left: 0.25rem;
      }

      button {
        display: flex;
        flex-direction: row;
        align-items: center;
        border: none;
        padding: 0;
        margin: 0;
        height: min-content;
        background: transparent;
        color: inherit;
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
        transition: all 0.2s ease;
      }
      :host(:not([disabled]):active) #rough,
      :host(:not([disabled]).is-active) #rough {
        transform: scale(0.95);
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
    're-button': Element
  }
}
