import { describe, expect, it, vi } from 'vitest'
import '../src/re-range.ts'
import type { RangeElement } from '../src/re-range.ts'

describe('re-range', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-range')).toBeDefined()
  })

  it('renders rough svg with default bounds', async () => {
    const range = document.createElement('re-range') as RangeElement
    document.body.appendChild(range)
    await range.updateComplete

    expect(range.min).toBe(0)
    expect(range.max).toBe(100)
    expect(range.step).toBe(1)
    expect(range.value).toBe(50)

    const roughSvg = range.shadowRoot?.querySelector('svg#rough')
    expect(roughSvg).not.toBeNull()

    range.remove()
  })

  it('adjusts value via arrow keys and fires change on keyup', async () => {
    const range = document.createElement('re-range') as RangeElement
    range.value = 50
    range.step = 5
    document.body.appendChild(range)
    await range.updateComplete

    const changeSpy = vi.fn()
    range.addEventListener('change', changeSpy)

    range.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    expect(range.value).toBe(55)

    range.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    expect(range.value).toBe(50)

    range.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }))
    expect(changeSpy).toHaveBeenCalledTimes(1)

    range.remove()
  })

  it('arrow keys stay within min and max bounds', async () => {
    const range = document.createElement('re-range') as RangeElement
    range.min = 10
    range.max = 20
    range.value = 19
    document.body.appendChild(range)
    await range.updateComplete

    // ArrowRight should clamp at max
    range.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    expect(range.value).toBe(20)

    range.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    expect(range.value).toBe(20) // clamped at max

    // ArrowLeft from max
    range.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    expect(range.value).toBe(19)

    // Move to min
    range.value = 11
    range.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    expect(range.value).toBe(10)

    range.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    expect(range.value).toBe(10) // clamped at min

    range.remove()
  })

  it('ignores keyboard navigation when disabled', async () => {
    const range = document.createElement('re-range') as RangeElement
    range.value = 50
    range.disabled = true
    document.body.appendChild(range)
    await range.updateComplete

    range.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    expect(range.value).toBe(50)

    range.remove()
  })
})
