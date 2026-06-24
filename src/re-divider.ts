import { css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { ReElement } from './internal/re-element.js'

/**
 * Divider element is a visual separator between groups of content.
 * It can be displayed horizontally or vertically.
 *
 * @cssproperty --color - The stroke color of the divider line. Defaults to black with 50% opacity.
 * @cssproperty --thickness - The thickness of the divider. Defaults to 4px.
 */
@customElement('re-divider')
export class DividerElement extends ReElement {
  @property({ type: Boolean, reflect: true }) vertical = false

  static styles = [
    ...super.styles,
    css`
      :host {
        display: block;
        stroke: var(--color, rgb(from black R G B / 0.5));
        --thickness: 4px;
        border-width: 0;
        box-sizing: content-box;
        width: 100%;
        height: var(--thickness);
        margin: 0.5rem 0;
        flex-grow: 0;
        flex-shrink: 0;
      }
      :host([vertical]) {
        display: inline-block;
        width: var(--thickness);
        height: 100%;
        margin: 0 0.5rem;
      }
    `
  ]

  override render() {
    return super.renderRoughSvg()
  }

  protected override onResized(
      width: number,
      height: number,
      cstyles: CSSStyleDeclaration): SVGElement[] {
    const thickness = Number.parseFloat(cstyles.getPropertyValue('--thickness'))

    const options = Object.assign({
       stroke: 'inherit',
       strokeWidth: 'inherit',
    }, this.options)

    // The default randomness is 2 and stroke width is 1px.  This means lines
    // are up to 5px in "thickness".  Draw a new line for each 5px, but overlap
    // them a little.
    const lines = []
    for (let i = 2; i < thickness; i += 3) {
      options.seed = (options.seed ?? 0) + 1
      lines.push(this.vertical
          ? this.rough.line(i, 0, i, height, options)
          : this.rough.line(0, i, width, i, options))
    }
    return lines
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-divider': DividerElement
  }
}
