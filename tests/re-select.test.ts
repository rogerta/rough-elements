import { describe, expect, it, vi } from 'vitest'
import '../src/re-select.ts'
import type { SelectElement } from '../src/re-select.ts'
import '../src/re-item.ts'
import type { ItemElement } from '../src/re-item.ts'

describe('re-select', () => {
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

    const menu = select.shadowRoot?.querySelector('re-menu')
    const clickEvent = new MouseEvent('click', { bubbles: true,
      composed: true })
    Object.defineProperty(clickEvent, 'target', { value: item2 })
    menu?.dispatchEvent(clickEvent)
    await select.updateComplete

    expect(changeSpy).toHaveBeenCalledTimes(1)
    expect(select.value).toBe('opt2')
    expect(select.selectedIndex).toBe(1)

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

      // The click handler updates the value from microtask chains, so flush
      // them before awaiting the select's update.
      await new Promise(resolve => setTimeout(resolve, 0))
      await select.updateComplete
      await new Promise(resolve => setTimeout(resolve, 0))
      await select.updateComplete
    }

    it('initially selects only the first item in multiple mode', async () => {
      const { select, items, } = await createMultiSelect()

      expect(select.value).toBe('opt1')
      expect(select.selectedOptions.length).toBe(1)
      expect(select.selectedOptions[0]).toBe(items[0])
      expect(items[1].selected).toBe(false)

      select.remove()
    })

    it('ctrl+click toggles the selected state of the clicked item', async () => {
      const { select, items, } = await createMultiSelect()
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

    it('fires a change event on each ctrl+click', async () => {
      const { select, items } = await createMultiSelect()
      const [, item2] = items

      const changeSpy = vi.fn()
      select.addEventListener('change', changeSpy)

      await clickItem(select, item2, true)
      expect(changeSpy).toHaveBeenCalledTimes(1)
      expect(changeSpy.mock.lastCall?.[0].target).toBe(select)

      await clickItem(select, item2, true)
      expect(changeSpy).toHaveBeenCalledTimes(2)

      select.remove()
    })

    it('click without ctrl behaves like single selection', async () => {
      const { select, items } = await createMultiSelect()
      const [item1, , item3] = items

      // Ctrl+select a couple of items first.
      await clickItem(select, item3, true)
      expect(select.selectedOptions.length).toBe(2)

      // A plain click picks just the clicked item.
      await clickItem(select, item3)
      expect(select.value).toBe('opt3')
      expect(Array.from(select.selectedOptions)).toEqual([item3])
      expect(item1.selected).toBe(false)

      // A plain click on the selected item clears the selection, exactly as
      // it does when `multiple` is false.
      await clickItem(select, item3)
      expect(select.value).toBe('')
      expect(select.selectedOptions.length).toBe(0)
      expect(item3.selected).toBe(false)

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
})
