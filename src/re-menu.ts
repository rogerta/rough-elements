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

// State saved by menu during keyboard navigation of the menus.  This state
// is created when the menu is shown up and discarded once the user makes a
// selection or dismisses the menu.
class KeyboardNavState {
  constructor(
    public assignedElements: Element[],
    public currentIndex: number,
    public curentItem?: ItemElement,  // Must be valid if currentIndex !== -1.
  ) {
    // Update the current fields with the selected item, if any.
    this.assignedElements.forEach((el, index) => {
      if (el instanceof ItemElement){
        if (el.selected) {
          this.currentIndex = index
          this.curentItem = el
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
      this.curentItem!.selected = false
    }

    // If nextIndex !== -1, then it is guaranteed that the element at that
    // index is an ItemElement.
    this.currentIndex = nextIndex
    this.curentItem = this.assignedElements[this.currentIndex] as ItemElement
    this.curentItem!.selected = true
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

  private kbNavState_?: KeyboardNavState

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
    const slot = this.renderRoot.querySelector<HTMLSlotElement>('slot')
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

        const slot = this.renderRoot.querySelector<HTMLSlotElement>('slot')
        this.kbNavState_= new KeyboardNavState(
            slot?.assignedElements({ flatten: true }) ?? [], -1, undefined)
        break

      case 'keydown': {
        const ke = e as KeyboardEvent
        switch (ke.key) {
          case 'ArrowDown':
          case 'ArrowUp':
          case 'ArrowLeft':
          case 'ArrowRight':
            // Prevent the default otherwise the page may scroll.
            ke.preventDefault()
            break
        }
        break
      }
      case 'keyup': {
        const ke = e as KeyboardEvent
        switch (ke.key) {
          case 'ArrowDown':
            // Prevent the default otherwise the page may scroll.
            ke.preventDefault()
            this.kbNavState_?.move(false)
            break
          case 'ArrowUp':
            // Prevent the default otherwise the page may scroll.
            ke.preventDefault()
            this.kbNavState_?.move(true)
            break
          case 'ArrowLeft':
            // Prevent the default otherwise the page may scroll.
            ke.preventDefault()
            console.log(`keyup key=${ke.key}`)
            break
          case 'ArrowRight':
            // Prevent the default otherwise the page may scroll.
            ke.preventDefault()
            console.log(`keyup key=${ke.key}`)
            break
          case 'Enter':
            if(this.kbNavState_?.curentItem) {
              this.kbNavState_.curentItem.click()
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
    this.addEventListener('toggle', this)
    this.addEventListener('keydown', this)
    this.addEventListener('keyup', this)

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
