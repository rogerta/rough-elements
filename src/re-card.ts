import { css, html } from 'lit'
import { customElement } from 'lit/decorators.js'

import { ReBase } from './re-base.js'

@customElement('re-card')
export class Element extends ReBase {
  override render() {
    return super.render().concat([
      html`<slot></slot>`
    ])
  }

  static styles = ReBase.styles.concat([
    css`
      :host {
        display: inline-block;
        padding: 1em;
        border-width: 0.5rem;
      }
    `
  ])
}

declare global {
  interface HTMLElementTagNameMap {
    're-card': Element
  }
}
