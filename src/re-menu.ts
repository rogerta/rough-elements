/**
 * Menus show a list of user selectable options as often seen in a dropdown or
 * context menu.  Children of the menu are usually `<re-item>`,
 * `<re-menu-item>` or `<re-divider>` elements but any content can be used.
 * @module
 */

import { css, html, type PropertyValues } from 'lit'
import { customElement } from 'lit/decorators.js'

import { BackgroundMixin } from './internal/re-background-mixin.ts'
import { BorderMixin } from './internal/re-border-mixin.ts'
import { ReElement } from './internal/re-element.ts'

import { getItemFromEvent, ItemElement } from './re-item.ts'
import { MenuItemElement } from './re-menu-item.ts'

// Return value of findItemByValue() when an item cannot be found.
export const NO_ITEM = {
  index: -1,
  item: null,
}

// Stack of open <re-menu>s used to restore focus when they close.
let menuStack: MenuElement[] = []

// State saved by menu during keyboard navigation of the menus.  This state
// is created when the menu is shown up and discarded once the user makes a
// selection or dismisses the menu.
class KeyboardNavState {
  assignedElements: Element[]
  currentIndex: number
  currentItem?: ItemElement  // Must be valid if currentIndex !== -1.

  constructor(
    assignedElements: Element[],
    currentIndex: number,
    currentItem?: ItemElement,
  ) {
    this.assignedElements = assignedElements
    this.currentIndex = currentIndex
    this.currentItem = currentItem

    // Update the current fields with the selected item, if any.
    this.assignedElements.forEach((el, index) => {
      if (el instanceof ItemElement){
        if (el.selected) {
          this.currentIndex = index
          this.currentItem = el
        }
      }
    })
  }

  move(up: boolean) {
    const nextIndex = up ? this.findPrev_(this.currentIndex)
        : this.findNext_(this.currentIndex)
    if (nextIndex === -1) {
      return false
    }

    if (this.currentIndex !== -1) {
      this.currentItem!.selected = false
    }

    // If nextIndex !== -1, then it is guaranteed that the element at that
    // index is an ItemElement.
    this.currentIndex = nextIndex
    this.currentItem = this.assignedElements[this.currentIndex] as ItemElement
    this.currentItem!.selected = true
    this.currentItem.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }

  private findPrev_(index: number) {
    for (--index; index >= 0; --index) {
      const el = this.assignedElements[index]
      if (el instanceof ItemElement && !el.disabled) {
        return index
      }
    }

    return -1
  }

  private findNext_(index: number) {
    for (++index; index < this.assignedElements.length; ++index) {
      const el = this.assignedElements[index]
      if (el instanceof ItemElement && !el.disabled) {
        return index
      }
    }

    return -1
  }
}

/**
 * Menus show a list of user selectable options as often seen in a dropdown or
 * context menu.  Children of the menu are usually `<re-item>`,
 * `<re-menu-item>` or `<re-divider>` elements but any content can be used.
 *
 * The most common use of menus is as follows:
 * ```html
 * <re-menu popover id="menu1"@click="${onMenuClicked_}">
 *   <re-item id="item1">...</re-item>
 *   <re-item id="item2">...</re-item>
 *   <re-item id="item3">...</re-item>
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
 */
@customElement('re-menu')
export class MenuElement extends BorderMixin(BackgroundMixin(ReElement)) {
  private kbNavState_?: KeyboardNavState

