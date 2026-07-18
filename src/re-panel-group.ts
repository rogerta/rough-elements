import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/**
 * Panel Groups manage sets of elements (also called panels) ensuring that
 * only one is visible at a time.
 * ```html
 * <re-panel-group name="my-group" selected="panel1">
 *   <div data-id="panel1">...</div>
 *   <div data-id="panel2">...</div>
 *   <div data-id="panel3">...</div>
 * </re-panel-group>
 * ```
 * Each panel must have a `data-id` attribute whose value is unique in the
 * group.  Setting the `selected` property of the panel group to the `data-id`
 * value of a panel makes that panel visible and hides all others.
 *
 * Alternately, the panel group can be paired with a Tab Group that shares the
 * same name.  The tab group should have one Item for each panel, where the `id`
 * of the item matches the `data-id` of the panel.  Clicking on an item makes
 * the corresponding panel visible.  For example, here is a tab group that is
 * paired with the panel group above:
 * ```html
 * <re-tab-group name="my-group">
 *   <re-item id="panel1">...</re-item>
 *   <re-item id="panel2">...</re-item>
 *   <re-item id="panel3">...</re-item>
 * </re-tab-group>
 * ```
 * It's important that the panel and tab groups be in the same shadow root or
 * light DOM so that they can find each other.
 */
@customElement('re-panel-group')
export class PanelGroupElement extends LitElement {
  /**
   * The name of the panel group.  It must be unique within a given shadow
   * root or light DOM.
   */
  @property({}) accessor name = ''

  /**
   * The `data-id` of the panel that is currently visible.
   */
  @property({}) accessor selected = ''

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
        console.error('Panels should be HTML elements')
      }

      p.classList.toggle('re-hidden', id !== this.selected)
    })
  }
}
