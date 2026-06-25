import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import './re-icon.js'

/**
 * An element that is meant to be used inside an `<re-menu>` or 're-select'
 * element.  An optional icon can be prefixed or suffixed.  For menu items,
 * the suffix is often used to show a keyboard shortcut.
 *
 * @cssproperty --color - The color of the item's body text.
 * @cssproperty --re-primary-color - The primary color used for selection background and hover drop-shadow.
 * @cssproperty --button-text-shadow-color - The color of text shadow on hover.
 */
@customElement('re-item')
export class ItemElement extends LitElement {
  /**
   * True if the item is selected.
   */
  @property({ type: Boolean, reflect: true }) selected = false

  /**
   * If true the button is disabled and does not respond to user actions.
   */
  @property({ type: Boolean, reflect: true }) disabled = false

  constructor() {
    super()
    this.addEventListener('click', e => {
      if (this.disabled) {
        e.stopImmediatePropagation()
        e.stopPropagation()
      }
    })
  }

  static styles = [
    css`
      :host {
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        justify-content: stretch;
        padding: 0 0.25rem;
        user-select: none;
        cursor: pointer;
      }
      :host([selected]) {
        background: rgb(from var(--color) R G B / 0.1);
      }
      :host([disabled]) {
        opacity: 0.5;
        cursor: default;
      }

      @media (prefers-color-scheme: dark) {
        :host([selected]) {
          background: rgb(from var(--color) R G B / 0.2);
        }
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
        margin: 0;
        color: var(--color);
      }

      @media (hover: hover) {
        :host(:hover:not([disabled])) {
          text-shadow: 0 0 3px var(--button-text-shadow-color);
          filter: drop-shadow(0px 0px 4px rgb(from var(--re-primary-color) R G B / 0.8));
        }
        :host(:hover:active:not([disabled])) {
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
   * @returns An array of Nodes that can be used to determine the label.
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

  override render(): unknown {
    return html`
      <!-- Slot used to hold the item prefix.  Often this is an <re-icon>. -->
      <slot name="prefix"><re-icon part="prefix"></re-icon></slot>
      <!-- The main body of the item. As a slot, any nodes in the light DOM
           not explicitly assigned to another slot are assigned to this slot.
           As a part, the slot can be styled as needed.  Note the slot by
           default has the "inline-block" display, some margins, and will grow
           and shrink as needed wihin the <re-item>. -->
      <slot part="body"></slot>
      <!-- For menu items, this is often used to show the keyboard shortcut
           that also triggers the same action as the menu item. -->
      <slot name="suffix"><re-icon part="suffix"></re-icon> </slot>
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
 * <re-item> that is not disabled.  This function is helpful since clicking
 * the prefix/suffix/body part of the item could cause the target of the event
 * to be that part, complicating item detection.
 *
 * Note that web components that derive from <re-item> are also detected.
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
 * })
 * ```
 *
 * @param e An event.  This is usually a click event on an element that is
 *    located inside an `<re-menu>` or `<re-select>` element.
 *
 * @returns The <re-item>, or null if something other than an <re-item> was
 *    clicked.
 */
export function getItemFromEvent(e: Event) {
  let target = e.target instanceof HTMLElement ? e.target : null
  while (target && !(target instanceof ItemElement)) {
    target = target.parentElement
  }
  return target && target.getAttribute('disabled') === null ? target : null
}
