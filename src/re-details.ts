import { css, html, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { Mixin as BgMixin } from './internal/re-background-mixin.js'
import { Mixin as BorderMixin } from './internal/re-border-mixin.js'
import { fire, ReElement } from './internal/re-element.js'
import './re-icon.js'

@customElement('re-details')
export class DetailsElement extends BorderMixin(BgMixin(ReElement)) {
  @property({ type: Boolean, reflect: true }) disabled = false
  @property({ type: Boolean, reflect: true }) open = false

  static styles = [
    ...super.styles,
    css`
      :host {
        display: block;
        padding: 0.5rem;
        interpolate-size: allow-keywords;
      }
      summary::marker {
        content: '';
      }
      slot {
        display: block;
      }
      summary {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
      slot[name=marker] re-icon,
      slot[name=marker]::slotted(re-icon) {
        transition: rotate 0.2s ease;
      }
      details[open] slot[name=marker] re-icon,
      details[open] slot[name=marker]::slotted(re-icon) {
        rotate: 90deg;
      }
      ::details-content {
        transition: height 0.2s ease,
            opacity 0.2s ease,
            margin-top 0.2s ease,
            content-visibility 0.2s ease allow-discrete;
        height: 0;
        opacity: 0;
        overflow: clip;
      }
      [open]::details-content {
        margin-top: 0.5rem;
        height: auto;
        opacity: 1;
      }
      :host([disabled]) {
        & slot[name=marker] re-icon {
          opacity: 0;
        }
        & details {
          pointer-events: none;
        }
      }
    `
  ]

  protected updated(props: PropertyValues) {
    super.updated(props)
    if (props.has('open')) {
      fire(this, 'toggle', {detail: this.open})
    }
  }

  private onToggle_(e: ToggleEvent) {
    const target = e.target as HTMLDetailsElement
    this.open = target?.open ?? false
  }

  protected render() {
    return [
      this.renderRoughSvg(),
      html`
      <details ?open="${this.open}" @toggle="${this.onToggle_}">
        <summary>
          <slot name="summary" part="summary"></slot>
          <slot name="marker" part="marker"
              ><re-icon name="keyboard-arrow-right"></re-icon></slot>
        </summary>
        <slot part="content"></slot>
      </details>`
    ]
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-details': DetailsElement
  }
}
