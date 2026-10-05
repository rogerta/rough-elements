import { describe, expect, it } from 'vitest'
import '../src/re-divider.ts'
import type { DividerElement } from '../src/re-divider.ts'

describe('re-divider', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-divider')).toBeDefined()
  })

  it('renders rough svg in shadow root', async () => {
    const el = document.createElement('re-divider') as DividerElement
    document.body.appendChild(el)
    await el.updateComplete

    expect(el.vertical).toBe(false)
    expect(el.hasAttribute('vertical')).toBe(false)

    const roughSvg = el.shadowRoot?.querySelector('svg#rough')
    expect(roughSvg).not.toBeNull()

    el.remove()
  })

  it('reflects vertical property', async () => {
    const el = document.createElement('re-divider') as DividerElement
    document.body.appendChild(el)
    await el.updateComplete

    el.vertical = true
    await el.updateComplete

    expect(el.hasAttribute('vertical')).toBe(true)
    expect(el.vertical).toBe(true)

    el.vertical = false
    await el.updateComplete
    expect(el.hasAttribute('vertical')).toBe(false)

    el.remove()
  })
})
