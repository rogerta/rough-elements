import { describe, expect, it, vi } from 'vitest'
import '../src/re-item.ts'
import { getItemFromEvent, type ItemElement } from '../src/re-item.ts'
import '../src/re-menu.ts'
import type { MenuElement } from '../src/re-menu.ts'
import '../src/re-menu-item.ts'
import type { MenuItemElement } from '../src/re-menu-item.ts'

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

  it('does not fire click events outside the menu for disabled items', async () => {
    const menu = document.createElement('re-menu') as MenuElement

    const disabledItem = document.createElement('re-item') as ItemElement
    disabledItem.disabled = true
    const span = document.createElement('span')
    span.textContent = 'Disabled item content'
    disabledItem.appendChild(span)
    menu.appendChild(disabledItem)

    document.body.appendChild(menu)
    await menu.updateComplete

    const menuClickSpy = vi.fn()
    const bodyClickSpy = vi.fn()
    menu.addEventListener('click', menuClickSpy)
    document.body.addEventListener('click', bodyClickSpy)

    span.click()

    expect(menuClickSpy).not.toHaveBeenCalled()
    expect(bodyClickSpy).not.toHaveBeenCalled()

    document.body.removeEventListener('click', bodyClickSpy)
    menu.remove()
  })

  it('getLabelNodes returns assigned prefix, body and suffix nodes in order', async () => {
    const item = document.createElement('re-item') as ItemElement

    const append = (slot: string | null, text: string) => {
      const span = document.createElement('span')
      if (slot) {
        span.setAttribute('slot', slot)
      }
      span.textContent = text
      span.id = `${text.toLowerCase().replace(/\s+/g, '-')}-id`
      item.appendChild(span)
      return span
    }

    const originals = [
      append('prefix', 'Prefix 1'),
      append('prefix', 'Prefix 2'),
      append(null, 'Body 1'),
      append(null, 'Body 2'),
      append('suffix', 'Suffix 1'),
      append('suffix', 'Suffix 2'),
    ]

    document.body.appendChild(item)
    await item.updateComplete

    const nodes = item.getLabelNodes()

    expect(nodes.map(n => n.textContent)).toEqual([
      'Prefix 1',
      'Prefix 2',
      'Body 1',
      'Body 2',
      'Suffix 1',
      'Suffix 2',
    ])

    // The nodes are clones of the originals, not the originals themselves,
    // and any IDs are stripped from the clones.
    nodes.forEach((node, i) => {
      expect(node).not.toBe(originals[i])
      expect((node as HTMLElement).hasAttribute('id')).toBe(false)
    })

    item.remove()
  })

  // Per the HTML spec, HTMLSlotElement.assignedNodes() returns the slot's
  // fallback content (its child nodes) when nothing has been assigned to the
  // slot.  An unassigned prefix or suffix slot therefore contributes its
  // fallback <re-icon> content while an unassigned body slot, which has no
  // fallback content, contributes nothing.
  //
  // Disabled: happy-dom does not implement the fallback content behaviour of
  // assignedNodes() — unassigned slots return an empty list instead of the
  // slot's child nodes — so this test fails under vitest's happy-dom
  // environment.  Re-enable once happy-dom matches the HTML spec.
  it.skip('getLabelNodes handles optional slots with fallback content', async () => {
    // Each of the three slots is optional and can be assigned more than one
    // child.
    const combos = [
      { prefix: false, body: false, suffix: false },
      { prefix: true, body: false, suffix: false },
      { prefix: false, body: true, suffix: false },
      { prefix: false, body: false, suffix: true },
      { prefix: true, body: true, suffix: false },
      { prefix: true, body: false, suffix: true },
      { prefix: false, body: true, suffix: true },
      { prefix: true, body: true, suffix: true },
    ]

    for (const { prefix, body, suffix } of combos) {
      const item = document.createElement('re-item') as ItemElement

      const append = (slot: string | null, text: string) => {
        const span = document.createElement('span')
        if (slot) {
          span.setAttribute('slot', slot)
        }
        span.textContent = text
        item.appendChild(span)
      }

      if (prefix) {
        append('prefix', 'P1')
        append('prefix', 'P2')
      }
      if (body) {
        append(null, 'B1')
        append(null, 'B2')
      }
      if (suffix) {
        append('suffix', 'S1')
        append('suffix', 'S2')
      }

      document.body.appendChild(item)
      await item.updateComplete

      const expectedTexts = [
        // Fallback <re-icon> content has no text content.
        ...(prefix ? ['P1', 'P2'] : ['']),
        ...(body ? ['B1', 'B2'] : []),
        ...(suffix ? ['S1', 'S2'] : ['']),
      ]
      const expectedLocalNames = [
        ...(prefix ? ['span', 'span'] : ['re-icon']),
        ...(body ? ['span', 'span'] : []),
        ...(suffix ? ['span', 'span'] : ['re-icon']),
      ]

      const nodes = item.getLabelNodes()
      expect(nodes.map(n => n.textContent)).toEqual(expectedTexts)
      // localName is an Element property, not a Node property, so cast.
      expect(nodes.map(n => (n as Element).localName))
        .toEqual(expectedLocalNames)

      item.remove()
    }
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

    it('returns the re-item in a submenu, not the ancestor re-menu-item', async () => {
      const menu = document.createElement('re-menu') as MenuElement
      const menuItem = document.createElement(
        're-menu-item',
      ) as MenuItemElement
      menu.appendChild(menuItem)

      const submenu = document.createElement('re-menu') as MenuElement
      submenu.setAttribute('slot', 'submenu')
      menuItem.appendChild(submenu)

      const item = document.createElement('re-item') as ItemElement
      const span = document.createElement('span')
      span.textContent = 'Inside submenu item'
      const span2 = document.createElement('span')
      span2.textContent = 'Another span'
      item.appendChild(span)
      submenu.appendChild(item)
      submenu.appendChild(span2)

      document.body.appendChild(menu)
      await menu.updateComplete

      let targetItem: ItemElement | null = null
      menu.addEventListener('click', e => {
        targetItem = getItemFromEvent(e)
      })

      span.click()
      expect(targetItem).toBe(item)
      expect(targetItem).not.toBe(menuItem)

      // Clicking on the span2 should return null since it is not an re-item
      // and the search should stop at the submenu boundary.  The re--menu-item
      // ancestor should not be returned.
      targetItem = null
      span2.click()
      expect(targetItem).toBeNull()

      menu.remove()
    })
  })
})
