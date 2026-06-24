import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import './re-divider.js'
import { getItemFromEvent, type ItemElement } from './re-item.js'
import type { IconElement } from './re-icon.js'
import type { PanelGroupElement } from './re-panel-group.js'
import { fire } from './internal/re-element.js'

/**
 * TabGroup element organizes content into separate views or tabs.
 * It manages selection and activates panels associated with tabs by name.
 */
@customElement('re-tab-group')
export class TabGroupElement extends LitElement {
  @property({}) name = ''
  @property({}) selected = ''

  static styles = [
    css`
      :host, div {
        display: inline-grid;
        grid-auto-columns: auto;
        grid-auto-flow: column;
        column-gap: 1rem;
      }
      :host([disabled]) {
        opacity: 0.5;
      }
      :host(:not([disabled]):focus-within) {
        outline: none;

        & re-divider::part(rough) {
          stroke-width: 3px;
        }
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

  constructor() {
    super()

    // This makes the element focusable.
    this.setAttribute('tabindex', '0')
  }

  handleEvent(e: Event) {
    switch (e.type) {
      case 'keydown': {
        const slot = this.renderRoot.querySelector('slot')
        const tabs = slot?.assignedElements()
        const length = tabs?.length ?? 0
        let index = tabs?.findIndex(t => t.id === this.selected) ?? -1
        if (index === -1) {
          break
        }

        const ke = e as KeyboardEvent

        switch (ke.key) {
          case 'ArrowDown':
          case 'ArrowLeft':
            // Prevent the default otherwise the page may scroll.
            ke.preventDefault()

            while (index > 0) {
              const tab = tabs![index - 1]
              if (tab.getAttribute('disabled') !== null) {
                --index
                continue
              }

              this.selected = tab.id
              fire(this, 'input', {bubbles: true, composed: true})
              break
            }
            break
          case 'ArrowUp':
          case 'ArrowRight':
            // Prevent the default otherwise the page may scroll.
            ke.preventDefault()

            while (index < length - 1) {
              const tab = tabs![index + 1]
              if (tab.getAttribute('disabled') !== null) {
                ++index
                continue
              }

              this.selected = tab.id
              fire(this, 'input', {bubbles: true, composed: true})
              break
            }
            break
        }
        break
      }
      case 'keyup': {
        break
      }
    }
  }

  onClick_(e: Event) {
    const item = getItemFromEvent(e)
    if (!item) {
      return
    }

    this.selected = item.id
    fire(this, 'change', {bubbles: true})
  }

  protected override firstUpdated(_: PropertyValues) {
    if (!this.name) {
      console.error('Tab groups must be named')
    }

    // Configure all the <re-item>s to work best as tabs.
    const slot = this.renderRoot.querySelector('slot')
    const tabs = slot?.assignedElements()
    tabs?.forEach(t => {
      if (t.tagName !== 'RE-ITEM') {
        console.error(`An tab in tab group "${this.name}" is not an <re-item>`)
        return
      }

      if (!t.id) {
        console.error(`An tab in tab group "${this.name}" does not have an id`)
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

  protected override updated(props: PropertyValues) {
    let gridColumn = -1

    if (props.has('selected')) {
      // Find the index of the selected tab so that the grid column can be
      // set correctly on the <re-divider>.
      const slot = this.renderRoot.querySelector('slot')
      const tabs = slot?.assignedElements()
      let index = tabs?.findIndex(t => t.id === this.selected) ?? -1
      if (index === -1 && tabs && tabs.length > 0) {
        index = 0
        this.selected = tabs[index].id
      }

      if (index !== -1) {
        gridColumn = index + 1
      }

      tabs?.forEach((tab, i) => {
        tab.classList.toggle('selected', i === index)
      })

      // If a valid tab is selected, notify the associated panel group.
      if (this.selected) {
        const root = this.getRootNode()
        if (root instanceof ShadowRoot || root instanceof Document) {
          root.querySelectorAll<PanelGroupElement>(
              `re-panel-group[name=${this.name}]`).forEach(panel => {
            panel.selected = this.selected
          })
        }
      }
    }

    const divider = this.renderRoot.querySelector('re-divider')
    if (divider && gridColumn !== -1) {
      divider.style.setProperty('grid-column', gridColumn.toString())
    }

    this.addEventListener('keydown', this)
    this.addEventListener('keyup', this)
  }

  override render() {
    return html`
      <!-- The default slot representing the tab headers (should be <re-item> elements). -->
      <slot @click="${this.onClick_}"></slot>
      <!-- The visual active tab indicator line. -->
      <re-divider part="indicator"></re-divider>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-tab-group': TabGroupElement
  }
}
