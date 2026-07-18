import { css, html, type PropertyValues } from 'lit'
import { customElement } from 'lit/decorators.js'

import './re-icon.js'
import './re-icon-button.js'
import { ItemElement } from './re-item.js'

/**
 * Menu items are Items that open up a menu when clicked .  They can be used
 * anywhere an Item can be used (essentially `<re-menu-item>` extends
 * `<re-item>`) and a submenu is needed.  For example:
 * ```
 * <re-dropdown>
 *   <re-item id="item1">...</re-item>
 *   <re-item id="item2">...</re-item>
 *   <re-item id="item3">...</re-item>
 *   <re-menu-item id="item3">
 *     ...
 *     <re-menu popover slot="submenu">
 *       <re-item id="item31">...</re-item>
 *       <re-item id="item32">...</re-item>
 *       <re-item id="item33">...</re-item>
 *     </re-menu>
 *   </re-item>
 * </re-dropdown>
 * ```
 * The menu must be assigned to fill the`submenu` slot and have the `popover`
 * attribute.  Any element type can be used but `<re-menu>` is the most common.
 *
 * If a submenu is specified, a right-pointing arrow icon is shown is the
 * `suffix `slot of the menu item.
 *
 * Note that menu items with a submenu will not propagate
 * `click` events as they are consumed the menu item to manage the submenu.
 *
 * @cssproperty --color - The foreground colour of the item.  Defaults to
 *    `--foreground-color`.  When the item is selected, 10% of this colour
 *    is used as the background.
 * @cssproperty --hover-shadow-color - The colour of shadow used when the
 *    button is hovered.
 */
@customElement('re-menu-item')
export class MenuItemElement extends ItemElement {
  constructor() {
    super()
    this.addEventListener('click', this)
  }

  static styles = [
    ...super.styles,
    css`
      re-icon-button::part(button) {
        anchor-name: --menu-anchor;
      }

      slot[name=submenu]::slotted(*) {
        /* Where to position the menu dropvoer relative to the trigger */
        position-anchor: --menu-anchor;
        position-area: center inline-end;
        position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
      }
    `
  ]

  /**
   * Returns this menu item's associated submenu, if any and if valid. A valid
   * submenu is an `HTMLElement` with the `popover` attribute.
   */
  getSubmenu() {
    const slot =
        this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name=submenu]')
    const menu = slot && slot.assignedElements().length > 0
        ? slot.assignedElements()[0] : undefined
    return (
        menu instanceof HTMLElement && menu.getAttribute('popover') !== null)
            ? menu : undefined
  }

  /**
   * Toggles the visible state of the submenu.
   */
  toggleSubmenu() {
    // Note: calling button.click() does not seem to show the popover.  To
    // make this work togglePopover() was exposed from <re-icon-button>.  See
    // if there is a way to make click() work.
    const button = this.renderRoot.querySelector('re-icon-button')
    button?.togglePopover()
  }

  protected override updated(props: PropertyValues) {
    super.updated(props)

    const submenu = this.getSubmenu()
    const arrow = this.shadowRoot?.querySelector('re-icon-button')
    arrow?.classList.toggle('re-hidden', submenu === undefined)

    if (submenu) {
      if (submenu instanceof HTMLElement &&
          submenu.getAttribute('popover') !== null) {
        arrow?.setPopoverTarget(submenu)
        this.renderRoot.addEventListener('click', this)
      } else {
        console.error('submenu should have the popover attribute')
      }
    } else {
      arrow?.setPopoverTarget(null)
      this.renderRoot.removeEventListener('click', this)
    }
  }

  handleEvent(e: Event) {
    switch (e.type) {
      case 'click':
        // If there is no submenu, nothing to do here.  Just treat this like
        // a simple <re-item>.
        const submenu = this.getSubmenu()
        if (!submenu) {
          break
        }

        const target = e.target as HTMLElement

        // If the clicked element is not this element or in either the shadow
        // or light DOMs of this element, ignore it.  This happens when the
        // user clicks inside a submenu.
        const root = target.getRootNode()
        const parent = target.parentNode
        if ((target !== this) && (root !== this.renderRoot) &&
            (parent !== this)) {
          // // If the target is an <re-menu-item> (for example, the user did not
          // // clicked on a re-divider), then ignore the click here so it
          // // propgates up the tree.
          // if (target.tagName === 'RE-MENU-ITEM') {
            break
          // }
        }

        // From this point on, the menu item consumes the event.  It's either
        // the icon button or this menu item (itself or child) that was clicked.
        // Otherwise the re-menu that contains this menu item would auto close.

        e.stopPropagation()

        // Ignore this click if it's the arrow icon button since it's the
        // trigger of the popover.  Otherwise the menu would close itself below.
        if (target.tagName === 'RE-ICON-BUTTON') {
          break
        }

        submenu.togglePopover()
        break
    }
  }

  override render() {
    return [
      super.render(),
      html`
        <!-- Icon button pointing to the right, indicating a submenu. -->
        <re-icon-button part="submenu-icon" class="re-hidden"
            name="keyboard-arrow-right"></re-icon-button>
        <!-- Slot containing the popover menu to use as a submenu. -->
        <slot name="submenu"></slot>
      `
    ]
  }
}
