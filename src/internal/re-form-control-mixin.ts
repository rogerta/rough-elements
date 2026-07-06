// Base class for all elements that can submit data as part of a form.

import { LitElement, type PropertyValues } from 'lit'
import { property } from 'lit/decorators.js'

type Constructor<T = {}> = new (...args: any[]) => T

export declare class FormControlInterface {
  name: string
  setFormValue(
        value: string | File | FormData | null,
        state?: string | File | FormData | null): void
  setValidity(
        flags: ValidityStateFlags,
        message?: string,
        anchor?: HTMLElement): void
  submitForm(submitter?: HTMLElement): void
}

/**
 * All rough elements that can submit values as part of a form derive from
 * this class.
 *
 * When deriving from this class it is important to call the base class methods
 * `firstUdated()`, `updated()`, and `disconnectedCallback()` as needed.
 *
 * @param superClass Usually LitElement or ReElement.
 * @returns The mixin base class supporting form participation.
 */
export const ReFormControlMixin =
    <T extends Constructor<LitElement>>(superClass: T) => {
  class MixinClass extends superClass {
    /**
     * Name used when this button is part of a form submission.  This must
     * be a non-empty string.
     */
    @property({}) name = ''

    private internals_?: ElementInternals

    setFormValue(
        value: string | File | FormData | null,
        state?: string | File | FormData | null) {
      this.internals_?.setFormValue(value, state)
    }

    setValidity(
        flags: ValidityStateFlags,
        message?: string,
        anchor?: HTMLElement) {
      this.internals_?.setValidity(flags, message, anchor)
    }

    // Wrapper methods for element internals.

    protected get validity() { return this.internals_?.validity ?? {}}
    protected get validationMessage() { return this.internals_?.validationMessage }
    protected get willValidate() { return this.internals_?.willValidate }
    protected checkValidity() { return this.internals_?.checkValidity() ?? true }
    protected reportValidity() { return this.internals_?.reportValidity() ?? true }
    protected setCustomValidity(message: string) {
      if (message) {
        this.internals_?.setValidity({ customError: true }, message)
      } else {
        this.internals_?.setValidity({})
      }
    }

    /**
     * Submits the form if any.
     *
     * @param submitter The button that submitted the form, if any.
     * @returns True if there was a from to submit.
     */
    submitForm(submitter?: HTMLElement) {
      this.internals_?.form?.requestSubmit(submitter)
    }

    override connectedCallback() {
      super.connectedCallback()
      this.internals_ = this.attachInternals()
    }
  }
  return MixinClass as Constructor<FormControlInterface> & T;
}
