import { css, html, nothing, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { Mixin } from './re-border-and-background-mixin.js'
import { ReElement } from './re-element.js'
import './re-icon.js'
import './re-icon-button.js'

export type VARIANTS = 'primary' | 'success' | 'neutral' | 'warning' | 'danger'

@customElement('re-alert')
export class Element extends Mixin(ReElement) {
  @property({ type: Boolean, reflect: true }) open = false
  @property({ type: Boolean, reflect: true }) closable = false
  @property({ reflect: true }) variant: VARIANTS = 'primary'
  @property({ type: Number }) duration = Infinity

  show() {
    this.open = true
  }

  hide() {
    this.open = false
  }

  toast() {

  }

  onClose_() {
    this.hide()
  }

  protected override updated(_props: PropertyValues) {
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
        align-items: stretch;
        padding: 0.25rem 0.5rem;
        gap: 0.5rem;
      }
      :host([open]) {
        display: inline-flex;
      }

      :host([variant=primary]) {
        --background-color: rgb(from var(--re-primary-color) R G B / 0.1);
        & re-icon {
          color: var(--re-primary-color);
        }
      }
      :host([variant=success]) {
        --background-color: rgb(from var(--re-success-color) R G B / 0.1);
        & re-icon {
          color: var(--re-success-color);
        }
      }
      :host([variant=neutral]) {
        & re-icon {
          color: var(--re-neutral-color);
        }
      }
      :host([variant=warning]) {
        --background-color: rgb(from var(--re-warning-color) R G B / 0.1);
        & re-icon {
          color: var(--re-warning-color);
        }
      }
      :host([variant=danger]) {
        --background-color: rgb(from var(--re-danger-color) R G B / 0.1);
        & re-icon {
          color: var(--re-danger-color);
        }
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
