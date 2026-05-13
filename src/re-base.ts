import { LitElement, css, html, type PropertyValues } from 'lit'
import { query } from 'lit/decorators.js'

import rough from '@rogerta/roughjs'

export type Point = [number, number]
export type RoughCanvas = ReturnType<typeof rough.canvas>
export type RoughSVG = ReturnType<typeof rough.svg>
export type Config = NonNullable<Parameters<typeof rough.generator>[0]>
export type Options = NonNullable<Config['options']>
export type ResolvedOptions = Required<Options>

// Some useful info that needs to be documented:
//
// --rough-z-index CSS prop sets the ordering of the rough elements.
// --border-width CSS prop sets the width of the rough border.
// --border-color CSS prop sets the colour of the rough border.
// --background-color CSS prop sets the colour of the rough background.
// --background-stroke-width CSS prop sets the width of the stroke used to
//    paint the pattern background.
export class ReBase extends LitElement {
  @query('svg', true) private svg_?: SVGSVGElement;

  private rough_?: RoughSVG
  private observer_?: ResizeObserver
  private options_: Options = {
  }

  constructor() {
    super()
    this.options_.seed = rough.newSeed()
  }

  protected firstUpdated(_: PropertyValues) {
    if (this.svg_) {
      this.rough_ = rough.svg(this.svg_)
    } else {
      throw new Error('Failed to find svg element')
    }

    this.observer_ = new ResizeObserver(entries => {
      if (!this.svg_ || !this.rough_) {
        throw new Error('Failed to find svg element')
      }

      for (let entry of entries) {
        const { width, height } = this.svg_.getBoundingClientRect()
        const cstyles = getComputedStyle(entry.target)
        const borderWidth = parseFloat(cstyles.borderWidth)
        const halfBorderWidth = borderWidth / 2
        const bgColour = cstyles.getPropertyValue('--background-color')
        const roughElements: SVGElement[] = []

        if (bgColour) {
          const options = Object.assign({
            maxRandomnessOffset: halfBorderWidth,
            fill: bgColour,
            fillStyle: 'hachure',
            fillWeight: 16,  // Should match --background-stroke-width below.
            hachureGap: 17,
            hachureAngle: -60,
          }, this.options_)
          const el = this.rough_.rectangle(
              -halfBorderWidth, -halfBorderWidth,
              width + borderWidth, height + borderWidth,
              options)
          el.classList.add('background')
          roughElements.push(el)
        }

        if (borderWidth > 0) {
          const options = Object.assign({
            maxRandomnessOffset: halfBorderWidth,
          }, this.options_)
          const el = this.rough_.rectangle(
              -halfBorderWidth, -halfBorderWidth,
              width + borderWidth, height + borderWidth,
              options)
          el.classList.add('border')
          roughElements.push(el)
        }

        this.svg_.replaceChildren(...roughElements)
      }
    })
    this.observer_.observe(this, {box: 'border-box'})
  }

  renderRoughSvg() {
    return [html`<svg id="rough"></svg>`]
  }

  static styles = [
    css`
      :host {
        /* Make sure the browser will not draw any visible border even when
         * the border width is other than zero by setting it to solid transpent.
         * This is done so that the border-width CSS property can be used to
         * control the rough border width.  Without this trick, the computed
         * border width will always be zero regardless how it is specified in
         * CSS. */
        border-color: transparent;
        border-style: solid;

        /* Needed so that the svg's absolute position works. */
        position: relative;

        /* It's important that the element box sizing be border-box so that the
         * rough border is re-drawn when the element's border width changes.
         * Otherwise the resize observer would not get called. */
        box-sizing: border-box;

        /* Should match fillWeight above */
        --background-stroke-width: 16;
      }

      /* The svg element is positioned to covers the padding box of the host
       * element. Overflow is visible so the rough border (SVG sub-elements)
       * will can placed in the host's border box, which is outside the
       * padding box. */
      #rough {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
        z-index: var(--rough-z-index, -1);
      }

      /* Styling for the outline of shapes.  Anything that affects the stroke
       * of an SVG element can be used here.  Fill is always 'none'. */
      #rough .border .outline {
        fill: none;
        stroke: var(--border-color, currentcolor);
        stroke-dasharray: var(--re-stroke-dasharray, inherit);
        stroke-dashoffset: var(--re-stroke-dashoffset, inherit);
        stroke-linecap: var(--re-stroke-linecap, inherit);
        stroke-linejoin: var(--re-stroke-linejoin, inherit);
        stroke-miterlimit: var(--re-stroke-miterlimit, inherit);
        stroke-opacity: var(--re-stroke-opacity, inherit);
        stroke-width: var(--re-stroke-width, inherit);
      }

      /* Styling for the solid fill of shapes.  Anything that affects the fill
       * of an SVG element can be used here.  Stroke is always 'none'. */
      #rough .background .solid-fill {
        stroke: none;
        fill: var(--background-color, inherit);
        fill-opacity: var(--re-fill-opacity, inherit);
        fill-rule: var(--re-fill-rule, inherit);
      }

      /* Styling for the pattern fill of shapes.  Anything that affects the
       * stroke of an SVG element can be used here.  Fill is always 'none'. */
      #rough .background .pattern-fill {
        fill: none;
        stroke: var(--background-color, inherit);
        stroke-dasharray: var(--re-fill-dasharray, inherit);
        stroke-dashoffset: var(--re-fill-dashoffset, inherit);
        stroke-linecap: var(--re-fill-linecap, inherit);
        stroke-linejoin: var(--re-fill-linejoin, inherit);
        stroke-miterlimit: var(--re-fill-miterlimit, inherit);
        stroke-opacity: var(--re-fill-opacity, inherit);
        stroke-width: var(--background-stroke-width, inherit);
      }
    `]
}
