import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import './re-button.js'
import './re-menu.js'
import { NO_ITEM } from './re-menu.js'

/**
 * Dropdowns expose a menu of actions that the user can perform.
 * A dropdown consists of a trigger button and a popover menu panel.
 *
 * The `label` slot provides the content of the trigger button, usually some
 * short text, and should always be specified.
 *
 * Any children not assigned to a slot are placed in the popover menu panel.
 * These are usually `<re-item>`, `<re-menu-item>` or `<re-divider>` elements,
 * but any content can be placed there.
 *
 * A common use of a dropdown is as follows:
 * ```
 * <re-dropdown id="dd1"@click="${onItemClicked_}">
 *   <span slot="label">Click me</span>
 *   <re-item id="item1">...</re-item>
 *   <re-item id="item2">...</re-item>
 *   <re-divider></re-divider>
 *   <re-item id="item3">...</re-item>
 * </re-dropdown>
 * ```
 * ```
 * import { getItemFromEvent } from '@rough-elements/re-item.ts'
 *
 * onItemClicked_(e: Event) {
 *   const item = getItemFromEvent(e)
 *   switch (item?.id) {
 *     case 'item1':
 *        ...
 *        break
 *     case 'item2':
 *        ...
 *        break
 *     case 'item3':
 *        ...
 *        break
 *   }
 * }
 * ```
 *
 */
@customElement('re-dropdown')
export class DropdownElement extends LitElement {
  static shadowRootOptions: ShadowRootInit = {
    ...super.shadowRootOptions,
    delegatesFocus: true,
  }

  /**
   * If true the button is disabled and does not respond to user actions.
   */
  @property({ type: Boolean, reflect: true }) disabled = false

  static styles = [
    css`
      :host {
        display: inline-block;
        outline: none;
      }
      re-button {
        --text-transform: none;
      }
      re-button[part="trigger"]::part(button) {
        anchor-name: --menu-anchor;
      }
      re-menu {
        /* Where to position the menu dropvoer relative to the trigger */
        position-anchor: --menu-anchor;
        position-area: bottom span-right;
        position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
      }
    `
  ]

  /**
   * Find the item in the drop down list whose `id` matches `value`.
   *
   * @param value The value to match an item's ID.
   * @returns An object with two properties: index and item.  If no item
   *    is found index is -1 and item is `null`.  Otherwise
   */
  protected async findItemByValue_(value: string) {
    const menu = this.renderRoot.querySelector('re-menu')

    // If this methods happens to be called early in dropdown creation, like
    // at firstUpdated() time, it's possible for the menu to not be finished
    // its own update cycle.  Wait for it to compelete before looking for
    // the item.
    await menu?.updateComplete

    return menu?.findItemByValue(value) ?? NO_ITEM
  }

  protected async unselectAllItems_() {
    const menu = this.renderRoot.querySelector('re-menu')

    // If this methods happens to be called early in dropdown creation, like
    // at firstUpdated() time, it's possible for the menu to not be finished
    // its own update cycle.  Wait for it to compelete before looking for
    // the item.
    await menu?.updateComplete

    return menu?.unselectAllItems()
  }

  override firstUpdated(_: PropertyValues) {
    const button = this.renderRoot.querySelector('re-button')
    if (button) {
      const panel = this.renderRoot.querySelector('re-menu')
      if (panel) {
        button.setPopoverTarget(panel)
      }
    }

    this.setAttribute('tabindex', '0')
  }

  override render() {
    return html`
      <!-- The \`<re-button>\` that impements the trigger button. -->
      <re-button autofocus part="trigger" caret ?disabled="${this.disabled}">
        <!-- The label for the trigger button. Usually text. -->
        <slot name="label">${this.renderLabelDefault_()}</slot>
      </re-button>
      <!-- The \`<re-menu>\` that implements the popover panel. -->
      <re-menu popover part="panel">
        <!-- Unslotted children elements appear in the menu panel. -->
        <slot></slot>
      </re-menu>
    `
  }

  protected renderLabelDefault_(): Node[] {
    return []
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-dropdown': DropdownElement
  }
}
