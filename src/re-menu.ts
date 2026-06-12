import { css, html, type PropertyValues } from 'lit'
import { customElement } from 'lit/decorators.js'

import { Mixin as BgMixin } from './re-background-mixin.js'
import { Mixin as BorderMixin } from './re-border-mixin.js'
import { ReElement } from './re-element.js'

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
 * import { getIdOfMenuitem } from 'rough-elements/re-menu-item.ts'
 *
 * onMenuClicked_(e: Event) {
 *   const id = getIdOfMenuitem(e)
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
 * }
 * ```
 */
@customElement('re-menu')
export class MenuElement extends BorderMixin(BgMixin(ReElement)) {
  static styles = [
    ...super.styles,
    css`
      :host {
        position: relative;
        flex-direction: column;
        align-items: stretch;
        justify-content: start;
        padding: 0.25rem 0;
      }
      :host(:not([popover])),
      :host([popover]:popover-open) {
        margin: var(--border-width); /* Visually nicer */
        display: inline-flex;
        overflow: visible;  /* Needed so that menu border is visible */
      }
    `
  ]

  handleEvent(e: Event) {
    switch (e.type) {
      case 'click':
        if (this.matches(':popover-open')) {
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
        <!-- The main body of the menu. The panel is onle column of
          -- children representing the menu item choices. -->
        <slot part="panel"></slot>
      `,
    ]
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-menu': MenuElement
  }
}
