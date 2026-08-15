/**
 * Icon buttons implement the no-border "Icon Button" pattern described in
 * `<re-button>`.
 * @module
 */

import { html, LitElement, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

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
   * Turns this button into a popover control button.  The value of is the ID
   * of the popover element to control.  The popover element in expected to be
   * in the same shadow root or light DOM as this button.  If this is not the
   * case, use the `setPopoverTarget()` method instead.
   */
  @property({}) accessor popovertarget: string | undefined = undefined

  /**
   * If true the button does not respond to user actions.  Disabled buttons are
   * not sumbitted as part of a form.
   */
  @property({ type: Boolean, reflect: true }) accessor disabled = false

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

  /**
   * Toggles the popover associated to this button, if any.
   *
   * @param force If true, forces the popoverto show.  If false, forces the
   *    popover to hide.  If not specified, the state of the popover toggles.
   * @returns true if the popup is open after the call, and false otherwise.
   */
  togglePopover(force?: boolean): boolean {
    const button = this.renderRoot.querySelector('re-button')
    return button!.togglePopover(force) ?? false
  }

  protected override firstUpdated(_: PropertyValues) {
    this.setAttribute('tabindex', '0')
  }

  protected override willUpdate(props: PropertyValues) {
    super.willUpdate(props)

    if (props.has('popovertarget') && this.popovertarget) {
      const root = this.getRootNode()
      if (root instanceof ShadowRoot || root instanceof Document) {
        const target = root.getElementById(this.popovertarget)
        this.setPopoverTarget(target)
      }
    }
  }

  protected render() {
    return html`
      <re-button autofocus ?disabled="${ifDefined(this.disabled)}"
          variant="text" circle exportparts="button">
        <re-icon name="${this.name}"></re-icon>
      </re-button>
    `
  }
}
