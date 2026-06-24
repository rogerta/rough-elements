import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

// Set "hidden" class on element.  So embedder needs to set the required
// styles for this class.
/**
 * PanelGroup element groups a set of panels together and handles making only
 * the selected panel visible by toggling a `hidden` class on the panel child elements.
 */
@customElement('re-panel-group')
export class PanelGroupElement extends LitElement {
  @property({}) name = ''
  @property({}) selected = ''

  static styles = [
    css`
      :host {
        position: relative;
        display: grid;
        grid-template-areas: "main";
      }
      ::slotted(*) {
        grid-area: main;
      }
    `
  ]

  protected override firstUpdated(_: PropertyValues) {
    if (!this.name) {
      console.error('Panel groups must be named')
    }
    this.hideAllPanelsExceptSelected_()
  }

  protected override updated(props: PropertyValues) {
    if (props.has('selected')) {
      this.hideAllPanelsExceptSelected_()
    }
  }

  override render() {
    return html`
      <!-- The default slot representing the panel elements. -->
      <slot></slot>
    `
  }

  private hideAllPanelsExceptSelected_() {
    const slot = this.renderRoot.querySelector('slot')
    const panels = slot?.assignedElements()
    panels?.forEach(p => {
      const id = p instanceof HTMLElement ? p.dataset.id : undefined
      if (id === undefined) {
        console.error('Panel children should be HTML elements')
      }

      p.classList.toggle('hidden', id !== this.selected)
    })
  }
}

declare global {
  interface HTMLElementTagNameMap {
    're-panel-group': PanelGroupElement
  }
}
