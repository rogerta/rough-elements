import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import  './re-button.js'
import { fire } from './internal/re-element.js'
import  './re-icon-button.js'
import { ifDefined } from 'lit/directives/if-defined.js'

/**
 * Dialogs are shown when immedidate user interaction is required.
 * Usually dialogs appear in the middle of the page overlaying existing
 * content, but `<re-dialog>`s can also be pinned along any edge (top, right,
 * bottom, or left) of the viewport.  When pinned this way dialogs are often
 * called "drawers".
 *
 * Dialogs are shown by caling `showModal()`.  Dialogs are dismissed by calling
 * `requestClose()` or by user interaction:  the user can press the Escape key,
 * click outside the dialog, or click the Close button.  This behaviour can
 * be changed with the `closeby` property.
 *
 * Dialogs use an `<re-card>` to layout their content.  The `footer` slot of
 * `<re-dialog>` fills a standard `<footer>` HTML element that itself fills
 * the `footer` slot of `<re-card>`.  The `footer` slot usually contains
 * buttons such as "OK" or "Cancel".  By default `<re-dialog>`'s `footer`
 * slot is empty.
 *
 * The `title` and `actions` slots fill the `header` slot of `<re-card>` from
 * left to right.  The `actions` slots is filled by default with a Close
 * `<re-icon-button>` button.  Keep in mind that if the `actions` slot is
 * filled by the caller, the default Close button is not shown.  The caller
 * should either provide some other mechanism to close the dialog or depend on
 * one of the default close interactions.
 *
 * Any content not assigned to a slot fills the body of the `<re-card>`.
 *
 * @cssproperty --background-color - The background color of the dialog.
 *    Defaults to `Canvas`.
 * @cssproperty --border-width - The border width for the `<re-card>`.
 *
 * @event close - Fired when the `<dialog>` has been closed.
 * @event cancel - Fires when the user triggers a close request.  This event
 *    is cancelable.
 *
 */
@customElement('re-dialog')
export class DialogElement extends LitElement {
  /**
   * Controls how the dialog can be closed by user interaction.  If set to
   * `'any'` the dialog can be closed with a click outside the dialog, a press
   * of the Escape key, or some caller specific mechanism.
   *
   * If set to `'closerequest'` the dialog can only be closed by a press
   * of the Escape key or some caller specific mechanism.
   *
   * if set the `'none'` the dialog can only be closed by some caller specific
   * mechanism.
   */
  @property({}) accessor closedby: 'any' | 'closerequest' | 'none' = 'any'

  /**
   * Returns true if the dialog is open.
   */
  get open() {
    return this.renderRoot.querySelector('dialog')?.open ?? false
  }

  static styles = [
    //...super.styles,
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
        background-color: rgb(0 0 0 / 0.2);
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
        --background-color: Canvas;
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

      @media (prefers-color-scheme: dark) {
        dialog::backdrop {
          xbackground-color: rgb(255 255 255 / 0.1);
        }
      }
  `]

  /**
   * Shows the dialog.
   */
  showModal() {
    this.renderRoot.querySelector('dialog')?.showModal()
  }

  /**
   * Programmatically requests the dialog to close.
   */
  requestClose() {
    this.renderRoot.querySelector('dialog')?.requestClose()
  }

  private onDialogClose_() {
    fire(this, 'close')
  }

  private onDialogCancel_(e: Event) {
    if (!fire(this, 'cancel', { cancelable: true })) {
      e.preventDefault()
    }
  }

  protected override updated(props: PropertyValues) {
    super.updated(props)
  }

  override render() {
    return [
      html`
        <!-- The native HTML \`<dialog>\` wrapping the \`<re-card>\`. -->
        <dialog part="dialog" closedby="${ifDefined(this.closedby)}"
            @close="${this.onDialogClose_}" @cancel="${this.onDialogCancel_}">
          <!-- The \`<re-card>\` used to layout the dialog. -->
          <re-card part="card" fillStyle="solid">
            <!-- The header bar containing the \`title\` and \`actions\`
                 slots. -->
            <header part="header">
              <!-- The dialog's title. By default the font is slightly larger
                   than normal text. -->
              <slot name="title"></slot>
              <!-- \`<div>\` container that holds the \`actions\` slot. -->
              <div part="actions" id="actions">
                <!-- Dialog action buttons. If not filled by the caller then
                     this slot is filled with an \`<re-icon-button>\` tha
                     can be used to close the dialog.  This slot is usually
                     filled with one or more \`<re-icon-button>\`s allowing
                     the user to perform various actions. -->
                <slot name="actions">
                  <re-icon-button name="close" @click="${this.requestClose}"
                      ></re-icon-button>
                </slot>
              </div>
            </header>

            <!-- The main body of the dialog. -->
            <slot></slot>

            <!-- The dialog's footer. -->
            <footer part="footer">
              <!-- The dialog's footer buttons, such as "OK" or "Cancel". -->
              <slot name="footer"></slot>
            </footer>
          </re-card>
        </dialog>
      `
    ]
  }
}
