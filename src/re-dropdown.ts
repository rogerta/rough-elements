import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement } from 'lit/decorators.js'

import './re-button.js'
import './re-menu.js'

/**
 * A dropdown exposes a menu of actions that the user can perform.  The
 * dropdown consists of a button that toggles the visibility of the menu.
 */
@customElement('re-dropdown')
export class DropdownElement extends LitElement {
  static styles = [css`
    :host {
      display: inline-block;
    }
    re-button[part="trigger"]::part(button) {
      anchor-name: --menu-anchor;
    }
    re-menu {
      /* Where to position the menu dropvoer relative to the trigger */
      position-anchor: --menu-anchor;
      position-area: block-end;
      position-try-fallbacks: flip-block, flip-inline, flip-block flip-inline;
    }
  `]

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
      <!-- The button that triggers opening the panel. -->
      <re-button part="trigger" caret>
        <!-- The slot used as the label for the trigger button.
             Usually this is some short text. -->
        <slot name="label"></slot>
      </re-button>
      <!-- The <re-menu> used as the popover panel. -->
      <re-menu popover part="panel">
        <!-- Holds the slots of this menu. -->
        <slot name="menuitems"></slot>
      </re-menu>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-dropdown': DropdownElement
  }
}
