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

  it('reflects inner input value changes to the value property', async () => {
    const cases = [
      { type: 'text', value: 'typed text' },
      { type: 'number', value: '123' },
      { type: 'date', value: '2024-06-15' },
    ] as const

    for (const { type, value } of cases) {
      const input = document.createElement('re-input') as InputElement
      input.type = type
      document.body.appendChild(input)
      await input.updateComplete

      const innerInput = input.shadowRoot?.querySelector('input')
      expect(innerInput).not.toBeNull()
      expect(input.value).toBe('')

      // Programmatically setting the inner input's value does not fire an
      // input event, and re-input only syncs its own value property in
      // response to input/change events from the inner input.  So an input
      // event must be dispatched to simulate user typing.
      innerInput!.value = value
      innerInput!.dispatchEvent(
        new Event('input', { bubbles: true, composed: true }),
      )

      expect(input.value).toBe(value)

      input.remove()
    }
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

  it('exposes valueAsDate for date inputs', async () => {
    const input = document.createElement('re-input') as InputElement
    input.type = 'date'
    input.value = '2024-06-15'
    document.body.appendChild(input)
    await input.updateComplete

    expect(input.valueAsDate).toEqual(new Date(Date.UTC(2024, 5, 15)))

    input.value = '2025-01-31'
    await input.updateComplete
    expect(input.valueAsDate).toEqual(new Date(Date.UTC(2025, 0, 31)))

    input.remove()
  })
})
