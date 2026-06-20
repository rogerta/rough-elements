import { css, html, type PropertyValues } from 'lit'
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
        <slot class="hidden" part="image" name="image"></slot>
        <slot class="hidden" part="header" name="header"></slot>
        <slot class="hidden" part="body"></slot>
        <slot class="hidden" part="footer" name="footer"></slot>
      `,
    ]
  }

  override updated(_props: PropertyValues) {
    ['header', 'body', 'footer', 'image'].forEach(part => {
      const slot =
          this.renderRoot.querySelector<HTMLSlotElement>(`slot[part=${part}]`)!
      const hasChildren = slot.assignedNodes().length > 0
      slot.classList.toggle('hidden', !hasChildren)
    })
  }

  static styles = [
    ...super.styles,
    css`
      :host {
        display: inline-block;
        --img-border: calc(-0.5 * var(--border-width));
      }
      slot {
        display: block;
      }
      slot.hidden {
        display: none;
      }
      slot:not([part=image]) {
        padding: 0.5rem 1rem;
      }
      slot[part=image] {
        margin-top: var(--img-border);
        margin-left: var(--img-border);
        margin-right: var(--img-border);
      }
      ::slotted(img) {
        display: block;
        width: 100%;
      }
    `
  ]
}

declare global {
  interface HTMLElementTagNameMap {
    're-card': CardElement
  }
}
