import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('my-element')
export class Element extends LitElement {
  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Number })
  count = 0

  render() {
    return html`
    `
  }

  static styles = [css`
  `]
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': Element
  }
}
