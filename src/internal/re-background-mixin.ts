import { css } from 'lit'

import type { ReElement } from './re-element'
import { property } from 'lit/decorators.js'
import type { FILLSTYLE } from './re-common'

type Constructor<T = {}> = new (...args: any[]) => T

/**
 * A mixin class that fills the background of an element using rough drawing
 * primitives.
 *
 * By default the background is transparent.  See the `fillStyle` property to
 * determine the types of backgrounds supported.
 *
 * The following CSS properties are supported:
 * @cssproperty --re-background-color - Determines the background.  This applies
 *    to all fill styles.
 * @cssproperty --re-background-stroke-width - When filling with `hachure` or
 *    `zigzag` styles, determines the width of the stroke.
 * @cssproperty --re-fill-dasharray - When filling with `hachure` or `zigzag`
 *    styles, defines the dash array for the stroke used to fill the background.
 * @cssproperty --re-fill-dashoffset - When filling with `hachure` or `zigzag`
 *    styles, defines the dash offset for the stroke used to fill the
 *    background.
 * @cssproperty --re-fill-linecap - When filling with `hachure` or `zigzag`
 *    styles, defines the line cap for the stroke used to fill the background.
 * @cssproperty --re-fill-linejoin - When filling with `hachure` or `zigzag`
 *    styles, defines the line join for the stroke used to fill the background.
 * @cssproperty --re-fill-miterlimit - When filling with `hachure` or `zigzag`
 *    styles, defines the miter limit for the stroke used to fill the
 *    background.
 * @cssproperty --re-fill-opacity - When using the `solid` style, defines
 *    the opacity of the fill colour.
 * @cssproperty --re-fill-rule - When using the `solid` style, defines
 *    the fill rule of the fill colour.
 */
export declare class BackgroundMixinInterface {
  /**
   * The style of fill to use as the background of this elemnt.  When set to
   * `none` the element's background is transparent.  This is the default.
   *
   * When set to `solid`, the background is filled with the colour specified
   * in the `--re-background-color` CSS property.  This colour value must
   * resolve to a valid `rgb()` colour.
   *
   * When set to `hachure` or `zigzag`, the background is filled with lines.
   * The former uses rougly parallel lines whereas the latter uses zigzags
   * as if the pen was never removed from the paper.  The other properties
   * and CSS properties affect how the lines are drawn.  Internally, the lines
   * are SVG <path>s with the stroke being drawn.  Each of the CSS properties
   * of the form `re-fill-xxx` maps to the equivalent stroke CSS property
   * `stroke-xxx`.
   */
  fillStyle: FILLSTYLE

  /**
   * Fills on the specified fraction of the element's background, starting
   * from the left.  This is used to implement the progress bar and likely
   * needs to be generalized for other uses.  This value must be between
   * 0 and 1.
   */
  fillFraction: number

  /**
   * Sets the weight of the stroke used to fill the background.
   * NOTE: This may conflict with --re-background-stroke-width, needs
   * investigation.
   */
  hachureWeight: number

  /**
   * The gap between lines of the `hachure` or `zigzag` styles in pixels.
   * The larger the gap, the more empty space between the fill lines, causing
   * more of the background to show through.
   */
  hachureGap: number

  /**
   * The angle of the lines of the `hachure` or `zigzag` styles in degrees.
   * Zero degrees is straight up and down, and positive values turn the lines
   * clockwise.
   */
  hachureAngle: number
}

/**
 * See description of `BackgroundMixinInterface` for details.
 */
export const BackgroundMixin =
    <T extends Constructor<ReElement>>(superClass: T) => {
  class MixinClass extends superClass {
    @property({}) fillStyle: FILLSTYLE = 'none'
    @property({}) hachureWeight = 6
    @property({}) hachureGap = 15
    @property({}) hachureAngle = -75
    @property({}) fillFraction = 1

    static styles = [
      ...(superClass as unknown as typeof ReElement).styles,
      css`
        :host {
          --re-background-stroke-width: 16;
        }

        /* Styling for the solid fill of shapes.  Anything that affects the fill
        * of an SVG element can be used here.  Stroke is always 'none'. */
        #rough .background .solid-fill {
          stroke: none;
          fill: var(--re-background-color, inherit);
          fill-opacity: var(--re-fill-opacity, inherit);
          fill-rule: var(--re-fill-rule, inherit);
        }

        /* Styling for the pattern fill of shapes.  Anything that affects the
        * stroke of an SVG element can be used here.  Fill is always 'none'. */
        #rough .background .pattern-fill {
          fill: none;
          stroke: var(--re-background-color, inherit);
          stroke-dasharray: var(--re-fill-dasharray, inherit);
          stroke-dashoffset: var(--re-fill-dashoffset, inherit);
          stroke-linecap: var(--re-fill-linecap, inherit);
          stroke-linejoin: var(--re-fill-linejoin, inherit);
          stroke-miterlimit: var(--re-fill-miterlimit, inherit);
          stroke-opacity: var(--re-fill-opacity, inherit);
          stroke-width: var(--re-background-stroke-width, inherit);
        }
      `]

    protected override onResized(
        width: number,
        height: number,
        cstyles: CSSStyleDeclaration): SVGElement[] {
      const roughElements = super.onResized(width, height, cstyles)
      if (this.fillStyle === 'none') {
        return roughElements
      }

      const borderWidth = parseFloat(cstyles.borderWidth)
      const halfBorderWidth = borderWidth / 2
      const bgColour = cstyles.getPropertyValue('--re-background-color')

      if (bgColour) {
        // NOTE: `fill` is set to 'inherit' so that the colour can dynamically
        // change based on the CSS property.  If `fill` were set to `bgColour`
        // instead, it would override any CSS value.

        const options = Object.assign({
          maxRandomnessOffset: halfBorderWidth,
          stroke: 'none',
          fill: 'inherit',
          fillStyle: this.fillStyle,
          fillWeight: this.hachureWeight,
          hachureGap: this.hachureGap,
          hachureAngle: this.hachureAngle,
        }, this.options)

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
  return MixinClass as Constructor<BackgroundMixinInterface> & T;
}
