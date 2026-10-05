import { describe, expect, it, vi } from 'vitest'
import '../src/re-rating.ts'
import type { RatingElement } from '../src/re-rating.ts'

describe('re-rating', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-rating')).toBeDefined()
  })

  it('renders star icons matching max property', async () => {
    const rating = document.createElement('re-rating') as RatingElement
    document.body.appendChild(rating)
    await rating.updateComplete

    expect(rating.max).toBe(5)
    expect(rating.value).toBe(0)

    const stars = rating.shadowRoot?.querySelectorAll('re-icon[name="star-rate"]')
    expect(stars?.length).toBe(5)

    rating.remove()
  })

  it('updates value on star click and dispatches change event', async () => {
    const rating = document.createElement('re-rating') as RatingElement
    document.body.appendChild(rating)
    await rating.updateComplete

    const changeSpy = vi.fn()
    rating.addEventListener('change', changeSpy)

    const thirdStar = rating.shadowRoot?.querySelector('re-icon[data-value="3"]') as HTMLElement
    thirdStar?.click()
    await rating.updateComplete

    expect(rating.value).toBe(3)
    expect(changeSpy).toHaveBeenCalledTimes(1)

    // Clicking the same star toggles it back to 0
    thirdStar?.click()
    await rating.updateComplete
    expect(rating.value).toBe(0)

    rating.remove()
  })

  it('supports keyboard navigation via arrow keys', async () => {
    const rating = document.createElement('re-rating') as RatingElement
    document.body.appendChild(rating)
    await rating.updateComplete

    const changeSpy = vi.fn()
    rating.addEventListener('change', changeSpy)

    rating.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    expect(rating.value).toBe(1)

    rating.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    expect(rating.value).toBe(2)

    rating.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    expect(rating.value).toBe(1)

    rating.dispatchEvent(new KeyboardEvent('keyup', { key: 'ArrowRight' }))
    expect(changeSpy).toHaveBeenCalledTimes(1)

    rating.remove()
  })

  it('does not update value when disabled or readonly', async () => {
    const rating = document.createElement('re-rating') as RatingElement
    rating.disabled = true
    document.body.appendChild(rating)
    await rating.updateComplete

    const thirdStar = rating.shadowRoot?.querySelector('re-icon[data-value="3"]') as HTMLElement
    thirdStar?.click()
    await rating.updateComplete
    expect(rating.value).toBe(0)

    rating.disabled = false
    rating.readonly = true
    await rating.updateComplete

    thirdStar?.click()
    await rating.updateComplete
    expect(rating.value).toBe(0)

    rating.remove()
  })
})
