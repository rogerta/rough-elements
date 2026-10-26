import { describe, expect, it, vi } from 'vitest'
import '../src/re-textarea.ts'
import type { TextAreaElement } from '../src/re-textarea.ts'

describe('re-textarea', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-textarea')).toBeDefined()
  })

  it('renders native textarea inside shadow DOM', async () => {
    const ta = document.createElement('re-textarea') as TextAreaElement
    document.body.appendChild(ta)
    await ta.updateComplete

    const innerTextarea = ta.shadowRoot?.querySelector('textarea')
    expect(innerTextarea).not.toBeNull()
    expect(ta.value).toBe('')

    ta.remove()
  })

  it('syncs value and dispatches input and change events', async () => {
    const ta = document.createElement('re-textarea') as TextAreaElement
    document.body.appendChild(ta)
    await ta.updateComplete

    ta.value = 'line1\nline2'
    await ta.updateComplete

    const innerTextarea = ta.shadowRoot?.querySelector('textarea')
    expect(innerTextarea?.value).toBe('line1\nline2')

    const inputSpy = vi.fn()
    const changeSpy = vi.fn()
    ta.addEventListener('input', inputSpy)
    ta.addEventListener('change', changeSpy)

    innerTextarea?.dispatchEvent(
      new Event('input', { bubbles: true, composed: true }),
    )
    innerTextarea?.dispatchEvent(new Event('change', { bubbles: true }))

    expect(inputSpy).toHaveBeenCalledTimes(1)
    expect(changeSpy).toHaveBeenCalledTimes(1)

    ta.remove()
  })

  it('supports rows, cols and disabled properties', async () => {
    const ta = document.createElement('re-textarea') as TextAreaElement
    ta.rows = 4
    ta.cols = 40
    ta.disabled = true
    document.body.appendChild(ta)
    await ta.updateComplete

    const innerTextarea = ta.shadowRoot?.querySelector('textarea')
    // happy-dom returns attribute values as strings
    expect(innerTextarea?.getAttribute('rows')).toBe('4')
    expect(innerTextarea?.getAttribute('cols')).toBe('40')
    expect(innerTextarea?.disabled).toBe(true)

    ta.remove()
  })
})
