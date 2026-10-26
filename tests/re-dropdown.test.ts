import { describe, expect, it } from 'vitest'
import '../src/re-dropdown.ts'
import type { DropdownElement } from '../src/re-dropdown.ts'
import '../src/re-item.ts'

describe('re-dropdown', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-dropdown')).toBeDefined()
  })

  it('renders trigger button and popover menu panel', async () => {
    const dropdown = document.createElement('re-dropdown') as DropdownElement
    document.body.appendChild(dropdown)
    await dropdown.updateComplete

    expect(dropdown.disabled).toBe(false)
    expect(dropdown.getAttribute('tabindex')).toBe('0')

    const trigger = dropdown.shadowRoot?.querySelector(
      're-button[part="trigger"]',
    )
    expect(trigger).not.toBeNull()
    expect(trigger?.hasAttribute('caret')).toBe(true)
    expect(trigger?.getAttribute('popovertarget')).toBe('panel')

    const menu = dropdown.shadowRoot?.querySelector(
      're-menu#panel[part="panel"]',
    )
    expect(menu).not.toBeNull()
    expect(menu?.hasAttribute('popover')).toBe(true)

    const labelSlot = trigger?.querySelector('slot[name="label"]')
    expect(labelSlot).not.toBeNull()

    const contentSlot = menu?.querySelector('slot')
    expect(contentSlot).not.toBeNull()

    dropdown.remove()
  })

  it('reflects disabled property to trigger button', async () => {
    const dropdown = document.createElement('re-dropdown') as DropdownElement
    dropdown.disabled = true
    document.body.appendChild(dropdown)
    await dropdown.updateComplete

    expect(dropdown.hasAttribute('disabled')).toBe(true)

    const trigger = dropdown.shadowRoot?.querySelector(
      're-button[part="trigger"]',
    )
    expect(trigger?.hasAttribute('disabled')).toBe(true)

    dropdown.disabled = false
    await dropdown.updateComplete

    expect(dropdown.hasAttribute('disabled')).toBe(false)
    expect(trigger?.hasAttribute('disabled')).toBe(false)

    dropdown.remove()
  })

  it('renders slotted label and items correctly', async () => {
    const dropdown = document.createElement('re-dropdown') as DropdownElement

    const labelSpan = document.createElement('span')
    labelSpan.setAttribute('slot', 'label')
    labelSpan.textContent = 'Dropdown Actions'
    dropdown.appendChild(labelSpan)

    const item1 = document.createElement('re-item')
    item1.id = 'action1'
    item1.textContent = 'Action 1'
    dropdown.appendChild(item1)

    document.body.appendChild(dropdown)
    await dropdown.updateComplete

    const assignedToLabel = (dropdown.shadowRoot?.querySelector(
      'slot[name="label"]',
    ) as HTMLSlotElement)
      ?.assignedElements()
    expect(assignedToLabel).toContain(labelSpan)

    const assignedToMenu =
      (dropdown.shadowRoot?.querySelector('re-menu slot') as HTMLSlotElement)
        ?.assignedElements()
    expect(assignedToMenu).toContain(item1)

    dropdown.remove()
  })
})
