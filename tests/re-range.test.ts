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

  it('ignores pointer events when disabled', async () => {
    const range = document.createElement('re-range') as RangeElement
    range.value = 50
    range.disabled = true
    document.body.appendChild(range)
    await range.updateComplete

    const inputSpy = vi.fn()
    const changeSpy = vi.fn()
    range.addEventListener('input', inputSpy)
    range.addEventListener('change', changeSpy)

    range.dispatchEvent(
      new PointerEvent('pointerdown', { pointerId: 1, bubbles: true }),
    )
    range.dispatchEvent(
      new PointerEvent('pointermove', {
        pointerId: 1,
        bubbles: true,
        clientX: 10,
        clientY: 10,
      }),
    )
    range.dispatchEvent(
      new PointerEvent('lostpointercapture', {
        pointerId: 1,
        bubbles: true,
        clientX: 10,
        clientY: 10,
      }),
    )

    expect(range.value).toBe(50)
    expect(inputSpy).not.toHaveBeenCalled()
    expect(changeSpy).not.toHaveBeenCalled()

    range.remove()
  })

  it('snaps pointer-selected values to the step when min is zero', async () => {
    const range = document.createElement('re-range') as RangeElement
    range.min = 0
    range.max = 100
    range.step = 10
    document.body.appendChild(range)
    await range.updateComplete

    // happy-dom does not do layout so the width has to be provided to the
    // pointer event handlers.
    range.getBoundingClientRect = () => ({ width: 100 }) as DOMRect

    range.dispatchEvent(
      new PointerEvent('pointerdown', { pointerId: 1, bubbles: true }),
    )

    const movePointerTo = (offsetX: number) => {
      const move = new PointerEvent('pointermove', {
        pointerId: 1,
        bubbles: true,
      })
      Object.defineProperty(move, 'offsetX', { value: offsetX })
      range.dispatchEvent(move)
    }

    // 24 snaps down to 20, 25 rounds up to 30 and 34 snaps down to 30.
    movePointerTo(24)
    expect(range.value).toBe(20)
    movePointerTo(25)
    expect(range.value).toBe(30)
    movePointerTo(34)
    expect(range.value).toBe(30)
    movePointerTo(100)
    expect(range.value).toBe(100)

    // All values are multiples of the step.
    expect(range.value % range.step).toBe(0)

    range.remove()
  })

  it('snaps pointer-selected values to the step when min is non-zero', async () => {
    const range = document.createElement('re-range') as RangeElement
    range.min = 10
    range.max = 110
    range.step = 10
    document.body.appendChild(range)
    await range.updateComplete

    range.getBoundingClientRect = () => ({ width: 100 }) as DOMRect

    range.dispatchEvent(
      new PointerEvent('pointerdown', { pointerId: 1, bubbles: true }),
    )

    const movePointerTo = (offsetX: number) => {
      const move = new PointerEvent('pointermove', {
        pointerId: 1,
        bubbles: true,
      })
      Object.defineProperty(move, 'offsetX', { value: offsetX })
      range.dispatchEvent(move)
    }

    // With min=10, values snap to min + k * step, not to absolute multiples
    // of the step: 12 snaps to 10, 37 snaps to 50 and 94 snaps to 100.
    movePointerTo(2)
    expect(range.value).toBe(10)
    movePointerTo(27)
    expect(range.value).toBe(40)
    movePointerTo(37)
    expect(range.value).toBe(50)
    movePointerTo(94)
    expect(range.value).toBe(100)

    // All values are min plus a multiple of the step.
    expect((range.value - range.min) % range.step).toBe(0)
    expect(range.value).toBeGreaterThanOrEqual(range.min)
    expect(range.value).toBeLessThanOrEqual(range.max)

    range.remove()
  })
})
