import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { fire } from './internal/re-element.js'
import './re-icon.js'
import { classMap } from 'lit/directives/class-map.js'
import { IconElement } from './re-icon.js'

/**
 * Rating element allows users to view or enter a star rating.
 * It displays a row of interactive star icons.
 *
 * @cssproperty --re-rating-color - Color of the selected rating stars. Defaults to `gold`.
 */
@customElement('re-rating')
export class RatingElement extends LitElement {
  @property({ type: Number }) max = 1
  @property({ type: Number }) value: number = 0

  /**
   * If true the user should not be able to change the rating.
   */
  @property({ type: Boolean, reflect: true }) readonly = false

  static styles = [
    css`
      :host {
        --re-rating-color: gold;
      }
      :host, div {
        display: inline-flex;
      }
      re-icon {
        --color: rgb(0 0 0 / 0.2);
        transition: transform 0.2s ease;
      }
      :host(:not(:hover)) re-icon.selected,
      :host([readonly]) re-icon.selected {
        --color: var(--re-rating-color);
      }

      @media (hover: hover) {
        :host(:not([readonly])) :hover > re-icon {
          --color: var(--re-rating-color);
        }
        :host(:not([readonly])) re-icon:hover {
          transform: scale(1.5);
        }
      }
    `
  ]

  onClick_(e: Event) {
    const target = e.target as HTMLElement
    if (!target.dataset.value) {
      return
    }

    const value = Number.parseInt(target.dataset.value)
    if (Number.isNaN(value)) {
      return
    }

    if (this.readonly) {
      e.stopPropagation()
      return
    }

    this.value = this.value === value ? 0 : value

    this.updateComplete.then(() => fire(this, 'change', {bubbles: true}))
  }

  onPointerMove_(e: Event) {
    if (!(e.target instanceof IconElement)) {
      return
    }

    const value = e.target.dataset.value
    if (!value) {
      return
    }

    fire(this, 'input', {
      bubbles: true,
      composed: true,
      detail: Number.parseInt(value)
    })
  }

  override render() {
    const classes1 = {selected: this.value > 0 }
    const classes2 = {selected: this.value > 1 }
    const classes3 = {selected: this.value > 2 }
    const classes4 = {selected: this.value > 3 }
    const classes5 = {selected: this.value > 4 }

    return html`
      <div @click="${this.onClick_}" @pointermove="${this.onPointerMove_}">
        <re-icon class="${classMap(classes1)}" data-value="1" name="star-rate"></re-icon>
        <div>
          <re-icon class="${classMap(classes2)}" data-value="2" name="star-rate"></re-icon>
          <div>
            <re-icon class="${classMap(classes3)}" data-value="3" name="star-rate"></re-icon>
            <div>
              <re-icon class="${classMap(classes4)}" data-value="4" name="star-rate"></re-icon>
              <div>
                <re-icon class="${classMap(classes5)}" data-value="5" name="star-rate"></re-icon>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-rating': RatingElement
  }
}
