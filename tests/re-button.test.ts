import { describe, expect, it, vi } from 'vitest'
import '../src/re-button.ts'
import type { ButtonElement } from '../src/re-button.ts'

describe('re-button', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-button')).toBeDefined()
  })

  it('default fill style is solid', async () => {
    const btn = document.createElement('re-button') as ButtonElement
    btn.textContent = 'Click me'
    document.body.appendChild(btn)
    await btn.updateComplete

    expect(btn.fillStyle).toBe('solid')

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
    const target = document.createElement('div')
    target.setAttribute('popover', '')
    target.style.display = 'none'
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
console.log('rogerta supports popover target via click')
    const target = document.createElement('div')
    target.setAttribute('popover', '')
    target.style.display = 'none'
    document.body.appendChild(target)

    const btn = document.createElement('re-button') as ButtonElement
    document.body.appendChild(btn)
    await btn.setPopoverTarget(target)

    await btn.click()
console.log('rogerta after')
    const styles = getComputedStyle(target)
    expect(styles.getPropertyValue('display')).toBe('block')

    btn.remove()
    target.remove()
  })

  it('supports popover target via attribute', async () => {
console.log('rogerta supports popover target via attribute')
    const target = document.createElement('div')
    target.setAttribute('popover', '')
    target.style.display = 'none'
    target.id = 'testPopover'
    document.body.appendChild(target)

    const btn = document.createElement('re-button') as ButtonElement
    document.body.appendChild(btn)
    await btn.updateComplete

    btn.popovertarget = target.id
    await btn.updateComplete

    const isOpen = btn.togglePopover()
    expect(typeof isOpen).toBe('boolean')
console.log('rogerta after')
    const styles = getComputedStyle(target)
    expect(styles.getPropertyValue('display')).toBe('block')

    btn.remove()
    target.remove()
  })
})
