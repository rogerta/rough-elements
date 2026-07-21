import { css } from 'lit'
import { property } from 'lit/decorators.js'

import type { ReElement } from './re-element.js'
import type { BORDERSTYLE } from './re-common.js'

type Constructor<T = {}> = new (...args: any[]) => T

/**
 * A mixin class that draws a border around the element using rough drawing
 * primitives.
 *
 * By default a simple two-line border is drawn as if a pen went over the
 * same path twice.  The border is drawing using the `--border-color` CSS
 * proprty if defined, or the current color of the element with a 50% alpha
 * channel.
 *
 * The standard border width CSS properties are respected such that the rough
 * border is always drawn in that region.  However larger borders do not
 * cause more lines to be drawn.  The two lines simply drawn with more space
 * between them.  The usefulness of changing the border width of a rough element
 * may be limited.  Setting different widths for different sides of the the
 * element may also cause unexpected effects.
 *
 * Each of the lines is implenmented as an SVG <path> with the stroke being
 * drawn.  Each of the CSS properties of the form `re-stroke-xxx` maps to the
 * equivalent stroke CSS property `stroke-xxx`.
 *
 * The following CSS properties are supported:
 * @cssproperty --border-color - The colour used to draw the border.
 * @cssproperty --border-width - The width of the border.  This defaults to
 *    0.5rem and generally should not be changed.  See description above.
 * @cssproperty --re-stroke-dasharray - Defines the dash array for the stroke.
 * @cssproperty --re-stroke-dashoffset - Defines the dash offset for the stroke.
 * @cssproperty --re-stroke-linecap - Defines the line cap for the stroke.
 * @cssproperty --re-stroke-linejoin - Defines the line join for the stroke.
 * @cssproperty --re-stroke-miterlimit - Defines the miter limit for the stroke.
 * @cssproperty --re-stroke-opacity - Defines the opacity of the stroke colour.
 * @cssproperty --re-stroke-width - Defines the opacity of the stroke.
 */
export declare class BorderMixinInterface {
  /**
   * Determines the style of border around this element.  Can be `rectangle`
   * (default) or `circle` or `none`.  The border will be drawn in the border
   * area of the element.
   */
  borderStyle: BORDERSTYLE
}

/**
 * See description of `BorderMixinInterface` for details.
 */
export const BorderMixin =
    <T extends Constructor<ReElement>>(superClass: T) => {
  class MixinClass extends superClass {
    @property({}) accessor borderStyle: BORDERSTYLE = 'rectangle'

    static styles = [
      ...(superClass as unknown as typeof ReElement).styles,
      css`
        :host {
          border-width: var(--re-border-width, var(--border-width));
        }

        /* Styling for the outline of shapes.  Anything that affects the stroke
        * of an SVG element can be used here.  Fill is always 'none'. */
        #rough .border .outline {
          fill: none;
          stroke: var(--re-border-color, var(--border-color));
          stroke-dasharray: var(--re-stroke-dasharray, inherit);
          stroke-dashoffset: var(--re-stroke-dashoffset, inherit);
          stroke-linecap: var(--re-stroke-linecap, inherit);
          stroke-linejoin: var(--re-stroke-linejoin, inherit);
          stroke-miterlimit: var(--re-stroke-miterlimit, inherit);
          stroke-opacity: var(--re-stroke-opacity, inherit);
          stroke-width: var(--re-stroke-width, inherit);
        }
      `]

    protected override onResized(
        width: number,
        height: number,
        cstyles: CSSStyleDeclaration): SVGElement[] {
      const roughElements = super.onResized(width, height, cstyles)
      const borderWidth = parseFloat(cstyles.borderWidth)
      const halfBorderWidth = borderWidth / 2

      if (this.enableDebugging) {
        console.log(`onResize: bw=${borderWidth} w=${width} h=${height}`)
      }

      if (borderWidth > 0) {
        const options = Object.assign({
          maxRandomnessOffset: halfBorderWidth,
        }, this.options)

        let el = undefined
        if (this.borderStyle === 'rectangle') {
          el = this.rough.rectangle(
              -halfBorderWidth, -halfBorderWidth,
              width + borderWidth, height + borderWidth,
              options)
        } else if (this.borderStyle === 'circle') {
          el = this.rough.ellipse(
              (width) / 2, (height) / 2,
              width + borderWidth, height + borderWidth,
              options)
        }
        if (el) {
          el.classList.add('border')
          roughElements.push(el)
        }
      }

      return roughElements
    }
  }
  return MixinClass as Constructor<BorderMixinInterface> & T;
}
