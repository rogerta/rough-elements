import { css, html, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { Mixin } from './re-background-mixin.js'
import type { VARIANTS } from './re-common.js'
import { ReElement } from './re-element.js'

@customElement('re-badge')
export class Element extends Mixin(ReElement) {
  @property({ reflect: true }) variant: VARIANTS = 'primary'

  override render() {
    return [
      super.renderRoughSvg(),
      html`
        <slot part="body"></slot>
      `,
    ]
  }

  override firstUpdated(props: PropertyValues) {
    super.firstUpdated(props)
    this.fillStyle = 'solid'
  }

  override updated(_props: PropertyValues) {
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
        --background-color: transparent;
        cursor: default;
      }
      :host * {
        cursor: default;
      }
      slot {
        color: white;
      }
      :host([variant=primary]) {
        --background-color: var(--re-primary-color);
      }
      :host([variant=success]) {
        --background-color: var(--re-success-color);
      }
      :host([variant=neutral]) {
        --background-color: var(--re-neutral-color);
      }
      :host([variant=warning]) {
        --background-color: var(--re-warning-color);
      }
      :host([variant=danger]) {
        --background-color: var(--re-danger-color);
      }
    `
  ]
}

declare global {
  interface HTMLElementTagNameMap {
    're-badge': Element
  }
}
