import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import './re-icon.js'

/**
 * An element that is meant to be used inside an `<re-menu>` or 're-select'
 * element.  An optional icon can be prefixed or suffixed.  For menu items,
 * the suffix is often used to show a keyboard shortcut.
 */
@customElement('re-item')
export class ItemElement extends LitElement {
  /**
   * True if the item is selected.
   */
  @property({ type: Boolean, reflect: true }) selected = false

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
      :host([selected]) {
        background: rgb(from var(--re-primary-color) R G B / 0.1);
      }

      slot[name=prefix]::slotted(*),
      slot[name=suffix]::slotted(*), {
        flex: 0 0;
      }
      /* It's important to set the display on the slot itself so that the
       * body can be properly styled if the assigned node is a text node. */
      slot[part=body] {
        display: inline-block;
        flex: 1 1;
        margin-left: 0.25rem;
        margin-right: 1rem;
      }
      .hidden {
        display: none;
      }

      @media (hover: hover) {
        :host(:hover) {
          text-shadow: 0 0 3px var(--button-text-shadow-color);
          filter: drop-shadow(0px 0px 4px rgb(from var(--re-primary-color) R G B / 0.8));
        }
        :host(:hover:active) {
          text-shadow: 0 0 3px var(--button-text-shadow-color);
          filter: drop-shadow(0px 0px 4px rgb(from var(--re-primary-color) R G B / 0.8));
        }
      }
    `
  ]

  /**
   * Gets the Nodes that make up this item.  This is useful for determining the
   * label of a selected item in a `<re-select>` element, for example.
   *
   * @returns An array of Nodes that can be ued
   */
  getLabelNodes() {
    let nodes1: Node[] = []
    const prefix =
        this.shadowRoot?.querySelector<HTMLSlotElement>('[name=prefix]')
    const suffix =
        this.shadowRoot?.querySelector<HTMLSlotElement>('[name=suffix]')
    const body =
        this.shadowRoot?.querySelector<HTMLSlotElement>('[part=body]')

    if (prefix) {
      nodes1 = nodes1.concat(prefix.assignedNodes())
    }
    if (body) {
      nodes1 = nodes1.concat(body.assignedNodes())
    }
    if (suffix) {
      nodes1 = nodes1.concat(suffix.assignedNodes())
    }

    const nodes = nodes1.map(n => n.cloneNode(true))
    nodes.forEach(n => n instanceof HTMLElement ? n.id = '' : null)

    return nodes
  }

  override render() {
    return html`
      <!-- Slot used to hold the item prefix.  Often this is an <re-icon>. -->
      <slot name="prefix"><re-icon></re-icon></slot>
      <!-- The main body of the item. As a slot, any nodes in the light DOM
           not explicitly assigned to another slot are assigned to this slot.
           As a part, the slot can be styled as needed.  Note the slot by
           default has the "inline-block" display, some margins, and will grow
           and shrink as needed wihin the <re-item>. -->
      <slot part="body"></slot>
      <!-- For menu items, this is often used to show the keyboard shortcut
           that also triggers the same action as the menu item. -->
      <slot name="suffix"><re-icon></re-icon> </slot>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-item': ItemElement
  }
}

/**
 * Given an Event (usually a `click` event), returns the ID of the closest
 * element to the event's target that matches the given selector.  This
 * function is helpful since clicking the prefix/suffix/body part of the item
 * could cause the target of the event to be that part, complicating item
 * detection.
 *
 * The intended use of this function is as follows:
 *
 * ```html
 * <re-menu>
 *   <re-item id="item1">...</re-item>
 *   <re-item id="item2">...</re-item>
 *   <re-item id="item3">...</re-item>
 * </re-menu>
 * ```
 * ```js
 * document.querySelector('re-menu').addEventListener('click', e => {
 *   const id = getIdOfItem(e)
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
 * })
 * ```
 *
 * @param e An event.  This is usually a click event on an item that is
 *    located inside an `<re-menu>` or `<re-select>` element.
 * @param selector The selector to match.  By default, this is `re-item`.
 *
 * @returns The item or undefined if something other than a menu item
 *    is clicked.
 */
export function getItemFromEvent<T extends ItemElement>(
    e: Event, selector='re-item') {
  if (e.target instanceof HTMLElement) {
    return e.target.closest<T>(selector)
  }
  return undefined
}
