import { html, LitElement, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import './re-icon.js'

/**
 * Icon buttons implement the no-border "Icon Button" pattern described in
 * `<re-button>`.
 *
 * Writing:
 * ```
 * <re-icon-button name="???"></re-icon-button>
 * ```
 * is a shortcut for writing:
 * ```
 * <re-button circle variant="text"><re-icon name="???"></re-icon></re-button>
 * ```
 *
 * @csspart button - The underyling native button representing this element.
 *
 * @cssproperty --color - The colour of the icon button.  Defaults to
 *    `--foreground-color`.
 * @cssproperty --size - The width and height of the icon button.  Defaults to
 *    `1.5rem`.
 */
@customElement('re-icon-button')
export class IconButtonElement extends LitElement {
  static shadowRootOptions: ShadowRootInit = {
    ...super.shadowRootOptions,
    delegatesFocus: true,
  }

  /**
   * The name of the icon to display.
   */
  @property() accessor name = ''

  /**
   * Sets this icon button to be a trigger for a popover element. The popover
   * will be displayed once the button finishes it's update cycle (that is, once
   * the `updateComplete` promise resolves).
   *
   * `setPopoverTarget` is needed to allow targets from different shawdow root
   * boundaries to be used.
   *
   * @param target The popover element.  This element is expected to
   *    have the `popover` attribute.  It's anchor will be set this button.
   */
  setPopoverTarget(target: HTMLElement| null) {
    this.updateComplete.then(() => {
      const button = this.renderRoot.querySelector('re-button')
      if (button) {
        button.setPopoverTarget(target)
      }
    })
  }

  protected override firstUpdated(_: PropertyValues) {
    this.setAttribute('tabindex', '0')
  }

  protected render() {
    return html`
      <re-button autofocus variant="text" circle exportparts="button">
        <re-icon name="${this.name}"></re-icon>
      </re-button>
    `
  }
}
