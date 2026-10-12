import { describe, expect, it } from 'vitest'
import { canSnapshotTextChange } from './editingSnapshot'

describe('text change snapshots', () => {
  it('defers history while Fabric is still editing the text', () => {
    expect(canSnapshotTextChange([{ isEditing: true }])).toBe(false)
    expect(
      canSnapshotTextChange([{ isEditing: false }, { isEditing: true }])
    ).toBe(false)
  })

  it('records a change once editing has ended', () => {
    expect(canSnapshotTextChange([{ isEditing: false }])).toBe(true)
    expect(canSnapshotTextChange([{}])).toBe(true)
  })
})
