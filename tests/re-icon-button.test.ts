import { describe, expect, it } from 'vitest'
import '../src/re-icon-button.ts'
import type { IconButtonElement } from '../src/re-icon-button.ts'

describe('re-icon-button', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-icon-button')).toBeDefined()
  })

  it('renders internal re-button and re-icon', async () => {
    const btn = document.createElement('re-icon-button') as IconButtonElement
    btn.name = 'close'
    document.body.appendChild(btn)
    await btn.updateComplete

    const innerButton = btn.shadowRoot?.querySelector('re-button')
    expect(innerButton).not.toBeNull()

    const innerIcon = innerButton?.querySelector('re-icon')
    expect(innerIcon).not.toBeNull()
    expect(innerIcon?.getAttribute('name')).toBe('close')

    btn.remove()
  })

  it('reflects disabled property to inner button', async () => {
    const btn = document.createElement('re-icon-button') as IconButtonElement
    btn.disabled = true
    document.body.appendChild(btn)
    await btn.updateComplete

    expect(btn.hasAttribute('disabled')).toBe(true)

    const innerButton = btn.shadowRoot?.querySelector('re-button')
    expect(innerButton?.hasAttribute('disabled')).toBe(true)

    btn.remove()
  })

  it('supports popover target configuration', async () => {
    const target = document.createElement('div')
    target.setAttribute('popover', '')
    document.body.appendChild(target)

    const btn = document.createElement('re-icon-button') as IconButtonElement
    document.body.appendChild(btn)
    await btn.updateComplete

    btn.setPopoverTarget(target)
    await btn.updateComplete

    const isOpen = btn.togglePopover()
    expect(typeof isOpen).toBe('boolean')

    btn.remove()
    target.remove()
  })
})
