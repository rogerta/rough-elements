// Declation to map tag name to class name, useful for auto-completion in
// editors like vscode.  To use this file, add the following triple-slash
// comment to a project:
//
//  /// <reference types="@rough/rough-elements/src/global.d.ts" />

import * as rough from './rough-elements.ts'

declare global {
  interface HTMLElementTagNameMap {
    're-alert': rough.AlertElement,
    're-badge': rough.BadgeElement
    're-button': rough.ButtonElement
    're-card': rough.CardElement
    're-checkbox': rough.CheckboxElement
    're-details': rough.DetailsElement
    're-dialog': rough.DialogElement
    're-divider': rough.DividerElement
    're-dropdown': rough.DropdownElement
    're-icon-button': rough.IconButtonElement
    're-icon': rough.IconElement
    're-input': rough.InputElement
    're-item': rough.ItemElement
    're-menu-item': rough.MenuItemElement
    're-menu': rough.MenuElement
    're-panel-group': rough.PanelGroupElement
    're-progress': rough.ProgressElement
    're-radio': rough.RadioElement
    're-range': rough.RangeElement
    're-rating': rough.RatingElement
    're-select': rough.SelectElement,
    're-spinner': rough.SpinnerElement,
    're-tab-group': rough.TabGroupElement,
    're-textarea': rough.TextAreaElement,
  }
}
