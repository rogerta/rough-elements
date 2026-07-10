import { css } from 'lit'

export type VARIANTS = 'primary' | 'success' | 'neutral' | 'warning' | 'danger'

export type FILLSTYLE = 'hachure' | 'zigzag' | 'solid' | 'none'

export type BORDERSTYLE = 'rectangle' | 'circle' | 'none'

// Styles
//
// No need for --re-<component>-xxx styles because those can always be set
// using `re-<component> { xxx: ... }`.

export const STYLES = css`
  :host {
    --re-font-sans-family: "Noto Sans", sans-serif;
    --re-font-serif-family: "Noto Serif", serif;
    --re-font-mono-family: monospace;

    --re-font-size: 1rem;

    --re-input-font-family: var(--re-font-sans-family);
    --re-help-font-family: var(--re-font-sans-family);
    --re-label-font-family: var(--re-font-sans-family);

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
export function sleep(tmo: number) {
  return new Promise(resolve => setTimeout(resolve, tmo))
}
