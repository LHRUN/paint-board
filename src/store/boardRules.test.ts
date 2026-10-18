import { describe, expect, it } from 'vitest'
import { boardTitleIssue, idsToDelete } from './boardRules'

describe('board title rules', () => {
  it('rejects an empty name and a name another board already uses', () => {
    expect(boardTitleIssue('  ', ['Sketch'])).toBe('empty')
    expect(boardTitleIssue(' Sketch ', ['Sketch'])).toBe('duplicate')
    expect(boardTitleIssue('Notes', ['Sketch'])).toBeNull()
  })

  it('lets a board keep its own name when older data already repeats it', () => {
    expect(boardTitleIssue('Sketch', ['Sketch', 'Sketch'], 'Sketch')).toBeNull()
    expect(boardTitleIssue('Notes', ['Sketch', 'Notes'], 'Sketch')).toBe(
      'duplicate'
    )
  })

  it('compares stored titles after trimming', () => {
    expect(boardTitleIssue('Notes', [' Notes '])).toBe('duplicate')
    expect(boardTitleIssue(' Notes ', ['Notes'])).toBe('duplicate')
  })

  it('rejects trimming a title into a name another board already uses', () => {
    expect(boardTitleIssue('Notes', [' Notes ', 'Notes'], ' Notes ')).toBe(
      'duplicate'
    )
    expect(boardTitleIssue('Notes', [' Notes '], ' Notes ')).toBeNull()
  })
})

describe('batch delete targets', () => {
  const files = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]

  it('deletes the selection when at least one board remains', () => {
    expect(idsToDelete(files, ['a', 'b'], 'a')).toEqual(['a', 'b'])
  })

  it('keeps the current board when every board is selected', () => {
    expect(idsToDelete(files, ['a', 'b', 'c'], 'b')).toEqual(['a', 'c'])
  })

  it('does not delete the only remaining board', () => {
    expect(idsToDelete([{ id: 'a' }], ['a'], 'a')).toEqual([])
  })
})
