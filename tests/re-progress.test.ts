import { describe, expect, it } from 'vitest'
import '../src/re-progress.ts'
import type { ProgressElement } from '../src/re-progress.ts'

describe('re-progress', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-progress')).toBeDefined()
  })

  it('renders default structure and initial property values', async () => {
    const progress = document.createElement('re-progress') as ProgressElement
    document.body.appendChild(progress)
    await progress.updateComplete

    expect(progress.min).toBe(0)
    expect(progress.max).toBe(1)
    expect(progress.value).toBeUndefined()
    expect(progress.showvalue).toBe(false)
    expect(progress.fillStyle).toBe('zigzag')
    expect(progress.fillFraction).toBe(0)

    const roughSvg = progress.shadowRoot?.querySelector('svg#rough')
    expect(roughSvg).not.toBeNull()

    const label = progress.shadowRoot?.querySelector('div[part="label"]')
    expect(label).not.toBeNull()
    expect(label?.textContent).toBe('')

    progress.remove()
  })

  it('clamps value between min and max', async () => {
    const progress = document.createElement('re-progress') as ProgressElement
    progress.min = 10
    progress.max = 50
    progress.value = 5 // below min
    document.body.appendChild(progress)
    await progress.updateComplete

    expect(progress.value).toBe(10)
    expect(progress.fillFraction).toBe(0)

    progress.value = 60 // above max
    await progress.updateComplete

    expect(progress.value).toBe(50)
    expect(progress.fillFraction).toBe(1)

    progress.remove()
  })

  it('updates fillFraction based on value, min and max', async () => {
    const progress = document.createElement('re-progress') as ProgressElement
    progress.min = 0
    progress.max = 100
    progress.value = 25
    document.body.appendChild(progress)
    await progress.updateComplete

    expect(progress.fillFraction).toBe(0.25)

    progress.value = 75
    await progress.updateComplete

    expect(progress.fillFraction).toBe(0.75)

    progress.remove()
  })

  it('renders numeric label when showvalue is true and updates styling across 50% boundary', async () => {
    const progress = document.createElement('re-progress') as ProgressElement
    progress.min = 0
    progress.max = 100
    progress.showvalue = true
    progress.value = 20
    document.body.appendChild(progress)
    await progress.updateComplete

    const label = progress.shadowRoot?.querySelector(
      'div[part="label"]',
    ) as HTMLElement
    expect(label.textContent).toBe('20.0')
    expect(label.style.marginLeft).toBe('21%')
    expect(label.style.marginRight).toBe('auto')
    expect(label.style.color).toBe('var(--label-lower-color)')

    // Cross 50% threshold
    progress.value = 80
    await progress.updateComplete

    expect(label.textContent).toBe('80.0')
    expect(label.style.marginLeft).toBe('auto')
    expect(label.style.marginRight).toBe('21%')
    expect(label.style.color).toBe('var(--label-upper-color)')

    progress.remove()
  })
})
