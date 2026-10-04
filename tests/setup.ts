/**
 * Vitest test setup for rough-elements web components in happy-dom.
 *
 * While happy-dom implements Custom Elements, Shadow DOM, and ResizeObserver,
 * it does not yet implement the Form-Associated Custom Elements (FACE) API,
 * specifically `HTMLElement.prototype.attachInternals()`.
 *
 * Form-associated components in rough-elements (such as re-button, re-input,
 * re-checkbox, re-select, etc.) inherit from FormControlMixin, which calls
 * `this.attachInternals()` in `connectedCallback()`. Without this shim, mounting
 * any of those components in happy-dom throws:
 *   "TypeError: this.attachInternals is not a function"
 */

if (typeof HTMLElement !== 'undefined'
  && !HTMLElement.prototype.attachInternals) {
  HTMLElement.prototype.attachInternals = function() {
    return {
      setFormValue: () => {},
      setValidity: () => {},
      checkValidity: () => true,
      reportValidity: () => true,
      validity: {
        badInput: false,
        customError: false,
        patternMismatch: false,
        rangeOverflow: false,
        rangeUnderflow: false,
        stepMismatch: false,
        tooLong: false,
        tooShort: false,
        typeMismatch: false,
        valid: true,
        valueMissing: false,
      },
      validationMessage: '',
      willValidate: true,
      form: null,
      labels: [] as unknown as NodeList,
      states: new Set(),
    } as unknown as ElementInternals
  }
}
