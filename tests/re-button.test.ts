import { describe, expect, it, vi } from 'vitest'
import '../src/re-button.ts'
import '../src/re-icon.ts'
import type { ButtonElement } from '../src/re-button.ts'

describe('re-button', () => {
  it('registers custom element', () => {
    expect(customElements.get('re-button')).toBeDefined()
  })

  it('renders with default properties', async () => {
    const btn = document.createElement('re-button') as ButtonElement
    document.body.appendChild(btn)
    await btn.updateComplete

    expect(btn.disabled).toBe(false)
    expect(btn.name).toBe('')
    expect(btn.href).toBeUndefined()
    expect(btn.target).toBeUndefined()
    expect(btn.download).toBeUndefined()
    expect(btn.caret).toBe(false)
    expect(btn.circle).toBe(false)
    expect(btn.variant).toBe('none')
    expect(btn.type).toBe('button')
    expect(btn.formaction).toBeUndefined()
    expect(btn.formenctype).toBeUndefined()
    expect(btn.formmethod).toBe('post')
    expect(btn.formnovalidate).toBeUndefined()
    expect(btn.formtarget).toBe('_self')
    expect(btn.value).toBeUndefined()
    expect(btn.popovertarget).toBeUndefined()
    expect(btn.fillStyle).toBe('solid')

    const roughSvg = btn.shadowRoot?.querySelector('svg#rough')
    expect(roughSvg).not.toBeNull()

    const innerButton = btn.shadowRoot?.querySelector('button[part="button"]')
    expect(innerButton).not.toBeNull()

    const prefixSlot = btn.shadowRoot?.querySelector('slot[name="prefix"]')
    expect(prefixSlot).not.toBeNull()

    const mainSlot = btn.shadowRoot?.querySelector('slot#main')
    expect(mainSlot).not.toBeNull()

    const suffixSlot = btn.shadowRoot?.querySelector('slot[name="suffix"]')
    expect(suffixSlot).not.toBeNull()

    // No caret by default
    const caretIcon = btn.shadowRoot?.querySelector('re-icon[part="caret"]')
    expect(caretIcon).toBeNull()

    // No link by default
    const link = btn.shadowRoot?.querySelector('a')
    expect(link).toBeNull()

    btn.remove()
  })

  it('renders slot content and handles clicks', async () => {
    const btn = document.createElement('re-button') as ButtonElement
    btn.textContent = 'Click me'
    document.body.appendChild(btn)
    await btn.updateComplete

    const clickSpy = vi.fn()
    btn.addEventListener('click', clickSpy)

    await btn.click()
    expect(clickSpy).toHaveBeenCalledTimes(1)

    btn.remove()
  })

  // TODO: move this to re-button-base tests.
  it('reflects disabled property', async () => {
    const btn = document.createElement('re-button') as ButtonElement
    btn.disabled = true
    document.body.appendChild(btn)
    await btn.updateComplete

    expect(btn.hasAttribute('disabled')).toBe(true)
    expect(btn.disabled).toBe(true)

    const innerButton = btn.shadowRoot?.querySelector('button')
    expect(innerButton?.disabled).toBe(true)

    btn.remove()
  })

  it('supports popover target via togglePopover', async () => {
    const target = document.createElement('div')
    target.setAttribute('popover', 'auto')
    document.body.appendChild(target)
    const styles1 = getComputedStyle(target)
    expect(styles1.getPropertyValue('display')).toBe('none')

    const btn = document.createElement('re-button') as ButtonElement
    document.body.appendChild(btn)
    await btn.updateComplete

    await btn.setPopoverTarget(target)

    const isOpen = btn.togglePopover()
    expect(typeof isOpen).toBe('boolean')
    const styles = getComputedStyle(target)
    expect(styles.getPropertyValue('display')).toBe('block')

    btn.remove()
    target.remove()
  })

  it('supports popover target via click', async () => {
    const target = document.createElement('div')
    target.setAttribute('popover', 'auto')
    document.body.appendChild(target)
    const styles1 = getComputedStyle(target)
    expect(styles1.display).toBe('none')

    const btn = document.createElement('re-button') as ButtonElement
    document.body.appendChild(btn)
    await btn.setPopoverTarget(target)

    await btn.click()
    const styles = getComputedStyle(target)
    expect(styles.getPropertyValue('display')).toBe('block')

    btn.remove()
    target.remove()
  })

  it('supports popover target via attribute', async () => {
    const target = document.createElement('div')
    target.setAttribute('popover', 'auto')
    target.id = 'testPopover'
    document.body.appendChild(target)

    const btn = document.createElement('re-button') as ButtonElement
    document.body.appendChild(btn)
    btn.setAttribute('popovertarget', target.id)
    await btn.updateComplete

    btn.popovertarget = target.id
    await btn.updateComplete

    const isOpen = btn.togglePopover()
    expect(typeof isOpen).toBe('boolean')
    const styles = getComputedStyle(target)
    expect(styles.getPropertyValue('display')).toBe('block')

    btn.remove()
    target.remove()
  })

  it('submits the form when type is "submit"', async () => {
    const form = document.createElement('form')
    // Prevent actual navigation on submit.
    form.addEventListener('submit', (e) => e.preventDefault())
    document.body.appendChild(form)

    const btn = document.createElement('re-button') as ButtonElement
    btn.type = 'submit'
    btn.name = 'name'
    btn.value = 'value'

    // Normally, the browser would associate the button with the form at DOM
    // insertion time.  What this means for web components is that the `form`
    // field of the `ElementInternals` object is set as needed.  jsdom does
    // not do this, this do it manually here.
    btn.setFormForTesting(form)

    form.appendChild(btn)

    await btn.updateComplete

    const submitSpy = vi.fn()
    form.addEventListener('submit', submitSpy)

    await btn.click()

    expect(submitSpy).toHaveBeenCalledTimes(1)

    btn.remove()
    form.remove()
  })

  it('renders an <a> in shadow DOM when href is set, and click() fires exactly one click event', async () => {
    const btn = document.createElement('re-button') as ButtonElement
    btn.href = 'https://example.com'
    document.body.appendChild(btn)
    await btn.updateComplete

    // An <a> element should now exist in the shadow DOM.
    const link = btn.shadowRoot?.querySelector('a')
    expect(link).not.toBeNull()
    expect(link?.getAttribute('href')).toBe('https://example.com')

    // Intercept clicks on the inner <a> so the browser does not navigate,
    // and count how many times the outer <re-button> receives a click event.
    link?.addEventListener('click', (e) => e.preventDefault())

    const clickSpy = vi.fn()
    btn.addEventListener('click', clickSpy)

    await btn.click()

    // Exactly one click event should bubble up to the <re-button> host —
    // not two (one from the inner <button> and another retargeted from the <a>).
    expect(clickSpy).toHaveBeenCalledTimes(1)

    btn.remove()
  })

  it('renders a caret icon when the caret property is true', async () => {
    const btn = document.createElement('re-button') as ButtonElement
    btn.caret = true
    document.body.appendChild(btn)
    await btn.updateComplete

    const caretIcon = btn.shadowRoot?.querySelector('re-icon[part="caret"]')
    expect(caretIcon).not.toBeNull()
    expect(caretIcon?.getAttribute('name')).toBe('keyboard-arrow-down')

    btn.remove()
  })

  it('clicking a prefix slot <re-icon> fires a click event on <re-button>', async () => {
    const btn = document.createElement('re-button') as ButtonElement
    const icon = document.createElement('re-icon')
    icon.setAttribute('slot', 'prefix')
    icon.setAttribute('name', 'star')
    btn.appendChild(icon)
    document.body.appendChild(btn)
    await btn.updateComplete

    const clickSpy = vi.fn()
    btn.addEventListener('click', clickSpy)

    icon.click()

    expect(clickSpy).toHaveBeenCalledTimes(1)

    btn.remove()
  })

  it('clicking a suffix slot <re-icon> fires a click event on <re-button>', async () => {
    const btn = document.createElement('re-button') as ButtonElement
    const icon = document.createElement('re-icon')
    icon.setAttribute('slot', 'suffix')
    icon.setAttribute('name', 'star')
    btn.appendChild(icon)
    document.body.appendChild(btn)
    await btn.updateComplete

    const clickSpy = vi.fn()
    btn.addEventListener('click', clickSpy)

    icon.click()

    expect(clickSpy).toHaveBeenCalledTimes(1)

    btn.remove()
  })
})
