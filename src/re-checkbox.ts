// Copyright 2026 ChildFIRST Authors
// Use of this source code is governed by the license in the LICENSE file.

import { css, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { Element as ButtonElement } from './re-button.js'
import { Element as IconElement } from './re-icon.js'

@customElement('re-checkbox')
export class Element extends ButtonElement {
  @property({ type: Boolean, reflect: true }) checked = false
  @property({ type: Boolean, reflect: true }) indeterminate = false

  private caret_?: IconElement

    static styles = [
      ...super.styles,
      css`
        :host(:not([disabled]):focus-within) ::slotted([slot=prefix]) {
          --color: var(--re-primary-color);
        }
      `
    ]

  override firstUpdated(props: PropertyValues) {
    this.variant = 'text'
    this.fillStyle = 'none'
    this.borderStyle = 'none'

    // Add a caret suffix.
    this.caret_ = this.ownerDocument.createElement('re-icon')
    if (this.caret_) {
      this.caret_.name = 'checkbox-outline-blank'
      this.caret_.slot = 'prefix'
      this.append(this.caret_)
    }

    this.renderRoot.addEventListener('click', e => {
      if (this.disabled) {
        e.preventDefault()
        return
      }

      this.checked = !this.checked
      this.indeterminate = false
    })
    super.firstUpdated(props)
  }

  protected override updated(props: PropertyValues) {
    super.updated(props)
    if (this.caret_) {
      this.caret_.name = this.checked ? 'checkbox'
          : (this.indeterminate ? 'checkbox-indeterminate'
              : 'checkbox-outline-blank')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-checkbox': Element
  }
}
