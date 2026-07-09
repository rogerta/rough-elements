import { css, html, nothing, type PropertyValues, type TemplateResult } from 'lit'
import { property } from 'lit/decorators.js'

import { BackgroundMixin } from './re-background-mixin.js'
import { BorderMixin } from './re-border-mixin.js'
import { FormControlMixin } from './re-form-control-mixin.js'
import { ReElement } from './re-element.js'

import '../re-icon.js'
import { ifDefined } from 'lit/directives/if-defined.js'

/**
 * This is a base class used to help implement click-style controls such as
 * buttons, links, checkboxes and radio buttons.
 */
export class ButtonBaseElement extends
    BorderMixin(BackgroundMixin(FormControlMixin(ReElement))) {
  static shadowRootOptions: ShadowRootInit = {
    ...super.shadowRootOptions,
    delegatesFocus: true,
  }

  /**
   * If true the button does not respond to user actions.  Disabled buttons are
   * not sumbitted as part of a form.
   */
  @property({ type: Boolean, reflect: true }) disabled = false

  handleEvent(e: Event) {
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

  override firstUpdated(props: PropertyValues) {
    super.firstUpdated(props)
    const button = this.renderRoot.querySelector('button')
    button?.addEventListener('keydown', this)
    button?.addEventListener('keyup', this)
    button?.addEventListener('blur', this)
    this.setAttribute('tabindex', '0')
  }

  override render() {
    return [
      this.renderRoughSvg(),
      html`
        <!-- The underyling native button representing this element. -->
        <button autofocus ?disabled="${this.disabled}" part="button"
            name="${ifDefined(this.name)}" @click="${this.handleEvent}">
          <!-- A prefix for the label.  An \`<re-icon>\` is often used here. -->
          <slot name="prefix"></slot>
          <!-- The main label of the button. Typically holds text. -->
          <slot></slot>
          <!-- A suffix for the label.  An \`<re-icon>\` is often used here. -->
          <slot name="suffix"></slot>
          ${this.renderCaretIfNeeded_() }
        </button>
      `,
    ]
  }

  protected renderCaretIfNeeded_(): TemplateResult | typeof nothing {
    return nothing
  }

  static styles = [
    ...super.styles,
    css`
      :host {
        display: inline-block;
        color: var(--color, ButtonText);
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

      slot[name=prefix]::slotted(*) {
        --color: var(--border-color);
        margin-left: -0.25rem;
      }
      slot[name=suffix]::slotted(*) {
        --color: var(--border-color);
      }
      re-icon[name=keyboard-arrow-down] {
        margin-right: -0.25rem;
      }

      /* NOTE: an important side effect of setting the button display to flex is
       * that the browser does not add extra width and/or height due to
       * template whitespace nodes or descender gaps for inline-block. */
      button {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        border: none;
        padding: 0;
        margin: 0;
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
          text-shadow: 0 0 3px var(--button-text-shadow-color);
          filter: drop-shadow(0px 0px 4px rgb(from var(--re-primary-color) R G B / 0.8));
        }
        :host(:hover:active:not([disabled])) button {
          text-shadow: 0 0 3px var(--button-text-shadow-color);
          filter: drop-shadow(0px 0px 4px rgb(from var(--re-primary-color) R G B / 0.8));
        }
      }
    `,
  ]
}
