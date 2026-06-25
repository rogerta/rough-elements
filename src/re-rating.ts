import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'

import { fire } from './internal/re-element.js'
import { ReFormControlMixin } from './internal/re-form-control-mixin.js'

import { IconElement } from './re-icon.js'

/**
 * Rating element allows users to view or enter a star rating.
 * It displays a row of interactive star icons.
 *
 * @cssproperty --re-rating-color - Color of the selected rating stars. Defaults to `gold`.
 */
@customElement('re-rating')
export class RatingElement extends ReFormControlMixin(LitElement) {
  static formAssociated = true

  @property({ type: Number }) max = 5
  @property({ type: Number }) value: number = 0

  /**
   * If true the user should not be able to change the rating.
   */
  @property({ type: Boolean, reflect: true }) disabled = false
  @property({ type: Boolean, reflect: true }) readonly = false
  @property({ type: Boolean, reflect: true }) required = false

  static styles = [
    css`
      :host {
        --re-rating-color: gold;
      }
      :host, div {
        display: inline-flex;
      }
      :host([disabled]) {
        opacity: 0.5;
      }
      :host(:focus) {
        outline: none;
      }

      re-icon {
        --color: rgb(0 0 0 / 0.3);
        transition: transform 0.2s ease;
      }

      :host(:not(:hover)) re-icon.selected,
      :host([readonly]) re-icon.selected,
      :host([disabled]) re-icon.selected {
        --color: var(--re-rating-color);
      }

      :host(:not([disabled]):focus) re-icon,
      :host(:not([disabled]):active) re-icon {
        filter: drop-shadow(0 0 4px var(--re-primary-color));
      }

      @media (prefers-color-scheme: dark) {
        re-icon {
          --color: rgb(255 255 255 / 0.3);
        }

        :host(:not([disabled]):focus) re-icon,
        :host(:not([disabled]):active) re-icon {
          filter: drop-shadow(0 0 4px var(--foreground-color));
        }
      }

      @media (hover: hover) {
        :host(:not([readonly]):not([disabled])) :hover > re-icon {
          --color: var(--re-rating-color);
        }
        :host(:not([readonly]):not([disabled])) re-icon:hover {
          transform: scale(1.5);
        }
      }
    `
  ]

  private validate_() {
    const validity: ValidityStateFlags = {}
    let message: string | undefined

    if (this.required) {
      if (this.value < 1) {
        validity.valueMissing = true
        message = 'Rating is required'
      } else if (this.value > this.max) {
        validity.rangeOverflow = true
        message = `Rating is above max of ${this.max}`
      }
    }

    this.setValidity(validity, message)
  }

  private isEditable_() {
    return !this.disabled && !this.readonly
  }

  handleEvent(e: Event) {
    switch (e.type) {
      case 'keydown': {
        const ke = e as KeyboardEvent

        switch (ke.key) {
          case 'ArrowDown':
          case 'ArrowLeft':
            // Prevent the default otherwise the page may scroll.
            ke.preventDefault()
            if (this.value > 0 && this.isEditable_()) {
            --this.value
            }
            break
          case 'ArrowUp':
          case 'ArrowRight':
            // Prevent the default otherwise the page may scroll.
            ke.preventDefault()
            if (this.value < this.max && this.isEditable_()) {
            ++this.value
            }
            break
        }
        break
      }
      case 'keyup': {
        fire(this, 'change', {bubbles: true})
        break
      }
    }
  }

  private onClick_(e: Event) {
    const target = e.target as HTMLElement
    if (!target.dataset.value) {
      return
    }

    const value = Number.parseInt(target.dataset.value)
    if (Number.isNaN(value)) {
      return
    }

    if (!this.isEditable_()) {
      e.stopPropagation()
      return
    }

    this.value = this.value === value ? 0 : value

    this.updateComplete.then(() => fire(this, 'change', {bubbles: true}))
  }

  private onPointerMove_(e: Event) {
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

  override firstUpdated(props: PropertyValues) {
    super.firstUpdated(props)
    this.addEventListener('keydown', this)
    this.addEventListener('keyup', this)
    this.setAttribute('tabindex', '0')
  }

  protected override updated(props: PropertyValues) {
    super.updated(props)

    if (props.has('value')) {
      this.setFormValue(this.value.toString())
    }

    if (props.has('value') || props.has('max')) {
      this.validate_()
    }
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
