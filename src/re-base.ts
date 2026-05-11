import { LitElement, css, html, type PropertyValues } from 'lit'
import { query } from 'lit/decorators.js'

import rough from '@rogerta/roughjs'

export type Point = [number, number]
export type RoughCanvas = ReturnType<typeof rough.canvas>
export type RoughSVG = ReturnType<typeof rough.svg>
export type Config = NonNullable<Parameters<typeof rough.generator>[0]>
export type Options = NonNullable<Config['options']>
export type ResolvedOptions = Required<Options>

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
      if (!this.svg_) {
        throw new Error('Failed to find svg element')
      }

      for (let entry of entries) {
        const { width, height } = this.svg_.getBoundingClientRect()
        const bwidth =
            parseFloat(getComputedStyle(entry.target).borderWidth)
        let rect: SVGElement | undefined = undefined
        if (bwidth > 0) {
          const halfbwidth = bwidth / 2
          const options = Object.assign({
            maxRandomnessOffset: halfbwidth,
          }, this.options_)
          rect = this.rough_?.rectangle(
              -halfbwidth, -halfbwidth,
              width + bwidth, height + bwidth,
              options)
        }

        if (rect) {
          this.svg_.replaceChildren(rect)
        } else {
          this.svg_.replaceChildren()
        }
      }
    })
    this.observer_.observe(this, {box: 'border-box'})
  }

  override render() {
    return [html`<svg></svg>`]
  }

  static styles = [
    css`
      :host {
        /* Make sure the browser will not draw any visible border even when
        * the border width is other than zero.
        */
        border-color: transparent;
        border-style: solid;
        border-width: 0;

        /* Needed so that the svg's absolute position works. */
        position: relative;

        /* It's important that the element box sizing be border-box so that the
        * rough border is re-drawn when the element's border width changes.
        * Otherwise the resize observer would not get called. */
        box-sizing: border-box;
      }

      /* The svg element is positioned to covers the padding box of the host
      * element. Overflow is visible so the rough border (SVG sub-elements) will
      * can placed in the host's border box, which is outside the padding box.
      */
      svg {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        overflow: visible;
      }
    `]
}
