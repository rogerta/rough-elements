// Copyright 2026 ChildFIRST Authors
// Use of this source code is governed by the license in the LICENSE file.

import { css, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { ReElement } from './re-element.js'
import { getIcon, getViewBox } from './re-iconset.js'

@customElement('re-icon')
export class Element extends ReElement {
  @property({reflect: true}) name = ''

  static styles = [css`
    :host {
      display: inline-block;
      width: var(--size, 1.5rem);
      height: var(--size, 1.5rem);
      color: var(--color, inherit);
      stroke-width: var(--re-stroke-width, inherit);
    }
    .icon {
      stroke: none;
      fill: currentcolor;
    }
  `]

  protected override updated(_: PropertyValues) {
    this.requestRoughRender()
  }

  override render() {
    return super.renderRoughSvg()
  }

  override onResized(
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
    're-icon': Element
  }
}
