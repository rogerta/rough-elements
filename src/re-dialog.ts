import { css, html, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { Mixin as BgMixin } from './re-background-mixin.js'
import { Mixin as BorderMixin } from './re-border-mixin.js'
import  './re-button.js'
import { ReElement } from './re-element.js'
import  './re-icon-button.js'

@customElement('re-dialog')
export class DialogElement extends BorderMixin(BgMixin(ReElement)) {
  @property({reflect: true}) name = ''

  static styles = [
    ...super.styles,
    css`
      :host {
        position: absolute;
        width: 0;
        height: 0;
        border: none;
        interpolate-size: allow-keywords;
      }
      dialog {
        box-sizing: border-box;
        border: none;
        padding: 0;
        outline: none;
        background-color: transparent;
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

      :host(.top) {
        & dialog:open {
          transform: translateY(0);
        }
        & dialog {
          --dialog-width: calc(100% + 2 * var(--border-width));
          top: 0;
          left: 0;
          right: 0;
          bottom: auto;
          max-width: var(--dialog-width);
          width: var(--dialog-width);
          transform: translateY(-100%);
        }
      }

      :host(.right) {
        & dialog:open {
          transform: translateX(0);
        }
        & dialog {
          --dialog-height: calc(100% + 2 * var(--border-width));
          top: 0;
          bottom: 0;
          right: 0;
          left: auto;
          max-height: var(--dialog-height);
          height: var(--dialog-height);
          transform: translateX(100%);
        }
      }

      :host(.bottom) {
        & dialog:open {
          transform: translateY(0);
        }
        & dialog {
          --dialog-width: calc(100% + 2 * var(--border-width));
          top: auto;
          left: 0;
          right: 0;
          bottom: 0;
          max-width: var(--dialog-width);
          width: var(--dialog-width);
          transform: translateY(100%);
        }
      }

      :host(.left) {
        & dialog:open {
          transform: translateX(0);
        }
        & dialog {
          --dialog-height: calc(100% + 2 * var(--border-width));
          top: 0;
          bottom: 0;
          left: 0;
          right: auto;
          max-height: var(--dialog-height);
          height: var(--dialog-height);
          transform: translateX(-100%);
        }
      }

      :host(.drawer) {
        & dialog {
          margin: calc(-1 * var(--border-width));
          transition: transform 0.5s ease,
              overlay 0.5s ease allow-discrete,
              display 0.5s ease allow-discrete;
        }

        & dialog re-card {
          display: block;
          width: 100%;
          height: 100%;
        }
      }

      @starting-style {
        :host(.top) dialog:open {
          transform: translateY(-100%);
        }
        :host(.right) dialog:open {
          transform: translateX(100%);
        }
        :host(.bottom) dialog:open {
          transform: translateY(100%);
        }
        :host(.left) dialog:open {
          transform: translateX(-100%);
        }
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
        <dialog part="dialog" closedby="any">
          <re-card fillStyle="solid">
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
    're-dialog': DialogElement
  }
}
