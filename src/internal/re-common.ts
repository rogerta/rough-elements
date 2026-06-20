import { css } from 'lit'

export type VARIANTS = 'primary' | 'success' | 'neutral' | 'warning' | 'danger'

export type FILLSTYLE = 'hachure' | 'zigzag' | 'solid' | 'none'

export type BORDERSTYLE = 'rectangle' | 'circle' | 'none'

// Styles
//
// No need --re-<component>-font-family styles because those can always be set
// using `re-<component> { font-family: ... }`.

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
