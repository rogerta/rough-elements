import { describe, expect, it } from 'vitest'
import { addUserIcon, getIcon, getViewBox } from '../src/re-iconset.ts'

describe('re-iconset', () => {
  it('retrieves built-in icons and default viewBox', () => {
    const checkIcon = getIcon('check')
    expect(checkIcon).toBeDefined()
    expect(typeof checkIcon).toBe('string')

    const viewBox = getViewBox('check')
    expect(viewBox).toBe('0 -960 960 960')
  })

  it('returns undefined for non-existent icons', () => {
    expect(getIcon('non-existent-icon-123')).toBeUndefined()
  })

  it('adds and retrieves a user icon with custom viewBox', () => {
    const testPath = 'M0 0 H10 V10 H0 Z'
    addUserIcon('custom', 'my-box', testPath, '0 0 10 10')

    expect(getIcon('custom:my-box')).toBe(testPath)
    expect(getViewBox('custom:my-box')).toBe('0 0 10 10')
  })

  it('throws error when collection or id is empty', () => {
    expect(() => addUserIcon('', 'id', 'path')).toThrow(
      'collection and id must be non-empty strings',
    )
    expect(() => addUserIcon('coll', '', 'path')).toThrow(
      'collection and id must be non-empty strings',
    )
  })
})
