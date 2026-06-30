import { css, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { fire, ReElement } from './internal/re-element.js'
import { ReFormControlMixin } from './internal/re-form-control-mixin.js'

/**
 * Range element represents a slider control to select a numeric value within a range.
 *
 * @cssproperty --knob-fraction - Height fraction of the knob diameter (between 0 and 1). Defaults to 0.66.
 * @cssproperty --re-range-knob-outline-color - Stroke color of the knob circle. Defaults to `--re-range-knob-color`.
 * @cssproperty --re-range-knob-color - Fill color of the knob circle. Defaults to `--color`.
 * @cssproperty --re-range-track-color - Stroke color of the range track line. Defaults to `--color`.
 * @cssproperty --color - Fallback color for knob and track.
 */
@customElement('re-range')
export class RangeElement extends ReFormControlMixin(ReElement) {
  static formAssociated = true

  @property({ type: Number }) min = 0
  @property({ type: Number }) max = 100
  @property({ type: Number }) step = 1
  @property({ type: Number }) value: number = 50

  /**
   * If true the button is disabled and does not respond to user actions.
   */
  @property({ type: Boolean, reflect: true }) disabled = false

  static styles = [
    ...super.styles,
    css`
      :host {
        position: relative;
        display: inline-block;
        border-width: 0;
        box-sizing: content-box;
        width: 10rem;
        height: 24px;
        --knob-fraction: 0.66;
        outline: none;
      }
      :host([disabled]) {
        opacity: 0.5;
      }

      :host(:not([disabled]):focus) #rough .line path {
        stroke-width: 2px;
      }

      #rough .circle {
        stroke: var(--re-range-knob-outline-color,
                    var(--re-range-knob-color, var(--color)));
        fill: var(--re-range-knob-color, var(--color));
      }

      #rough .line {
        stroke: var(--re-range-track-color, var(--color));
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

  handleEvent(e: Event) {
    switch (e.type) {
      case 'pointerdown': {
        const pe = e as PointerEvent
        this.setPointerCapture(pe.pointerId)
        break
      }
      case 'pointermove': {
        const pe = e as PointerEvent
        if (this.hasPointerCapture(pe.pointerId)) {
          const bounds = this.getBoundingClientRect()
          const fraction = pe.offsetX / (bounds.width)
          this.value = this.snap_(fraction * (this.max - this.min) + this.min)
        }
        break
      }
      case 'pointerup': {
        const pe = e as PointerEvent
        this.releasePointerCapture(pe.pointerId)

        const bounds = this.getBoundingClientRect()
        const fraction = pe.offsetX / (bounds.width)
        this.value = this.snap_(fraction * (this.max - this.min) + this.min)
        this.updateComplete.then(() => fire(this, 'change', {bubbles: true}))
        break
      }
      case 'keydown': {
        const ke = e as KeyboardEvent

        switch (ke.key) {
          case 'ArrowDown':
          case 'ArrowLeft':
            // Prevent the default otherwise the page may scroll.
            ke.preventDefault()
            this.value -= this.step
            break
          case 'ArrowUp':
          case 'ArrowRight':
            // Prevent the default otherwise the page may scroll.
            ke.preventDefault()
            this.value += this.step
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

  private snap_(value: number) {
    return Math.round(value / this.step) * this.step

  }

  override firstUpdated(props: PropertyValues) {
    super.firstUpdated(props)
    this.addEventListener('pointerdown', this)
    this.addEventListener('pointermove', this)
    this.addEventListener('pointerup', this)
    this.addEventListener('keydown', this)
    this.addEventListener('keyup', this)
    this.setAttribute('tabindex', '0')
  }

  // Note: this function always fixes `value` to make it valid.  So in no
  // case will the state be invalid for form purposes.
  override updated(props: PropertyValues) {
    super.updated(props)

    let requestRoughRender = false

    if(props.has('min')) {
      if (this.min > this.max) {
        this.min = 0
        requestRoughRender = true
      }
    }

    if(props.has('max')) {
      if (this.max < this.min) {
        this.max = 100
        requestRoughRender = true
      }
    }

    if(props.has('value')) {
      if (this.value === undefined) {
        this.value = this.min
      } else {
        this.value = this.snap_(this.value)
      }

      if (this.value < this.min) {
        this.value = this.min
      } else if (this.value > this.max) {
        this.value = this.max
      }

      this.setFormValue(this.value.toString())
      fire(this, 'input', {bubbles: true, composed: true})
      requestRoughRender = true
    }

    if (requestRoughRender) {
      this.requestRoughRender()
    }
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

    let fraction =
        Number.parseFloat(cstyles.getPropertyValue('--knob-fraction'))
    if (Number.isNaN(fraction)) {
      fraction = 2 / 3
    } else {
      fraction = Math.min(Math.max(fraction, 0), 1)
    }

    const diameter = height * fraction
    const position = (this.value - this.min) / (this.max - this.min) * width
    options.fill = 'inherit'
    options.fillStyle = 'solid'
    roughElements.push(this.rough.circle(position, half, diameter, options))

    return roughElements
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-range': RangeElement
  }
}
