import { css, html, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { Mixin as BgMixin } from './re-background-mixin.js'
import { Mixin as BorderMixin } from './re-border-mixin.js'
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
  @property({ type: Boolean, reflect: true }) disabled = false

  override firstUpdated(props: PropertyValues) {
    super.firstUpdated(props)
    this.fillStyle = 'solid'
  }

  override render() {
    return [
      this.renderRoughSvg(),
      html`
        <button>
          <slot name="prefix" part="prefix"></slot>
          <slot part="label"></slot>
          <slot name="suffix" part="suffix"></slot>
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
        font-size: 0.8rem;
        user-select: none;
      }
      :host([disabled]) {
        opacity: 0.5;
      }
      :host([variant=primary]) {
        color: white;
        --background-color: var(--re-primary-color);
      }
      :host([variant=success]) {
        color: white;
        --background-color: var(--re-success-color);
      }
      :host([variant=neutral]) {
        color: white;
        --background-color: var(--re-neutral-color);
      }
      :host([variant=warning]) {
        color: white;
        --background-color: var(--re-warning-color);
      }
      :host([variant=danger]) {
        color: white;
        --background-color: var(--re-danger-color);
      }

      button {
        border: none;
        padding: 0.5rem 1rem;
        margin: 0;
        height: min-content;
        background: transparent;
        color: inherit;
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
      :host(:not([disabled]):active) #rough {
        transform: scale(0.95);
      }

      @media (hover: hover) {
        :host(:hover:not([disabled])) button {
          text-shadow: 0 0 4px white;
        }
        :host(:hover:active:not([disabled])) button {
          text-shadow: 0 0 4px white;
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
