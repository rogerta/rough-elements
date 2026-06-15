import { css } from 'lit'

import type { ReElement } from './re-element'
import { property } from 'lit/decorators.js'
import type { FILLSTYLE } from './re-common'

type Constructor<T = {}> = new (...args: any[]) => T

export declare class MixinInterface {
  fillStyle: FILLSTYLE
  fillFraction: number
  hachureWeight: number
  hachureGap: number
  hachureAngle: number
}

// Some useful info that needs to be documented:
//
// --background-color CSS prop sets the colour of the rough background.
// --background-stroke-width CSS prop sets the width of the stroke used to
//    paint the pattern background.
export const Mixin =
    <T extends Constructor<ReElement>>(superClass: T) => {
  class MixinClass extends superClass {
    @property({}) fillStyle: FILLSTYLE = 'hachure'
    @property({}) hachureWeight = 6
    @property({}) hachureGap = 15
    @property({}) hachureAngle = -75
    @property({}) fillFraction = 1

    static styles = [
      ...(superClass as unknown as typeof ReElement).styles,
      css`
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

    protected override onResized(
        width: number,
        height: number,
        cstyles: CSSStyleDeclaration): SVGElement[] {
      const borderWidth = parseFloat(cstyles.borderWidth)
      const halfBorderWidth = borderWidth / 2
      const bgColour = cstyles.getPropertyValue('--background-color')
      const roughElements = super.onResized(width, height, cstyles)

      if (bgColour) {
        // NOTE: `fill` is set to 'inherit' so that the colour can dynamically
        // change based on the CSS property.  If `fill` were set to `bgColour`
        // instead, it would override any CSS value.

        const options = Object.assign({
          maxRandomnessOffset: halfBorderWidth,
          stroke: 'none',
          fillStyle: this.fillStyle,
          fillWeight: this.hachureWeight,
          hachureGap: this.hachureGap,
          hachureAngle: this.hachureAngle,
        }, this.options)
        if (this.fillStyle !== 'none') {
          options.fill = 'inherit'
        }

        // NOTE: the fraction is used for implementing a "progress" effect.
        // See <re-progress>.
        const finalWidth = this.fillFraction * (width + borderWidth)

        const el = this.rough.rectangle(
            -halfBorderWidth, -halfBorderWidth,
            finalWidth, height + borderWidth,
            options)
        el.classList.add('background')
        roughElements.push(el)
      }

      return roughElements
    }
  }
  return MixinClass as Constructor<MixinInterface> & T;
}
