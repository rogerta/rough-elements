import { css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { ReElement } from './re-element.js'

@customElement('re-spinner')
export class SpinnerElement extends ReElement {
  @property({ type: Boolean, reflect: true }) showValue = false
  @property({ type: Number }) min = 0
  @property({ type: Number }) max = 1
  @property({ type: Number }) value?: number

  override render() {
    return [
      super.renderRoughSvg(),
    ]
  }

  protected override onResized(
      width: number,
      height: number,
      cstyles: CSSStyleDeclaration) {
    const strokeWidth = cstyles.getPropertyValue('--track-width')

    const elements = super.onResized(width, height, cstyles)

    const options = Object.assign({
       stroke: 'inherit',
       strokeWidth,
    }, this.options)

    const cx = width / 2
    const cy = height / 2
    const d = Math.min(width, height)
    elements.push(this.rough.circle(cx, cy, d, options))

    options.disableMultiStroke = true
    elements.push(this.rough.circle(cx, cy, d, options))

    return elements
  }

  static styles = [
    ...super.styles,
    css`
      :host {
        display: inline-block;
        border-width: 0;
        --size: 1.5rem;
        --track-width: 2px;
        --circumference: calc(var(--size) * 3.14159);
        --dash-small: calc(var(--circumference) * 0.2);
        --dash-large: calc(var(--circumference) * 0.8);
        width: var(--size);
        height: var(--size);
      }
      svg :first-child path {
        stroke: var(--re-spinner-tracker-color, rgb(0 0 0 / 0.1));
      }
      svg :nth-child(2) path {
        stroke: var(--re-spinner-indicator-color, var(--re-primary-color));
        stroke-dasharray: var(--dash-small) var(--dash-large);
        transform-origin: center;
        animation: morphdash 2s ease-in-out infinite alternate,
                   rotatedash 0.75s linear infinite;
      }
      @keyframes morphdash {
        0% {
          stroke-dasharray: var(--dash-small) var(--dash-large);
        }
        100% {
          stroke-dasharray: var(--dash-large) var(--dash-small);
        }
      }
      @keyframes rotatedash {
        0% {
          transform: rotateY(180deg) rotateZ(0deg);
        }
        100% {
          transform: rotateY(180deg) rotateZ(-360deg);
        }
      }
    `
  ]
}

declare global {
  interface HTMLElementTagNameMap {
    're-spinner': SpinnerElement
  }
}
