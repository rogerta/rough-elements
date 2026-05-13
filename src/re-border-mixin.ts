import { css } from 'lit'

import type { ReElement } from './re-element'

type Constructor<T = {}> = new (...args: any[]) => T

// Some useful info that needs to be documented:
//
// --border-width CSS prop sets the width of the rough border.
// --border-color CSS prop sets the colour of the rough border.
// --background-color CSS prop sets the colour of the rough background.
// --background-stroke-width CSS prop sets the width of the stroke used to
//    paint the pattern background.
export const Mixin =
    <T extends Constructor<ReElement>>(superClass: T) => {
  class MixinClass extends superClass {
    static styles = [
      ...(superClass as unknown as typeof ReElement).styles,
      css`
        :host {
          --border-width: 0.5rem;
          border-width: var(--border-width);
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
      `]

    override onResized(
        width: number,
        height: number,
        cstyles: CSSStyleDeclaration): SVGElement[] {
      const borderWidth = parseFloat(cstyles.borderWidth)
      const halfBorderWidth = borderWidth / 2
      const roughElements = super.onResized(width, height, cstyles)

      if (borderWidth > 0) {
        const options = Object.assign({
          maxRandomnessOffset: halfBorderWidth,
        }, this.options)
        const el = this.rough.rectangle(
            -halfBorderWidth, -halfBorderWidth,
            width + borderWidth, height + borderWidth,
            options)
        el.classList.add('border')
        roughElements.push(el)
      }

      return roughElements
    }
  }
  return MixinClass as T;
}
