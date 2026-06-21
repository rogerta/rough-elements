import { css, html, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { Mixin as BgMixin } from './internal/re-background-mixin.js'
import { Mixin as BorderMixin } from './internal/re-border-mixin.js'
import  './re-button.js'
import { fire, ReElement } from './internal/re-element.js'
import  './re-icon-button.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('re-dialog')
export class DialogElement extends BorderMixin(BgMixin(ReElement)) {
  @property({reflect: true}) name = ''

  @property({}) closedBy? = 'any'

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

      /* Should match starting styles below. */
      dialog {
        box-sizing: border-box;
        border: none;
        padding: 0;
        outline: none;
        background-color: transparent;
        opacity: 0;
        transition-duration: 0.3s;
        transition-timing-function: ease;
        transition-behavior: allow-discrete;
        transition-property: opacity, overlay, display;
      }
      dialog[open] {
        opacity: 1;
      }

      /* Should match starting styles below. */
      dialog::backdrop {
        background-color: transparent;
        transition-duration: 0.3s;
        transition-timing-function: ease;
        transition-behavior: allow-discrete;
        transition-property: background-color, overlay, display;
      }
      dialog[open]::backdrop {
        background-color: rgb(100 0 0 / 0.1);
      }

      @starting-style {
        /* Should match closed styles above. */
        dialog[open] {
          opacity: 0;
        }
        dialog[open]::backdrop {
          background-color: transparent;
        }
      }

      re-card {
        padding: 1rem;
        --re-background-color: Canvas;
      }

      re-card::part(body) {
        padding: 0.5rem;
      }

      header {
        font-size: 1.25rem;
      }

      footer {
        display: flex;
        flex-direction: row;
        justify-content: end;
        align-items: center;
        gap: 0.25rem;
        margin-top: 1rem;
      }

      header, [part=actions] {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }
      [part=actions] {
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

  private onDialogClose_() {
    fire(this, 'close')
  }

  private onDialogCancel_(e: Event) {
    if (!fire(this, 'cancel', { cancelable: true })) {
      e.preventDefault()
    }
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
        <dialog part="dialog" closedby="${ifDefined(this.closedBy)}"
            @close="${this.onDialogClose_}" @cancel="${this.onDialogCancel_}">
          <re-card part="card" fillStyle="solid">
            <header part="header">
              <slot name="title"></slot>
              <div part="actions" id="actions">
                <slot name="actions">
                  <re-icon-button name="close" @click="${this.onClose_}"
                      ></re-icon-button>
                </slot>
              </div>
            </header>

            <slot></slot>

            <footer part="footer"><slot name="footer"></slot></footer>
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
