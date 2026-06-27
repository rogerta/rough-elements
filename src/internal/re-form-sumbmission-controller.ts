// A reactive controller that submits a value from its host during form
// submission.

import type { ReactiveController, ReactiveControllerHost } from 'lit'

//import { ReFormControlMixin } from './re-form-control-mixin.js'

export type HostType = /*typeof ReFormControlMixin &*/ ReactiveControllerHost

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
        console.log('formdata caught')
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