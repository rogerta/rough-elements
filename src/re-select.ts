import { type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { ReFormControlMixin } from './internal/re-form-control-mixin.js'

import { DropdownElement } from  './re-dropdown.js'
import { getItemFromEvent } from './re-item.js'

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
  static formAssociated = true

  @property({ type: Boolean, reflect: true }) multiple = false
  @property({ type: Number }) selectedIndex = -1
  @property({ type: Array }) selectedOptions = []
  @property({ type: Boolean, reflect: true }) required = false
  @property({}) value = ''

  @property({ type: Array, state: true }) private labelNodes_: Node[] = []

  constructor() {
    super()

    // This makes the element focusable.
    this.setAttribute('tabindex', '0')
  }

  validate_() {
    const validity: ValidityStateFlags = {}
    let message: string | undefined

    if (this.required && this.selectedIndex === -1) {
      validity.valueMissing = true
      message = 'Nothing selected'
    }

    this.setValidity(validity, message)
  }

  override firstUpdated(props: PropertyValues) {
    super.firstUpdated(props)

    const menu = this.renderRoot.querySelector('re-menu')
    menu?.addEventListener('click', this)
  }

  override updated(props: PropertyValues) {
    super.updated(props)

     if (props.has('value')) {
      this.setFormValue(this.value)
      this.findItemByValue_(this.value).then(({index, item}) => {
        if (index !== -1) {
          this.unselectAllItems_().then(() => {
            item!.selected = true
            this.selectedIndex = index
            this.labelNodes_ = item!.getLabelNodes()
          })
        } else {
          this.selectedIndex = -1
          this.labelNodes_ = []
        }

        this.validate_()
      })
    }
  }

  handleEvent(e: Event) {
    switch (e.type) {
      case 'click': {
        const item = getItemFromEvent(e)
        if (item) {
          this.value = item.id !== this.value ? item.id : ''
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
