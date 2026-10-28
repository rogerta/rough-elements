import { describe, expect, it, vi } from 'vitest'
import '../src/re-details.ts'
import type { DetailsElement } from '../src/re-details.ts'

describe('re-details', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-details')).toBeDefined()
  })

  it('renders default structure and slots', async () => {
    const details = document.createElement('re-details') as DetailsElement
    document.body.appendChild(details)
    await details.updateComplete

    expect(details.open).toBe(false)
    expect(details.disabled).toBe(false)
    expect(details.shadowRoot).not.toBeNull()

    const roughSvg = details.shadowRoot?.querySelector('svg#rough')
    expect(roughSvg).not.toBeNull()

    const innerDetails = details.shadowRoot?.querySelector(
      'details[part="details"]',
    )
    expect(innerDetails).not.toBeNull()

    const summary = innerDetails?.querySelector('summary[part="summary"]')
    expect(summary).not.toBeNull()

    const summarySlot = summary?.querySelector('slot[name="summary"]')
    expect(summarySlot).not.toBeNull()

    const markerSlot = summary?.querySelector('slot[name="marker"]')
    expect(markerSlot).not.toBeNull()
    const defaultMarker = markerSlot?.querySelector('re-icon')
    expect(defaultMarker?.getAttribute('name')).toBe('keyboard-arrow-right')

    const contentSlot = innerDetails?.querySelector('slot[part="content"]')
    expect(contentSlot).not.toBeNull()

    details.remove()
  })

  it('syncs open property with inner details element', async () => {
    const details = document.createElement('re-details') as DetailsElement
    document.body.appendChild(details)
    await details.updateComplete

    const innerDetails = details.shadowRoot?.querySelector(
      'details',
    ) as HTMLDetailsElement
    expect(innerDetails.open).toBe(false)

    details.open = true
    await details.updateComplete

    expect(details.hasAttribute('open')).toBe(true)
    expect(innerDetails.open).toBe(true)

    details.open = false
    await details.updateComplete

    expect(details.hasAttribute('open')).toBe(false)
    expect(innerDetails.open).toBe(false)

    details.remove()
  })

  it('dispatches toggle event when toggled', async () => {
    const details = document.createElement('re-details') as DetailsElement
    document.body.appendChild(details)
    await details.updateComplete

    const toggleSpy = vi.fn()
    details.addEventListener('toggle', toggleSpy)

    details.open = true
    await details.updateComplete

    expect(toggleSpy).toHaveBeenCalledTimes(1)
    const event = toggleSpy.mock.calls[0][0] as ToggleEvent
    expect(event.newState).toBe('open')
    expect(event.oldState).toBe('closed')
    expect(details.open).toBe(true)

    details.open = false
    await details.updateComplete

    expect(toggleSpy).toHaveBeenCalledTimes(2)
    const event2 = toggleSpy.mock.calls[1][0] as ToggleEvent
    expect(event2.newState).toBe('closed')
    expect(event2.oldState).toBe('open')
    expect(details.open).toBe(false)

    details.remove()
  })

  it('reflects disabled property and sets inert on summary', async () => {
    const details = document.createElement('re-details') as DetailsElement
    document.body.appendChild(details)
    await details.updateComplete

    const summary = details.shadowRoot?.querySelector('summary')
    expect(summary?.hasAttribute('inert')).toBe(false)

    details.disabled = true
    await details.updateComplete

    expect(details.hasAttribute('disabled')).toBe(true)
    expect(summary?.hasAttribute('inert')).toBe(true)

    details.remove()
  })
})
