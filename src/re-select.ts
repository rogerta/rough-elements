import { type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { fire } from './internal/re-element.js'
import { ReFormControlMixin } from './internal/re-form-control-mixin.js'

import { DropdownElement } from  './re-dropdown.js'
import { getItemFromEvent, ItemElement } from './re-item.js'

/**
 * A select exposes a menu of options that the user can select from.  The
 * currently selected option is shown as the label of the select.
 *
 * While this element derives from `<re-dropdown>`, the `label` slot should not
 * be used directly.  It is used internally to show the currently selected
 * option(s).
 *
 * This component inherits all CSS custom properties and slots from DropdownElement.
 */
@customElement('re-select')
export class SelectElement extends ReFormControlMixin(DropdownElement) {
   @property({ type: Boolean, reflect: true }) multiple = false
   @property({}) value = ''
   @property({ type: Number }) selectedIndex = -1
   @property({ type: Array }) selectedOptions = []
   @property({ type: Array, state: true }) private labelNodes_: Node[] = []

   override getFormValue(): string | Blob | undefined {
    return this.selectedIndex === -1 ? undefined : this.value
  }

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
          if (this.value !== item.id) {
            this.value = item.id
            this.labelNodes_ = item.getLabelNodes()
            this.updateComplete.then(
                () => fire(this, 'change', {bubbles: true}))
          }
        }
        break
      }
    }
  }

  protected override renderLabelDefault_() {
    return this.labelNodes_
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-select': SelectElement
  }
}
