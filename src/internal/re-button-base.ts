import { css, CSSResult, html, nothing, type PropertyValues,
  type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import { BackgroundMixin,
  type BackgroundMixinInterface } from './re-background-mixin.ts'
import { BorderMixin, type BorderMixinInterface } from './re-border-mixin.ts'
import { ReElement } from './re-element.ts'
import { type FormControlInterface,
  FormControlMixin } from './re-form-control-mixin.ts'

import '../re-icon.ts'

const ButtonBaseElementBase:
  & (new(...args: any[]) => BorderMixinInterface)
  & (new(...args: any[]) => BackgroundMixinInterface)
  & (new(...args: any[]) => FormControlInterface)
  & typeof ReElement = BorderMixin(BackgroundMixin(FormControlMixin(ReElement)))
/**
 * This is a base class used to help implement click-style controls such as
 * buttons, links, checkboxes and radio buttons.
 */
export class ButtonBaseElement extends ButtonBaseElementBase {
  static shadowRootOptions: ShadowRootInit = {
    ...super.shadowRootOptions,
    delegatesFocus: true,
  }

  /**
   * If true the button does not respond to user actions.  Disabled buttons are
   * not sumbitted as part of a form.
   */
  @property({ type: Boolean, reflect: true })
  accessor disabled = false

  handleEvent(e: Event): void {
    switch (e.type) {
      case 'keydown': {
        const ke = e as KeyboardEvent
        if (ke.key === ' ') {
          this.classList.add('is-active')
        }
        break
      }
      case 'keyup': {
        const ke = e as KeyboardEvent
        if (ke.key === ' ') {
          this.classList.remove('is-active')
        }
        break
      }
      case 'blur':
        this.classList.remove('is-active')
        break
      default:
        break
    }
  }

  override firstUpdated(props: PropertyValues): void {
    super.firstUpdated(props)
    const button = this.renderRoot.querySelector('button')
    button?.addEventListener('click', this)
    button?.addEventListener('keydown', this)
    button?.addEventListener('keyup', this)
    button?.addEventListener('blur', this)
    this.setAttribute('tabindex', '0')
  }

  override render(): TemplateResult<1>[] {
    return [
      this.renderRoughSvg(),
      html`
        <!-- The underyling native button representing this element. -->
        <button autofocus ?disabled="${this.disabled}" part="button"
            name="${ifDefined(this.name)}">
          <!-- A prefix for the label.  An \`<re-icon>\` is often used here. -->
          <slot name="prefix"></slot>
          <!-- The main label of the button. Typically holds text. -->
          <slot id="main"></slot>
          <!-- A suffix for the label.  An \`<re-icon>\` is often used here. -->
          <slot name="suffix"></slot>
          ${this.renderCaretIfNeeded_()}
        </button>
      `,
    ]
  }

  protected renderCaretIfNeeded_(): TemplateResult | typeof nothing {
    return nothing
  }

  static styles: CSSResult[] = [
    ...super.styles,
    css`
      :host {
        position: relative;
        display: inline-block;
        color: var(--color);
        user-select: none;
        cursor: pointer;
        --button-text-shadow-color: rgb(from black R G B / 0.1);
      }
      :host * {
        cursor: pointer;
      }
      :host([disabled]) {
        opacity: 0.5;
      }

      slot#main {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-grow: 1;
      }
      slot[name=prefix]::slotted(*) {
        flex-grow: 0;
        --color: var(--border-color);
        margin-left: -0.25rem;
      }
      slot[name=suffix]::slotted(*) {
        flex-grow: 0;
        --color: var(--border-color);
      }
      re-icon[name=keyboard-arrow-down] {
        flex-grow: 0;
        margin-right: -0.25rem;
      }

      /* NOTE: an important side effect of setting the button display to flex is
       * that the browser does not add extra width and/or height due to
       * template whitespace nodes or descender gaps for inline-block. */
      button {
        display: flex;
        flex-direction: row;
        justify-content: stretch;
        align-items: center;
        border: none;
        padding: 0;
        margin: 0;
        width: 100%;
        height: min-content;
        background-color: transparent;
        color: inherit;
        -webkit-tap-highlight-color: transparent;
        transition: transform 0.2s ease;
        font-family: var(--re-input-font-family);
      }
      /* Removes the focus ring only for mouse/touch interactions */
      button:focus {
        outline: none;
      }

      :host(:not([disabled]):focus-within) {
        --re-stroke-width: 2px;
      }

      #rough {
        color: inherit;
        transition: transform 0.2s ease;
      }

      /* Button press animation */
      :host(:not([disabled]):active) #rough,
      :host(:not([disabled]).is-active) #rough {
        transform: scale(0.95);
      }

      @media (hover: hover) {
        :host(:hover:not([disabled])) button {
          filter: drop-shadow(0px 0px 4px rgb(from var(--hover-shadow-color) R G B / 0.8));
        }
        :host(:hover:active:not([disabled])) button {
          filter: drop-shadow(0px 0px 4px rgb(from var(--hover-shadow-color) R G B / 0.8));
        }
      }
    `,
  ]
}
