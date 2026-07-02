import { LitElement, css, html, type PropertyValues } from 'lit'
import { property, query } from 'lit/decorators.js'
import rough from '@rogerta/roughjs'

import { STYLES } from './re-common.js'

export type Point = [number, number]
export type RoughCanvas = ReturnType<typeof rough.canvas>
export type RoughSVG = ReturnType<typeof rough.svg>
export type Config = NonNullable<Parameters<typeof rough.generator>[0]>
export type Options = NonNullable<Config['options']>
export type ResolvedOptions = Required<Options>

/**
 * Fires a custom event with the given type and detail.
 *
 * @param target The element firing the event (i.e. the element if the
 *    AT_TARGET bubbling phase).
 * @param type The event's type.
 * @param options `CustomEvent` initialazation options.
 *
 * @return False if the event is cancelable and at least one of the event
 *    handlers which received event called Event.preventDefault(). Otherwise
 *    true.
 */
export function fire<T>(
    target: EventTarget,
    type: string,
    options: CustomEventInit<T>={}) {
  return target.dispatchEvent(new CustomEvent(type, options))
}

// The baseclass for all rough elements.
//
// Some useful info that needs to be documented:
//
// --rough-z-index CSS prop sets the ordering of the rough elements.
/**
 * The base class for many rough elements.
 *
 * This class creates and manages the rough rendering of the element using
 * an SVG element.  This SVG element is a child in the rough element's shadow
 * DOM.  Subclasses are expected to overide `onResized()` in order to add rough
 * shapes to this SVG as part of the element's rendering.
 *
 * Any classes that derives directly or indirectly from `ReElement` must
 * remember to call the base class' `firstUpdated()` method or the rough
 * rendering will be incomplete.
 *
 * The `--rough-z-index` CSS property can be used to control where the SVG
 * element containing the rough rendering appears in the rendering order of
 * childen of this element.  By default the SVG element is an absolutely
 * positioned child with a `z-index` of -1.
 *
 * The SVG element is exposed as the "rough" part of the web component.  This
 * may be used for addiional style if needed.
 */
export class ReElement extends LitElement {
  @query('svg#rough', true) private svg_?: SVGSVGElement

  /**
   * Enables debugging in elements when the string is not undefined and not
   * emtpty.  When enabled, some rough elements will write debgging information
   * to `console.log`.
   */
  @property({}) enableDebugging?: string

  private observer_?: ResizeObserver
  private rough_?: RoughSVG
  private options_: Options = { seed: rough.newSeed() }

  protected get svg() { return this.svg_! }
  protected get rough(): RoughSVG {
    if (!this.rough_) {
      this.rough_ = rough.svg(this.svg_!)
    }
    return this.rough_!
  }

  protected get options(): Options { return this.options_ }

  override firstUpdated(_: PropertyValues) {
    if (!this.svg_) {
      throw new Error('No rough svg')
    }
    if (!this.rough) {
      throw new Error('Error creating roughness')
    }

    this.observer_ = new ResizeObserver(entries => {
      for (let _ of entries) {
        this.requestRoughRender()
      }
    })
    this.observer_.observe(this, {box: 'border-box'})
  }

  protected renderRoughSvg() {
    return html`
      <!-- The SVG element that contains the rough rendering of this
           element. -->
      <svg xmlns="http://www.w3.org/2000/svg" id="rough" part="rough"></svg>
    `
  }

  /**
   * This method is meant to be overidden by derived classes to render the
   * roughness.  An implementation of this method in a derived class should
   * call the base class' `onResized()` and append any of its own rough
   * primitives to the returned array and return the entire set.
   *
   * This method is called when the elements is first added to the DOM tree as
   * well as when the element is resized.  Derived classes should use the
   * arguments to render the appropraite roughness.
   *
   * All elements already in the rough SVG element will be removed and replaced
   * with newly returned elements.
   */
  protected onResized(
      _width: number,
      _height: number,
      _cstyles: CSSStyleDeclaration): SVGElement[] {
    return []
  }

  /**
   * Forces the element to immediately re-render its roughness.  The contents
   * of the rough SVG element are replaced.
   */
  protected requestRoughRender() {
    if (!this.svg_) {
      throw new Error('No rough svg')
    }

    const { width, height } = this.svg.getBoundingClientRect()
    const cstyles = getComputedStyle(this)
    const roughElements = this.onResized(width, height, cstyles)
    this.svg.replaceChildren(...roughElements)
  }

  static styles = [
    STYLES,
    css`
      :host {
        /* Make sure that z-index on #rough applies only within component */
        isolation: isolate;

        /* Make sure the browser will not draw any visible border even when
         * the border width is other than zero by setting it to solid transpent.
         * This is done so that the border-width CSS property can be used to
         * control the rough border width.  Without this trick, the computed
         * border width will always be zero regardless how it is specified in
         * CSS. */
        border-color: transparent;
        border-style: solid;

        /* Needed so that the svg's absolute position works. */
        position: relative;

        /* It's important that the element box sizing be border-box so that the
         * rough border is re-drawn when the element's border width changes.
         * Otherwise the resize observer would not get called. */
        box-sizing: border-box;
      }

      /* The svg element is positioned to covers the padding box of the host
       * element. Overflow is visible so the rough border (SVG sub-elements)
       * will can placed in the host's border box, which is outside the
       * padding box.  BY default, the svg is placed underneath the other
       * child elements using z-index. */
      #rough {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        height: 100%;
        inset: 0;
        overflow: visible;
        z-index: var(--rough-z-index, -1);
      }
    `]
}
