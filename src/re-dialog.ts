// Copyright 2026 ChildFIRST Authors
// Use of this source code is governed by the license in the LICENSE file.

import { css, html, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { Mixin as BgMixin } from './re-background-mixin.js'
import { Mixin as BorderMixin } from './re-border-mixin.js'
import  './re-button.js'
import { ReElement } from './re-element.js'
import  './re-icon-button.js'

@customElement('re-dialog')
export class Element extends BorderMixin(BgMixin(ReElement)) {
  @property({reflect: true}) name = ''

  static styles = [
    ...super.styles,
    css`
      :host {
        position: absolute;
        width: 0;
        height: 0;
        border: none;
      }
      dialog {
        box-sizing: border-box;
        border: none;
        padding: 0;
        outline: none;
        background-color: transparent;
        max-height: 95vh;
      }

      re-card {
        --background-color: white;
      }

      re-card::part(body) {
        padding: 0.5rem;
      }

      header {
        font-size: 1.25rem;
      }

      slot[part=body] {
        display: block;
        margin: 1rem 0;
      }

      footer {
        display: flex;
        flex-direction: row;
        justify-content: end;
        align-items: center;
        gap: 0.25rem;
      }

      header, #actions {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
      #actions {
        gap: 0.5rem;
      }
  `]

  showModal() {
    this.renderRoot.querySelector('dialog')?.showModal()
  }

  private onClose_() {
    this.renderRoot.querySelector('dialog')?.requestClose()
  }

  protected override updated(props: PropertyValues) {
    super.updated(props)
    this.requestRoughRender()
  }

  override render() {
    return [
      super.renderRoughSvg(),
      html`
        <dialog part="dialog">
          <re-card>
            <header part="header">
              <slot name="title"></slot>
              <div id="actions">
                <slot name="actions">
                  <re-icon-button name="close" @click="${this.onClose_}"
                      ></re-icon-button>
                </slot>
              </div>
            </header>

            <slot part="body"></slot>

            <footer part="footer">
              <slot name="footer">
                <re-button variant="primary" @click="${this.onClose_}"
                    >Close</re-button>
              </slot>
            </footer>
          </re-card>
        </dialog>
      `
    ]
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-dialog': Element
  }
}
