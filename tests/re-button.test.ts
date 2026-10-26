import { describe, expect, it, vi } from 'vitest'
import '../src/re-button.ts'
import type { ButtonElement } from '../src/re-button.ts'

describe('re-button', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-button')).toBeDefined()
  })

  it('renders with default properties', async () => {
    const btn = document.createElement('re-button') as ButtonElement
    document.body.appendChild(btn)
    await btn.updateComplete

    expect(btn.disabled).toBe(false)
    expect(btn.name).toBe('')
    expect(btn.href).toBeUndefined()
    expect(btn.target).toBeUndefined()
    expect(btn.download).toBeUndefined()
    expect(btn.caret).toBe(false)
    expect(btn.circle).toBe(false)
    expect(btn.variant).toBe('none')
    expect(btn.type).toBe('button')
    expect(btn.formaction).toBeUndefined()
    expect(btn.formenctype).toBeUndefined()
    expect(btn.formmethod).toBe('post')
    expect(btn.formnovalidate).toBeUndefined()
    expect(btn.formtarget).toBe('_self')
    expect(btn.value).toBeUndefined()
    expect(btn.popovertarget).toBeUndefined()
    expect(btn.fillStyle).toBe('solid')

    const roughSvg = btn.shadowRoot?.querySelector('svg#rough')
    expect(roughSvg).not.toBeNull()

    const innerButton = btn.shadowRoot?.querySelector('button[part="button"]')
    expect(innerButton).not.toBeNull()

    const prefixSlot = btn.shadowRoot?.querySelector('slot[name="prefix"]')
    expect(prefixSlot).not.toBeNull()

    const mainSlot = btn.shadowRoot?.querySelector('slot#main')
    expect(mainSlot).not.toBeNull()

    const suffixSlot = btn.shadowRoot?.querySelector('slot[name="suffix"]')
    expect(suffixSlot).not.toBeNull()

    // No caret by default
    const caretIcon = btn.shadowRoot?.querySelector('re-icon[part="caret"]')
    expect(caretIcon).toBeNull()

    // No link by default
    const link = btn.shadowRoot?.querySelector('a')
    expect(link).toBeNull()

    btn.remove()
  })

  it('renders slot content and handles clicks', async () => {
    const btn = document.createElement('re-button') as ButtonElement
    btn.textContent = 'Click me'
    document.body.appendChild(btn)
    await btn.updateComplete

    const clickSpy = vi.fn()
    btn.addEventListener('click', clickSpy)

    await btn.click()
    expect(clickSpy).toHaveBeenCalledTimes(1)

    btn.remove()
  })

  // TODO: move this to re-button-base tests.
  it('reflects disabled property', async () => {
    const btn = document.createElement('re-button') as ButtonElement
    btn.disabled = true
    document.body.appendChild(btn)
    await btn.updateComplete

    expect(btn.hasAttribute('disabled')).toBe(true)
    expect(btn.disabled).toBe(true)

    const innerButton = btn.shadowRoot?.querySelector('button')
    expect(innerButton?.disabled).toBe(true)

    btn.remove()
  })

  it('supports popover target via togglePopover', async () => {
    // console.log(`*** rogerta doc=${document?.constructor?.toString()}`)
    // console.log(`*** rogerta win=${window?.constructor?.toString()}`)
    // console.log(`*** rogerta glob=${globalThis?.constructor?.toString()}`)
    // console.log(`*** rogerta globdoc=${globalThis?.Document?.constructor?.toString()}`)

    const target = document.createElement('div')
    target.setAttribute('popover', 'auto')
    document.body.appendChild(target)
    const styles1 = getComputedStyle(target)
    expect(styles1.getPropertyValue('display')).toBe('none')

    const btn = document.createElement('re-button') as ButtonElement
    document.body.appendChild(btn)
    await btn.updateComplete

    await btn.setPopoverTarget(target)

    const isOpen = btn.togglePopover()
    expect(typeof isOpen).toBe('boolean')
    const styles = getComputedStyle(target)
    expect(styles.getPropertyValue('display')).toBe('block')

    btn.remove()
    target.remove()
  })

  it('supports popover target via click', async () => {
    const target = document.createElement('div')
    target.setAttribute('popover', 'auto')
    document.body.appendChild(target)
    const styles1 = getComputedStyle(target)
    expect(styles1.display).toBe('none')

    const btn = document.createElement('re-button') as ButtonElement
    document.body.appendChild(btn)
    await btn.setPopoverTarget(target)

    await btn.click()
    const styles = getComputedStyle(target)
    expect(styles.getPropertyValue('display')).toBe('block')

    btn.remove()
    target.remove()
  })

  it('supports popover target via attribute', async () => {
    const target = document.createElement('div')
    target.setAttribute('popover', 'auto')
    target.id = 'testPopover'
    document.body.appendChild(target)

    const btn = document.createElement('re-button') as ButtonElement
    document.body.appendChild(btn)
    btn.setAttribute('popovertarget', target.id)
    await btn.updateComplete

    btn.popovertarget = target.id
    await btn.updateComplete

    const isOpen = btn.togglePopover()
    expect(typeof isOpen).toBe('boolean')
    const styles = getComputedStyle(target)
    expect(styles.getPropertyValue('display')).toBe('block')

    btn.remove()
    target.remove()
  })
})
