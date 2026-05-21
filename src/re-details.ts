import { css, html, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { ReElement } from './re-element'

@customElement('re-detalls')
export class Element extends ReElement {
  static styles = [
    ...super.styles,
    css`
    `
  ]

  protected render() {
    return [
      html`
      <details>
        <slot></slot>
      </details>`
    ]
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-details': Element
  }
}
