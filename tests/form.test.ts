import { describe, expect, it, vi } from 'vitest'

// Importing the elements registers their custom element definitions.
import '../src/re-button.ts'
import '../src/re-checkbox.ts'
import '../src/re-input.ts'
import '../src/re-item.ts'
import '../src/re-radio.ts'
import '../src/re-range.ts'
import '../src/re-rating.ts'
import '../src/re-select.ts'
import '../src/re-textarea.ts'
import type { FormControlMixinInterface } from '../src/internal/re-form-control-mixin.ts'

/**
 * A form-associated control defined by this library.
 *
 * All such controls derived from `FormControlMixin`, and thus have the
 * `setFormValue()` method used to inform the browser of the element's
 * submission value.
 */
interface FormControl extends HTMLElement, FormControlMixinInterface {
  /** The value submitted by this control. */
  value: string | number | undefined
  /** True if checkbox-like control is checked. */
  checked: boolean
  /** The button type.  "submit" buttons submit thier form. */
  type: string
  updateComplete: Promise<unknown>
}

/** Creates a control with the given tag and name form attributes. */
function createControl(tag: string, name: string): FormControl {
  const el = document.createElement(tag) as FormControl
  el.setAttribute('name', name)
  return el
}

describe('form', () => {
  it('submits one entry with the expected value per form control', async () => {
    // Modeled on the <form> with id "form1" in index.html.  The `name`
    // attributes are important: per the HTML spec, a browser takes the
    // entry name of a form-associated custom element from the element's
    // `name` content attribute, and the entry value from the last value
    // passed to `setFormValue()`.
    const form = document.createElement('form')
    document.body.appendChild(form)

    const button = createControl('re-button', 'button')
    const checkbox = createControl('re-checkbox', 'checkbox')
    const input = createControl('re-input', 'input')
    input.setAttribute('pattern', 'a\\d+z')
    // Three radios, all with the same form name, as they form one group.
    const radio1 = createControl('re-radio', 'radio')
    radio1.value = '1'
    const radio2 = createControl('re-radio', 'radio')
    radio2.value = '2'
    const radio3 = createControl('re-radio', 'radio')
    radio3.value = '3'
    const range = createControl('re-range', 'range')
    range.setAttribute('min', '0')
    range.setAttribute('max', '100')
    range.setAttribute('step', '5')
    const rating = createControl('re-rating', 'rating')
    const select = createControl('re-select', 'select')
    for (let i = 0; i < 3; ++i) {
      const item = document.createElement('re-item')
      item.id = `item${i}`
      item.textContent = `Item ${i}`
      select.appendChild(item)
    }
    const textarea = createControl('re-textarea', 'textarea')

    const controls = [
      button,
      checkbox,
      input,
      radio1,
      radio2,
      radio3,
      range,
      rating,
      select,
      textarea,
    ]

    // Spy on `setFormValue()` before connecting the controls so that every
    // submission value they send to the browser is captured.  The browser
    // keeps the last value communicated this way as the element's
    // submission value.
    const spies = controls.map(c => vi.spyOn(c, 'setFormValue'))

    form.append(...controls)
    await Promise.all(controls.map(c => c.updateComplete))

    // The initial update of each control is complete.  Now set the data
    // each control should submit.
    button.type = 'submit'
    button.value = 'submit me'
    checkbox.checked = true
    input.value = 'a123z' // Matches the pattern above.
    radio2.checked = true
    range.value = 30
    rating.value = 4
    select.value = 'item2'
    textarea.value = 'Some words'
    await Promise.all(controls.map(c => c.updateComplete))

    // The submitted data is caught in a `FormData` object, like a `formdata`
    // event handler would.  Note that happy-dom does not implement the
    // formdata event nor, via `tests/setup.ts`, the Element.Internals used
    // by the controls.  So the browser side of the submission is emulated
    // here: for each form control, the entry name is taken from the
    // element's `name` attribute, and the entry value from the last value
    // passed to `setFormValue()`.  Elements which have not set a value, or
    // which have set it to null, are not submitted, just like a real
    // browser does.
    const submitted = new Promise<FormData>(resolve => {
      form.addEventListener('submit', e => {
        e.preventDefault()
        const data = new FormData()
        controls.forEach((c, i) => {
          const calls = spies[i].mock.calls
          const value = calls.at(-1)?.[0]
          if (value !== null && value !== undefined) {
            data.append(c.getAttribute('name')!, String(value))
          }
        })
        resolve(data)
      })
    })

    // Clicking the submit button submits the form.  Normally the browser
    // associates the button with the form at DOM insertion time.  This sets
    // the `form` field of the `ElementInternals` object as needed.  happy-dom
    // does not do this, so do it manually here, as done in re-button.test.ts.
    button.setFormForTesting(form)
    await button.click()

    const data = await submitted

    // Each control adds exactly one entry with the expected name and
    // value.  The three radios contribute only one entry for the checked
    // one, like a native radio group does.
    expect(data.get('button')).toBe('submit me')
    expect(data.get('checkbox')).toBe('on')
    expect(data.get('input')).toBe('a123z')
    expect(data.get('radio')).toBe('2')
    expect(data.get('range')).toBe('30')
    expect(data.get('rating')).toBe('4')
    expect(data.get('select')).toBe('item2')
    expect(data.get('textarea')).toBe('Some words')

    // There are no duplicate names at all.
    const names = [...data.keys()]
    expect(names.filter((n, i) => names.indexOf(n) !== i)).toEqual([])

    // Duplicates cannot be submitted either: the inner native controls
    // never carry a `name` attribute, and the form itself contains no
    // native form controls in the light DOM.
    for (const c of controls) {
      const inner = c.shadowRoot?.querySelectorAll('input, textarea, button')
      for (const el of inner ?? []) {
        expect(el.hasAttribute('name')).toBe(false)
      }
    }
    expect(form.querySelectorAll('input, textarea, button, select')).toHaveLength(0)

    form.remove()
  })
})
