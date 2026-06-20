import { css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { Mixin } from './internal/re-background-mixin.js'
import type { VARIANTS } from './internal/re-common.js'
import { ReElement } from './internal/re-element.js'

@customElement('re-badge')
export class BadgeElement extends Mixin(ReElement) {
  @property({ reflect: true }) variant: VARIANTS = 'primary'

  constructor() {
    super()
    this.fillStyle = 'solid'
  }

  override render() {
    return [
      super.renderRoughSvg(),
      html`
        <slot part="body"></slot>
      `,
    ]
  }

  static styles = [
    ...super.styles,
    css`
      :host {
        display: inline-block;
        --border-width: 0;
        font-size: 0.75rem;
        padding: 0 0.125rem;
        color: var(--color, ButtonText);
        --re-background-color: transparent;
        cursor: default;
      }
      :host * {
        cursor: default;
      }
      slot {
        color: white;
      }
      :host([variant=primary]) {
        --re-background-color: var(--re-primary-color);
      }
      :host([variant=success]) {
        --re-background-color: var(--re-success-color);
      }
      :host([variant=neutral]) {
        --re-background-color: var(--re-neutral-color);
      }
      :host([variant=warning]) {
        --re-background-color: var(--re-warning-color);
      }
      :host([variant=danger]) {
        --re-background-color: var(--re-danger-color);
      }
    `
  ]
}

declare global {
  interface HTMLElementTagNameMap {
    're-badge': BadgeElement
  }
}
