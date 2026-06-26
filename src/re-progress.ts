import { css, html, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { BackgroundMixin } from './internal/re-background-mixin.js'
import { BorderMixin } from './internal/re-border-mixin.js'
import { ReElement } from './internal/re-element.js'

/**
 * Progress element represents the completion progress of a task.
 * It displays a hand-drawn rough zigzag progress bar.
 *
 * @cssproperty --color - Color of the progress label and bar lines.
 * @cssproperty --label-lower-color - Color of the label when the progress is lower than 50%. Defaults to `--color`.
 * @cssproperty --label-upper-color - Color of the label when the progress is at or above 50%. Defaults to `--background-color`.
 */
@customElement('re-progress')
export class ProgressElement extends BorderMixin(BackgroundMixin(ReElement)) {
  @property({ type: Boolean, reflect: true }) showValue = false
  @property({ type: Number }) min = 0
  @property({ type: Number }) max = 1
  @property({ type: Number }) value?: number

  constructor() {
    super()
    this.hachureGap = 7
    this.hachureAngle = -15
    this.fillStyle = 'zigzag'
    this.fillFraction = 0
  }

  override render() {
    return [
      super.renderRoughSvg(),
      html`
        <!-- The label displaying the numeric progress value when showValue is true. -->
        <div part="label">${this.renderValue_()}</div>
      `,
    ]
  }

  renderValue_() {
    return this.showValue && this.value ? this.value.toFixed(1) : ''
  }

  override updated(props: PropertyValues) {
    super.updated(props)

    if(props.has('min')) {
      if (this.min > this.max) {
        this.min = 0
      }
    }

    if(props.has('max')) {
      if (this.max < this.min) {
        this.max = 1
      }
    }

    if (this.value !== undefined) {
      if (this.value < this.min) {
        this.value = this.min
      } else if (this.value > this.max) {
        this.value = this.max
      }
    }

    if(props.has('value')) {
      const value = this.value ?? this.min
      this.fillFraction = (value - this.min) / (this.max - this.min)
      const label = this.renderRoot.querySelector('div')
      if (label) {
        if (this.fillFraction < 0.5) {
          label.style.marginLeft = `${this.fillFraction * 100 + 1}%`
          label.style.marginRight = 'auto'
          label.style.color = 'var(--label-lower-color)'
        } else {
          label.style.marginLeft = 'auto'
          label.style.marginRight = `${101 - this.fillFraction * 100}%`
          label.style.color = 'var(--label-upper-color)'
        }
      }
    }

    this.requestRoughRender()
  }

  static styles = [
    ...super.styles,
    css`
      :host {
        display: inline-flex;
        align-items: center;
        --re-background-color: var(--color);
        --re-background-stroke-width: 4px;
        --label-lower-color: var(--color);
        --label-upper-color: var(--background-color);
      }
      div {
        margin: 0;
        display: flex;
        align-items: center;
        height: 0.5rem;
        font-size: 0.5rem;
        width: fit-content;
        text-align: center;
        font-weight: bold;
      }
    `
  ]
}

declare global {
  interface HTMLElementTagNameMap {
    're-progress': ProgressElement
  }
}
