import { type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { ReFormControlMixin } from './internal/re-form-control-mixin.js'

import { DropdownElement } from  './re-dropdown.js'
import { getItemFromEvent } from './re-item.js'

/**
 * Selects expose a menu of options from which the user can choose one or many.
 * A select consists of a trigger button and a popover menu panel with the full
 * list of options to choose.
 *
 * The `label` slot provides the content of the trigger button and is filled
 * internally with the currently selected option(s).  It should not be filled
 * by the caller except to override the default rendering (not recommended).
 *
 * Any children not assigned to a slot are placed in the popover menu panel.
 * These are usually `<re-item>`, `<re-menu-item>` or `<re-divider>` elements,
 * but any content can be placed there.
 *
 * A typical use of select is as follows:
* ```
 * <re-select id="sel1"@change="${onChanged}">
 *   <re-item id="item1">...</re-item>
 *   <re-item id="item2">...</re-item>
 *   <re-divider></re-divider>
 *   <re-item id="item3">...</re-item>
 * </re-select>
 * ```
 * ```
 * onChanged(e: Event) {
 *   const id = e.target.value
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
 * `<re-select>` participates in forms just like the stardard HTML `<select>`.
  */
@customElement('re-select')
export class SelectElement extends ReFormControlMixin(DropdownElement) {
  static formAssociated = true

  /**
   * If true, multiple options can be selected simultaneously.  Otherwise only
   * one option can be selected at a time.
   *
   * NOT YET IMPLEMENTED
   */
  @property({ type: Boolean, reflect: true }) multiple = false

  /**
   * The index of the currently selected option.  If no option is selected,
   * this is -1.
   */
  @property({ type: Number }) selectedIndex = -1

  /**
   * The currently selected option(s).  If no option is selected, this is an
   * empty array.
   *
   * NOT YET IMPLEMENTED
   */
  @property({ type: Array }) selectedOptions = []

  /**
   * If true, an option must be selected before its form can be submitted.
   */
  @property({ type: Boolean, reflect: true }) required = false

  /**
   * The `id` of the item that is currently selected.
   */
  @property({}) value = ''

  @property({ type: Array, state: true }) private labelNodes_: Node[] = []

  private validate_() {
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
            this.validate_()
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
