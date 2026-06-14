import { type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { DropdownElement } from  './re-dropdown.js'
import { getItemFromEvent, ItemElement } from './re-item.js'
import { fire } from './re-element.js'

/**
 * A select exposes a menu of options that the user can select from.  The
 * currently selected option is shown as the label of the select.
 *
 * While this element derives from `<re-dropdown>`, the `label` slot should not
 * be used directly.  It is used internally to show the currently selected
 * option(s).
 */
@customElement('re-select')
export class SelectElement extends DropdownElement {
   @property({ type: Boolean, reflect: true }) multiple = false
   @property({}) value = ''
   @property({ type: Number }) selectedIndex = -1
   @property({ type: Array }) selectedOptions = []
   @property({ type: Array, state: true }) private labelNodes_: Node[] = []

  override firstUpdated(props: PropertyValues) {
    super.firstUpdated(props)

    const menu = this.renderRoot.querySelector('re-menu')
    if (menu) {
      menu.addEventListener('click', this)
    }

    // If the select has a preselected value, we need to update the label to
    // match it.
     if (props.has('value')) {
      const slot =
          this.renderRoot.querySelector<HTMLSlotElement>('re-menu > slot')
      if (slot) {
        const selectedNode = slot.assignedNodes().find(node => {
          return node instanceof ItemElement && node.id === this.value
        }) as ItemElement | undefined

        if (selectedNode) {
          this.labelNodes_ = selectedNode.getLabelNodes()
        }
      }
    }
  }

  private unselectAllItems_() {
    const slot =
        this.renderRoot.querySelector<HTMLSlotElement>('re-menu > slot')
    if (slot) {
      slot.assignedNodes().forEach(item => {
        if (item instanceof ItemElement) {
          item.selected = false
        }
      })
    }
  }

  handleEvent(e: Event) {
    switch (e.type) {
      case 'click': {
        const item = getItemFromEvent(e)
        if (item) {
          this.unselectAllItems_()
          item.selected = !item.selected
          this.value = item.id
          this.labelNodes_ = item.getLabelNodes()
          fire(this, 'change')
        }
        break
      }
    }
  }

  renderLabelDefault_() {
    return this.labelNodes_
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-select': SelectElement
  }
}
