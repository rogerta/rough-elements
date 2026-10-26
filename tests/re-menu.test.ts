import { describe, expect, it, vi } from 'vitest'
import '../src/re-menu.ts'
import { MenuElement, NO_ITEM } from '../src/re-menu.ts'
import '../src/re-item.ts'
import type { ItemElement } from '../src/re-item.ts'

describe('re-menu', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-menu')).toBeDefined()
  })

  it('renders rough svg and slot inside inner container', async () => {
    const menu = document.createElement('re-menu') as MenuElement
    document.body.appendChild(menu)
    await menu.updateComplete

    expect(menu.shadowRoot).not.toBeNull()
    const roughSvg = menu.shadowRoot?.querySelector('svg#rough')
    expect(roughSvg).not.toBeNull()

    const innerDiv = menu.shadowRoot?.querySelector('div[tabindex="-1"]')
    expect(innerDiv).not.toBeNull()

    const slot = innerDiv?.querySelector('slot')
    expect(slot).not.toBeNull()

    menu.remove()
  })

  it('finds items by value and returns NO_ITEM for nonexistent values', async () => {
    const menu = document.createElement('re-menu') as MenuElement
    const item1 = document.createElement('re-item') as ItemElement
    item1.id = 'opt1'
    const item2 = document.createElement('re-item') as ItemElement
    item2.id = 'opt2'

    menu.appendChild(item1)
    menu.appendChild(item2)
    document.body.appendChild(menu)
    await menu.updateComplete

    const res1 = menu.findItemByValue('opt1')
    expect(res1.index).toBe(0)
    expect(res1.item).toBe(item1)

    const res2 = menu.findItemByValue('opt2')
    expect(res2.index).toBe(1)
    expect(res2.item).toBe(item2)

    const missing = menu.findItemByValue('nonexistent')
    expect(missing).toEqual(NO_ITEM)

    const empty = menu.findItemByValue('')
    expect(empty).toEqual(NO_ITEM)

    menu.remove()
  })

  it('unselectAllItems sets selected to false on all child items', async () => {
    const menu = document.createElement('re-menu') as MenuElement
    const item1 = document.createElement('re-item') as ItemElement
    item1.id = 'opt1'
    item1.selected = true
    const item2 = document.createElement('re-item') as ItemElement
    item2.id = 'opt2'
    item2.selected = true

    menu.appendChild(item1)
    menu.appendChild(item2)
    document.body.appendChild(menu)
    await menu.updateComplete

    expect(item1.selected).toBe(true)
    expect(item2.selected).toBe(true)

    menu.unselectAllItems()

    expect(item1.selected).toBe(false)
    expect(item2.selected).toBe(false)

    menu.remove()
  })

  it('hides popover when an item is clicked in popover mode', async () => {
    const menu = document.createElement('re-menu') as MenuElement
    menu.setAttribute('popover', 'auto')

    const item = document.createElement('re-item') as ItemElement
    item.id = 'opt1'
    item.textContent = 'Option 1'
    menu.appendChild(item)

    document.body.appendChild(menu)
    await menu.updateComplete

    menu.showPopover()
    expect(menu.matches(':popover-open')).toBe(true)

    item.click()
    expect(menu.matches(':popover-open')).toBe(false)

    menu.remove()
  })

  it('navigates items with arrow keys and activates on Enter/Space', async () => {
    const menu = document.createElement('re-menu') as MenuElement
    const item1 = document.createElement('re-item') as ItemElement
    item1.id = 'opt1'
    const item2 = document.createElement('re-item') as ItemElement
    item2.id = 'opt2'
    const item3 = document.createElement('re-item') as ItemElement
    item3.id = 'opt3'
    item3.disabled = true

    menu.appendChild(item1)
    menu.appendChild(item2)
    menu.appendChild(item3)

    document.body.appendChild(menu)
    await menu.updateComplete

    menu.dispatchEvent(new Event('focus'))

    // Arrow down moves to item1
    menu.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    )
    expect(item1.selected).toBe(true)
    expect(item2.selected).toBe(false)

    // Arrow down moves to item2
    menu.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    )
    expect(item1.selected).toBe(false)
    expect(item2.selected).toBe(true)

    // Arrow down skips disabled item3; remains at item2
    menu.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    )
    expect(item2.selected).toBe(true)

    // Arrow up moves back to item1
    menu.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
    )
    expect(item1.selected).toBe(true)
    expect(item2.selected).toBe(false)

    // Enter clicks active item
    const clickSpy = vi.fn()
    item1.addEventListener('click', clickSpy)
    menu.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    )
    expect(clickSpy).toHaveBeenCalledTimes(1)

    // Space clicks active item
    menu.dispatchEvent(
      new KeyboardEvent('keydown', { key: ' ', bubbles: true }),
    )
    expect(clickSpy).toHaveBeenCalledTimes(2)

    menu.remove()
  })
})
