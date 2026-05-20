import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import './re-icon.js'

// Some useful info that needs to be documented:
//
// --color CSS prop sets the color of the icon.
// --re-primary-color CSS prop sets the hover color.
@customElement('re-icon-button')
export class Element extends LitElement {
  @property() name = ''
  @property() href = ''
  @property() target = ''
  @property() download = ''
  @property({ type: Boolean, reflect: true }) disabled = false

  override render() {
    return [
      html`
        <button>
          <re-icon part="icon" name="${this.name}"></re-icon>
        </button>
      `,
    ]
  }

  static styles = [
    css`
      :host {
        display: inline-block;
        color: var(--color, inherit);
        border: none;
        user-select: none;
        cursor: pointer;
      }
      :host * {
        cursor: pointer;
      }
      :host([disabled]) {
        opacity: 0.5;
      }
      button {
        border: none;
        padding: 0;
        margin: 0;
        height: min-content;
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
      :host(:not([disabled])) :active {
        transform: scale(0.9);
      }
      @media (hover: hover) {
        :host(:hover:not([disabled])) {
          color: var(--re-primary-color);

          & re-icon::part(rough) {
            filter: drop-shadow(0px 0px 4px rgb(from var(--re-primary-color) R G B / 0.8));
          }
        }
        :host(:hover:active:not([disabled])) {
          color: var(--re-primary-color);

          & re-icon::part(rough) {
            filter: drop-shadow(0px 0px 4px rgb(from var(--re-primary-color) R G B / 0.8));
          }
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
