/**
 * Selects expose a menu of options from which the user can choose one or many.
 * A select consists of a trigger button and a popover menu panel with the full
 * list of options to choose.
 * @module
 */

import { css, CSSResult, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import { FormControlMixin,
  type FormControlMixinInterface } from './internal/re-form-control-mixin.ts'

import { fire } from './internal/re-element.ts'
import { DropdownElement } from './re-dropdown.ts'
import { getItemFromEvent, ItemElement } from './re-item.ts'

export const SelectElementBase:
  & (new(...args: any[]) => FormControlMixinInterface)
  & typeof DropdownElement = FormControlMixin(DropdownElement)

// The default of the value and of the initially selected item captured on
// first render must always be the same.  Note that `firstUpdated()` usually
// changes the value right away by auto-selecting an item.
const DEFAULT_VALUE = ''

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
 * but any content can be placed there.  `<re-item>`s must have a non-empty
 * and unique `id` attribute or some functionality will not work as expected.
 *
 * If `<re-menu-item>`s are used, their children will be flattened with the
 * other children of `re-select`.  This will make the `selectedIndex` property
 * tricky to deal with.  In this case, the `value` or `selectedOptions`
 * properties will be more useful.  Make sure that all children, even those
 * nested inside `<re-menu-item>`s, have unique IDs.
 *
 * Set the initially selected `<re-item>` by giving it the `selected` attribute
 * and not by setting the `value` property or `<re-select>`.  In the exmaple
 * below, the second item will be selected when the `<re-select>` is initially
 * rendered.
 *
 * A typical use of select is as follows:
 * ```
 * <re-select id="sel1"@change="${onChanged}">
 *   <re-item id="item1">...</re-item>
 *   <re-item id="item2" selected>...</re-item>
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
   * If true, an option must be selected before its form can be submitted.
   */
  @property({ type: Boolean, reflect: true })
  accessor required = false

  @property({ type: Array, state: true })
  private accessor labelNodes_: Node[] = []

  /**
   * A mutation observer to watch for changes to the select's children
   * <re-item>s.  <re-select> listens for added and removed items as well
   * as changes to their `selected` attribute.
   */
  private observer_?: MutationObserver

  private value_: string = DEFAULT_VALUE

  /** The `id` of the selected item when the element was first rendered. */
  private initialValue_ = DEFAULT_VALUE

  constructor() {
    super()

    this.observer_ = new MutationObserver(async entries => {
      let fireEvents = false

      if (this.multiple) {
        // See if the value property needs to be updated.  By definition `value`
        // is the first selected item in DOM order.
        this.value_ = this.selectedOptions.at(0)?.id ?? ''
        this.requestUpdate('value')
        fireEvents = true
      } else {
        // If multiple items are selected in entries, the last one in the list
        // is the one that is considered selected.  This is assumed to be the
        // last one the user clicked on.  If the user clicks on the selected
        // item, it will be unselected and the <re-select> will have no value.
        let lastValue = ''
        for (const entry of entries) {
          if (entry.type === 'attributes') {
            if (entry.attributeName === 'selected') {
              if (entry.target instanceof ItemElement
                && entry.target.selected) {
                lastValue = entry.target.id
              }
            }
          }
        }
        if (lastValue === '') {
          // If no item was selected, the value is the first selected item in
          // the list, if any.  This handles the case where the item was
          // unselected in the value setter.
          lastValue = this.selectedOptions.at(0)?.id ?? ''
        }

        if (this.value !== lastValue) {
          this.value = lastValue
          fireEvents = true
        }
      }

      if (fireEvents) {
        this.updateComplete.then(
          () => {
            fire(this, 'input', { bubbles: true, composed: true })
            fire(this, 'change', { bubbles: true })
          },
        )
      }
    })
  }

  disconnectedCallback(): void {
    super.disconnectedCallback()
    this.observer_?.disconnect()
  }

  /**
   * An array of `<re-item>` children, if any.
   */
  get options(): ReadonlyArray<ItemElement> {
    const slot = this.renderRoot?.querySelector<HTMLSlotElement>('re-menu slot')
    const els = slot?.assignedElements({ flatten: true }) ?? []
    return els.reduce((items, el) => {
      if (el.tagName === 'RE-ITEM') {
        items.push(el as ItemElement)
      }
      return items.concat([...el.querySelectorAll('re-item')])
    }, [] as ItemElement[])
  }

  /**
   * An array of currently selected `<re-item>` children, if any.
   * An `<re-item>` is selected if it has the `selected` attribute.
   */
  get selectedOptions(): ReadonlyArray<ItemElement> {
    return this.options.filter(item => item.selected)
  }

  /**
   * Gets the `id` of the item that is currently selected.
   */
  get value(): string {
    return this.value_
  }

  /**
   * Sets the `id` of the item that is currently selected.  This will set
   * the `selected` property to the item with the matching `id`, and remove
   * the `selected` attribute from all other items.  If no item has a matching
   * `id`, all items are unselected.
   *
   * A requestUpdate() is triggered for the `value` property.
   *
   * @param id The `id` of the item to select.
   */
  @property({})
  set value(id: string) {
    const old = this.value

    // If the value is set before the first update, options will be empty.
    // This can happen if the user sets the value attribute on the element
    // in the html.  In this case the value is ignored.  Setting a default
    // item should be done via the 'selected' property of <re-item>.
    const item = this.options.find(item => item.id === id)
    if (item) {
      item.selected = true
    }

    this.value_ = id
    this.unselectAllItemsExcept_(id)
    this.requestUpdate('value', old)
  }

  /**
   * The ids of all the selected items when the element was first rendered,
   * in list order.  Used by the form reset lifecycle callback to restore
   * the initial selections when multiple options can be selected.
   */
  private initialSelectedIds_: string[] = []

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

  private unhighlightAllItemsExcept_(id: string) {
    this.options.forEach(item => {
      if (item.id !== id) {
        item.highlighted = false
      }
    })
  }

  private unselectAllItemsExcept_(id: string) {
    this.options.forEach(item => {
      if (item.id !== id) {
        item.selected = false
        item.highlighted = false
      }
    })
  }

  private validate_() {
    const validity: ValidityStateFlags = {}
    let message: string | undefined

    if (this.required && this.selectedIndex === -1) {
      validity.valueMissing = true
      message = 'Nothing selected'
    }

    // The error bubble is anchored to the inner trigger button, and not the
    // host, because the host is not focusable.  The browser uses the anchor as
    // both the target of the bubble and of the focus when interactive
    // validation fails.  As required by the spec, the anchor is within this
    // element's shadow tree, so the encapsulation of the form identity is
    // maintained.
    const anchor = this.renderRoot.querySelector('re-button')
    this.setValidity(validity, message, anchor ?? undefined)
  }

  /**
   * Returns the ids of all the selected items, in list order.
   */
  private getSelectedIds_(): string[] {
    return this.selectedOptions.map(item => item.id)
  }

  /**
   * Gives the browser the current submission value and state of this
   * element.
   *
   * When only one option can be selected, the value is the `id` of the
   * selected item, like the value of the standard HTML `<select>`.  When
   * multiple options can be selected, the browser is instead given a
   * `FormData` with one entry per selected item, like the standard HTML
   * `<select multiple>` which submits one entry per selected option, all
   * with the same name.  The FormData is used as both the submission value
   * and the state saved by the browser for the form restore lifecycle
   * callback.
   */
  private updateFormValue_(): void {
    if (!this.multiple) {
      this.setFormValue(this.value_)
      return
    }

    const ids = this.getSelectedIds_()
    if (ids.length === 0) {
      this.setFormValue(null)
      return
    }

    const data = new FormData()
    ids.forEach(id => data.append(this.name, id))
    this.setFormValue(data, data)
  }

  /**
   * Selects exactly the items whose id appears in the given list, unselects
   * all the others, and restores the value and the form value of this
   * element accordingly.
   */
  private restoreSelectionByIds_(ids: string[]): void {
    const selectedIds = new Set(ids)
    this.options.forEach(
      item => item.selected = selectedIds.has(item.id),
    )

    // Set `value_` directly, and not with the `value` setter, so that the
    // items selected above are not unselected.
    const old = this.value_
    this.value_ = ids.at(0) ?? ''
    this.requestUpdate('value', old)
  }

  protected override onFormReset_(): void {
    if (this.multiple) {
      this.restoreSelectionByIds_(this.initialSelectedIds_)
    } else {
      this.value = this.initialValue_
    }
  }

  protected override onFormStateRestore_(
    state: FormData | File | string | null,
  ): void {
    // The value submitted by this element is the `id` of the selected item,
    // or, when multiple options can be selected, a FormData with one entry
    // per selected item, as passed to setFormValue() by updateFormValue_().
    if (state instanceof FormData) {
      const ids = [...state].map(([, value]) => String(value))
      this.restoreSelectionByIds_(ids)
    } else if (typeof state === 'string') {
      this.value = state
    }
  }

  override firstUpdated(props: PropertyValues): void {
    super.firstUpdated(props)

    const menu = this.renderRoot.querySelector('re-menu')
    menu?.addEventListener('click', this)

    this.observer_?.observe(this, {
      subtree: true,
      childList: true,
      attributeFilter: ['selected'],
    })

    // For the non-multiple case, an initially selected item is chosen as
    // follows, in decreasing order of precedence:
    // - if an item has the selected attribute, that item is selected
    // - otherwise, the first item in the list is selected
    //
    // In multiple mode nothing is auto-selected, like the standard HTML
    // `<select multiple>`, but the value is still the id of the first item
    // with the `selected` attribute, if any.
    if (!this.multiple) {
      const item = this.selectedOptions.at(0) ?? this.options.at(0)
      if (item) {
        // This will request an asynchronous update on the item if it was not
        // already selected.  Setting `initialSelectedIds_` below may not take
        // this item into account, but that's OK because it was not initially
        // selected anyway.
        item.selected = true

        this.value_ = item.id
      }
    } else {
      this.value_ = this.selectedOptions.at(0)?.id ?? ''
    }

    // Capture the ids of the items initially selected and the value, before
    // the selection can change, so the form reset lifecycle callback can
    // restore them later.
    this.initialValue_ = this.value
    this.initialSelectedIds_ = this.getSelectedIds_()
  }

  override updated(props: PropertyValues): void {
    super.updated(props)

    // TODO: handle `selectedIndex` changes.

    if (props.has('value')) {
      this.updateFormValue_()

      const index = this.options.findIndex(item => item.id === this.value)
      const item = index !== -1 ? this.options.at(index) : null

      if (index !== this.selectedIndex) {
        this.selectedIndex = index
      }
      if (item) {
        this.labelNodes_ = item.getLabelNodes()
      } else {
        this.labelNodes_ = [document.createTextNode('-- Nothing selected --')]
      }

      this.validate_()
    }

    if (props.has('multiple')) {
      this.dropdownmode = this.multiple ? 2 : 1

      const button = this.renderRoot.querySelector('re-button')
      const panel = this.renderRoot.querySelector('re-menu')

      button?.updateComplete.then(() => {
        button.disabled = this.multiple || this.disabled
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

  override handleEvent(e: Event): void {
    super.handleEvent(e)

    switch (e.type) {
      case 'click': {
        const item = getItemFromEvent(e)
        if (item) {
          const me = e as MouseEvent
          if (this.multiple && !me.ctrlKey) {
            // this.value = item.selected ? '' : item.id
            // break
            this.unselectAllItemsExcept_(item.id)
          } else {
            this.unhighlightAllItemsExcept_(item.id)
          }

          item.selected = !item.selected
          item.highlighted = true
        }
        break
      }
    }
  }

  protected override renderLabelDefault_(): Node[] {
    return this.labelNodes_
  }
}
