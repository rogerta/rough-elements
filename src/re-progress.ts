import { css, html, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { Mixin as BgMixin } from './re-background-mixin.js'
import { Mixin as BorderMixin } from './re-border-mixin.js'
import { ReElement } from './re-element.js'

@customElement('re-progress')
export class ProgressElement extends BorderMixin(BgMixin(ReElement)) {
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
          label.style.color = 'black'
        } else {
          label.style.marginLeft = 'auto'
          label.style.marginRight = `${101 - this.fillFraction * 100}%`
          label.style.color = 'white'
        }
      }
    }

    this.requestRoughRender()
  }

  static styles = [
    ...super.styles,
    css`
      :host {
        display: inline-block;
        --background-color: rgb(from var(--re-primary-color) R G B / 0.5);
        --background-stroke-width: 4px;
        font: caption;
      }
      div {
        margin: 0;
        height: 1rem;
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
