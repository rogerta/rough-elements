import { describe, expect, it } from 'vitest'
import '../src/re-icon.ts'
import type { IconElement } from '../src/re-icon.ts'

describe('re-icon', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-icon')).toBeDefined()
  })

  it('renders rough svg in shadow root', async () => {
    const icon = document.createElement('re-icon') as IconElement
    document.body.appendChild(icon)
    await icon.updateComplete

    expect(icon.name).toBe('')
    expect(icon.shadowRoot).not.toBeNull()

    const roughSvg = icon.shadowRoot?.querySelector('svg#rough')
    expect(roughSvg).not.toBeNull()

    icon.remove()
  })

  it('updates name property and reflects attribute', async () => {
    const icon = document.createElement('re-icon') as IconElement
    document.body.appendChild(icon)
    await icon.updateComplete

    icon.name = 'check'
    await icon.updateComplete

    expect(icon.getAttribute('name')).toBe('check')
    expect(icon.name).toBe('check')

    icon.remove()
  })
})
