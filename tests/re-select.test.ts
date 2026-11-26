import { describe, expect, it, vi } from 'vitest'
import '../src/re-select.ts'
import type { SelectElement } from '../src/re-select.ts'
import '../src/re-item.ts'
import type { ItemElement } from '../src/re-item.ts'

describe('re-select', () => {
  // Waits for the select's asynchronous update cycle to settle.  Clicking an
  // item toggles its `selected` attribute; a mutation observer then updates
  // `value`, re-sends the form value, and fires `change`, all from microtask
  // and update chains.
  const settle = async (select: SelectElement) => {
    for (let i = 0; i < 4; i++) {
      await new Promise(resolve => setTimeout(resolve, 0))
      await select.updateComplete
    }
  }

  // Dispatches a click on an item as if it bubbled from the select's menu
  // panel, then waits for the select's asynchronous update cycle to settle.
  const clickItem = async (
    select: SelectElement,
    item: ItemElement,
    ctrlKey = false,
  ) => {
    const menu = select.shadowRoot?.querySelector('re-menu')
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      composed: true,
      ctrlKey,
    })
    Object.defineProperty(clickEvent, 'target', { value: item })
    menu?.dispatchEvent(clickEvent)
    await settle(select)
  }

  it('registers custom element', () => {
    expect(customElements.get('re-select')).toBeDefined()
  })

  it('renders with default properties and form association', async () => {
    const select = document.createElement('re-select') as SelectElement
    document.body.appendChild(select)
    await select.updateComplete

    expect(select.multiple).toBe(false)
    expect(select.selectedIndex).toBe(-1)
    expect(select.required).toBe(false)
    expect(select.value).toBe('')

    select.remove()
  })

  it('automatically selects initial item if none is selected', async () => {
    const select = document.createElement('re-select') as SelectElement
    const item1 = document.createElement('re-item') as ItemElement
    item1.id = 'opt1'
    item1.textContent = 'Option 1'
    const item2 = document.createElement('re-item') as ItemElement
    item2.id = 'opt2'
    item2.textContent = 'Option 2'

    select.appendChild(item1)
    select.appendChild(item2)

    document.body.appendChild(select)
    await select.updateComplete

    expect(select.value).toBe('opt1')
    expect(select.selectedIndex).toBe(0)
    expect(item1.selected).toBe(true)

    select.remove()
  })

  it('prefers pre-selected item as initial value', async () => {
    const select = document.createElement('re-select') as SelectElement
    const item1 = document.createElement('re-item') as ItemElement
    item1.id = 'opt1'
    item1.textContent = 'Option 1'
    const item2 = document.createElement('re-item') as ItemElement
    item2.id = 'opt2'
    item2.textContent = 'Option 2'
    item2.selected = true

    select.appendChild(item1)
    select.appendChild(item2)

    document.body.appendChild(select)
    await select.updateComplete

    expect(select.value).toBe('opt2')
    expect(select.selectedIndex).toBe(1)
    expect(item2.selected).toBe(true)

    select.remove()
  })

  it('updates selectedIndex and selectedOptions when value is changed programmatically', async () => {
    const select = document.createElement('re-select') as SelectElement
    const item1 = document.createElement('re-item') as ItemElement
    item1.id = 'opt1'
    item1.textContent = 'Option 1'
    const item2 = document.createElement('re-item') as ItemElement
    item2.id = 'opt2'
    item2.textContent = 'Option 2'

    select.appendChild(item1)
    select.appendChild(item2)

    document.body.appendChild(select)
    await select.updateComplete

    select.value = 'opt2'
    await select.updateComplete

    expect(select.selectedIndex).toBe(1)
    expect(item2.selected).toBe(true)
    expect(item1.selected).toBe(false)
    expect(select.selectedOptions.length).toBe(1)
    expect(select.selectedOptions[0]).toBe(item2)

    select.remove()
  })

  it('updates value and dispatches change event when an item is selected', async () => {
    const select = document.createElement('re-select') as SelectElement
    const item1 = document.createElement('re-item') as ItemElement
    item1.id = 'opt1'
    item1.textContent = 'Option 1'
    const item2 = document.createElement('re-item') as ItemElement
    item2.id = 'opt2'
    item2.textContent = 'Option 2'

    select.appendChild(item1)
    select.appendChild(item2)

    document.body.appendChild(select)
    await select.updateComplete

    const changeSpy = vi.fn()
    select.addEventListener('change', changeSpy)

    await clickItem(select, item2)

    expect(changeSpy).toHaveBeenCalledTimes(1)
    expect(changeSpy.mock.lastCall?.[0].target).toBe(select)
    expect(select.value).toBe('opt2')
    expect(select.selectedIndex).toBe(1)
    expect(item1.selected).toBe(false)
    expect(item2.selected).toBe(true)

    select.remove()
  })

  it('reflects required property', async () => {
    const select = document.createElement('re-select') as SelectElement
    select.required = true
    document.body.appendChild(select)
    await select.updateComplete

    expect(select.hasAttribute('required')).toBe(true)
    expect(select.required).toBe(true)

    select.required = false
    await select.updateComplete

    expect(select.hasAttribute('required')).toBe(false)
    expect(select.required).toBe(false)

    select.remove()
  })

  describe('multiple selection', () => {
    const createMultiSelect = async () => {
      const select = document.createElement('re-select') as SelectElement
      select.multiple = true
      const items = ['opt1', 'opt2', 'opt3'].map((id, index) => {
        const item = document.createElement('re-item') as ItemElement
        item.id = id
        item.textContent = `Option ${index + 1}`
        select.appendChild(item)
        return item
      })

      document.body.appendChild(select)
      await select.updateComplete

      return { select, items }
    }

    it('initially selects only the first item in multiple mode', async () => {
      const { select, items } = await createMultiSelect()

      expect(select.value).toBe('opt1')
      expect(select.selectedOptions.length).toBe(1)
      expect(select.selectedOptions[0]).toBe(items[0])
      expect(items[1].selected).toBe(false)

      select.remove()
    })

    it('ctrl+click toggles the selected state of the clicked item', async () => {
      const { select, items } = await createMultiSelect()
      const [item1, item2, item3] = items

      // Initially only the first item is selected.
      await clickItem(select, item2, true)
      expect(item2.selected).toBe(true)
      expect(item1.selected).toBe(true)
      expect(select.selectedOptions.length).toBe(2)
      expect(Array.from(select.selectedOptions)).toEqual([item1, item2])

      // Ctrl+clicking a selected item deselects it.
      await clickItem(select, item2, true)
      expect(item2.selected).toBe(false)
      expect(select.selectedOptions.length).toBe(1)
      expect(Array.from(select.selectedOptions)).toEqual([item1])

      // Ctrl+clicking another item leaves the other selections intact.
      await clickItem(select, item3, true)
      expect(item3.selected).toBe(true)
      expect(item1.selected).toBe(true)
      expect(Array.from(select.selectedOptions)).toEqual([item1, item3])

      select.remove()
    })

    it('value is the id of the first selected item in DOM order', async () => {
      const { select, items } = await createMultiSelect()
      const [item1, item2, item3] = items

      // Selecting later items doesn't change the value while the first item
      // is still selected.
      await clickItem(select, item2, true)
      await clickItem(select, item3, true)
      expect(select.value).toBe('opt1')

      // Deselecting the first item promotes the next selected item in DOM
      // order.
      await clickItem(select, item1, true)
      expect(select.value).toBe('opt2')

      await clickItem(select, item2, true)
      expect(select.value).toBe('opt3')

      // Deselecting everything empties the value.
      await clickItem(select, item3, true)
      expect(select.value).toBe('')
      expect(select.selectedOptions.length).toBe(0)

      select.remove()
    })

    it('fires input and change events whenever the selection changes', async () => {
      const { select, items } = await createMultiSelect()
      const [item1, item2] = items

      // Let the events fired by the initial auto-selection settle before
      // attaching the spies.
      await settle(select)

      const changeSpy = vi.fn()
      const inputSpy = vi.fn()
      select.addEventListener('change', changeSpy)
      select.addEventListener('input', inputSpy)

      // Ctrl+clicking another item keeps the first selected item, so the
      // value does not change, but the selection did change, so input and
      // change are fired.
      await clickItem(select, item2, true)
      expect(select.value).toBe('opt1')
      expect(changeSpy).toHaveBeenCalledTimes(1)
      expect(changeSpy.mock.lastCall?.[0].target).toBe(select)
      expect(inputSpy).toHaveBeenCalledTimes(1)

      // Deselecting the first selected item promotes the next one in DOM
      // order and fires the events again.
      await clickItem(select, item1, true)
      expect(select.value).toBe('opt2')
      expect(changeSpy).toHaveBeenCalledTimes(2)
      expect(inputSpy).toHaveBeenCalledTimes(2)

      // Selecting the first item again changes the value back, firing
      // another pair of events.
      await clickItem(select, item1, true)
      expect(select.value).toBe('opt1')
      expect(changeSpy).toHaveBeenCalledTimes(3)
      expect(inputSpy).toHaveBeenCalledTimes(3)

      // Deselecting a non-first item does not change the value, but the
      // selection changed, so the events are fired again.
      await clickItem(select, item2, true)
      expect(select.value).toBe('opt1')
      expect(changeSpy).toHaveBeenCalledTimes(4)
      expect(inputSpy).toHaveBeenCalledTimes(4)

      select.remove()
    })

    it('click without ctrl behaves like single selection', async () => {
      const { select, items } = await createMultiSelect()
      const [item1, item2, item3] = items

      // Ctrl+select a couple of items first.
      await clickItem(select, item3, true)
      expect(select.selectedOptions.length).toBe(2)

      // A plain click on an unselected item picks just that item.
      await clickItem(select, item2)
      expect(select.value).toBe('opt2')
      expect(Array.from(select.selectedOptions)).toEqual([item2])
      expect(item1.selected).toBe(false)
      expect(item3.selected).toBe(false)

      // A plain click on the selected item clears the selection, exactly as
      // it does when `multiple` is false.
      await clickItem(select, item2)
      expect(select.value).toBe('')
      expect(select.selectedOptions.length).toBe(0)
      expect(item2.selected).toBe(false)

      select.remove()
    })

    it('submits one form entry per selected item', async () => {
      const select = document.createElement('re-select') as SelectElement
      select.multiple = true
      select.name = 'options'
      const items = ['opt1', 'opt2', 'opt3'].map((id, index) => {
        const item = document.createElement('re-item') as ItemElement
        item.id = id
        item.textContent = `Option ${index + 1}`
        select.appendChild(item)
        return item
      })
      const setFormValueSpy = vi.spyOn(select, 'setFormValue')

      document.body.appendChild(select)
      await settle(select)

      // The first item is selected by default, and the submitted value and
      // state are a FormData with one entry per selected item, all with the
      // same name, exactly like the standard HTML `<select multiple>`.
      let state = setFormValueSpy.mock.lastCall?.[1]
      expect(state).toBeInstanceOf(FormData)
      expect([...(state as FormData)]).toEqual([['options', 'opt1']])
      expect(setFormValueSpy.mock.lastCall?.[0]).toBe(state)

      const [item1, item2, item3] = items
      setFormValueSpy.mockClear()

      // Every change to the selection re-sends the form value with one entry
      // per selected item, even when `value`, which is still the first
      // selected item, does not change.
      await clickItem(select, item2, true)
      expect(setFormValueSpy).toHaveBeenCalledTimes(1)
      state = setFormValueSpy.mock.lastCall?.[1]
      expect(state).toBeInstanceOf(FormData)
      expect([...(state as FormData)]).toEqual([
        ['options', 'opt1'],
        ['options', 'opt2'],
      ])

      await clickItem(select, item3, true)
      expect(setFormValueSpy).toHaveBeenCalledTimes(2)
      state = setFormValueSpy.mock.lastCall?.[1]
      expect([...(state as FormData)]).toEqual([
        ['options', 'opt1'],
        ['options', 'opt2'],
        ['options', 'opt3'],
      ])

      // Deselecting the first item changes the value, so the form value is
      // re-sent with one entry per remaining selected item.
      await clickItem(select, item1, true)
      expect(select.value).toBe('opt2')
      expect(setFormValueSpy).toHaveBeenCalledTimes(3)
      state = setFormValueSpy.mock.lastCall?.[1]
      expect([...(state as FormData)]).toEqual([
        ['options', 'opt2'],
        ['options', 'opt3'],
      ])

      // Deselecting another item removes its entry from the submitted data.
      await clickItem(select, item2, true)
      expect(setFormValueSpy).toHaveBeenCalledTimes(4)
      state = setFormValueSpy.mock.lastCall?.[1]
      expect([...(state as FormData)]).toEqual([['options', 'opt3']])

      // Deselecting every item removes the field from the submitted data.
      await clickItem(select, item3, true)
      expect(setFormValueSpy).toHaveBeenCalledTimes(5)
      expect(setFormValueSpy.mock.lastCall?.[0]).toBeNull()

      select.remove()
    })

    it('keeps and resets every item selected with the attribute', async () => {
      const select = document.createElement('re-select') as SelectElement
      select.multiple = true
      const [item1, item2, item3] = ['opt1', 'opt2', 'opt3'].map(
        (id, index) => {
          const item = document.createElement('re-item') as ItemElement
          item.id = id
          item.textContent = `Option ${index + 1}`
          if (id !== 'opt1') {
            item.selected = true
          }
          select.appendChild(item)
          return item
        },
      )

      document.body.appendChild(select)
      await select.updateComplete

      // Every item with the `selected` attribute stays selected, and the
      // value is the id of the first of them.
      expect(item2.selected).toBe(true)
      expect(item3.selected).toBe(true)
      expect(item1.selected).toBe(false)
      expect(select.value).toBe('opt2')

      // Change the selection manually so that resetting it tests the
      // restoration of the initial selection.
      await clickItem(select, item2, true)
      await clickItem(select, item1, true)
      expect(item1.selected).toBe(true)
      expect(item2.selected).toBe(false)

      select.formResetCallback()
      await select.updateComplete
      expect(item1.selected).toBe(false)
      expect(item2.selected).toBe(true)
      expect(item3.selected).toBe(true)
      expect(select.value).toBe('opt2')
      expect(select.selectedOptions.length).toBe(2)

      select.remove()
    })

    it('restores every selected item from the form state', async () => {
      const { select, items } = await createMultiSelect()
      select.name = 'options'
      const [item1, , item3] = items

      const state = new FormData()
      state.append('options', 'opt2')
      state.append('options', 'opt3')
      select.formStateRestoreCallback(state, 'restore')
      await select.updateComplete

      expect(select.value).toBe('opt2')
      expect(select.selectedOptions.length).toBe(2)
      expect(item1.selected).toBe(false)
      expect(item3.selected).toBe(true)

      select.remove()
    })
  })

  it('configures panel and trigger button in multiple selection mode', async () => {
    const select = document.createElement('re-select') as SelectElement
    select.multiple = true
    document.body.appendChild(select)
    await select.updateComplete

    expect(select.hasAttribute('multiple')).toBe(true)

    const button = select.shadowRoot?.querySelector('re-button')
    const panel = select.shadowRoot?.querySelector('re-menu')

    await button?.updateComplete
    await panel?.updateComplete

    expect(button?.hasAttribute('disabled')).toBe(true)
    expect(panel?.hasAttribute('popover')).toBe(false)
    expect(panel?.getAttribute('tabindex')).toBe('0')

    select.remove()
  })

  it('keeps trigger button disabled when the select is disabled', async () => {
    const select = document.createElement('re-select') as SelectElement
    select.setAttribute('disabled', '')
    const item1 = document.createElement('re-item') as ItemElement
    item1.id = 'opt1'
    item1.textContent = 'Option 1'
    select.appendChild(item1)
    document.body.appendChild(select)
    await settle(select)

    expect(select.disabled).toBe(true)

    const button = select.shadowRoot?.querySelector('re-button')
    await button?.updateComplete
    await settle(select)

    expect(button?.hasAttribute('disabled')).toBe(true)
    expect((button as any)?.disabled).toBe(true)

    // Toggling disabled off and on must keep the trigger button in sync.
    select.disabled = false
    await settle(select)
    expect(button?.hasAttribute('disabled')).toBe(false)

    select.disabled = true
    await settle(select)
    expect(button?.hasAttribute('disabled')).toBe(true)

    select.remove()
  })
})
