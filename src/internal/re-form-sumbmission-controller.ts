// A reactive controller that submits a value from its host during form
// submission.

import type { ReactiveController, ReactiveControllerHost } from 'lit'

//import { ReFormControlMixin } from './re-form-control-mixin.js'

interface FormControl {
  name: string
  getFormValue(): string | Blob | undefined
}

export type HostType = FormControl & ReactiveControllerHost

export class ReFormSubmissionController implements ReactiveController {
  host_: HostType
  form_: HTMLFormElement

  constructor(host: HostType, form: HTMLFormElement) {
    this.form_ = form
    this.host_ = host
    this.host_.addController(this)
    this.form_.addEventListener('formdata', this)
  }

  handleEvent(e: Event) {
    switch (e.type) {
      case 'formdata':
        const fde = e as FormDataEvent
        const name = this.host_.name
        if (name) {
          const value = this.host_.getFormValue()
          if (value !== undefined) {
            fde.formData.append(name, value)
          }
        }
        break
    }
  }

  shutdown() {
    this.host_.removeController(this)
  }

  hostConnected() {

  }

  hostDisconnected() {
  }

  hostUpdated() {
  }
}