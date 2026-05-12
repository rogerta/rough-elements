import { css, html, type PropertyValues } from 'lit'
import { customElement, query } from 'lit/decorators.js'

import { ReBase } from './re-base.js'

@customElement('re-card')
export class Element extends ReBase {
  @query('slot[part=header') slotHeader!: HTMLSlotElement
  @query('slot[part=body') slotBody!: HTMLSlotElement
  @query('slot[part=footer') slotFooter!: HTMLSlotElement
  @query('slot[part=image') slotImage!: HTMLSlotElement

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

  static styles = ReBase.styles.concat([
    css`
      :host {
        display: inline-block;
        --border-width: 0.5rem;
        --neg-border: calc(-1 * var(--border-width));
        border-width: var(--border-width);
      }
      slot {
        display: block;
      }
      slot.hidden {
        display: none;
      }
      slot:not([part=image]) {
        padding: 1rem;
      }
      slot[part=image] {
        position: relative; /* So image is above rough svg */
        margin-top: var(--neg-border);
        margin-left: var(--neg-border);
        margin-right: var(--neg-border);
      }
      ::slotted(img) {
        display: block;
        width: 100%;
      }
    `
  ])
}

declare global {
  interface HTMLElementTagNameMap {
    're-card': Element
  }
}
