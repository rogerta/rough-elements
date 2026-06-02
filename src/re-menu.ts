import { css, html } from 'lit'
import { customElement } from 'lit/decorators.js'

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
        flex-direction: column;
        align-items: stretch;
        justify-content: start;
        padding: 0.25rem 0;
      }
      :host(:not([popover])),
      :host([popover]:popover-open) {
        display: inline-flex;
      }
      ::slotted(re-divider) {
        --color: rgb(from black R G B / 0.5);
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
