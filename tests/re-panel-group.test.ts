import { describe, expect, it } from 'vitest'
import '../src/re-panel-group.ts'
import type { PanelGroupElement } from '../src/re-panel-group.ts'

describe('re-panel-group', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-panel-group')).toBeDefined()
  })

  it('renders default slot and has initial properties', async () => {
    const pg = document.createElement('re-panel-group') as PanelGroupElement
    pg.name = 'test-group'
    document.body.appendChild(pg)
    await pg.updateComplete

    expect(pg.name).toBe('test-group')
    expect(pg.selected).toBe('')

    const slot = pg.shadowRoot?.querySelector('slot')
    expect(slot).not.toBeNull()

    pg.remove()
  })

  it('hides all panels except the selected panel using re-hidden class', async () => {
    const pg = document.createElement('re-panel-group') as PanelGroupElement
    pg.name = 'tabs-group'
    pg.selected = 'panel1'

    const p1 = document.createElement('div')
    p1.dataset.id = 'panel1'
    p1.textContent = 'Panel 1 Content'

    const p2 = document.createElement('div')
    p2.dataset.id = 'panel2'
    p2.textContent = 'Panel 2 Content'

    const p3 = document.createElement('div')
    p3.dataset.id = 'panel3'
    p3.textContent = 'Panel 3 Content'

    pg.appendChild(p1)
    pg.appendChild(p2)
    pg.appendChild(p3)

    document.body.appendChild(pg)
    await pg.updateComplete

    expect(p1.classList.contains('re-hidden')).toBe(false)
    expect(p2.classList.contains('re-hidden')).toBe(true)
    expect(p3.classList.contains('re-hidden')).toBe(true)

    // Switch selected panel to panel2
    pg.selected = 'panel2'
    await pg.updateComplete

    expect(p1.classList.contains('re-hidden')).toBe(true)
    expect(p2.classList.contains('re-hidden')).toBe(false)
    expect(p3.classList.contains('re-hidden')).toBe(true)

    // Switch to nonexistent panel
    pg.selected = 'nonexistent'
    await pg.updateComplete

    expect(p1.classList.contains('re-hidden')).toBe(true)
    expect(p2.classList.contains('re-hidden')).toBe(true)
    expect(p3.classList.contains('re-hidden')).toBe(true)

    pg.remove()
  })
})
