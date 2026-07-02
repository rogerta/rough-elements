import { css, html, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { BackgroundMixin } from './internal/re-background-mixin.js'
import { BorderMixin } from './internal/re-border-mixin.js'
import { fire, ReElement } from './internal/re-element.js'
import './re-icon.js'

/**
 * Details are disclosure elements in which more detailed information is
 * visible only when it is toggled open. A summary, which is always visible,
 * must be provided in the `summary` slot.
 *
 * If the default expanded/collapsed indicator is overriden by filling the
 * `marker` slot with an `<re-icon>`, that icon will be automatically rotated
 * by 90&deg; when the details is opened. To prevent this set the rotate CSS
 * property of the marker to 'none'.  For example, a details with `id`
 * equal to `myid` can prevent automatic rotation as follows:
 * ```
 * re-details#myid [slot=marker] {
 *   rotate: none;
 * }
 * ```
 */
@customElement('re-details')
export class DetailsElement extends BorderMixin(BackgroundMixin(ReElement)) {
  /**
   * If true the details does not respond to user actions.
   */
  @property({ type: Boolean, reflect: true }) disabled = false

  /**
   * If true the body is visible to the user, otherwise the body is not
   * visible.
   */
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
      summary {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
      summary:focus {
        outline: none;
        font-weight: bold;
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

  protected override updated(props: PropertyValues) {
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
      <!-- The underlying html \`<details>\` element. -->
      <details ?open="${this.open}" @toggle="${this.onToggle_}" part="details">
        <!-- The underlying html \`<summary>\` element. -->
        <summary part="summary" ?inert="${this.disabled}">
          <!-- The content of the summary. -->
          <slot name="summary"></slot>
          <!-- The expanded/collapsed indicator. If this slot is not filled
              a default a rotating chevron \`<re-icon>\` is used. -->
          <slot name="marker"><re-icon name="keyboard-arrow-right"></re-icon></slot>
        </summary>
        <!-- The content of the expandable/collapsible body. -->
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
