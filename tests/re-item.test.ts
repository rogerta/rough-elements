import { describe, expect, it, vi } from 'vitest'
import '../src/re-item.ts'
import { getItemFromEvent, type ItemElement } from '../src/re-item.ts'
import '../src/re-menu.ts'

describe('re-item', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-item')).toBeDefined()
  })

  it('renders default slots and structure', async () => {
    const item = document.createElement('re-item') as ItemElement
    document.body.appendChild(item)
    await item.updateComplete

    expect(item.selected).toBe(false)
    expect(item.disabled).toBe(false)

    const prefixSlot = item.shadowRoot?.querySelector('slot[name="prefix"]')
    const bodySlot = item.shadowRoot?.querySelector('slot[part="body"]')
    const suffixSlot = item.shadowRoot?.querySelector('slot[name="suffix"]')

    expect(prefixSlot).not.toBeNull()
    expect(bodySlot).not.toBeNull()
    expect(suffixSlot).not.toBeNull()

    item.remove()
  })

  it('reflects selected and disabled properties', async () => {
    const item = document.createElement('re-item') as ItemElement
    document.body.appendChild(item)
    await item.updateComplete

    item.selected = true
    item.disabled = true
    await item.updateComplete

    expect(item.hasAttribute('selected')).toBe(true)
    expect(item.hasAttribute('disabled')).toBe(true)

    item.selected = false
    item.disabled = false
    await item.updateComplete

    expect(item.hasAttribute('selected')).toBe(false)
    expect(item.hasAttribute('disabled')).toBe(false)

    item.remove()
  })

  it('stops click event propagation when disabled', async () => {
    const item = document.createElement('re-item') as ItemElement
    item.disabled = true
    document.body.appendChild(item)
    await item.updateComplete

    const parentClickSpy = vi.fn()
    document.body.addEventListener('click', parentClickSpy)

    item.click()

    expect(parentClickSpy).not.toHaveBeenCalled()

    document.body.removeEventListener('click', parentClickSpy)
    item.remove()
  })

  it('getLabelNodes returns cloned nodes without IDs', async () => {
    const item = document.createElement('re-item') as ItemElement
    item.id = 'test-item'

    const span = document.createElement('span')
    span.id = 'span-id'
    span.textContent = 'Label text'
    item.appendChild(span)

    document.body.appendChild(item)
    await item.updateComplete

    const labelNodes = item.getLabelNodes()
    expect(labelNodes.length).toBeGreaterThan(0)
    const clonedSpan = labelNodes.find(n =>
      n.textContent === 'Label text'
    ) as HTMLElement
    expect(clonedSpan).toBeDefined()
    expect(clonedSpan.hasAttribute('id')).toBe(false)

    item.remove()
  })

  describe('getItemFromEvent', () => {
    it('returns item when clicking directly on item or its contents', async () => {
      const item = document.createElement('re-item') as ItemElement
      item.id = 'item1'
      const span = document.createElement('span')
      span.textContent = 'Click me'
      item.appendChild(span)
      document.body.appendChild(item)
      await item.updateComplete

      let targetItem: ItemElement | null = null
      item.addEventListener('click', e => {
        targetItem = getItemFromEvent(e)
      })

      span.click()
      expect(targetItem).toBe(item)

      item.remove()
    })

    it('returns null if item is disabled', async () => {
      const item = document.createElement('re-item') as ItemElement
      item.id = 'item-disabled'
      item.disabled = true
      document.body.appendChild(item)
      await item.updateComplete

      let targetItem: ItemElement | null = null
      const event = new MouseEvent('click', { bubbles: true })
      Object.defineProperty(event, 'target', { value: item })
      targetItem = getItemFromEvent(event)

      expect(targetItem).toBeNull()

      item.remove()
    })

    it('does not traverse past re-menu boundary', async () => {
      const menu = document.createElement('re-menu')
      const span = document.createElement('span')
      span.textContent = 'Inside menu outside item'
      menu.appendChild(span)
      document.body.appendChild(menu)
      await menu.updateComplete

      const event = new MouseEvent('click', { bubbles: true })
      Object.defineProperty(event, 'target', { value: span })
      const targetItem = getItemFromEvent(event)

      expect(targetItem).toBeNull()

      menu.remove()
    })
  })
})
