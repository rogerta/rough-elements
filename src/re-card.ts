import { css, html } from 'lit'
import { customElement } from 'lit/decorators.js'

import { Mixin as BgMixin } from './internal/re-background-mixin.js'
import { Mixin as BorderMixin } from './internal/re-border-mixin.js'
import { ReElement } from './internal/re-element.js'

@customElement('re-card')
export class CardElement extends BorderMixin(BgMixin(ReElement)) {
  override render() {
    return [
      super.renderRoughSvg(),
      html`
        <slot part="image" name="image"></slot>
        <slot part="header" name="header"></slot>
        <slot part="body"></slot>
        <slot part="footer" name="footer"></slot>
      `,
    ]
  }

  static styles = [
    ...super.styles,
    css`
      :host {
        display: inline-block;
        --img-border: calc(-0.5 * var(--border-width));
      }
      slot:not([part=image]) {
        padding: 0.5rem 1rem;
      }
      slot[part=image]::slotted(img) {
        display: block;
        width: calc(100% - 2 * var(--img-border)); /* Note: --img-border < 0 */
        margin-top: var(--img-border);
        margin-left: var(--img-border);
        margin-right: var(--img-border);
      }
    `
  ]
}

declare global {
  interface HTMLElementTagNameMap {
    're-card': CardElement
  }
}
