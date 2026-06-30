import { css, html, type PropertyValues } from 'lit'
import { customElement } from 'lit/decorators.js'

import { BackgroundMixin } from './internal/re-background-mixin.js'
import { BorderMixin } from './internal/re-border-mixin.js'
import { ReElement } from './internal/re-element.js'
import { getItemFromEvent, ItemElement } from './re-item.js'

// Return value of findItemByValue() when an item cannot be found.
export const NO_ITEM = {
  index: -1,
  item: null,
}

/**
 * Menus show a list of user selectable options as often seen in a dropdown or
 * context menu.  Children of the menu are usually `<re-item>`s,
 * `<re-menu-item>`s or `<re-divider>` elements but any type can be used.
 *
 * The most common use of menus is as follows:
 *
 * ```html
 * <re-menu popover id="menu1" @click="${this.onMenuClicked_}">
 *   <re-menu-item id="item1">...</re-menu-item>
 *   <re-menu-item id="item2">...</re-menu-item>
 *   <re-menu-item id="item3">...</re-menu-item>
 * </re-menu>
 * ```
 * ```js
 * import { getItemFromEvent } from '@rough-elements/re-item.ts'
 *
 * onMenuClicked_(e: Event) {
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
 * A menu has the `tabindex` attribute set to `-1`.  This allows
 * keyboard navigation of the menu items with the arrow keys.  When a menu is
 * used as a popover, it will request focus for itself in response to the
 * `toggle` event.
 *
 * @cssproperty --re-background-color - The background color of the menu. Defaults to `Canvas`.
 */
@customElement('re-menu')
export class MenuElement extends BorderMixin(BackgroundMixin(ReElement)) {
  static styles = [
    ...super.styles,
    css`
      :host {
        position: relative;
        flex-direction: column;
        align-items: stretch;
        justify-content: start;
        padding: 0.25rem 0;
        background-color: var(--re-background-color, Canvas);
        outline: none;
      }
      :host(:not([popover])),
      :host([popover]:popover-open) {
        display: inline-flex;
        overflow: visible;  /* Needed so that menu border is visible */
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
  findItemByValue(value: string) {
    const slot =
        this.renderRoot.querySelector<HTMLSlotElement>('slot')
    if (!slot) {
      return NO_ITEM
    }

    const assignedElements = slot.assignedElements({ flatten: true })
    if (assignedElements.length === 0) {
      return NO_ITEM
    }

    const index = !value ? 0 : assignedElements.findIndex(node => {
      return node instanceof ItemElement && node.id === value
    })

    return { index, item: assignedElements[index] as ItemElement }
  }

  handleEvent(e: Event) {
    switch (e.type) {
      case 'click':
        // Only close the menu if the user clicked on an item.
        if (this.matches(':popover-open') && getItemFromEvent(e)) {
          this.hidePopover()
        }
        break

      case 'toggle':
        // <re-menu> has tabindex==-1 which means it will only get focus if
        // programmatically set.  So request focus now.  tabindex is not set
        // to zero since this is not recommended by mdn or what-wg for popovers.
        // If this event is received then the menu has been configured as a
        // popover.  Request focus now so that keyboard navigation of the menu
        // is possible.
        this.focus()
        break
    }
  }

  firstUpdated(props: PropertyValues): void {
    super.firstUpdated(props)
    this.addEventListener('click', this)
    this.addEventListener('toggle', this)

    // This makes the element focusable programmtically.  This is best practice
    // for popovers that are focusable.
    // TODO: tabindex should never be set in the ctor for web components.  Need
    // to fix all the other classes (which seem to be working right now in
    // chrome...)
    this.setAttribute('tabindex', '-1')
  }

  override render() {
    return [
      super.renderRoughSvg(),
      html`
        <!-- The main body slot of the menu, representing a single column of items. -->
        <slot></slot>
      `,
    ]
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-menu': MenuElement
  }
}
