import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import './re-button.js'
import './re-menu.js'

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
      <re-menu popover part="panel">
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
