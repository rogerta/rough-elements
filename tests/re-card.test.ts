import { describe, expect, it } from 'vitest'
import '../src/re-card.ts'
import type { CardElement } from '../src/re-card.ts'

describe('re-card', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-card')).toBeDefined()
  })

  it('renders rough svg and slots for image, header, body, footer', async () => {
    const card = document.createElement('re-card') as CardElement
    document.body.appendChild(card)
    await card.updateComplete

    expect(card.shadowRoot).not.toBeNull()
    const roughSvg = card.shadowRoot?.querySelector('svg#rough')
    expect(roughSvg).not.toBeNull()

    const imageSlot = card.shadowRoot?.querySelector('slot[name="image"]')
    const headerSlot = card.shadowRoot?.querySelector('slot[name="header"]')
    const bodySlot = card.shadowRoot?.querySelector('slot[part="body"]')
    const footerSlot = card.shadowRoot?.querySelector('slot[name="footer"]')

    expect(imageSlot).not.toBeNull()
    expect(headerSlot).not.toBeNull()
    expect(bodySlot).not.toBeNull()
    expect(footerSlot).not.toBeNull()

    card.remove()
  })

  it('inherits border and background mixin properties', async () => {
    const card = document.createElement('re-card') as CardElement
    document.body.appendChild(card)
    await card.updateComplete

    expect(card.borderStyle).toBe('rectangle')
    expect(card.fillStyle).toBe('none')

    card.borderStyle = 'none'
    card.fillStyle = 'solid'
    await card.updateComplete

    expect(card.borderStyle).toBe('none')
    expect(card.fillStyle).toBe('solid')

    card.remove()
  })
})
