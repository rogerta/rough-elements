import { describe, expect, it } from 'vitest'
import '../src/re-badge.ts'
import type { BadgeElement } from '../src/re-badge.ts'

describe('re-badge', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-badge')).toBeDefined()
  })

  it('renders with default variant', async () => {
    const el = document.createElement('re-badge') as BadgeElement
    document.body.appendChild(el)
    await el.updateComplete

    expect(el.variant).toBe('none')
    expect(el.fillStyle).toBe('solid')
    expect(el.shadowRoot).not.toBeNull()

    const roughSvg = el.shadowRoot?.querySelector('svg#rough')
    expect(roughSvg).not.toBeNull()

    const body = el.shadowRoot?.querySelector('slot[part=body]')
    expect(body).not.toBeNull()

    el.remove()
  })

  it('updates variant property', async () => {
    const el = document.createElement('re-badge') as BadgeElement
    document.body.appendChild(el)
    await el.updateComplete
    expect(el.getAttribute('variant')).toBe('none')

    el.variant = 'primary'
    await el.updateComplete
    expect(el.getAttribute('variant')).toBe('primary')

    el.remove()
  })
})
