import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import './re-icon.js'

// Some useful info that needs to be documented:
//
// --color CSS prop sets the color of the icon.
// --re-primary-color CSS prop sets the hover color.
@customElement('re-icon-button')
export class IconButtonElement extends LitElement {
  @property() name = ''
  @property() href = ''
  @property() target = ''
  @property() download = ''
  @property({ type: Boolean, reflect: true }) disabled = false

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
  setPopoverTarget(target: HTMLElement | null) {
    this.updateComplete.then(() => {
      const button = this.renderRoot.querySelector('button')
      if (button) {
        // Note: These properties need to be set via javascript and not in the
        // CSS.  However I'm not exactly sure why.
        button.style.setProperty('anchor-name', '--re-button-trigger')
        button.style.setProperty('position-anchor', '--re-button-trigger')
        button.popoverTargetElement = target
      }
    })
  }

  override render() {
    return [
      html`
        <button ?disabled="${this.disabled}"><re-icon
            part="icon" name="${this.name}"></re-icon></button>
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

      /* NOTE: the button display is set to flex so that the browser does not
       * add extra width and/or height due to template whitespace nodes or
       * descender gaps for inline-block. */
      button {
        display: flex;
        align-items: center;
        justify-content: center;
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
    're-icon-button': IconButtonElement
  }
}
