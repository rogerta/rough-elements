import { describe, expect, it, vi } from 'vitest'
import '../src/re-menu-item.ts'
import type { MenuItemElement } from '../src/re-menu-item.ts'
import '../src/re-menu.ts'
import type { MenuElement } from '../src/re-menu.ts'

/**
 * Creates an `<re-menu-item>` with a slotted popover submenu and content
 * assigned to the prefix, body and suffix slots.
 *
 * The popover target wiring done by `updated()` via `setPopoverTarget()` is
 * asynchronous, so a macrotask is awaited before the menu item is ready to
 * be clicked.
 */
async function createMenuItemWithSubmenu(): Promise<{
  menuItem: MenuItemElement
  prefix: HTMLElement
  body: HTMLElement
  suffix: HTMLElement
  submenu: MenuElement
}> {
  const menuItem = document.createElement('re-menu-item') as MenuItemElement

  const prefix = document.createElement('span')
  prefix.setAttribute('slot', 'prefix')
  prefix.textContent = 'Prefix'
  menuItem.appendChild(prefix)

  const body = document.createElement('span')
  body.textContent = 'Body'
  menuItem.appendChild(body)

  const suffix = document.createElement('span')
  suffix.setAttribute('slot', 'suffix')
  suffix.textContent = 'Suffix'
  menuItem.appendChild(suffix)

  const submenu = document.createElement('re-menu') as MenuElement
  submenu.setAttribute('slot', 'submenu')
  submenu.setAttribute('popover', 'auto')
  submenu.setAttribute('autofocus', '')
  submenu.setAttribute('tabindex', '-1')
  menuItem.appendChild(submenu)

  document.body.appendChild(menuItem)
  await menuItem.updateComplete
  // updated() wires the submenu icon button to the popover with
  // setPopoverTarget(), which resolves through a chain of updateComplete
  // promises that cross two shadow roots (re-icon-button and its inner
  // re-button).  Awaiting the menu item's own updateComplete is therefore
  // not enough: those nested promises may still be resolving.  Waiting for
  // a macrotask lets all pending microtasks, including that chain, settle
  // so the popover target is attached before any clicks are simulated.
  //
  // TODO: investigate having <re-menu-item> extend its updateComplete
  // promise to also wait for its children to finish updating, using Lit's
  // getUpdateComplete() hook.  If the menu item awaited the submenu icon
  // button's updateComplete chain there, awaiting the menu item's
  // updateComplete alone would be enough here and this timeout could be
  // removed.
  await new Promise(resolve => setTimeout(resolve, 0))

  return { menuItem, prefix, body, suffix, submenu }
}

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

  it('toggles the submenu when the submenu icon button is clicked', async () => {
    const { menuItem, submenu } = await createMenuItemWithSubmenu()

    expect(submenu.matches(':popover-open')).toBe(false)

    // A real click on the icon button lands on the native <button> deep in
    // its shadow DOM.  That button is the element wired to the popover
    // target by setPopoverTarget().
    const iconButton = menuItem.shadowRoot?.querySelector(
      're-icon-button[part="submenu-icon"]',
    ) as HTMLElement
    const reButton = iconButton.shadowRoot?.querySelector(
      're-button',
    ) as HTMLElement
    const nativeButton = reButton.shadowRoot?.querySelector('button')

    nativeButton?.click()
    expect(submenu.matches(':popover-open')).toBe(true)

    nativeButton?.click()
    expect(submenu.matches(':popover-open')).toBe(false)

    menuItem.remove()
  })

  it('toggles the submenu when prefix, body or suffix slot content is clicked', async () => {
    const { menuItem, prefix, body, suffix, submenu } =
      await createMenuItemWithSubmenu()

    expect(submenu.matches(':popover-open')).toBe(false)

    const slots = [
      { name: 'prefix', element: prefix },
      { name: 'body', element: body },
      { name: 'suffix', element: suffix },
    ]

    for (const { name, element } of slots) {
      element.click()
      expect(submenu.matches(':popover-open'), `${name} opens submenu`)
        .toBe(true)

      element.click()
      expect(submenu.matches(':popover-open'), `${name} closes submenu`)
        .toBe(false)
    }

    menuItem.remove()
  })
})
