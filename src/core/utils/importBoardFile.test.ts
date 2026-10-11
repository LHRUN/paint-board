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
})
