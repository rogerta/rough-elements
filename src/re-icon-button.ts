import { css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { ReElement } from './re-element.js'

import './re-icon.js'

// Some useful info that needs to be documented:
//
// --color CSS prop sets the color of the icon.
// --re-primary-color CSS prop sets the hover color.
@customElement('re-icon-button')
export class Element extends ReElement {
  @property() name = ''
  @property() href = ''
  @property() target = ''
  @property() download = ''
  @property({ type: Boolean, reflect: true }) disabled = false

  override render() {
    return [
      super.renderRoughSvg(),
      html`
        <button>
          <re-icon part="icon" name="${this.name}"></re-icon>
        </button>
      `,
    ]
  }

  static styles = [
    ...super.styles,
    css`
      :host {
        display: inline-block;
        color: var(--color, inherit);
      }
      :host([disabled]) {
        opacity: 0.5;
      }
      button {
        border: none;
        border-width: 0;
        background: transparent;
        color: inherit;
      }
      /* Removes the focus ring only for mouse/touch interactions */
      button:focus:not(:focus-visible) {
        outline: none;
      }
      re-icon {
        color: inherit;
        transition: all 0.2s ease;
      }
      re-icon:active {
        transform: scale(0.9);
      }
      @media (hover: hover) {
        :host(:hover:not([disabled])) {
          color: var(--re-primary-color) !important;
          xbackground: var(--icon-button-hover-background, rgb(0 0 0 / 0.1));
        }
        :host(:hover:active:not([disabled])) {
          color: var(--re-primary-color) !important;
          xbackground: var(--icon-button-active-background, rgb(0 0 0 / 0.05));
        }
      }
    `,
  ]
}

declare global {
  interface HTMLElementTagNameMap {
    're-icon-button': Element
  }
}
