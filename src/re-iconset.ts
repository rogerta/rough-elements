// Copyright 2026 ChildFIRST Authors
// Use of this source code is governed by the license in the LICENSE file.

// See https://fonts.google.com/icons

const icons = new Map<string, string>()
icons.set('back', 'm287-446.67 240 240L480-160 160-480l320-320 47 46.67-240 240h513v66.66H287Z')
icons.set('check', 'M379.33-244 154-469.33 201.67-517l177.66 177.67 378.34-378.34L805.33-670l-426 426Z')
icons.set('close', 'm251.33-204.67-46.66-46.66L433.33-480 204.67-708.67l46.66-46.66L480-526.67l228.67-228.66 46.66 46.66L526.67-480l228.66 228.67-46.66 46.66L480-433.33 251.33-204.67Z')
icons.set('dangerous', 'M330-120 120-330v-300l210-210h300l210 210v300L630-120H330Zm30-193.33 120-120 120 120L646.67-360l-120-120 120-120L600-646.67l-120 120-120-120L313.33-600l120 120-120 120L360-313.33Zm-2 126.66h244L773.33-358v-244L602-773.33H358L186.67-602v244L358-186.67ZM480-480Z')
icons.set('warning', 'm40-120 440-760 440 760H40Zm115.33-66.67h649.34L480-746.67l-324.67 560Zm351.17-60.95q9.5-9.61 9.5-23.83 0-14.22-9.62-23.72-9.61-9.5-23.83-9.5-14.22 0-23.72 9.62-9.5 9.62-9.5 23.83 0 14.22 9.62 23.72 9.62 9.5 23.83 9.5 14.22 0 23.72-9.62ZM449.33-352H516v-216h-66.67v216ZM480-466.67Z')

// Icons from fonts.google.com have a much larger view box than icons from
// polymer's iron-icons.  Any that are downloaded from the former should have
// their view box set here.
// TODO: stop using iron-icons above and use all from fonts.google.com to
// sumplify things.
const vewboxes = new Map<string, string>()

export function getIcon(id: string) {
  return icons.get(id)
}

export function getViewBox(id: string) {
  return vewboxes.get(id) ?? '0 -960 960 960'
}
