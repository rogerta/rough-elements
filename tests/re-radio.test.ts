import { describe, expect, it, vi } from 'vitest'
import '../src/re-radio.ts'
import type { RadioElement } from '../src/re-radio.ts'

describe('re-radio', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-radio')).toBeDefined()
  })

  it('renders default unchecked state and prefix icon', async () => {
    const radio = document.createElement('re-radio') as RadioElement
    document.body.appendChild(radio)
    await radio.updateComplete

    expect(radio.checked).toBe(false)
    expect(radio.hasAttribute('checked')).toBe(false)

    const prefix = radio.querySelector('re-icon[slot="prefix"]')
    expect(prefix).not.toBeNull()
    expect(prefix?.getAttribute('name')).toBe('radio-button-unchecked')

    radio.remove()
  })

  it('checks on click and fires change event', async () => {
    const radio = document.createElement('re-radio') as RadioElement
    document.body.appendChild(radio)
    await radio.updateComplete

    const changeSpy = vi.fn()
    radio.addEventListener('change', changeSpy)

    // Click the inner button (the renderRoot click handler fires on the shadow root)
    const btn = radio.shadowRoot?.querySelector('button')
    btn?.click()
    await radio.updateComplete

    expect(radio.checked).toBe(true)
    expect(radio.hasAttribute('checked')).toBe(true)
    expect(changeSpy).toHaveBeenCalledTimes(1)

    const prefix = radio.querySelector('re-icon[slot="prefix"]')
    expect(prefix?.getAttribute('name')).toBe('radio-button-checked')

    radio.remove()
  })

  it('unchecks sibling radio button with the same name when checked is set', async () => {
    const radio1 = document.createElement('re-radio') as RadioElement
    radio1.name = 'groupB'
    radio1.value = '1'

    const radio2 = document.createElement('re-radio') as RadioElement
    radio2.name = 'groupB'
    radio2.value = '2'

    document.body.appendChild(radio1)
    document.body.appendChild(radio2)
    await radio1.updateComplete
    await radio2.updateComplete

    // Setting checked programmatically triggers updated() -> forEachOtherRadio_
    radio1.checked = true
    await radio1.updateComplete
    expect(radio1.checked).toBe(true)
    // radio2 should be unchecked since radio1 is now checked
    await radio2.updateComplete
    expect(radio2.checked).toBe(false)

    radio2.checked = true
    await radio2.updateComplete
    expect(radio2.checked).toBe(true)
    await radio1.updateComplete
    expect(radio1.checked).toBe(false)

    radio1.remove()
    radio2.remove()
  })

  it('does not check when disabled', async () => {
    const radio = document.createElement('re-radio') as RadioElement
    radio.disabled = true
    document.body.appendChild(radio)
    await radio.updateComplete

    radio.click()
    await radio.updateComplete

    expect(radio.checked).toBe(false)

    radio.remove()
  })
})
