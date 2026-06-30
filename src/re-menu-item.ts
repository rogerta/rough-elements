import { css, html, type PropertyValues } from 'lit'
import { customElement } from 'lit/decorators.js'

import './re-icon.js'
import './re-icon-button.js'
import { ItemElement } from './re-item.js'

/**
 * An element that is meant to be used inside an `<re-menu>` element.  An
 * optional icon can be prefixed or suffixed.  The suffix is often used
 * to show a keyboard shortcut.
 *
 * If a submenu is specified, a right-pointing arrow icon is shown at the right
 * of the menu item.  In this case, the submenu should be specicied with the
 * `popover` attribute.  Note that menu items with a submenu will not propagate
 * `click` events as they are consumed the menu item to manage the submenu.
 */
@customElement('re-menu-item')
export class MenuItemElement extends ItemElement {
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

      /* Used to hide submnenu icon button when there is no submenu. */
      .hidden {
        display: none;
      }
    `
  ]

  /**
   * Returns this menu item's associated submenu if any.
   */
  getSubmenu() {
    const slot =
        this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name=submenu]')
    return slot && slot.assignedElements().length > 0
        ? slot.assignedElements()[0] : undefined
  }

  showSubmenu() {
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
    arrow?.classList.toggle('hidden', submenu === undefined)

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
        const target = e.target as HTMLElement

        // If the clicked element is not in either the shadow or light DOMs
        // of this element, ignore it.  This happens when the user clicks
        // inside a submenu.
        const root = target.getRootNode()
        const parent = target.parentNode
        if ((root !== this.renderRoot) && (parent !== this)) {
          // If the target is an <re-menu-item> (for example, the user did not
          // clicked on a re-divider), then ignore the click here so it
          // propgates up the tree.
          if (target.tagName === 'RE-MENU-ITEM') {
            break
          }
        }

        // From this point on, the menu item consumes the event.  It's either
        // the icon button or this menu item (itself or child) that was clicked.
        // Otherwise the re-menu that contains this menu item would auto close.

        e.stopPropagation()

        // Ignore this click if it's the arrow icon button.  Otherwise the
        // menu would close itself below.
        if (target.tagName === 'RE-ICON-BUTTON') {
          break
        }

        const slot = this.shadowRoot
            ?.querySelector<HTMLSlotElement>('slot[name=submenu]')
        const menu = slot?.assignedElements()[0]
        if (menu instanceof HTMLElement &&
            menu.getAttribute('popover') !== null) {
          menu.togglePopover()
        }
        break
    }
  }

  override render() {
    return [
      super.render(),
      html`
        <!-- Icon button pointing to the right, indicating a submenu. -->
        <re-icon-button part="submenu-icon" class="hidden"
            name="keyboard-arrow-right"></re-icon-button>
        <!-- Slot containing the popover menu to use as a submenu. -->
        <slot name="submenu"></slot>
      `
    ]
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-menu-item': MenuItemElement
  }
}
