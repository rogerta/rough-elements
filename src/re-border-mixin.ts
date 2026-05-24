import { css } from 'lit'
import { property } from 'lit/decorators.js'

import type { ReElement } from './re-element.js'
import type { BORDERSTYLE } from './re-common.js'

type Constructor<T = {}> = new (...args: any[]) => T

export declare class MixinInterface {
    borderStyle: BORDERSTYLE
}

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
    @property({}) borderStyle: BORDERSTYLE = 'rectangle'

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
          stroke: var(--border-color, rgb(from currentcolor R G B / 0.5));
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
  return MixinClass as Constructor<MixinInterface> & T;
}
