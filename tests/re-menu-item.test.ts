import { describe, expect, it, vi } from 'vitest'
import '../src/re-menu-item.ts'
import type { MenuItemElement } from '../src/re-menu-item.ts'
import '../src/re-menu.ts'

describe('re-menu-item', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-menu-item')).toBeDefined()
  })

  it('renders with default item structure and hidden submenu icon', async () => {
    const menuItem = document.createElement('re-menu-item') as MenuItemElement
    document.body.appendChild(menuItem)
    await menuItem.updateComplete

    expect(menuItem.shadowRoot).not.toBeNull()

    const submenuIcon = menuItem.shadowRoot?.querySelector(
      're-icon-button[part="submenu-icon"]',
    )
    expect(submenuIcon).not.toBeNull()
    expect(submenuIcon?.classList.contains('re-hidden')).toBe(true)

    const submenuSlot = menuItem.shadowRoot?.querySelector(
      'slot[name="submenu"]',
    )
    expect(submenuSlot).not.toBeNull()

    expect(menuItem.getSubmenu()).toBeUndefined()

    menuItem.remove()
  })

  it('detects slotted popover submenu and reveals submenu icon', async () => {
    const menuItem = document.createElement('re-menu-item') as MenuItemElement
    const submenu = document.createElement('re-menu')
    submenu.setAttribute('slot', 'submenu')
    submenu.setAttribute('popover', 'auto')
    submenu.setAttribute('autofocus', '')
    submenu.setAttribute('tabindex', '-1')
    menuItem.appendChild(submenu)

    document.body.appendChild(menuItem)
    await menuItem.updateComplete

    expect(menuItem.getSubmenu()).toBe(submenu)

    const submenuIcon = menuItem.shadowRoot?.querySelector(
      're-icon-button[part="submenu-icon"]',
    )
    expect(submenuIcon?.classList.contains('re-hidden')).toBe(false)

    menuItem.remove()
  })

  it('toggles submenu when menuItem is clicked', async () => {
    const menuItem = document.createElement('re-menu-item') as MenuItemElement
    const submenu = document.createElement('re-menu')
    submenu.setAttribute('slot', 'submenu')
    submenu.setAttribute('popover', 'auto')
    submenu.setAttribute('autofocus', '')
    submenu.setAttribute('tabindex', '-1')
    menuItem.appendChild(submenu)

    document.body.appendChild(menuItem)
    await menuItem.updateComplete

    const toggleSpy = vi.spyOn(submenu, 'togglePopover')

    menuItem.click()

    expect(toggleSpy).toHaveBeenCalled()

    menuItem.remove()
  })

  it('toggleSubmenu calls togglePopover on inner button', async () => {
    const menuItem = document.createElement('re-menu-item') as MenuItemElement
    const submenu = document.createElement('re-menu')
    submenu.setAttribute('slot', 'submenu')
    submenu.setAttribute('popover', 'auto')
    submenu.setAttribute('autofocus', '')
    submenu.setAttribute('tabindex', '-1')
    menuItem.appendChild(submenu)

    document.body.appendChild(menuItem)
    await menuItem.updateComplete

    const button = menuItem.shadowRoot?.querySelector('re-icon-button')
    const toggleSpy = vi.spyOn(button!, 'togglePopover')

    menuItem.toggleSubmenu()
    expect(toggleSpy).toHaveBeenCalledTimes(1)

    menuItem.remove()
  })
})
