import { LitElement, css, html, type PropertyValues } from 'lit'
import { query } from 'lit/decorators.js'

import rough from '@rogerta/roughjs'

export type Point = [number, number]
export type RoughCanvas = ReturnType<typeof rough.canvas>
export type RoughSVG = ReturnType<typeof rough.svg>
export type Config = NonNullable<Parameters<typeof rough.generator>[0]>
export type Options = NonNullable<Config['options']>
export type ResolvedOptions = Required<Options>

// The baseclass for all rough elements.
//
// Some useful info that needs to be documented:
//
// --rough-z-index CSS prop sets the ordering of the rough elements.
// --border-width CSS prop sets the width of the rough border.
// --border-color CSS prop sets the colour of the rough border.
export class ReElement extends LitElement {
  @query('svg', true) private svg_?: SVGSVGElement;

  private rough_?: RoughSVG
  private options_: Options = { seed: rough.newSeed() }

  get svg() { return this.svg_! }
  get rough(): RoughSVG {
    if (!this.rough_ && this.svg_) {
      this.rough_ = rough.svg(this.svg_)
    }
    return this.rough_!
  }

  get options(): Options { return this.options_}

  override firstUpdated(_: PropertyValues) {
    if (!this.rough) {
      throw new Error('Error creating roughness')
    }
  }

  renderRoughSvg() {
    return html`<svg id="rough"></svg>`
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
    `]
}
