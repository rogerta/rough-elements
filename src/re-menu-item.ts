import { css, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'

import './re-icon.js'

/**
 * An element that is meant to be used inside an <re-menu> element.  An
 * optional icon can be placed at the start.  An optional suffix is often used
 * to show a keyboard shortcut.
 *
 * The "body" part should be specified as an HTML element and not just a
 * text node so that proper hover highlighting can be applied.  If the body
 * is meant to be just text, it should be wrapped in a <span> element.
 *
 * If a submenu is specified
 * the suffix instead will show an icon to
 */
@customElement('re-menu-item')
export class MenuItemElement extends LitElement {
  static styles = [
    css`
      :host {
        display: inline-flex;
        flex-direction: row;
        align-items: center;
        justify-content: stretch;
        padding: 0 0.25rem;
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

      @media (hover: hover) {
        :host(:hover:not([disabled])) ::slotted(*) {
          text-shadow: 0 0 3px var(--button-text-shadow-color);
          filter: drop-shadow(0px 0px 4px rgb(from var(--re-primary-color) R G B / 0.8));
        }
        :host(:hover:active:not([disabled])) ::slotted(*) {
          text-shadow: 0 0 3px var(--button-text-shadow-color);
          filter: drop-shadow(0px 0px 4px rgb(from var(--re-primary-color) R G B / 0.8));
        }
      }
    `
  ]

  override render() {
    return html`
      <!-- Used to hold an icon.  If none is specified, the space for the
           icon is still taken up, but shows as empty. -->
      <slot name="prefix" part="prefix"><re-icon></re-icon></slot>
      <!-- The main body of the menu item. -->
      <slot part="body"></slot>
      <!-- Often used to show the keyboard shortcut that also triggers the same
           action as this menu item. -->
      <slot name="suffix" part="suffix"><re-icon></re-icon></slot>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-menu-item': MenuItemElement
  }
}
