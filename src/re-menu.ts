import { css, html, type PropertyValues } from 'lit'
import { customElement } from 'lit/decorators.js'

import { BackgroundMixin } from './internal/re-background-mixin.js'
import { BorderMixin } from './internal/re-border-mixin.js'
import { ReElement } from './internal/re-element.js'
import { getItemFromEvent } from './re-item.js'

/**
 * Shows a menu as typically seen in a dropdown or context menu.  Usually
 * the children elements of a menu are `<re-menu-item>` and `<re-divider>`
 * elements but they can be any type.
 *
 * The most common use of menus is as follows:
 *
 * ```html
 * <re-menu id="menu1" @click="${this.onMenuClicked_}">
 *   <re-menu-item id="item1">...</re-menu-item>
 *   <re-menu-item id="item2">...</re-menu-item>
 *   <re-menu-item id="item3">...</re-menu-item>
 * </re-menu>
 * ```
 * ```js
 * import { getItemFromEvent } from 'rough-elements/re-item.ts'
 *
 * onMenuClicked_(e: Event) {
 *   const item = getItemFromEvent(e, 're-menu-item')
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
 * @cssproperty --re-background-color - The background color of the menu. Defaults to `Canvas`.
 */
@customElement('re-menu')
export class MenuElement extends BorderMixin(BackgroundMixin(ReElement)) {
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
      }
      :host(:not([popover])),
      :host([popover]:popover-open) {
        display: inline-flex;
        overflow: visible;  /* Needed so that menu border is visible */
      }
    `
  ]

  handleEvent(e: Event) {
    switch (e.type) {
      case 'click':
        // Only close the menu if the user clicked on an <re-menu-item>.
        if (this.matches(':popover-open') &&
            getItemFromEvent(e)) {
          this.hidePopover()
        }
        break
    }
  }

  firstUpdated(props: PropertyValues): void {
    super.firstUpdated(props)
    this.addEventListener('click', this)
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
