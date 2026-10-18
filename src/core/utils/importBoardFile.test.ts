import { describe, expect, it } from 'vitest'
import { parseImportedBoardFile } from './importBoardFile'

describe('parseImportedBoardFile', () => {
  it('rejects invalid json and incomplete documents', () => {
    expect(parseImportedBoardFile('{')).toBeNull()
    expect(parseImportedBoardFile('null')).toBeNull()
    expect(
      parseImportedBoardFile(JSON.stringify({ title: 'only title' }))
    ).toBeNull()
    expect(
      parseImportedBoardFile(JSON.stringify({ boardData: { objects: [] } }))
    ).toBeNull()
  })

  it('builds a file and strips a legacy fabric background', () => {
    const parsed = parseImportedBoardFile(
      JSON.stringify({
        title: 'sketch',
        boardVersion: '1.0.0',
        canvasWidth: 0.5,
        boardData: {
          objects: [{ type: 'rect' }],
          background: '#fff',
          backgroundImage: { src: 'https://example.com/bg.png' }
        }
      })
    )

    expect(parsed?.title).toBe('sketch')
    expect(parsed?.boardVersion).toBe('1.0.0')
    expect(parsed?.canvasWidth).toBe(0.5)
    expect(parsed?.backgroundColorList).toEqual(['#fff'])
    expect(parsed?.currentBackgroundColor).toBe(0)
    expect(parsed?.backgroundImage).toBe('https://example.com/bg.png')
    expect(parsed?.boardData).toEqual({ objects: [{ type: 'rect' }] })
    expect(parsed?.boardData).not.toHaveProperty('background')
  })

  it('starts a new revision and ignores a revision stored in the file', () => {
    const parsed = parseImportedBoardFile(
      JSON.stringify({
        title: 'sketch',
        contentRevision: 9,
        boardData: { objects: [] }
      })
    )

    expect(parsed?.contentRevision).toBe(0)
    expect(parsed?.zoom).toBe(1)
    expect(parsed?.viewportTransform).toBeUndefined()
  })

  it('restores a finite zoom and a 6-number viewport', () => {
    const viewport = [1.5, 0, 0, 1.5, -20, 40]
    const parsed = parseImportedBoardFile(
      JSON.stringify({
        title: 'sketch',
        zoom: 1.5,
        viewportTransform: viewport,
        boardData: { objects: [{ type: 'rect' }] }
      })
    )

    expect(parsed?.zoom).toBe(1.5)
    expect(parsed?.viewportTransform).toEqual(viewport)
  })

  it('ignores a non-positive zoom and a malformed viewport', () => {
    const parsed = parseImportedBoardFile(
      JSON.stringify({
        title: 'sketch',
        zoom: 0,
        viewportTransform: [1, 0, 0, 1, 'pan'],
        boardData: { objects: [] }
      })
    )

    expect(parsed?.zoom).toBe(1)
    expect(parsed?.viewportTransform).toBeUndefined()
  })
})
