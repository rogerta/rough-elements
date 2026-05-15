import { css, html, nothing, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { Mixin as BgMixin } from './re-background-mixin.js'
import { Mixin as BorderMixin } from './re-border-mixin.js'
import type { VARIANTS } from './re-common.js'
import { ReElement } from './re-element.js'
import './re-icon.js'
import './re-icon-button.js'

@customElement('re-alert')
export class Element extends BorderMixin(BgMixin(ReElement)) {
  @property({ type: Boolean, reflect: true }) open = false
  @property({ type: Boolean, reflect: true }) closable = false
  @property({ reflect: true }) variant: VARIANTS = 'primary'
  @property({ type: Number }) duration = Infinity

  durationTimer_ = 0

  show() {
    this.open = true
  }

  hide() {
    this.open = false

    if (this.parentElement?.id === 'reToastStack') {
      this.remove()
    }
  }

  toast() {
    const stack = this.createToastStackIfNeeded_()
    this.remove()

    // Make sure the toast can be dismissed.
    if (!this.closable && !Number.isFinite(this.duration)) {
      this.duration = 3000
    }

    stack.append(this)
    this.show()
  }

  private createToastStackIfNeeded_() {
    let stack = this.ownerDocument.getElementById('reToastStack')
    if (!stack) {
      stack = this.ownerDocument.createElement('div')
      stack.id = 'reToastStack'
      stack.style = `
        position: fixed;
        top: 1rem;
        right: 1rem;
        left: auto;
        bottom: auto;
        max-width: 100%;
        z-index: 10;
      `
      this.ownerDocument.body.append(stack)
    }
    return stack
  }

  private onClose_() {
    this.hide()
  }

  protected override updated(props: PropertyValues) {
    if (props.has('duration')) {
      if (this.durationTimer_) {
        clearTimeout(this.durationTimer_)
      }
      if (Number.isFinite(this.duration))
      this.durationTimer_ = setTimeout(() => {
        this.hide()
        this.durationTimer_ = 0
      }, this.duration)
    }
  }

  override render() {
    return [
      super.renderRoughSvg(),
      html`<re-icon part="icon" name="${this.renderIconName_()}"></re-icon>`,
      html`<div part="message"><slot></slot></div>`,
      this.renderButton_(),
    ]
  }

  private renderIconName_() {
    switch (this.variant) {
      case 'danger':
        return 'dangerous'
      case 'neutral':
      case 'primary':
        return 'info'
      case 'success':
        return 'check-circle'
      case 'warning':
        return 'warning'
    }
  }

  private renderButton_() {
    if (!this.closable) {
      return nothing
    }
    return html`<re-icon-button part="button" name="close"
        @click="${this.onClose_}"></re-icon-button>`
  }

  static styles = [
    ...super.styles,
    css`
      :host {
        display: none;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        padding: 0.25rem 0.5rem;
        gap: 0.5rem;
      }
      :host([open]) {
        display: inline-flex;
      }

      :host([variant=primary]) {
        --alart-bg-color: var(--re-primary-color);
        & re-icon {
          color: var(--re-primary-color);
        }
      }
      :host([variant=success]) {
        --alart-bg-color: var(--re-success-color);
        & re-icon {
          color: var(--re-success-color);
        }
      }
      :host([variant=neutral]) {
        --alart-bg-color: var(--re-neutral-color);
        & re-icon {
          color: var(--re-neutral-color);
        }
      }
      :host([variant=warning]) {
        --alart-bg-color: var(--re-warning-color);
        & re-icon {
          color: var(--re-warning-color);
        }
      }
      :host([variant=danger]) {
        --alart-bg-color: var(--re-danger-color);
        & re-icon {
          color: var(--re-danger-color);
        }
      }
      :host {
        --background-color:
            rgb(from var(--alart-bg-color)
                calc(0.1 * R + 230) calc(0.1 * G + 230) calc(0.1 * B + 230));
      }

      re-icon, re-icon-button {
        flex-grow: 0;
        flex-shrink: 0;
      }
      div {
        flex-grow: 1;
      }
    `
  ]
}

declare global {
  interface HTMLElementTagNameMap {
    're-alert': Element
  }
}
