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

// Polyfill ToggleEvent for happy-dom if undefined
if (typeof ToggleEvent === 'undefined') {
  class ToggleEventPolyfill extends Event {
    oldState: string
    newState: string
    constructor(
      type: string,
      eventInitDict?: { oldState?: string; newState?: string; bubbles?: boolean; cancelable?: boolean },
    ) {
      super(type, eventInitDict)
      this.oldState = eventInitDict?.oldState ?? 'closed'
      this.newState = eventInitDict?.newState ?? 'open'
    }
  }
  // @@ts-expect-error polyfill
  globalThis.ToggleEvent = ToggleEventPolyfill
}

// Polyfill Popover API for happy-dom if undefined
if (typeof HTMLElement !== 'undefined') {
  const popoverOpenSet = new WeakSet<HTMLElement>()

  if (!HTMLElement.prototype.showPopover) {
    HTMLElement.prototype.showPopover = function() {
      if (!popoverOpenSet.has(this)) {
        popoverOpenSet.add(this)
        this.dispatchEvent(
          new ToggleEvent('toggle', {
            oldState: 'closed',
            newState: 'open',
          }),
        )
      }
    }
  }

  if (!HTMLElement.prototype.hidePopover) {
    HTMLElement.prototype.hidePopover = function() {
      if (popoverOpenSet.has(this)) {
        popoverOpenSet.delete(this)
        this.dispatchEvent(
          new ToggleEvent('toggle', {
            oldState: 'open',
            newState: 'closed',
          }),
        )
      }
    }
  }

  if (!HTMLElement.prototype.togglePopover) {
    HTMLElement.prototype.togglePopover = function(force?: boolean): boolean {
      const isOpen = popoverOpenSet.has(this)
      const shouldOpen = force !== undefined ? force : !isOpen
      if (shouldOpen) {
        this.showPopover()
        return true
      } else {
        this.hidePopover()
        return false
      }
    }
  }

  const origMatches = HTMLElement.prototype.matches
  // @@ts-expect-error polyfill for :popover-open
  HTMLElement.prototype.matches = function(selectors: string) {
    if (selectors === ':popover-open') {
      return popoverOpenSet.has(this)
    }
    return origMatches.call(this, selectors)
  }
}

// When using happy-dom, the document object belongs to the mocked window
// instance created by Happy DOM.  However, code that does
// `document instanceof Document` evaluates Document against Node's global
// scope (globalThis.Document), causing the check to fail.  To fix this,
// override the global Document constructor to be the same as the window's
// Document constructor.
// @ts-expect-error Deprecated
globalThis.Document = window.HTMLDocument
