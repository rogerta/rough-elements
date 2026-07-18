import { css, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { ReElement } from './internal/re-element.js'
import { getIcon, getViewBox } from './re-iconset.js'

/**
 * Icons display hand-drawn rough icons from the Rough Elements iconset
 * registry.
 *
 * The `name` property identfies the icon to display. Rough Elements comes with
 * a set pre-defined icons and additional icons can be registered using the
 * `addUserIcon()` function exported from `re-iconset.ts`.  Icons are rendered
 * with enough randomness such that two icons with the same name will appear
 * slightly diffrently.
 *
 * An empty name renders no icon but the `<re-icon>` remains part of the normal
 * page layout.  This is useful to reserve space on the page that might later be
 * filled with an icon.
 *
 * @cssproperty --size - The width and height of the icon. Defaults to `1.5rem`.
 * @cssproperty --color - The fill color of the icon.  Defaults to
 *    `--foreground-color`.
 */
@customElement('re-icon')
export class IconElement extends ReElement {
  /**
   * The name of the icon to display.
   */
  @property({reflect: true}) accessor name = ''

  static styles = [
    ...super.styles,
    css`
      :host {
        display: inline-block;
        width: var(--size, 1.5rem);
        height: var(--size, 1.5rem);
        border-width: 0;
      }
      .icon {
        stroke: none;
        fill: var(--color);
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
