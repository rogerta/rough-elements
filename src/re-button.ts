import { css, html, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { Mixin as BgMixin } from './re-background-mixin.js'
import { Mixin as BorderMixin } from './re-border-mixin.js'
import type { VARIANTS } from './re-common.js'
import { ReElement } from './re-element.js'

// Some useful info that needs to be documented:
//
// --color CSS prop sets the color of the icon.
// --re-primary-color CSS prop sets the hover color.
@customElement('re-button')
export class Element extends BorderMixin(BgMixin(ReElement)) {
  @property() name = ''
  @property() href = ''
  @property() target = ''
  @property() download = ''
  @property({ type: Boolean, reflect: true }) circle = false
  @property({ type: Boolean, reflect: true }) disabled = false
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
      case 'keydown':
        this.classList.add('is-active')
        break
      case 'keyup':
      case 'blur':
        this.classList.remove('is-active')
        break
      default:
        break
    }
  }

  protected override updated(props: PropertyValues) {
    const isTextButton = this.variant === 'text'

    // Do this before the circle check.
    if (props.has('variant')) {
      this.borderStyle = isTextButton ? 'none' : 'rectangle'
      this.fillStyle = isTextButton ? 'none' : 'solid'
    }

    // Do this after the variant check.
    if (!isTextButton && props.has('circle')) {
      this.borderStyle = this.circle ? 'circle' : 'rectangle'
      this.fillStyle = this.circle ? 'none' : 'solid'
    }
  }

  override render() {
    return [
      this.renderRoughSvg(),
      html`
        <button name="${this.name}">
          <slot class="hidden" name="prefix" part="prefix"></slot>
          <slot part="label"></slot>
          <slot class="hidden" name="suffix" part="suffix"></slot>
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
        --button-text-shadow-color: black;
        font-size: 0.8rem;
        user-select: none;
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
        display: contents;
      }
      slot.hidden {
        display: none;
      }

      button {
        border: none;
        padding: 0;
        margin: 0;
        height: min-content;
        background: transparent;
        color: inherit;
      }
      :host(:not([circle])) {
        padding: 0.5rem 1rem;
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
