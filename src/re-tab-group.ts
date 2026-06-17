import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import './re-divider.js'
import type { ItemElement } from './re-item.js'
import type { IconElement } from './re-icon.js'

@customElement('re-tab-group')
export class TabGroupElement extends LitElement {
  @property({}) name = ''
  @property({ type: Number, state: true }) selected = 1

  static styles = [
    css`
      :host, div {
        display: inline-grid;
        grid-auto-columns: auto;
        grid-auto-flow: column;
        column-gap: 1rem;
      }
      ::slotted(*) {
        grid-row: 1 / 2;
      }
      re-divider {
        grid-row: 2 / 3;
        grid-column: 1;
        margin: 0;
      }
    `
  ]

  onClick_(e: Event) {
    const target = e.target as HTMLElement
    const slot = this.renderRoot.querySelector('slot')
    const tabs = slot?.assignedElements()
    const index = tabs?.findIndex(t => t === target.closest('re-item')) ?? -1
    if (index !== -1) {
      this.selected = index + 1
    }
  }

  protected override firstUpdated(_: PropertyValues) {
    if (!this.name) {
      console.error('Tab groups should be named')
    }

    // Configure all the <re-item>s to work best as tabs.
    const slot = this.renderRoot.querySelector('slot')
    const tabs = slot?.assignedElements()
    tabs?.forEach(t => {
      if (t.tagName !== 'RE-ITEM') {
        console.error('An tab in a tab group is not an <re-item>')
        return
      }

      const item = t as ItemElement
      const prefix =
          item.shadowRoot?.querySelector('[part=prefix]') as IconElement
      if (prefix && !prefix.name) {
        prefix.style.setProperty('--size', '0')
      }
      const suffix =
          item.shadowRoot?.querySelector('[part=suffix]') as IconElement
      if (suffix && !suffix.name) {
        suffix.style.setProperty('--size', '0')
      }
    })
  }

  protected override updated(_: PropertyValues) {
    const divider = this.renderRoot.querySelector('re-divider')
    if (divider) {
      divider.style.setProperty('grid-column', this.selected.toString())
    }
  }

  override render() {
    return html`
      <slot @click="${this.onClick_}"></slot>
      <re-divider part="indicator"></re-divider>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-tab-group': TabGroupElement
  }
}
