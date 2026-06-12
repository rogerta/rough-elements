import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement } from 'lit/decorators.js'

import './re-icon.js'
import './re-icon-button.js'

/**
 * Given an Event (usually a `click` event), returns the ID of the closest
 * `<re-menu-item>` element to the event's target.  This function is helpful
 * since clicking the prefix/suffix/body part of the menu item could cause
 * the target of the event to be that part, complicating menu item detection.
 *
 * The intended use of this function is as follows:
 *
 * ```html
 * <re-menu id="menu1" @click="${this.onMenuClicked_}">
 *   <re-menu-item id="item1">...</re-menu-item>
 *   <re-menu-item id="item2">...</re-menu-item>
 *   <re-menu-item id="item3">...</re-menu-item>
 * </re-menu>
 * ```
 * ```js
 * onMenuClicked_(e: Event) {
 *   const id = getIdOfMenuitem(e)
 *   switch (id) {
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
 * @param e An event.  This is usually a click event on a menu item that is
 *    located inside an `<re-menu>` element.
 * @returns The ID of the `<re-menu-item>`, or undefined if something other
 *    than a menu item is clicked.
 */
export function getIdOfMenuitem(e: Event) {
  if (e.target instanceof HTMLElement) {
    const mi = e.target.closest('re-menu-item')
    return mi?.id
  }
  return undefined
}

/**
 * An element that is meant to be used inside an `<re-menu>` element.  An
 * optional icon can be prefixed or suffixed.  The suffix is often used
 * to show a keyboard shortcut.
 *
 * The "body" part should be specified as an HTML element and not just a
 * text node so that proper hover highlighting can be applied.  If the body
 * is meant to be just text, it should be wrapped in a <span> element.
 *
 * If a submenu is specified, a right-pointing arrow icon is shown at the right
 * of the menu item.  In this case, the submenu should be specicied with the
 * `popover` attribute.  Note that menu items with a submenu will not propagate
 * `click` events as they are consumed the menu item to manage the submenu.
 */
@customElement('re-menu-item')
export class MenuItemElement extends LitElement {
  static styles = [
    css`
      :host {
        font: caption;  /* Use the system menu font. */
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        justify-content: stretch;
        padding: 0 0.25rem;
        user-select: none;
        cursor: pointer;
      }
      slot[name=prefix]::slotted(*),
      slot[name=suffix]::slotted(*), {
        flex: 0 0;
      }
      slot[part=body]::slotted(*) {
        display: inline-block;
        flex: 1 1;
        margin-left: 0.25rem;
        margin-right: 1rem;
      }
      .hidden {
        display: none;
      }

    re-icon-button::part(button) {
      anchor-name: --menu-anchor;
    }
    slot[name=submenu]::slotted(*) {
      /* Where to position the menu dropvoer relative to the trigger */
      position-anchor: --menu-anchor;
      position-area: center inline-end;
      position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
    }

      @media (hover: hover) {
        :host(:hover:not([disabled])) :not([name=submenu])::slotted(*) {
          text-shadow: 0 0 3px var(--button-text-shadow-color);
          filter: drop-shadow(0px 0px 4px rgb(from var(--re-primary-color) R G B / 0.8));
        }
        :host(:hover:active:not([disabled])) :not([name=submenu])::slotted(*) {
          text-shadow: 0 0 3px var(--button-text-shadow-color);
          filter: drop-shadow(0px 0px 4px rgb(from var(--re-primary-color) R G B / 0.8));
        }
      }
    `
  ]

  protected override updated(_: PropertyValues) {
    const slot =
        this.shadowRoot?.querySelector<HTMLSlotElement>('slot[name=submenu]')
    const hasSubmenu = slot && slot.assignedElements().length > 0
    const arrow = this.shadowRoot?.querySelector('re-icon-button')
    arrow?.classList.toggle('hidden', !hasSubmenu)

    if (hasSubmenu) {
      const menu = slot.assignedElements()[0]
      if (menu instanceof HTMLElement &&
          menu.getAttribute('popover') !== null) {
        arrow?.setPopoverTarget(menu)
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
        // of this element, ignore it.  It is likely to be a submenu item.
        const root = target.getRootNode()
        const parent = target.parentNode
        if ((root !== this.renderRoot) && (parent !== this)) {
          break
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
    return html`
      <!-- Slot used to hold the mennu item prefix.  Often this is. -->
      <slot name="prefix"><re-icon></re-icon></slot>
      <!-- The main body of the menu item. -->
      <slot part="body"></slot>
      <!-- Often used to show the keyboard shortcut that also triggers the same
           action as this menu item. -->
      <slot name="suffix"><re-icon></re-icon></slot>
      <re-icon-button class="hidden" name="keyboard-arrow-right"
          ></re-icon-button>
      <slot name="submenu"></slot>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-menu-item': MenuItemElement
  }
}
