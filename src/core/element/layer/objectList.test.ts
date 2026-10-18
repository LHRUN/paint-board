import { describe, expect, it } from 'vitest'
import {
  objectAtListIndex,
  objectListLabel,
  objectListRows,
  selectableAfterVisibilityChange,
  stackAfterListMove,
  textSnippet
} from './objectList'

describe('object list', () => {
  it('shows the front object first and marks the canvas selection', () => {
    const back = { id: 'back', type: 'path' }
    const front = { id: 'front', type: 'i-text', text: 'Hello' }
    const rows = objectListRows([back, front], [front])

    expect(rows.map((row) => row.key)).toEqual(['front', 'back'])
    expect(rows[0]).toMatchObject({
      labelKey: 'objectList.text',
      detail: 'Hello',
      selected: true,
      visible: true
    })
    expect(rows[1].selected).toBe(false)
  })

  it('labels brushes, shapes, and clipped text', () => {
    expect(objectListLabel({ type: 'path' }).labelKey).toBe('objectList.brush')
    expect(
      objectListLabel({ type: 'path', _customType: 'freehand' }).labelKey
    ).toBe('style.freehand')
    expect(
      objectListLabel({ type: 'path', _customType: 'freehandStroke' }).labelKey
    ).toBe('style.freehandStroke')
    expect(
      objectListLabel({ type: 'group', _customType: 'ink' }).labelKey
    ).toBe('style.ink')
    expect(objectListLabel({ _customType: 'shapeLine' }).labelKey).toBe(
      'objectList.line'
    )
    expect(
      objectListLabel({ type: 'group', _customType: 'group' }).labelKey
    ).toBe('objectList.group')
    expect(textSnippet('  one   two three four five  ')).toBe(
      'one two three fo…'
    )
    expect(objectListLabel({ type: 'i-text', text: '' }).detail).toBeUndefined()
  })

  it('treats a hidden object as not visible', () => {
    const hidden = { id: 'hidden', type: 'image', visible: false }
    expect(objectListRows([hidden], []).at(0)?.visible).toBe(false)
  })

  it('keeps non-text selectable on the prototype when shown', () => {
    expect(selectableAfterVisibilityChange('shapeLine', true, false)).toBe(
      undefined
    )
    expect(selectableAfterVisibilityChange(undefined, true, true)).toBe(
      undefined
    )
    expect(selectableAfterVisibilityChange('itext', true, false)).toBe(false)
    expect(selectableAfterVisibilityChange('itext', true, true)).toBe(true)
    expect(selectableAfterVisibilityChange('itext', false, true)).toBe(false)
  })

  it('maps a panel move back onto the canvas stack', () => {
    const stack = ['back', 'middle', 'front']
    expect(objectAtListIndex(stack, 0)).toBe('front')
    expect(stackAfterListMove(stack, 0, 2)).toEqual(['front', 'back', 'middle'])
    expect(stackAfterListMove(stack, 1, 1)).toBeNull()
    expect(stackAfterListMove(stack, -1, 0)).toBeNull()
  })
})
