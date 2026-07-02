import { css, html, nothing, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

import type { VARIANTS } from './internal/re-common.js'
import { ButtonBaseElement } from './internal/re-button-base.js'

import './re-icon.js'

/**
 * Buttons are interactive elements activated by the user with a mouse,
 * keyboard, finger, voice command, or other mechanism.  Once activated, the
 * button fires an event that tiggers an application specific action.
 *
 * Rough buttons can be used as popover element triggers.  See the
 * `setPopoverTarget()` method.
 *
 * To control the border and background refer to the Border & Background
 * documentation.  By default buttons have a solid background and a rectangle
 * border, except `varaiant=text` which have neither.
 *
 * ### Icon Buttons
 * An "icon button" is a common pattern that can be implemented  by placing a
 * single `<re-icon>` in the default slot and setting `circle` to true.  If no
 * border is desired, set `variant=text` as well.  For example:
 * ```
 * <re-button circle variant="text"><re-icon name="info"></re-icon></re-button>
 * ```
 * The button can be made larger or smaller by setting the `--size` CSS
 * property on the embedded `<re-icon>` element.  For example:
 * ```
 *   re-button[circle] re-icon {
 *     --size: 3rem;
 *   }
 *   re-button[circle][variant=text] {
 *     border-size: 0;  // Optionally, defaults to 0.5rem otherwise.
 *   }
 * ```
 *
 * `<re-button>` is meant as a drop in replacement for `<button>` or `<a>`.
 * */
@customElement('re-button')
export class ButtonElement extends ButtonBaseElement {
  static formAssociated = true

  /**
   * When not empty, the button behaves like an <a> element with the
   * specified value of `href`.  The default behaviour is to open the link
   * specified by `href` in the target window.
   */
  @property() href = ''

  /**
   * If `href` is not empty, specifies the target window to open the link.
   */
  @property() target = ''

  /**
   * If `href` is not empty, the browser will download the linked file to a
   * file named by this property.
   */
  @property() download = ''

  /**
   * If true, a caret `<re-icon>` will be suffixed to this button.  This is
   * mostly used internally to indicate that the button will open some kind of
   * submenu.
   */
  @property({ type: Boolean, reflect: true }) caret = false

  /**
   * If true the button will render with a round border instead of a rectangular
   * one.  Usually the default slot is filled with a single `<re-icon>`.
   */
  @property({ type: Boolean, reflect: true }) circle = false

  /**
   * A theme variant for the button, mostly affectings its colours.
   */
  @property({ reflect: true }) variant: VARIANTS | 'text' | '' = ''

  // Form specific properties.

  /**
   * The button type for form submissions. Use type `'submit'` to make this
   * button submit its associated form.
   */
  @property({}) type = 'button'

  /**
   * If this button is used to submit the form, the form's `action` is
   * overridden with this URL.
   */
  @property({}) formaction?: string

  /**
   * If this button is used to submit the form, the form's `enctype` is
   * overridden with this encoding type.
   */
  @property({}) formenctype?: string

  /**
   * If this button is used to submit the form, the form's `method` is
   * overridden with this method.
   */
  @property({}) formmethod = 'post'

  /**
   * If this button is used to submit the form, the form's `novalidate` is
   * overridden with this value.
   */
  @property({}) formnovalidate?: string

  /**
   * If this button is used to submit the form, the form's `target` is
   * overridden with this value.
   */
  @property({}) formtarget = '_self'

  /**
   * If this button is used to submit the form, this buttons `name` and `value`
   * are submitted with the form data.
   */
  @property({}) value?: string

  constructor() {
    super()
    this.fillStyle = 'solid'
  }

  /**
   * Sets this button to be a trigger for a popover element. The popover will
   * be displayed once the button finishes it's update cycle (that is, once
   * `updateComplete` promise resolves).
   *
   * `setPopoverTarget` is needed to allow targets from different shawdow root
   * boundaries to be used.
   *
   * @param target The popover element.  This element is expected to
   *    have the `popover` attribute.  It's anchor will be set this button.
   */
  setPopoverTarget(target: HTMLElement) {
    this.updateComplete.then(() => {
      const button = this.renderRoot.querySelector('button')
      if (button) {
        button.popoverTargetElement = target
      }
    })
  }

  handleEvent(e: Event) {
    switch (e.type) {
      case 'click':
        // If this is a submit button as part of a form, submit the form.
        if (this.type === 'submit') {
          if (this.name && this.value) {
            this.setFormValue(this.value)
          }

          // TODO: eventually the/a button should be passed to `submitForm()`
          // so that the submitter properties can be used.
          this.submitForm()
        }
        break
      default:
        super.handleEvent(e)
        break
    }
  }

  // Using willUpdate() instead of updated() to avoid a double update cycle.
  protected override willUpdate(props: PropertyValues) {
    super.willUpdate(props)

    if (props.has('variant') || props.has('circle')) {
      const isTextButton = this.variant === 'text'
      this.borderStyle = isTextButton ? 'none'
          : (this.circle ? 'circle' : 'rectangle')
      this.fillStyle = isTextButton || this.circle ? 'none' : 'solid'
    }
  }

  protected override renderCaretIfNeeded_() {
    return this.caret ? html`<re-icon name="keyboard-arrow-down"></re-icon>`
                      : nothing
  }

  static styles = [
    ...super.styles,
    css`
      :host(:not([variant=text])) {
        --text-transform: uppercase;
      }
      :host(:not([circle])) {
        padding: 0.25rem 0.5rem;
      }

      :host([variant=primary]) {
        color: white;
        --re-background-color: var(--re-primary-color);
        --button-text-shadow-color: white;
      }
      :host([variant=success]) {
        color: white;
        --re-background-color: var(--re-success-color);
        --button-text-shadow-color: white;
      }
      :host([variant=neutral]) {
        color: white;
        --re-background-color: var(--re-neutral-color);
        --button-text-shadow-color: white;
      }
      :host([variant=warning]) {
        color: white;
        --re-background-color: var(--re-warning-color);
        --button-text-shadow-color: white;
      }
      :host([variant=danger]) {
        color: white;
        --re-background-color: var(--re-danger-color);
        --button-text-shadow-color: white;
      }

      :host(:not([caret])) slot[name=suffix]::slotted(*) {
        margin-right: -0.25rem;
      }

      /* NOTE: an important side effect of setting the button display to flex is
       * that the browser does not add extra width and/or height due to
       * template whitespace nodes or descender gaps for inline-block. */
      button {
        text-transform: var(--text-transform);
      }

      :host([variant=text]:not([disabled]):focus-within) button {
        font-weight: bold;
      }

      /* Button press animation */
      :host([variant=text]:not([disabled]):active) button,
      :host([variant=text]:not([disabled]).is-active) button {
        transform: scale(0.9);
      }
    `,
  ]
}

declare global {
  interface HTMLElementTagNameMap {
    're-button': ButtonElement
  }
}
