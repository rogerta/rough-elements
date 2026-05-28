import { css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { Mixin as BgMixin } from './re-background-mixin.js'
import { Mixin as BorderMixin } from './re-border-mixin.js'
import { ReElement } from './re-element.js'

@customElement('re-menu')
export class MenuElement extends BorderMixin(BgMixin(ReElement)) {
  static styles = [
    ...super.styles,
    css`
      :host {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        align-items: stretch;
        justify-content: start;
        padding: 0.25rem 0;
      }
      ::slotted(re-divider) {
        --color: rgb(from black R G B / 0.5);
        margin: 0.5rem 0;
      }
    `
  ]

  override render() {
    return [
      super.renderRoughSvg(),
      html`
        <!-- The main body of the menu. -->
        <slot part="panel"></slot>
      `,
    ]
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-menu': MenuElement
  }
}
