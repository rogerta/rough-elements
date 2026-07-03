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
  @property() name = ''

  protected override firstUpdated(_: PropertyValues) {
    this.setAttribute('tabindex', '0')
  }

  protected render() {
    return html`
      <re-button autofocus variant="text" circle>
        <re-icon name="${this.name}"></re-icon>
      </re-button>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-icon-button': IconButtonElement
  }
}
