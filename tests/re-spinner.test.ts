import { describe, expect, it } from 'vitest'
import '../src/re-spinner.ts'
import type { SpinnerElement } from '../src/re-spinner.ts'

describe('re-spinner', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-spinner')).toBeDefined()
  })

  it('renders rough svg in shadow root', async () => {
    const el = document.createElement('re-spinner') as SpinnerElement
    document.body.appendChild(el)
    await el.updateComplete

    const roughSvg = el.shadowRoot?.querySelector('svg#rough')
    expect(roughSvg).not.toBeNull()

    el.remove()
  })
})
