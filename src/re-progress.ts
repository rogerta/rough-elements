import { css, html, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { BackgroundMixin } from './internal/re-background-mixin.js'
import { BorderMixin } from './internal/re-border-mixin.js'
import { ReElement } from './internal/re-element.js'

/**
 * Progress elements represent the completion progress of a task.
 *
 * @cssproperty --color - Color of the progress label and bar lines.
 * @cssproperty --label-lower-color - Color of the label when the progress
 *    is lower than 50%. Defaults to `--color`.
 * @cssproperty --label-upper-color - Color of the label when the progress
 *    is at or above 50%. Defaults to `--background-color`.
 */
@customElement('re-progress')
export class ProgressElement extends BorderMixin(BackgroundMixin(ReElement)) {
  /**
   * If true the numeric value of the progress is displayed on the progress bar.
   */
  @property({ type: Boolean, reflect: true }) showvalue = false

  /**
   * The lower numeric bound of the measured range. This must be less than
   * `max` if specified.
   */
  @property({ type: Number }) min = 0

  /**
   * The upper numeric bound of the measured range. This must be greater than
   * `min` if specified.
   */
  @property({ type: Number }) max = 1

  /**
   * The current value of the progress bar.
   */
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
        <!-- The label displaying the numeric progress value when \`showvalue\`
             is true. -->
        <div part="label">${this.renderValue_()}</div>
      `,
    ]
  }

  private renderValue_() {
    return this.showvalue && this.value ? this.value.toFixed(1) : ''
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
        --color: var(--primary-color);
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
