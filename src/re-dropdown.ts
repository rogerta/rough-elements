import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import './re-button.js'
import './re-menu.js'
import { ItemElement } from './re-item.js'
import { NO_ITEM } from './re-menu.js'

/**
 * Dropdown element exposes a menu of actions that the user can perform.
 * It consists of a trigger button and a popover menu panel.
 */
@customElement('re-dropdown')
export class DropdownElement extends LitElement {
  /**
   * If true the button is disabled and does not respond to user actions.
   */
  @property({ type: Boolean, reflect: true }) disabled = false

  private currentValue_?: string

  static styles = [
    css`
      :host {
        display: inline-block;
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

  onToggle_(e: Event) {
    const te = e as ToggleEvent
    if (te.newState === 'open') {
      // <re-menu> has tabindex==-1 which means it will only get focus if
      // programmatically set.  So request focus now.  tabindex is not set
      // to zero since this is not recommended by mdn or what-wg for popovers.
      const menu = te.target as HTMLElement
      menu.focus()
      this.currentValue_ = undefined
    }
  }

  onKeyDown_(e: Event) {
    const ke = e as KeyboardEvent
    switch (ke.key) {
      case 'ArrowDown':
        // Prevent the default otherwise the page may scroll.
        ke.preventDefault()
        console.log(`keydown key=${ke.key}`)
        break
      case 'ArrowUp':
        // Prevent the default otherwise the page may scroll.
        ke.preventDefault()
        console.log(`keydown key=${ke.key}`)
        break
      case 'ArrowLeft':
        // Prevent the default otherwise the page may scroll.
        ke.preventDefault()
        console.log(`keydown key=${ke.key}`)
        break
      case 'ArrowRight':
        // Prevent the default otherwise the page may scroll.
        ke.preventDefault()
        console.log(`keydown key=${ke.key}`)
        break
    }
  }

  onKeyUp_(e: Event) {
    const ke = e as KeyboardEvent
    switch (ke.key) {
      case 'ArrowDown':
        // Prevent the default otherwise the page may scroll.
        ke.preventDefault()
        console.log(`keyup key=${ke.key}`)
        break
      case 'ArrowUp':
        // Prevent the default otherwise the page may scroll.
        ke.preventDefault()
        console.log(`keyup key=${ke.key}`)
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
    }
  }

  override firstUpdated(_: PropertyValues) {
    const button = this.renderRoot.querySelector('re-button')
    if (button) {
      const panel = this.renderRoot.querySelector('re-menu')
      if (panel) {
        button.setPopoverTarget(panel)
      }
    }
  }

  override render() {
    return html`
      <!-- The trigger button that toggles the dropdown visibility. -->
      <re-button part="trigger" caret ?disabled="${this.disabled}">
        <!-- Slot used as the label for the trigger button. Usually text. -->
        <slot name="label">${this.renderLabelDefault_()}</slot>
      </re-button>
      <!-- The menu container used as the popover panel. -->
      <re-menu popover part="panel" @toggle="${this.onToggle_}"
          @keydown="${this.onKeyDown_}" @keyup="${this.onKeyUp_}">
        <!-- The default slot representing the menu items. -->
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
