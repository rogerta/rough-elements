import { describe, expect, it, vi } from 'vitest'
import '../src/re-dialog.ts'
import type { DialogElement } from '../src/re-dialog.ts'

describe('re-dialog', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-dialog')).toBeDefined()
  })

  it('renders with default structure and slots', async () => {
    const dialog = document.createElement('re-dialog') as DialogElement
    document.body.appendChild(dialog)
    await dialog.updateComplete

    expect(dialog.closedby).toBe('any')
    expect(dialog.open).toBe(false)

    const innerDialog = dialog.shadowRoot?.querySelector(
      'dialog[part="dialog"]',
    )
    expect(innerDialog).not.toBeNull()

    const card = innerDialog?.querySelector('re-card[part="card"]')
    expect(card).not.toBeNull()

    const titleSlot = card?.querySelector('slot[name="title"]')
    expect(titleSlot).not.toBeNull()

    const actionsSlot = card?.querySelector('slot[name="actions"]')
    expect(actionsSlot).not.toBeNull()

    const defaultCloseBtn = actionsSlot?.querySelector(
      're-icon-button[name="close"]',
    )
    expect(defaultCloseBtn).not.toBeNull()

    const footerSlot = card?.querySelector('slot[name="footer"]')
    expect(footerSlot).not.toBeNull()

    dialog.remove()
  })

  it('opens dialog with showModal and reflects open getter', async () => {
    const dialog = document.createElement('re-dialog') as DialogElement
    document.body.appendChild(dialog)
    await dialog.updateComplete

    expect(dialog.open).toBe(false)

    dialog.showModal()
    await dialog.updateComplete

    expect(dialog.open).toBe(true)

    dialog.requestClose()
    await dialog.updateComplete

    expect(dialog.open).toBe(false)

    dialog.remove()
  })

  it('dispatches cancel and close events on requestClose', async () => {
    const dialog = document.createElement('re-dialog') as DialogElement
    document.body.appendChild(dialog)
    await dialog.updateComplete

    const cancelSpy = vi.fn()
    const closeSpy = vi.fn()
    dialog.addEventListener('cancel', cancelSpy)
    dialog.addEventListener('close', closeSpy)

    dialog.showModal()
    await dialog.updateComplete

    dialog.requestClose()
    await dialog.updateComplete

    expect(cancelSpy).toHaveBeenCalledTimes(1)
    expect(closeSpy).toHaveBeenCalledTimes(1)
    expect(dialog.open).toBe(false)

    dialog.remove()
  })

  it('prevents dialog from closing if cancel event is canceled', async () => {
    const dialog = document.createElement('re-dialog') as DialogElement
    document.body.appendChild(dialog)
    await dialog.updateComplete

    dialog.addEventListener('cancel', e => e.preventDefault())

    dialog.showModal()
    await dialog.updateComplete

    dialog.requestClose()
    await dialog.updateComplete

    expect(dialog.open).toBe(true)

    dialog.remove()
  })

  it('clicking default close button triggers requestClose', async () => {
    const dialog = document.createElement('re-dialog') as DialogElement
    document.body.appendChild(dialog)
    await dialog.updateComplete

    dialog.showModal()
    await dialog.updateComplete
    expect(dialog.open).toBe(true)

    const closeBtn = dialog.shadowRoot?.querySelector(
      'slot[name="actions"] re-icon-button[name="close"]',
    ) as HTMLElement
    closeBtn.click()
    await dialog.updateComplete

    expect(dialog.open).toBe(false)

    dialog.remove()
  })
})
