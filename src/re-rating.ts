import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'

import { fire } from './internal/re-element.js'
import { FormControlMixin } from './internal/re-form-control-mixin.js'

import { IconElement } from './re-icon.js'

/**
 * Ratings collect star ratings from (or display them to) the user.  Ratings
 * can be configured with 3 to 5 stars.
 *
 * Ratings can be associated with HTML forms and will submit their rating.
 * In this case, the `name` property must be set to a valid string.
 *
 * @cssproperty --re-rating-color - Color of the selected rating stars. Defaults to `gold`.
 */
@customElement('re-rating')
export class RatingElement extends FormControlMixin(LitElement) {
  static formAssociated = true

  /**
   * The number of stars to display.  The minimum is 3 and the maximum is 5.
   */
  @property({ type: Number }) max = 5

  /**
   * The rating. When specified in the HTML, corresponds to the initial value.
   */
  @property({ type: Number }) value: number = 0

  /**
   * If true the input does not respond to user actions.  Disabled inputs are
   * not sumbitted as part of a form.
   */
  @property({ type: Boolean, reflect: true }) disabled = false

  /**
   * If true, the rating is not editable.
   */
  @property({ type: Boolean, reflect: true }) readonly = false

  /**
   * If true, the checkbox must be checked before its form can be submitted.
   */
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
        --color: rgb(from var(--foreground-color) R G B / 0.3);
        transition: transform 0.2s ease;
      }

      .hidden {
        display: none;
      }

      :host(:not(:hover)) re-icon.selected,
      :host([readonly]) re-icon.selected,
      :host([disabled]) re-icon.selected {
        --color: var(--re-rating-color);
      }

      :host(:not([disabled]):focus) re-icon,
      :host(:not([disabled]):active) re-icon {
        filter: drop-shadow(0 0 4px var(--foreground-color));
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

    if (!Number.isInteger(this.max) || this.max < 3 || this.max > 5) {
      console.error(`Invalid max value ${this.max}.  Must be between 3 and 5.`)
    }
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
    const classes4 = {selected: this.value > 3, hidden: this.max < 4 }
    const classes5 = {selected: this.value > 4, hidden: this.max < 5 }

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
