/**
 * Selects expose a menu of options from which the user can choose one or many.
 * A select consists of a trigger button and a popover menu panel with the full
 * list of options to choose.
 * @module
 */

import { css, CSSResult, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { type FormControlInterface,
  FormControlMixin } from './internal/re-form-control-mixin.ts'

import { fire } from './internal/re-element.ts'
import { DropdownElement } from './re-dropdown.ts'
import { getItemFromEvent, type ItemElement } from './re-item.ts'

const SelectElementBase:
  & (new(...args: any[]) => FormControlInterface)
  & typeof DropdownElement = FormControlMixin(DropdownElement)

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
 * If `<re-menu-item>`s are used, their children will be flattened with the
 * other children of `re-select`.  This will make the `selectedIndex` property
 * tricky to deal with.  In this case, the `value` or `selectedOptions`
 * properties will be more useful.  Make sure that all children, even those
 * nested inside `<re-menu-item>`s, have unique IDs.
 *
 * A typical use of select is as follows:
 * ```
 * <re-select id="sel1"@change="${onChanged}">
 *   <re-item id="item1">...</re-item>
 *   <re-item id="item2">...</re-item>
 *   <re-divider></re-divider>
 *   <re-item id="item3">...</re-item>
 *   <re-menu-item id="item4">
 *     ...
 *     <re-menu popover slot="submenu">
 *       <re-item id="item41">...</re-item>
 *       <re-item id="item42">...</re-item>
 *       <re-item id="item43">...</re-item>
 *     </re-menu>
 *   </re-menu-item>
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
 *     ...
 *   }
 * }
 * ```
 * `<re-select>` participates in forms just like the stardard HTML `<select>`.
 *
 * @event change - Fires when the value has been changed and committed by the
 *    user. Unlike the input event, the change event is not necessarily fired
 *    for each alteration to an element's value.
 */
@customElement('re-select')
export class SelectElement extends SelectElementBase {
  static formAssociated = true

  /**
   * If true, multiple options can be selected simultaneously.  Otherwise only
   * one option can be selected at a time.
   */
  @property({ type: Boolean, reflect: true })
  accessor multiple = false

  /**
   * The index of the currently selected option.  If no option is selected,
   * this is -1.  If multiple options are selected, this is the index of the
   * first selected option.
   *
   * Note that if `<re-menu-item>`s are used as children of the `re-select`,
   * all items are reduced to a flattened array before the selected index is
   * calculated.  In these cases it's likely easier to depend on the `value`
   * property than this one.
   */
  @property({ type: Number })
  accessor selectedIndex: number = -1

  /**
   * A non-live `NodeList` of currently selected `<re-items>`(s), if any.
   * An `<re-items>` is selected if it has the `selected` attribute.
   */
  get selectedOptions(): NodeListOf<Element> {
    return this.querySelectorAll('re-item[selected]')
  }

  /**
   * A promise that resolves when all items of the `re-select` are unselected.
   * When callers wait on `this.updateComplete`, then will also wait for this
   * promise to resolve.
   */
  allItemsUnselectedComplete_: Promise<void> = Promise.resolve()

  /**
   * If true, an option must be selected before its form can be submitted.
   */
  @property({ type: Boolean, reflect: true })
  accessor required = false

  /**
   * The `id` of the item that is currently selected.
   */
  get value(): string {
    return this.value_
  }

  set value(v: string) {
    this.value_ = v
    this.allItemsUnselectedComplete_ = this.unselectAllItems_()
    this.requestUpdate('value')
  }

  private value_: string = ''

  protected async getUpdateComplete(): Promise<boolean> {
    const ret = await super.getUpdateComplete()
    await this.allItemsUnselectedComplete_
    return ret
  }

  @property({ type: Array, state: true })
  private accessor labelNodes_: Node[] = []

  static styles: CSSResult[] = [
    ...super.styles,
    css`
      :host([multiple]) {
        & re-button {
          display: none;
        }
      }
    `,
  ]

  private validate_() {
    const validity: ValidityStateFlags = {}
    let message: string | undefined

    if (this.required && this.selectedIndex === -1) {
      validity.valueMissing = true
      message = 'Nothing selected'
    }

    this.setValidity(validity, message)
  }

  override firstUpdated(props: PropertyValues): void {
    super.firstUpdated(props)

    const menu = this.renderRoot.querySelector('re-menu')
    menu?.addEventListener('click', this)

    // The initially selected item is chosen as follows, in decreasing order
    // of precedence:
    // - if there is an item with an `id` that matches the `value` property,
    //   that item is selected
    // - if an item has the selected attribute, that item is selected
    // - otherise, the first item in the list is selected
    //
    // To handle this, if the `value` is not set but an item has the
    // `selected` attribute, set the `value` to that item's `id`.
    if (!this.value) {
      const item = this.querySelector<ItemElement>('re-item[selected]')
        ?? this.querySelector<ItemElement>('re-item')
      if (item) {
        this.value = item.id
      }
    }
  }

  override async updated(props: PropertyValues): Promise<void> {
    super.updated(props)

    // TODO: handle `selectedIndex` changes.

    if (props.has('value')) {
      this.setFormValue(this.value_)

      const { index, item } = await this.findItemByValue_(this.value_)
      if (index !== -1) {
        item!.selected = true
        this.selectedIndex = index
        this.labelNodes_ = item!.getLabelNodes()
      } else {
        this.selectedIndex = -1
        this.labelNodes_ = [document.createTextNode('-- Nothing selected --')]
      }

      this.validate_()
    }

    if (props.has('multiple')) {
      const button = this.renderRoot.querySelector('re-button')
      const panel = this.renderRoot.querySelector('re-menu')

      button?.updateComplete.then(() => {
        if (this.multiple) {
          button.setAttribute('disabled', '')
        } else {
          button.removeAttribute('disabled')
        }
      })

      panel?.updateComplete.then(() => {
        if (this.multiple) {
          panel.removeAttribute('popover')
          panel.setAttribute('tabindex', '0')
        } else {
          panel.setAttribute('popover', '') // Equivalent to "auto".
          panel.setAttribute('tabindex', '-1')
        }
      })
    }
  }

  handleEvent(e: Event): void {
    super.handleEvent(e)

    switch (e.type) {
      case 'click': {
        const me = e as MouseEvent
        const item = getItemFromEvent(e)
        if (item) {
          if (this.multiple && me.ctrlKey) {
            item.selected = !item.selected
            item.updateComplete.then(() => {
              const first = this.querySelector('re-item[selected]')

              // Set `value_` directly to avoid unselecting all the items.
              const old = this.value_
              this.value_ = first ? first.id : ''
              this.requestUpdate('value', old)
              this.updateComplete.then(
                () => fire(this, 'change', { bubbles: true }),
              )
            })
          } else {
            this.value = item.id !== this.value ? item.id : ''
            this.updateComplete.then(
              () => fire(this, 'change', { bubbles: true }),
            )
          }
        }
        break
      }
    }
  }

  protected override renderLabelDefault_(): Node[] {
    return this.labelNodes_
  }
}
