import { describe, expect, it, vi } from 'vitest'
import '../src/re-tab-group.ts'
import type { TabGroupElement } from '../src/re-tab-group.ts'
import '../src/re-panel-group.ts'
import type { PanelGroupElement } from '../src/re-panel-group.ts'
import '../src/re-item.ts'
import type { ItemElement } from '../src/re-item.ts'

describe('re-tab-group', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-tab-group')).toBeDefined()
  })

  it('renders default slot and divider indicator', async () => {
    const tabGroup = document.createElement('re-tab-group') as TabGroupElement
    tabGroup.name = 'my-tabs'
    document.body.appendChild(tabGroup)
    await tabGroup.updateComplete

    expect(tabGroup.name).toBe('my-tabs')
    expect(tabGroup.selected).toBe('')
    expect(tabGroup.getAttribute('tabindex')).toBe('0')

    const slot = tabGroup.shadowRoot?.querySelector('slot')
    expect(slot).not.toBeNull()

    const indicator = tabGroup.shadowRoot?.querySelector(
      're-divider[part="indicator"]',
    )
    expect(indicator).not.toBeNull()

    tabGroup.remove()
  })

  it('automatically selects first tab if selected is not specified', async () => {
    const tabGroup = document.createElement('re-tab-group') as TabGroupElement
    tabGroup.name = 'auto-first'

    const tab1 = document.createElement('re-item') as ItemElement
    tab1.id = 'tab1'
    tab1.textContent = 'Tab 1'

    const tab2 = document.createElement('re-item') as ItemElement
    tab2.id = 'tab2'
    tab2.textContent = 'Tab 2'

    tabGroup.appendChild(tab1)
    tabGroup.appendChild(tab2)

    document.body.appendChild(tabGroup)
    await tabGroup.updateComplete

    expect(tabGroup.selected).toBe('tab1')
    expect(tab1.classList.contains('selected')).toBe(true)
    expect(tab2.classList.contains('selected')).toBe(false)

    const indicator = tabGroup.shadowRoot?.querySelector(
      're-divider[part="indicator"]',
    ) as HTMLElement
    expect(indicator.style.gridColumn).toBe('1')

    tabGroup.remove()
  })

  it('updates selected tab and indicator on click and fires change event', async () => {
    const tabGroup = document.createElement('re-tab-group') as TabGroupElement
    tabGroup.name = 'click-group'

    const tab1 = document.createElement('re-item') as ItemElement
    tab1.id = 'tab1'
    tab1.textContent = 'Tab 1'

    const tab2 = document.createElement('re-item') as ItemElement
    tab2.id = 'tab2'
    tab2.textContent = 'Tab 2'

    tabGroup.appendChild(tab1)
    tabGroup.appendChild(tab2)

    document.body.appendChild(tabGroup)
    await tabGroup.updateComplete

    const changeSpy = vi.fn()
    tabGroup.addEventListener('change', changeSpy)

    const slot = tabGroup.shadowRoot?.querySelector('slot')
    const clickEvent = new MouseEvent('click', { bubbles: true,
      composed: true })
    Object.defineProperty(clickEvent, 'target', { value: tab2 })
    slot?.dispatchEvent(clickEvent)
    await tabGroup.updateComplete

    expect(changeSpy).toHaveBeenCalledTimes(1)
    expect(tabGroup.selected).toBe('tab2')
    expect(tab2.classList.contains('selected')).toBe(true)
    expect(tab1.classList.contains('selected')).toBe(false)

    const indicator = tabGroup.shadowRoot?.querySelector(
      're-divider[part="indicator"]',
    ) as HTMLElement
    expect(indicator.style.gridColumn).toBe('2')

    tabGroup.remove()
  })

  it('synchronizes selected state with paired re-panel-group', async () => {
    const tabGroup = document.createElement('re-tab-group') as TabGroupElement
    tabGroup.setAttribute('name', 'shared-name')
    tabGroup.selected = 'p1'

    const tab1 = document.createElement('re-item') as ItemElement
    tab1.id = 'p1'
    const tab2 = document.createElement('re-item') as ItemElement
    tab2.id = 'p2'
    tabGroup.appendChild(tab1)
    tabGroup.appendChild(tab2)

    const panelGroup = document.createElement(
      're-panel-group',
    ) as PanelGroupElement
    panelGroup.setAttribute('name', 'shared-name')

    const p1 = document.createElement('div')
    p1.dataset.id = 'p1'
    const p2 = document.createElement('div')
    p2.dataset.id = 'p2'
    panelGroup.appendChild(p1)
    panelGroup.appendChild(p2)

    document.body.appendChild(panelGroup)
    document.body.appendChild(tabGroup)
    await tabGroup.updateComplete
    await panelGroup.updateComplete

    expect(panelGroup.selected).toBe('p1')
    expect(p1.classList.contains('re-hidden')).toBe(false)
    expect(p2.classList.contains('re-hidden')).toBe(true)

    const slot = tabGroup.shadowRoot?.querySelector('slot')
    const clickEvent = new MouseEvent('click', { bubbles: true,
      composed: true })
    Object.defineProperty(clickEvent, 'target', { value: tab2 })
    slot?.dispatchEvent(clickEvent)
    await tabGroup.updateComplete
    await panelGroup.updateComplete

    expect(panelGroup.selected).toBe('p2')
    expect(p1.classList.contains('re-hidden')).toBe(true)
    expect(p2.classList.contains('re-hidden')).toBe(false)

    tabGroup.remove()
    panelGroup.remove()
  })

  it('navigates tabs with keyboard arrow keys and fires input event', async () => {
    const tabGroup = document.createElement('re-tab-group') as TabGroupElement
    tabGroup.name = 'keyboard-group'

    const tab1 = document.createElement('re-item') as ItemElement
    tab1.id = 't1'
    const tab2 = document.createElement('re-item') as ItemElement
    tab2.id = 't2'
    const tab3 = document.createElement('re-item') as ItemElement
    tab3.id = 't3'
    tab3.disabled = true

    tabGroup.appendChild(tab1)
    tabGroup.appendChild(tab2)
    tabGroup.appendChild(tab3)

    document.body.appendChild(tabGroup)
    await tabGroup.updateComplete

    const inputSpy = vi.fn()
    tabGroup.addEventListener('input', inputSpy)

    // ArrowRight navigates to t2
    tabGroup.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await tabGroup.updateComplete

    expect(tabGroup.selected).toBe('t2')
    expect(inputSpy).toHaveBeenCalledTimes(1)

    // ArrowRight skips disabled t3; stays on t2
    tabGroup.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }))
    await tabGroup.updateComplete

    expect(tabGroup.selected).toBe('t2')

    // ArrowLeft navigates back to t1
    tabGroup.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
    await tabGroup.updateComplete

    expect(tabGroup.selected).toBe('t1')
    expect(inputSpy).toHaveBeenCalledTimes(2)

    tabGroup.remove()
  })
})
