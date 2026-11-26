import { describe, expect, it, vi } from 'vitest'
import '../src/re-menu.ts'
import { MenuElement } from '../src/re-menu.ts'
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

  it('unselectAllItemsExcept keeps only the item with the given id selected', async () => {
    const menu = document.createElement('re-menu') as MenuElement
    const item1 = document.createElement('re-item') as ItemElement
    item1.id = 'opt1'
    item1.selected = true
    item1.highlighted = true
    const item2 = document.createElement('re-item') as ItemElement
    item2.id = 'opt2'
    item2.selected = true

    menu.appendChild(item1)
    menu.appendChild(item2)
    document.body.appendChild(menu)
    await menu.updateComplete

    expect(item1.selected).toBe(true)
    expect(item2.selected).toBe(true)

    // Only the item with the given id stays selected and highlighted.
    menu.unselectAllItemsExcept('opt2')

    expect(item1.selected).toBe(false)
    expect(item1.highlighted).toBe(false)
    expect(item2.selected).toBe(true)
    expect(item2.highlighted).toBe(true)

    // An empty id unselects and unhighlights all items.
    menu.unselectAllItemsExcept('')

    expect(item1.selected).toBe(false)
    expect(item2.selected).toBe(false)
    expect(item1.highlighted).toBe(false)
    expect(item2.highlighted).toBe(false)

    menu.remove()
  })

  it('moves the highlight with arrow keys and clicks the item on Enter/Space', async () => {
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

    const key = (k: string) =>
      menu.dispatchEvent(
        new KeyboardEvent('keydown', { key: k, bubbles: true }),
      )

    // In a plain menu (dropdownmode 0) the arrow keys move the highlight
    // without changing the selection.
    key('ArrowDown')
    expect(item1.highlighted).toBe(true)
    expect(item1.selected).toBe(false)

    key('ArrowDown')
    expect(item1.highlighted).toBe(false)
    expect(item2.highlighted).toBe(true)

    // Arrow down skips the disabled item3 and remains at item2.
    key('ArrowDown')
    expect(item2.highlighted).toBe(true)

    // Arrow up moves back to item1.
    key('ArrowUp')
    expect(item1.highlighted).toBe(true)
    expect(item2.highlighted).toBe(false)

    // Enter clicks the highlighted item.
    const clickSpy = vi.fn()
    item1.addEventListener('click', clickSpy)
    key('Enter')
    expect(clickSpy).toHaveBeenCalledTimes(1)

    // Clicking an item resets the keyboard navigation state, so move the
    // highlight again before pressing Space.
    key('ArrowDown')
    key(' ')
    expect(clickSpy).toHaveBeenCalledTimes(2)

    menu.remove()
  })

  it('makes the selection follow the highlight in dropdownmode 2', async () => {
    const menu = document.createElement('re-menu') as MenuElement
    menu.dropdownmode = 2
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

    const key = (k: string, init: KeyboardEventInit = {}) =>
      menu.dispatchEvent(
        new KeyboardEvent('keydown', { key: k, bubbles: true, ...init }),
      )

    // Without ctrl or shift, moving the highlight clears the previous
    // selections and selects the highlighted item, like a <select>.
    key('ArrowDown')
    expect(item1.highlighted).toBe(true)
    expect(item1.selected).toBe(true)
    expect(item2.selected).toBe(false)

    key('ArrowDown')
    expect(item1.highlighted).toBe(false)
    expect(item1.selected).toBe(false)
    expect(item2.highlighted).toBe(true)
    expect(item2.selected).toBe(true)

    // Arrow down skips the disabled item3 and remains at item2.
    key('ArrowDown')
    expect(item2.selected).toBe(true)

    // Arrow up moves back to item1.
    key('ArrowUp')
    expect(item1.highlighted).toBe(true)
    expect(item1.selected).toBe(true)
    expect(item2.selected).toBe(false)

    // Enter does not click the highlighted item in dropdownmode 2.
    const clickSpy = vi.fn()
    item1.addEventListener('click', clickSpy)
    key('Enter')
    expect(clickSpy).not.toHaveBeenCalled()

    // Space toggles the selected state of the highlighted item instead of
    // clicking it.
    key(' ')
    expect(item1.selected).toBe(false)
    expect(clickSpy).not.toHaveBeenCalled()

    menu.remove()
  })
})
