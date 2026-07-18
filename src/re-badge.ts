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
 *
 * @cssproperty --text-color - The colour to use for the badge's text.
 *    Defaults to `--background-color`.
 * @cssproperty --re-background-color - The background colour of the badge.
 *    Defaults to `--<VARIANT>-color` where `<VARIANT>` is the value of the
 *    `variant` property.  If no variant property is specified, then
 *    `--forground-color` is used.
 */
@customElement('re-badge')
export class BadgeElement extends BackgroundMixin(ReElement) {
  /**
   * Specifies the variant to use.  Different variants use a different colour
   * for the background.
   */
  @property({ reflect: true }) variant: VARIANTS = 'none'

  constructor() {
    super()
    this.fillStyle = 'solid'
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
        color: var(--text-color, var(--background-color));
        --re-background-color: var(--foreground-color);
        cursor: default;
      }
      :host * {
        cursor: default;
      }
      :host([variant=primary]) {
        --re-background-color: var(--primary-color);
      }
      :host([variant=success]) {
        --re-background-color: var(--success-color);
      }
      :host([variant=neutral]) {
        --re-background-color: var(--neutral-color);
      }
      :host([variant=warning]) {
        --re-background-color: var(--warning-color);
      }
      :host([variant=danger]) {
        --re-background-color: var(--danger-color);
      }
    `
  ]
}
