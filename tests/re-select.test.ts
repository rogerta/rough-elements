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
