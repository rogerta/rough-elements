import { type ComplexAttributeConverter, css, CSSResult } from 'lit'

export type VARIANTS = 'primary' | 'success' | 'neutral' | 'warning' | 'danger'
  | 'none'

export type FILLSTYLE = 'hachure' | 'zigzag' | 'solid' | 'none'

export type BORDERSTYLE = 'rectangle' | 'circle' | 'none'

// Styles
//
// No need for --re-<component>-xxx styles because those can always be set
// using `re-<component> { xxx: ... }`.

export const STYLES: CSSResult = css`
  :host {
    --re-input-font-family: var(--font-sans-family);
    --re-help-font-family: var(--font-sans-family);
    --re-label-font-family: var(--font-sans-family);

    --color: var(currentcolor, ButtonText);
    --re-input-background-color: var(--background-color, ButtonFace);
  }
`

/**
 * Causes the caller to sleep for the specified number of msec.  The caller
 * is expected to await om this function.
 *
 * @param tmo The amount of time to sleep in msec.
 * @returns A promise tha resolves with void after `tmo` msecs.
 */
export function sleep(tmo: number): Promise<unknown> {
  return new Promise(resolve => setTimeout(resolve, tmo))
}

/**
 * A converter for properties that reflects the value to an attribute
 * unless the value is the empty string.  Lit removes the attribute when
 * the toAttribute function returns null.  Use this for enumerated
 * attributes for which an explicitly specified empty value is not valid
 * or not meaningful, like `name` or `autocomplete`.
 */
export const omitEmptyString: ComplexAttributeConverter = {
  toAttribute(value: unknown): string | null {
    return typeof value === 'string' && value !== '' ? value : null
  },
}
