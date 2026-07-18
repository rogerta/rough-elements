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
 * border, except `variant=text` which have neither.
 *
 * ### Icon Buttons
 * An "icon button" is a common pattern that can be implemented by placing a
 * single `<re-icon>` in the default slot and setting `circle` to true.  If no
 * border is desired, set `variant=text` as well.  For example:
 * ```
 * <re-button circle variant="text"><re-icon name="info"></re-icon></re-button>
 * ```
 * The button can be made larger or smaller by setting the `--size` CSS
 * property on the embedded `<re-icon>` element.  If `variant=text` is used
 * the border space can optionally be removed too.  For example:
 * ```
 *   re-button[circle] re-icon {
 *     --size: 3rem;
 *   }
 *   re-button[circle][variant=text] {
 *     border-width: 0;  // Optionally, defaults to 0.5rem otherwise.
 *   }
 * ```
 *
 * `<re-button>` is meant as a drop in replacement for `<button>` or `<a>`.
 *
 * @cssproperty --hover-shadow-color - The colour of shadow used when the
 *    button is hovered.
 * @cssproperty --color - The colour of the button body, which is often text.
 *    Defaults to `--forground-color`.
 * @cssproperty --re-input-font-family - The font family to use for the button
 *    text.  Defaults to `--font-sans-family`.
 */
@customElement('re-button')
export class ButtonElement extends ButtonBaseElement {
  static formAssociated = true

  /**
   * When not empty, the button behaves like an <a> element with the
   * specified value of `href`.  The default behaviour is to open the link
   * specified by `href` in the target window.
   */
  @property() accessor href = ''

  /**
   * If `href` is not empty, specifies the target window to open the link.
   */
  @property() accessor target = ''

  /**
   * If `href` is not empty, the browser will download the linked file to a
   * file named by this property.
   */
  @property() accessor download = ''

  /**
   * If true, a caret `<re-icon>` will be suffixed to this button.  This is
   * mostly used internally to indicate that the button will open some kind of
   * submenu.  It's color is taken from `--border-color`.
   */
  @property({ type: Boolean, reflect: true }) accessor caret = false

  /**
   * If true the button will render with a round border instead of a rectangular
   * one.  Usually the default slot is filled with a single `<re-icon>`.
   */
  @property({ type: Boolean, reflect: true }) accessor circle = false

  /**
   * A theme variant for the button, mostly affectings its colours.
   */
  @property({ reflect: true }) accessor variant: VARIANTS | 'text' = 'none'

  // Form specific properties.

  /**
   * The button type for form submissions. Use type `'submit'` to make this
   * button submit its associated form.
   */
  @property({}) accessor type = 'button'

  /**
   * If this button is used to submit the form, the form's `action` is
   * overridden with this URL.
   */
  @property({}) accessor formaction: string | undefined = undefined

  /**
   * If this button is used to submit the form, the form's `enctype` is
   * overridden with this encoding type.
   */
  @property({}) accessor formenctype: string | undefined = undefined

  /**
   * If this button is used to submit the form, the form's `method` is
   * overridden with this method.
   */
  @property({}) accessor formmethod = 'post'

  /**
   * If this button is used to submit the form, the form's `novalidate` is
   * overridden with this value.
   */
  @property({}) accessor formnovalidate: string | undefined = undefined

  /**
   * If this button is used to submit the form, the form's `target` is
   * overridden with this value.
   */
  @property({}) accessor formtarget = '_self'

  /**
   * If this button is used to submit the form, this buttons `name` and `value`
   * are submitted with the form data.
   */
  @property({}) accessor value: string | undefined = undefined

  constructor() {
    super()
    this.fillStyle = 'solid'
  }

  /**
   * Sets this button to be a trigger for a popover element. The popover will
   * be displayed once the button finishes it's update cycle (that is, once
   * the `updateComplete` promise resolves).
   *
   * `setPopoverTarget` is needed to allow targets from different shawdow root
   * boundaries to be used.
   *
   * @param target The popover element.  This element is expected to
   *    have the `popover` attribute.  It's anchor will be set this button.
   */
  setPopoverTarget(target: HTMLElement | null) {
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
    return this.caret
        ? html`
          <!-- The \`<re-icon>\` used for the caret, if any. See the
               \`caret\` property. -->
          <re-icon part="caret" name="keyboard-arrow-down"></re-icon>
        `
        : nothing
  }

  static styles = [
    ...super.styles,
    css`
      :host(:not([variant=text])) {
        color: var(--color);
        --re-background-color: rgb(from var(--foreground-color) R G B / 0.05);
      }
      :host(:not([circle])) {
        padding: 0.25rem 0.5rem;
      }

      :host([variant=primary]) {
        --re-background-color: var(--primary-color);
        --hover-shadow-color: var(--foreground-color);
      }
      :host([variant=success]) {
        --re-background-color: var(--success-color);
        --hover-shadow-color: var(--foreground-color);
      }
      :host([variant=neutral]) {
        --re-background-color: var(--neutral-color);
        --hover-shadow-color: var(--foreground-color);
      }
      :host([variant=warning]) {
        --re-background-color: var(--warning-color);
        --hover-shadow-color: var(--foreground-color);
      }
      :host([variant=danger]) {
        --re-background-color: var(--danger-color);
        --hover-shadow-color: var(--foreground-color);
      }

      :host(:not([caret])) slot[name=suffix]::slotted(*) {
        margin-right: -0.25rem;
      }

      /* NOTE: an important side effect of setting the button display to flex is
       * that the browser does not add extra width and/or height due to
       * template whitespace nodes or descender gaps for inline-block. */
      button {
        text-transform: uppercase;
      }

      re-icon[name=keyboard-arrow-down] {
        --color: var(--border-color);
      }

      /* This does not set the font-weight to bold since that affects the
       * width of the control, which is annoying. */
      :host([variant=text]:not([disabled]):focus-within) button {
        text-shadow: 0.5px 0 0 var(--foreground-color),
                    -0.5px 0 0 var(--foreground-color);
      }

      /* Button press animation */
      :host([variant=text]:not([disabled]):active) button,
      :host([variant=text]:not([disabled]).is-active) button {
        transform: scale(0.9);
      }
    `,
  ]
}
