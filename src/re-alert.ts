import { css, html, nothing, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { BackgroundMixin } from './internal/re-background-mixin.js'
import { BorderMixin } from './internal/re-border-mixin.js'
import type { VARIANTS } from './internal/re-common.js'
import { ReElement } from './internal/re-element.js'
import './re-icon.js'
import './re-icon-button.js'

/**
 * Alerts display important messages to the user.  They can appear inline or
 * as toast notifications.  Alerts show an icon on the left, a message in
 * the middle, and an optional close button on the right.
 *
 * When using an alert inline, make sure to specify the `open` property or it
 * will not be displayed.  Changing the value can be used to show and hide
 * the alert as needed.  The `show()` and `hide()` methods do the same.
 *
 * When using the alert as a toast, don't specify the `open` property.  When
 * `toast()` is called the alert will be `open`ed.  Calling `toast()` removes
 * the alert from its location in the DOM and adds it to an internal alert
 * stack.  If the alert is not `closeable`, it will be closed and removed from
 * DOM automatically after `duration` millseconds (or 3sec if not specified).
 *
 * The `closeable` property can be set on any alert.  This adds a button along
 * the right side of the alert which closes the alert when clicked.
 *
 * Alerts can be shown using different variants, which use different colours
 * and different icons.
 *
 * To control the border and background refer to the Border & Background
 * documentation.
 *
 * @cssproperty --color - Sets the color of the icon inside the alert.
 */
@customElement('re-alert')
export class AlertElement extends BorderMixin(BackgroundMixin(ReElement)) {
  /**
   * Opens the alert if set to true, closes if set to false.
   */
  @property({ type: Boolean, reflect: true }) open = false

  /**
   * If true the alert will contain an icon button at the top right allowing
   * the user to close the alert.  If false, the alert will close itself after
   * after 3 seconds.
   */
  @property({ type: Boolean, reflect: true }) closable = false

  /**
   * Specifies the alert variant to use.  Different variants show different
   * icons and use a different colour for the background.
   */
  @property({ reflect: true }) variant: VARIANTS = 'primary'

  /**
   * The amount of time the alert will be displayed before it closes itself.
   * By default an alert will be displayed until programmatically closed.
   */
  @property({ type: Number }) duration: number = Infinity

  private durationTimer_ = 0

  constructor() {
    super()
    this.fillStyle = 'hachure'
  }

  /**
   * Shows the alert by setting the `open` property to true.
   *
   * @return {void}
   */
  show() {
    this.open = true
  }

  /**
   * Hides the alert.  If the alert is located in the internal alert stack,
   * the alert is removed from the DOM.
   *
   * @return {void}
   */
  hide() {
    this.open = false

    if (this.parentElement?.id === 'reToastStack') {
      this.remove()
    }
  }

  /**
   * Open the alert as a toast and move it to the internal alert stack.
   * Normally this is called when the toast is not open, but the method can
   * be called on an open alert.
   *
   * @return {void}
   */
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
      stack.style.cssText = `
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
      html`
        <!-- The alert's icon. This is an \`re-icon\` element whose name
             name is determined from the variant. -->
        <re-icon part="icon" name="${this.renderIconName_()}"></re-icon>
      `,
      html`
        <!-- The main body of the alert. Normally this is text but can
             be any valid html. -->
        <slot part="message"></slot>
      `,
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
    return html`
        <!-- The button used to close the alert if \`closeable\` is true.
             This is an \`re-icon-button\` element. -->
        <re-icon-button part="button" name="close"
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
          --color: var(--re-primary-color);
        }
      }
      :host([variant=success]) {
        --alart-bg-color: var(--re-success-color);
        & re-icon {
          --color: var(--re-success-color);
        }
      }
      :host([variant=neutral]) {
        --alart-bg-color: var(--re-neutral-color);
        & re-icon {
          --color: var(--re-neutral-color);
        }
      }
      :host([variant=warning]) {
        --alart-bg-color: var(--re-warning-color);
        & re-icon {
          --color: var(--re-warning-color);
        }
      }
      :host([variant=danger]) {
        --alart-bg-color: var(--re-danger-color);
        & re-icon {
          --color: var(--re-danger-color);
        }
      }
      :host {
        --re-background-color:
            rgb(from var(--alart-bg-color)
                calc(0.1 * R + 230) calc(0.1 * G + 230) calc(0.1 * B + 230));
      }

      re-icon, re-icon-button {
        flex-grow: 0;
        flex-shrink: 0;
      }
      slot {
        display: block;
        flex-grow: 1;
      }
    `
  ]
}

declare global {
  interface HTMLElementTagNameMap {
    're-alert': AlertElement
  }
}
