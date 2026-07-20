import { css, html } from 'lit'
import { customElement } from 'lit/decorators.js'

import { BackgroundMixin } from './internal/re-background-mixin.js'
import { BorderMixin } from './internal/re-border-mixin.js'
import { ReElement } from './internal/re-element.js'

/**
 * Cards are containers used to group related information or actions.
 * They support optional image, header, body, and footer sections, are
 * surrounded by a rough border and can paint an optional background.
 */
@customElement('re-card')
export class CardElement extends BorderMixin(BackgroundMixin(ReElement)) {
  override render() {
    return [
      super.renderRoughSvg(),
      html`
        <!-- The image or media element at the top of the card. -->
        <slot part="image" name="image"></slot>
        <!-- The card's header (positioned above the main body). -->
        <slot part="header" name="header"></slot>
        <!-- The card's main body or content. -->
        <slot part="body"></slot>
        <!-- The card's footer (positioned below the main body). -->
        <slot part="footer" name="footer"></slot>
      `,
    ]
  }

  static styles = [
    ...super.styles,
    css`
      :host {
        --img-border: calc(-0.5 * var(--border-width));
        overflow: visible;  /* Makes border visible when used as popover */
      }
      :host(:not([popover])),
      :host([popover]:popover-open) {
        display: inline-block;
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
