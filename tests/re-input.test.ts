import { describe, expect, it, vi } from 'vitest'
import '../src/re-input.ts'
import type { InputElement } from '../src/re-input.ts'

describe('re-input', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-input')).toBeDefined()
  })

  it('renders native input inside shadow DOM', async () => {
    const input = document.createElement('re-input') as InputElement
    document.body.appendChild(input)
    await input.updateComplete

    const innerInput = input.shadowRoot?.querySelector('input')
    expect(innerInput).not.toBeNull()
    expect(innerInput?.type).toBe('text')
    expect(input.value).toBe('')

    input.remove()
  })

  it('syncs value property and dispatches input/change events', async () => {
    const input = document.createElement('re-input') as InputElement
    document.body.appendChild(input)
    await input.updateComplete

    input.value = 'hello'
    await input.updateComplete

    const innerInput = input.shadowRoot?.querySelector('input')
    expect(innerInput?.value).toBe('hello')

    const inputSpy = vi.fn()
    const changeSpy = vi.fn()
    input.addEventListener('input', inputSpy)
    input.addEventListener('change', changeSpy)

    innerInput?.dispatchEvent(
      new Event('input', { bubbles: true, composed: true }),
    )
    innerInput?.dispatchEvent(new Event('change', { bubbles: true }))

    expect(inputSpy).toHaveBeenCalledTimes(1)
    expect(changeSpy).toHaveBeenCalledTimes(1)

    input.remove()
  })

  it('supports disabled, readonly and required attributes', async () => {
    const input = document.createElement('re-input') as InputElement
    input.disabled = true
    input.readonly = true
    input.required = true
    document.body.appendChild(input)
    await input.updateComplete

    const innerInput = input.shadowRoot?.querySelector('input')
    expect(innerInput?.disabled).toBe(true)
    expect(innerInput?.readOnly).toBe(true)
    expect(innerInput?.required).toBe(true)

    input.remove()
  })

  it('renders password visibility toggle for password type', async () => {
    const input = document.createElement('re-input') as InputElement
    input.type = 'password'
    document.body.appendChild(input)
    await input.updateComplete

    // The toggle button has part="password-icon" inside the suffix slot
    const slot = input.shadowRoot?.querySelector('slot[name="suffix"]')
    const toggleBtn = slot?.querySelector(
      're-icon-button[part="password-icon"]',
    )
    expect(toggleBtn).not.toBeNull()

    input.remove()
  })

  it('exposes valueAsNumber for numeric inputs', async () => {
    const input = document.createElement('re-input') as InputElement
    input.type = 'number'
    input.value = '42'
    document.body.appendChild(input)
    await input.updateComplete

    expect(input.valueAsNumber).toBe(42)

    input.value = '7'
    await input.updateComplete
    expect(input.valueAsNumber).toBe(7)

    input.remove()
  })
})
