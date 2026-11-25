/**
 * Menus show a list of user selectable options as often seen in a dropdown or
 * context menu.  Children of the menu are usually `<re-item>`,
 * `<re-menu-item>` or `<re-divider>` elements but any content can be used.
 * @module
 */

import { css, CSSResult, html, type PropertyValues,
  type TemplateResult } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { BackgroundMixin,
  type BackgroundMixinInterface } from './internal/re-background-mixin.ts'
import { BorderMixin,
  type BorderMixinInterface } from './internal/re-border-mixin.ts'
import { ReElement } from './internal/re-element.ts'

import { getItemFromEvent, ItemElement } from './re-item.ts'
import { MenuItemElement } from './re-menu-item.ts'

export interface ItemRecord {
  index: number
  item: ItemElement | null
}

// Return value of findItemByValue() when an item cannot be found.
export const NO_ITEM = {
  index: -1,
  item: null,
} as const

// Stack of open <re-menu>s used to restore focus when they close.
let menuStack: MenuElement[] = []

// State saved by menu during keyboard navigation of the menus.  This state
// is created when the menu is shown up and discarded once the user makes a
// selection or dismisses the menu.
class KeyboardNavState {
  assignedItems: ItemElement[]
  currentIndex: number = -1
  currentItem?: ItemElement = undefined // Must be valid if currentIndex !== -1.

  constructor(assignedItems: ItemElement[]) {
    this.assignedItems = assignedItems
    this.initialize_()
  }

  click(onlySelect: boolean) {
    if (!this.currentItem) {
      return
    }

    const item = this.currentItem

    if (onlySelect) {
      item.selected = !item.selected
    } else {
      item.click()
    }
  }

  move(up: boolean, clearAllSelectFirst: boolean,
    selectFollowsHighlight: boolean) {
    // If there is no current item, then the user has not yet navigated the menu
    // with the keyboard.  In this case, highlight the current item.  If
    // currentIndex is -1 the menu is empty.  nextIndex below will be -1 and
    // nothing happens.
    if (!this.currentItem && this.currentIndex !== -1) {
      this.currentItem = this.assignedItems[this.currentIndex]
      this.highlightItem_(this.currentItem, selectFollowsHighlight)
      return
    }

    const nextIndex = up
      ? this.findPrev_(this.currentIndex)
      : this.findNext_(this.currentIndex)
    if (nextIndex === -1) {
      return
    }

    if (clearAllSelectFirst) {
      this.assignedItems.forEach(item => item.selected = false)
    }

    this.currentItem!.highlighted = false

    // If nextIndex !== -1, then it is guaranteed that the element at that
    // index is an ItemElement.
    this.currentIndex = nextIndex
    this.currentItem = this.assignedItems[this.currentIndex]

    this.highlightItem_(this.currentItem, selectFollowsHighlight)
  }

  private findPrev_(index: number) {
    for (--index; index >= 0; --index) {
      const el = this.assignedItems[index]
      if (!el.disabled) {
        return index
      }
    }

    return -1
  }

  private findNext_(index: number) {
    for (++index; index < this.assignedItems.length; ++index) {
      const el = this.assignedItems[index]
      if (!el.disabled) {
        return index
      }
    }

    return -1
  }

  private highlightItem_(item: ItemElement, selectFollowsHighlight: boolean) {
    item.highlighted = true
    if (selectFollowsHighlight) {
      item.selected = true
    }

    item.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }

  // Initialize currentIndex always and currentItem conditionally.
  //
  // currentItem is either the first selected or highlighted item, or the first
  // item in the menu.  If there are no items in the menu, currentIndex will be
  // -1.
  //
  // If at least one item is selected or highlighted, currentItem will be
  // initialized as well.  This makes the internal state consistent with the
  // visible UI.
  private initialize_() {
    this.currentIndex = this.assignedItems.findIndex(el => el.highlighted)
    if (this.currentIndex === -1) {
      this.currentIndex = this.assignedItems.findIndex(el => el.selected)
    }
    if (this.currentIndex === -1 && this.assignedItems.length > 0) {
      this.currentIndex = 0

      // This scrollIntoView() is for a specific edge case.  If the number of
      // items is large, the menu uses scroll bars, and the user clicks an item
      // far down in the list, the next time the menu pops up it will be
      // scrolled to the clicked item.  The line above sets the current index
      // to 0 and that item is not visible.  If scrollIntoView() is not done
      // here, the next time the user clicks an arrow key, the list will scroll
      // the to correct item, but that feels weird.
      this.assignedItems[0].scrollIntoView({
        behavior: 'instant',
        block: 'nearest',
      })

      // currentItem will be initialized when a keyboard action is taken.
      // This is to avoid highlighting an item if the user never interacts with
      // the keyboard.
    } else {
      // An item is either already selected or highlighted, so set the current
      // item right away.  That way if the user presses a key, the appropriate
      // action is taken.
      this.currentItem = this.assignedItems[this.currentIndex]
      this.currentItem.highlighted = true
    }
  }

