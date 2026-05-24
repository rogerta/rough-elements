// Copyright 2026 ChildFIRST Authors
// Use of this source code is governed by the license in the LICENSE file.

import { css } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { ReElement } from './re-element.js'

@customElement('re-divider')
export class Element extends ReElement {
  @property({ type: Boolean, reflect: true }) vertical = false

  static styles = [css`
    :host {
      display: block;
      color: var(--color, inherit);
      --thickness: 4px;
      height: var(--thickness);
    }
    :host([vertical]) {
      display: inline-block;
      width: var(--thickness);
      height: 100%;
    }
  `]

  override render() {
    return super.renderRoughSvg()
  }

  protected override onResized(
      width: number,
      height: number,
      cstyles: CSSStyleDeclaration): SVGElement[] {
    const thickness = Number.parseFloat(cstyles.getPropertyValue('--thickness'))

    // The default randomness is 2 and stroke width is 1px.  This means lines
    // are up to 5px in "thickness".  Draw a new line for each 5px, but overlap
    // them a little.
    const lines = []
    for (let i = 2; i < thickness; i += 4) {
      lines.push(this.vertical
          ? this.rough.line(i, 0, i, height)
          : this.rough.line(0, i, width, i))
    }
    return lines
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-divider': Element
  }
}
