// Base class for all elements that can submit data as part of a form.

import { LitElement, type PropertyValues } from 'lit'
import { property } from 'lit/decorators.js'

import { ReFormSubmissionController } from './re-form-sumbmission-controller.js'

type Constructor<T = {}> = new (...args: any[]) => T

export declare class FormControlInterface {
  name: string
  form: string
  getFormValue(): string | Blob | undefined
  submitForm(submitter?: HTMLElement): boolean
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

    /**
     * ID of the form that contains this control.  The form must be in the same
     * document or shadow root as the button.  If the ID is not specified or
     * if the form is not found, any containing `<form>` element is used.
     */
    @property({}) form = ''

    private controller_?: ReFormSubmissionController
    private form_: HTMLFormElement | null = null

    /**
     * Derived classes are expected to override this method and return the
     * value to be submitted as part of the form.
     *
     * @returns The value to submit as part of the form, or undefined if there
     *    is nothng to submit.
     */
    getFormValue(): string | Blob | undefined {
      throw new Error('A form control must override this method')
    }
    /**
     * Submits the form if any.
     *
     * @param submitter The button that submitted the form, if any.
     * @returns True if there was a from to submit.
     */
    submitForm(submitter?: HTMLElement) {
      this.form_?.requestSubmit(submitter)
      return this.form_ !== null
    }

    /**
     * Returns the form associated with this form control.  If `form`is the ID
     * of a valid HTML form element, it is returned.  Otherwise the closest
     * containing `<form>`is found.
     *
     * @returns The form associated with this form controlor `null` if none
     *    is found.
     */
    private findForm_() {
      const root = this.getRootNode()
      if (root instanceof ShadowRoot || root instanceof Document) {
        const form = root.getElementById(this.form)
        if (form?.tagName == 'form') {
          return form as HTMLFormElement
        }

        return this.closest('form')
      }

      return null
    }

    private shutdownController_() {
      if (this.controller_) {
        this.controller_.shutdown()
        this.controller_ = undefined
      }
    }

    private updateForm_(form: HTMLFormElement | null) {
      if (form !== this.form_) {
        if (this.form_) {
          this.shutdownController_()
        }

        this.form_ = form

        if (form) {
          this.controller_ = new ReFormSubmissionController(this, form)
        }
      }
    }

    override connectedCallback() {
      super.connectedCallback()
      this.updateForm_(this.findForm_())
    }

    override disconnectedCallback() {
      super.disconnectedCallback()
      this.updateForm_(null)
    }

    protected override firstUpdated(props: PropertyValues) {
      super.firstUpdated(props)
      this.updateForm_(this.findForm_())
    }

    protected override updated(props: PropertyValues) {
      super.updated(props)
      if (props.has('form')) {
        this.updateForm_(this.findForm_())
      }
    }
  }
  return MixinClass as Constructor<FormControlInterface> & T;
}
