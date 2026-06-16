import { css, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { ReElement } from './re-element.js'

// Use CSS style "writing-mode" to make this range vertical.
@customElement('re-range')
export class RangeElement extends ReElement {
  @property({ type: Number }) min = 0
  @property({ type: Number }) max = 100
  @property({ type: Number }) step = 1
  @property({ type: Number }) value: number = 50

  /**
   * If true the button is disabled and does not respond to user actions.
   */
  @property({ type: Boolean, reflect: true }) disabled = false

  constructor() {
    super()

    // This makes the element focusable.
    this.setAttribute('tabindex', '0')
  }

  static styles = [
    ...super.styles,
    css`
      :host {
        display: inline-block;
        border-width: 0;
        box-sizing: content-box;
        width: 10rem;
        height: 24px;
        stroke: var(--color, rgb(from black R G B / 0.5));
        fill: var(--color, rgb(from var(--re-primary-color) R G B / 1));
        outline: none;
      }
      :host([disabled]) {
        opacity: 0.5;
      }

      :host(:not([disabled]):focus) #rough .line path {
        stroke-width: 2px;
      }

      /* Button press animation */
      #rough .circle {
        /* The following two properties are used to center the scale transform
         * on the "#rough .circle" element being scaled. */
        transform-box: fill-box;
        transform-origin: center;
        transition: transform 0.2s ease;
      }
      :host(:not([disabled]):active) #rough .circle,
      :host(:not([disabled]).is-active) #rough .circle {
        transform: scale(0.85);
      }

      @media (hover: hover) {
        :host(:hover:not([disabled])) {
          text-shadow: 0 0 3px var(--button-text-shadow-color);
          filter: drop-shadow(0px 0px 4px rgb(from var(--re-primary-color) R G B / 0.8));
        }
        :host(:hover:active:not([disabled])) {
          text-shadow: 0 0 3px var(--button-text-shadow-color);
          filter: drop-shadow(0px 0px 4px rgb(from var(--re-primary-color) R G B / 0.8));
        }
      }
    `
  ]

  override updated(props: PropertyValues) {
    super.updated(props)

    if(props.has('min')) {
      if (this.min > this.max) {
        this.min = 0
      }
    }

    if(props.has('max')) {
      if (this.max < this.min) {
        this.max = 100
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
    }

    this.requestRoughRender()
  }

  override render() {
    return super.renderRoughSvg()
  }

  protected override onResized(
      width: number,
      height: number,
      cstyles: CSSStyleDeclaration): SVGElement[] {
    const roughElements = super.onResized(width, height, cstyles)

    const options = Object.assign({
       stroke: 'inherit',
    }, this.options)

    const half = height / 2
    roughElements.push(this.rough.line(0, half, width, half, options))

    const position = (this.value - this.min) / (this.max - this.min) * width
    options.fill = 'inherit'
    options.fillStyle = 'solid'
    roughElements.push(this.rough.circle(position, half, half, options))

    return roughElements
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-range': RangeElement
  }
}
