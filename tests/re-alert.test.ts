import { describe, expect, it, vi } from 'vitest'
import '../src/re-alert.ts'
import type { AlertElement } from '../src/re-alert.ts'

describe('re-alert', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-alert')).toBeDefined()
  })

  it('renders with default properties', async () => {
    const alert = document.createElement('re-alert') as AlertElement
    document.body.appendChild(alert)
    await alert.updateComplete

    expect(alert.open).toBe(false)
    expect(alert.closable).toBe(false)
    expect(alert.variant).toBe('primary')
    expect(alert.duration).toBe(Infinity)
    expect(alert.fillStyle).toBe('hachure')

    const roughSvg = alert.shadowRoot?.querySelector('svg#rough')
    expect(roughSvg).not.toBeNull()

    const icon = alert.shadowRoot?.querySelector('re-icon[part="icon"]')
    expect(icon?.getAttribute('name')).toBe('info')

    const messageSlot = alert.shadowRoot?.querySelector('slot[part="message"]')
    expect(messageSlot).not.toBeNull()

    // No close button by default
    const closeBtn = alert.shadowRoot?.querySelector(
      're-icon-button[part="button"]',
    )
    expect(closeBtn).toBeNull()

    alert.remove()
  })

  it('updates icon based on variant', async () => {
    const alert = document.createElement('re-alert') as AlertElement
    document.body.appendChild(alert)

    const variants = [
      { variant: 'danger' as const, icon: 'dangerous' },
      { variant: 'success' as const, icon: 'check-circle' },
      { variant: 'warning' as const, icon: 'warning' },
      { variant: 'neutral' as const, icon: 'info' },
      { variant: 'primary' as const, icon: 'info' },
    ]

    for (const { variant, icon } of variants) {
      alert.variant = variant
      await alert.updateComplete
      const iconEl = alert.shadowRoot?.querySelector('re-icon[part="icon"]')
      expect(iconEl?.getAttribute('name')).toBe(icon)
    }

    alert.remove()
  })

  it('shows and hides via property and methods', async () => {
    const alert = document.createElement('re-alert') as AlertElement
    document.body.appendChild(alert)
    await alert.updateComplete

    expect(alert.open).toBe(false)
    expect(alert.hasAttribute('open')).toBe(false)

    alert.show()
    await alert.updateComplete
    expect(alert.open).toBe(true)
    expect(alert.hasAttribute('open')).toBe(true)

    alert.hide()
    await alert.updateComplete
    expect(alert.open).toBe(false)
    expect(alert.hasAttribute('open')).toBe(false)

    alert.remove()
  })

  it('renders close button when closable and closes on click', async () => {
    const alert = document.createElement('re-alert') as AlertElement
    alert.closable = true
    alert.open = true
    document.body.appendChild(alert)
    await alert.updateComplete

    const closeBtn = alert.shadowRoot?.querySelector(
      're-icon-button[part="button"]',
    ) as HTMLElement
    expect(closeBtn).not.toBeNull()
    expect(closeBtn.getAttribute('name')).toBe('close')

    closeBtn.click()
    await alert.updateComplete

    expect(alert.open).toBe(false)

    alert.remove()
  })

  it('supports toast() workflow and stack cleanup', async () => {
    const alert = document.createElement('re-alert') as AlertElement
    document.body.appendChild(alert)
    await alert.updateComplete

    alert.toast()
    await alert.updateComplete

    const stack = document.getElementById('reToastStack')
    expect(stack).not.toBeNull()
    expect(alert.parentElement).toBe(stack)
    expect(alert.open).toBe(true)
    expect(alert.duration).toBe(3000)

    alert.hide()
    await alert.updateComplete
    expect(alert.parentElement).toBeNull()

    stack?.remove()
  })

  it('automatically hides after duration expires', async () => {
    vi.useFakeTimers()
    const alert = document.createElement('re-alert') as AlertElement
    alert.open = true
    alert.duration = 500
    document.body.appendChild(alert)
    await alert.updateComplete

    expect(alert.open).toBe(true)

    vi.advanceTimersByTime(500)
    await alert.updateComplete

    expect(alert.open).toBe(false)

    alert.remove()
    vi.useRealTimers()
  })
})
