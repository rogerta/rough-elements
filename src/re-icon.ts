// Copyright 2026 ChildFIRST Authors
// Use of this source code is governed by the license in the LICENSE file.

import { css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { ReElement } from './re-element.js'
import { getIcon, getViewBox } from './re-iconset.js'

@customElement('re-icon')
export class Element extends ReElement {
  @property({reflect: true}) icon = ''

  static styles = [css`
    :host {
      display: inline-block;
      width: var(--size, 1.5rem);
      height: var(--size, 1.5rem);
      stroke: none;
      fill: currentcolor;
    }
    :host([hidden]) {
      display: none;
    }
  `]

  override render() {
    return super.renderRoughSvg()
  }

  override onResized(
      _width: number,
      _height: number,
      cstyles: CSSStyleDeclaration): SVGElement[] {
    const d = getIcon(this.icon)
    if (!d) {
      return []
    }

    this.svg.setAttribute('viewBox', getViewBox(this.icon))

    // NOTE: maxRandomnessOffset was chosen to make the icons look hand drawn.
    // This is pretty subjective though.
    const options = Object.assign({
      stroke: 'none',
      fill: cstyles.color,
      fillStyle: 'solid',
      maxRandomnessOffset: this.svg.viewBox.baseVal.width / 50,
    }, this.options)
    return [this.rough.path(d, options)]
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-icon': Element
  }
}