  static styles = [
    ...super.styles,
    css`
      :host {
        position: relative;
        flex-direction: column;
        align-items: stretch;
        justify-content: stretch;
        padding: 0.25rem 0;
        background-color: var(--background-color);
        outline: none;

        /* Default maximum height will be six default <re-item>s tall, plus
         * the default border and padding of the re-menu. */
        max-height: calc(6 * 1.5rem + 2 * var(--border-width) + 0.5rem);
      }
      div {
        display: inline-flex;
        position: relative;
        flex-direction: column;
        align-items: stretch;
        justify-content: start;
        overflow: auto;
        outline: none;
      }
      :host(:not([disabled]):focus-within) {
        --re-stroke-width: 2px;
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
    if (!value) {
      return NO_ITEM
    }
    const slot = this.renderRoot.querySelector<HTMLSlotElement>('slot')
    if (!slot) {
      return NO_ITEM
    }

    const assignedElements = slot.assignedElements({ flatten: true })
    if (assignedElements.length === 0) {
      return NO_ITEM
    }

    // TODO: filter out things that are not <re-item>s.

    const index = assignedElements.findIndex(node => {
      return node instanceof ItemElement && node.id === value
    })

    return { index, item: assignedElements[index] as ItemElement }
  }

  /**
   * Unselect all items in the menu.
   */
  unselectAllItems() {
    const slot = this.renderRoot.querySelector<HTMLSlotElement>('slot')
    if (slot) {
      slot.assignedElements({ flatten: true }).forEach(item => {
        if (item instanceof ItemElement) {
          item.selected = false
        }
      })
    }
  }

  handleEvent(e: Event) {
    switch (e.type) {
      case 'click':
        // Only close the menu if the user clicked on an item.  A call to
        // matches() then hidePopover() is used instead of togglePopover(false)
        // because the latter throws an error if this menu does not have the
        // popover attribute.
        if (this.matches(':popover-open') && getItemFromEvent(e)) {
          this.hidePopover()
        }
        break

      case 'toggle': {
        const te = e as ToggleEvent

        if (te.newState === 'open') {
          menuStack.push(this)
        } else {
          // If this item is at the top of the stack, focus the next menu down.
          // But only if there are are at least two menus in the stack.  For
          // menus inside <re-dropdown> and derivatives, the focus will be set
          // back to that element when the <re-menu> is closed.
          const setFocus = menuStack.length > 1 &&
              this === menuStack.at(menuStack.length - 1)
          menuStack = menuStack.filter(m => m !== this)
          if (setFocus) {
            menuStack.at(menuStack.length - 1)?.focus()
          }
        }
        break
      }
      case 'focus': {
        const slot = this.renderRoot.querySelector<HTMLSlotElement>('slot')
        this.kbNavState_= new KeyboardNavState(
            slot?.assignedElements({ flatten: true }) ?? [], -1, undefined)
        break
      }
      case 'keyup': {
        const ke = e as KeyboardEvent
        switch (ke.key) {
          case 'ArrowDown':
          case 'ArrowUp':
          case 'ArrowLeft':
          case 'ArrowRight':
          case ' ':
            // Prevent the default otherwise the page may scroll.
            // Prevent bubbling in case this is a nested submenu.
            ke.preventDefault()
            ke.stopPropagation()

            // Standard buttons generate a click() event only when the spacebar
            // is pressed, so do nothing here.
            break
          case 'Enter':
            // Prevent the default otherwise the page may scroll.
            // Prevent bubbling in case this is a nested submenu.
            ke.preventDefault()
            ke.stopPropagation()

            // Standard buttons generate a click() event only when the enter key
            // is released, so do nothing here.
            break
        }
        break
      }
      case 'keydown': {
        const ke = e as KeyboardEvent
        switch (ke.key) {
          case 'ArrowDown':
            // Prevent the default otherwise the page may scroll.
            // Prevent bubbling in case this is a nested submenu.
            ke.preventDefault()
            ke.stopPropagation()
            this.kbNavState_?.move(false)
            break
          case 'ArrowUp':
            // Prevent the default otherwise the page may scroll.
            // Prevent bubbling in case this is a nested submenu.
            ke.preventDefault()
            ke.stopPropagation()
            this.kbNavState_?.move(true)
            break
          case 'ArrowLeft':
            // Prevent the default otherwise the page may scroll.
            // Prevent bubbling in case this is a nested submenu.
            ke.preventDefault()
            ke.stopPropagation()
            break
          case 'ArrowRight': {
            // Prevent the default otherwise the page may scroll.
            // Prevent bubbling in case this is a nested submenu.
            ke.preventDefault()
            ke.stopPropagation()
            const item = this.kbNavState_?.currentItem
            if(item && item instanceof MenuItemElement) {
              item.toggleSubmenu()
            }
            break
          }
          case ' ':
            // Prevent the default otherwise the page may scroll.
            // Prevent bubbling in case this is a nested submenu.
            ke.preventDefault()
            ke.stopPropagation()
            if(this.kbNavState_?.currentItem) {
              this.kbNavState_.currentItem.click()
            }
            break
          case 'Enter':
            // Prevent the default otherwise the page may scroll.
            // Prevent bubbling in case this is a nested submenu.
            ke.preventDefault()
            ke.stopPropagation()

            if(this.kbNavState_?.currentItem) {
              this.kbNavState_.currentItem.click()
            }
            break
        }
        break
      }
    }
  }

  firstUpdated(props: PropertyValues): void {
    super.firstUpdated(props)
    this.addEventListener('click', this)
    this.addEventListener('focus', this)
    this.addEventListener('keydown', this)
    this.addEventListener('keyup', this)
    this.addEventListener('toggle', this)
  }

  override render() {
    return [
      super.renderRoughSvg(),
      // Remove <div> from tab focus so that in the cases where it displays
      // a scrollbar, it does not try to grab the focus.
      html`
        <div tabindex="-1">
          <!-- The main body slot of the menu, representing a single column
              of items. -->
          <slot></slot>
        </div>
      `,
    ]
  }
}
