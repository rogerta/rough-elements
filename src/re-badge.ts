import { css, html, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { BackgroundMixin } from './internal/re-background-mixin.js'
import type { VARIANTS } from './internal/re-common.js'
import { ReElement } from './internal/re-element.js'

/**
 * Badges display status like information to the user. Generally the body of
 * a badge is some small amount of text.
 *
 * Different variants of badges can be shown (defaults to 'primary') each with
 * their own background colour.  The foreground colour is always fixed by the
 * theme.
 */
@customElement('re-badge')
export class BadgeElement extends BackgroundMixin(ReElement) {
  /**
   * Specifies the variant to use.  Different variants use a different colour
   * for the background.
   */
  @property({ reflect: true }) variant: VARIANTS = 'primary'

  constructor() {
    super()
    this.fillStyle = 'solid'
    this.variant = 'primary'
  }

  override render() {
    return [
      super.renderRoughSvg(),
      html`
        <!-- The text of the badge. -->
        <slot part="body"></slot>
      `,
    ]
  }

  protected override updated(props: PropertyValues) {
    super.updated(props)

    if (props.has('variant')) {
      if (!this.variant) {
        console.error('The variant property of a badge is undefined')
      }
    }
  }

  static styles = [
    ...super.styles,
    css`
      :host {
        display: inline-block;
        --border-width: 0;
        font-size: 0.75rem;
        padding: 0 0.125rem;
        --background-color: transparent;
        cursor: default;
      }
      :host * {
        cursor: default;
      }
      slot {
        color: white;
      }
      :host([variant=primary]) {
        --background-color: var(--re-primary-color);
      }
      :host([variant=success]) {
        --background-color: var(--re-success-color);
      }
      :host([variant=neutral]) {
        --background-color: var(--re-neutral-color);
      }
      :host([variant=warning]) {
        --background-color: var(--re-warning-color);
      }
      :host([variant=danger]) {
        --background-color: var(--re-danger-color);
      }
    `
  ]
}

declare global {
  interface HTMLElementTagNameMap {
    're-badge': BadgeElement
  }
}
