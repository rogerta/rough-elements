import { describe, expect, it, vi } from 'vitest'
import '../src/re-checkbox.ts'
import type { CheckboxElement } from '../src/re-checkbox.ts'

describe('re-checkbox', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-checkbox')).toBeDefined()
  })

  it('renders default unchecked state and prefix icon', async () => {
    const cb = document.createElement('re-checkbox') as CheckboxElement
    document.body.appendChild(cb)
    await cb.updateComplete

    expect(cb.checked).toBe(false)
    expect(cb.indeterminate).toBe(false)
    expect(cb.hasAttribute('checked')).toBe(false)

    const prefix = cb.querySelector('re-icon[slot="prefix"]')
    expect(prefix).not.toBeNull()
    expect(prefix?.getAttribute('name')).toBe('checkbox-outline-blank')

    cb.remove()
  })

  it('toggles checked on click and dispatches input and change events', async () => {
    const cb = document.createElement('re-checkbox') as CheckboxElement
    document.body.appendChild(cb)
    await cb.updateComplete

    const inputSpy = vi.fn()
    const changeSpy = vi.fn()
    cb.addEventListener('input', inputSpy)
    cb.addEventListener('change', changeSpy)

    const btn = cb.shadowRoot?.querySelector('button')
    btn?.click()
    await cb.updateComplete

    expect(cb.checked).toBe(true)
    expect(cb.hasAttribute('checked')).toBe(true)
    expect(inputSpy).toHaveBeenCalledTimes(1)
    expect(changeSpy).toHaveBeenCalledTimes(1)

    btn?.click()
    await cb.updateComplete

    expect(cb.checked).toBe(false)
    expect(cb.hasAttribute('checked')).toBe(false)
    expect(inputSpy).toHaveBeenCalledTimes(2)
    expect(changeSpy).toHaveBeenCalledTimes(2)

    cb.remove()
  })

  it('does not toggle when disabled', async () => {
    const cb = document.createElement('re-checkbox') as CheckboxElement
    cb.disabled = true
    document.body.appendChild(cb)
    await cb.updateComplete

    const btn = cb.shadowRoot?.querySelector('button')
    btn?.click()
    await cb.updateComplete

    expect(cb.checked).toBe(false)

    cb.remove()
  })

  it('updates icon when indeterminate is true', async () => {
    const cb = document.createElement('re-checkbox') as CheckboxElement
    document.body.appendChild(cb)
    await cb.updateComplete

    cb.indeterminate = true
    await cb.updateComplete

    const prefix = cb.querySelector('re-icon[slot="prefix"]')
    expect(prefix?.getAttribute('name')).toBe('checkbox-indeterminate')

    cb.remove()
  })
})
