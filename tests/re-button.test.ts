import { describe, expect, it, vi } from 'vitest'
import '../src/re-button.ts'
import type { ButtonElement } from '../src/re-button.ts'

describe('re-button', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-button')).toBeDefined()
  })

  it('renders slot content and handles clicks', async () => {
    const btn = document.createElement('re-button') as ButtonElement
    btn.textContent = 'Click me'
    document.body.appendChild(btn)
    await btn.updateComplete

    const clickSpy = vi.fn()
    btn.addEventListener('click', clickSpy)

    btn.click()
    expect(clickSpy).toHaveBeenCalledTimes(1)

    btn.remove()
  })

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
})
