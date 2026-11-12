// Base class for all elements that can submit data as part of a form.

import { css, type CSSResult } from 'lit'
import { property } from 'lit/decorators.js'

import { omitEmptyString } from './re-common.ts'
import { type LitElementWithStylesArray } from './re-element.ts'

// Typescript requires mixin ctors to use exactly one argument of type
// `any[]`, so ignore this error from deno lint.
// deno-lint-ignore no-explicit-any
type Constructor<T = Record<PropertyKey, never>> = new(...args: any[]) => T

export declare class FormControlMixinInterface {
  name: string
  formResetCallback(): void
  formDisabledCallback(disabled: boolean): void
  formStateRestoreCallback(
    state: FormData | File | string | null,
    reason: string,
  ): void
  protected onFormReset_(): void
  protected onFormDisabled_(disabled: boolean): void
  protected onFormStateRestore_(
    state: FormData | File | string | null,
    reason: string,
  ): void
  setFormValue(
    value: string | File | FormData | null,
    state?: string | File | FormData | null,
  ): void
  setValidity(
    flags: ValidityStateFlags,
    message?: string,
    anchor?: HTMLElement,
  ): void
  submitForm(submitter?: HTMLElement): void
  setFormForTesting(form: HTMLFormElement): void
}

/**
 * All rough elements that can submit values as part of a form derive from
 * this class.  It's expected that these element define the static
 * `formAssociated` boolean as `true`.
 *
 * When deriving from this class it is important to call the base class methods
 * `firstUdated()`, `updated()`, and `disconnectedCallback()` as needed.
 *
 * The base class must derive from LitElementWithStylesArray, which
 * guarantees that its static `styles` member is a `CSSResult[]` array.
 * TypeScript does not carry the static members of a class through the bare
 * constructor used to constrain the class, hence the cast used below to
 * access the base class' styles.  This is the same idiom used by
 * BackgroundMixin and BorderMixin.  See `LitElementWithStylesArray` for the
 * full explanation.
 *
 * @param superClass A class derived from LitElementWithStylesArray, for
 *    example ReElement, DropdownElement, or LitElementWithStylesArray
 *    itself.
 * @returns The mixin base class supporting form participation.
 */
export const FormControlMixin = <
  T extends Constructor<LitElementWithStylesArray>,
>(
  superClass: T,
) => {
  class MixinClass extends superClass {
    /**
     * Name used when this element is part of a form submission.  This must
     * be a non-empty string.
     *
     * The property is reflected to the `name` attribute of the element
     * because the browser takes the entry name of a form-associated custom
     * element from that attribute.  An empty name is not reflected so that
     * unnamed elements don't carry a `name` attribute.
     */
    @property({ reflect: true, converter: omitEmptyString })
    accessor name = ''

    private internals_?: ElementInternals

    private forForTesting_?: HTMLFormElement

    // The cast is needed because static members are not carried through the
    // bare constructor used to constrain the class.  It is guaranteed to be
    // true by the LitElementWithStylesArray base class of the constraint.
    static styles: CSSResult[] = [
      ...(superClass as unknown as typeof LitElementWithStylesArray).styles,
      css`
        /* Only applied when the element has been disabled by an ancestor
         * <fieldset> element, and not by its own disabled property. */
        :host([form-disabled]) {
          opacity: 0.5;
          pointer-events: none;
        }
      `,
    ]

    constructor(...args: any[]) {
      super(...args)
      this.internals_ = this.attachInternals()
    }

    /**
     * Lifecycle callback invoked by the browser when the form that owns
     * this element has been reset, either with a reset type button or with
     * the form's reset() method.  It is expected in response to restore the
     * element to its initial state.  This implementation delegates to
     * onFormReset_(), which elements with a value or a checked state
     * override.
     */
    formResetCallback(): void {
      this.onFormReset_()
    }

    /**
     * Lifecycle callback invoked by the browser when the disabled state of
     * this element changes for reasons other than its own disabled
     * property changing, most notably when an ancestor <fieldset> element
     * becomes disabled or enabled again.  This implementation delegates to
     * onFormDisabled_().
     */
    formDisabledCallback(disabled: boolean): void {
      this.onFormDisabled_(disabled)
    }

    /**
     * Lifecycle callback invoked by the browser when it restores the state
     * of this element, for example during history navigation, page reloads,
     * autofilling, and undo.  The state is the value passed to setFormValue()
     * as the state parameter, or the submission value if setFormValue() was
     * called without a state.  This implementation delegates to
     * onFormStateRestore_(), which elements with a value or a checked state
     * override.
     */
    formStateRestoreCallback(
      state: FormData | File | string | null,
      reason: string,
    ): void {
      this.onFormStateRestore_(state, reason)
    }

    /**
     * Restores the element to the state it had when it was first rendered.
     * The default implementation does nothing, which is appropriate for
     * elements like buttons that have no value to restore.
     */
    protected onFormReset_(): void {}

    /**
     * Makes the element's form-disabled state visible and blocks user
     * interaction with it, using the `form-disabled` attribute together
     * with the host styles defined by this mixin.  The element's own
     * `disabled` property is deliberately not changed because it belongs
     * to the author and because disabling by an ancestor <fieldset> does
     * not change the disabled property of native controls either.
     */
    protected onFormDisabled_(disabled: boolean): void {
      this.toggleAttribute('form-disabled', disabled)
    }

    /**
     * Restores the element from a state previously given to the browser
     * with setFormValue().  The default implementation does nothing, which
     * is appropriate for elements like buttons that have no state to
     * restore.
     */
    protected onFormStateRestore_(
      _state: FormData | File | string | null,
      _reason: string,
    ): void {}

    setFormValue(
      value: string | File | FormData | null,
      state?: string | File | FormData | null,
    ) {
      this.internals_?.setFormValue(value, state)
    }

    setValidity(
      flags: ValidityStateFlags,
      message?: string,
      anchor?: HTMLElement,
    ) {
      this.internals_?.setValidity(flags, message, anchor)
    }

    // Wrapper methods for element internals.

    protected get validity() {
      return this.internals_?.validity ?? {}
    }
    protected get validationMessage() {
      return this.internals_?.validationMessage
    }
    protected get willValidate() {
      return this.internals_?.willValidate
    }
    protected checkValidity() {
      return this.internals_?.checkValidity() ?? true
    }
    protected reportValidity() {
      return this.internals_?.reportValidity() ?? true
    }
    protected setCustomValidity(message: string) {
      if (message) {
        this.internals_?.setValidity({ customError: true }, message)
      } else {
        this.internals_?.setValidity({})
      }
    }

    setFormForTesting(form: HTMLFormElement) {
      this.forForTesting_ = form
    }

    /**
     * Submits the form if any.
     *
     * @param submitter The button that submitted the form, if any.
     * @returns True if there was a from to submit.
     */
    submitForm(submitter?: HTMLElement) {
      const form = this.forForTesting_ ?? this.internals_?.form
      form?.requestSubmit(submitter)
    }
  }
  // The cast through `unknown` is needed because the protected lifecycle
  // hooks declared in `FormControlMixinInterface` cannot be compared across
  // the mixin's structurally-unrelated class types.
  return MixinClass as unknown as Constructor<FormControlMixinInterface> & T
}
