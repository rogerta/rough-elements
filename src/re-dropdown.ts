import { css, html, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { ReElement } from './re-element.js'
import './re-button.js'

@customElement('re-dropdown')
export class DropdownElement extends ReElement {
  @property({reflect: true}) name = ''

  static styles = [css`
    :host {
      display: inline-block;
    }
  `]

  protected override updated(_: PropertyValues) {
    this.requestRoughRender()
  }

  override render() {
    return html`
      <re-button part="trigger"></re-button>
      <div part="panel"></div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-dropdown': DropdownElement
  }
}