  unhighlightAllItemsExcept(id: string): void {
    this.assignedItems.forEach(item => {
      item.highlighted = item.id === id
    })

    if (id === '') {
      this.currentItem = undefined
      this.initialize_()
    }
  }
}

export const MenuElementBase:
  & (new(...args: any[]) => BorderMixinInterface)
  & (new(...args: any[]) => BackgroundMixinInterface)
  & typeof ReElement = BorderMixin(BackgroundMixin(ReElement))

/**
 * Menus show a list of user selectable options as often seen in a dropdown or
 * context menu.  Children of the menu are usually `<re-item>`,
 * `<re-menu-item>` or `<re-divider>` elements but any content can be used.
 * `<re-item>`s must have a non-empty and unique `id` attribute or some
 * functionality will not work as expected.
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
export class MenuElement extends MenuElementBase {
  private kbNavState_?: KeyboardNavState

  /**
   * Indicates that the menu is part of a dropdown control.  This mostly
   * affects the styling of the contanined menu items as well as how keyboard
   * navigation is handled.
   *
   * This is generally meant for internal use of the rough-elements library and
   * is not normally set by users.
   */
  @property({ type: Number })
  accessor dropdownmode: 0 | 1 | 2 = 0

  static styles: CSSResult[] = [
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
    `,
  ]

  private get assignedItems(): ItemElement[] {
    const slot = this.renderRoot.querySelector<HTMLSlotElement>('slot')
    if (!slot) {
      return []
    }

    return slot.assignedElements({ flatten: true })
      .filter((el): el is ItemElement => el instanceof ItemElement)
  }

  /**
   * Unselect and unhighlights all items in the menu except the one with the
   * specified ID.  Using an empty string for `id` will unselect and
   * unhighlights all items.
   *
   * @param id The `id` of the item to keep selected.
   */
  unselectAllItemsExcept(id: string): void {
    this.assignedItems.forEach(item => {
      item.selected = item.id === id
      item.highlighted = item.id === id
    })
  }

  handleEvent(e: Event): void {
    switch (e.type) {
      case 'click':
        // Only close the menu if the user clicked on an item.  A call to
        // matches() then hidePopover() is used instead of togglePopover(false)
        // because the latter throws an error if this menu does not have the
        // popover attribute.
        //
        // Note: the click event is never received for an <re-menu-item> with a
        // submenu because the event's propagation is stopped to manage the
        // submenu.
        if (getItemFromEvent(e)) {
          this.kbNavState_?.unhighlightAllItemsExcept('')
          if (this.matches(':popover-open')) {
            this.hidePopover()
          }
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
          const setFocus = menuStack.length > 1
            && this === menuStack.at(menuStack.length - 1)
          menuStack = menuStack.filter(m => m !== this)
          if (setFocus) {
            menuStack.at(menuStack.length - 1)?.focus()
          }
        }
        break
      }
      case 'focus': {
        this.kbNavState_ = new KeyboardNavState(this.assignedItems)
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
        const isCtrl = ke.ctrlKey
        const isShift = ke.shiftKey
        const selectFollowsHighlight = this.dropdownmode === 2
          && (isShift || !isCtrl)
        const clearAllSelectFirst = this.dropdownmode === 2 && !isCtrl
          && !isShift

        switch (ke.key) {
          case 'ArrowDown':
            // Prevent the default otherwise the page may scroll.
            // Prevent bubbling in case this is a nested submenu.
            ke.preventDefault()
            ke.stopPropagation()
            this.kbNavState_?.move(false, clearAllSelectFirst,
              selectFollowsHighlight)
            break
          case 'ArrowUp':
            // Prevent the default otherwise the page may scroll.
            // Prevent bubbling in case this is a nested submenu.
            ke.preventDefault()
            ke.stopPropagation()
            this.kbNavState_?.move(true, clearAllSelectFirst,
              selectFollowsHighlight)
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
            if (item && item instanceof MenuItemElement) {
              item.toggleSubmenu()
            }
            break
          }
          case ' ':
            // Prevent the default otherwise the page may scroll.
            // Prevent bubbling in case this is a nested submenu.
            ke.preventDefault()
            ke.stopPropagation()
            if (this.kbNavState_?.currentItem) {
              this.kbNavState_.click(this.dropdownmode === 2)
            }
            break
          case 'Enter':
            // Prevent the default otherwise the page may scroll.
            // Prevent bubbling in case this is a nested submenu.
            ke.preventDefault()
            ke.stopPropagation()

            if (this.dropdownmode !== 2 && this.kbNavState_?.currentItem) {
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

  override render(): TemplateResult<1>[] {
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
