import { css, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { ReElement } from './internal/re-element.js'
import { getIcon, getViewBox } from './re-iconset.js'

/**
 * Icon element displays a hand-drawn rough icon based on a specified name.
 * It queries the icon path data from an iconset and renders it as an SVG.
 *
 * @cssproperty --size - The width and height of the icon. Defaults to `1.5rem`.
 * @cssproperty --color - The fill color of the icon. Defaults to `inherit`.
 */
@customElement('re-icon')
export class IconElement extends ReElement {
  @property({reflect: true}) name = ''

  static styles = [
    ...super.styles,
    css`
      :host {
        display: inline-block;
        width: var(--size, 1.5rem);
        height: var(--size, 1.5rem);
      }
      .icon {
        stroke: none;
        fill: var(--color, inherit);
      }
    `
  ]

  protected override updated(_: PropertyValues) {
    this.requestRoughRender()
  }

  override render() {
    return super.renderRoughSvg()
  }

  protected override onResized(
      _width: number,
      _height: number,
      _cstyles: CSSStyleDeclaration): SVGElement[] {
    const d = getIcon(this.name)
    if (!d) {
      return []
    }

    this.svg.setAttribute('viewBox', getViewBox(this.name))

    // NOTE: maxRandomnessOffset was chosen to make the icons look hand drawn.
    // This is pretty subjective though.
    const options = Object.assign({
      stroke: 'none',
      fill: 'inherit',
      fillStyle: 'solid',
      maxRandomnessOffset: this.svg.viewBox.baseVal.width / 50,
    }, this.options)
    const icon = this.rough.path(d, options)
    icon.classList.add('icon')
    return [icon]
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-icon': IconElement
  }
}
