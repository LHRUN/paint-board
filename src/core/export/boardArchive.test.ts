import { describe, expect, it } from 'vitest'
import { boardArchiveOutcome, uniqueBoardFileName } from './boardArchive'
import { buildStoredZip, crc32 } from './storedZip'

const text = (value: string) => new TextEncoder().encode(value)

const readZipNames = (archive: Uint8Array) => {
  const view = new DataView(
    archive.buffer,
    archive.byteOffset,
    archive.byteLength
  )
  const names: string[] = []
  let offset = 0
  while (offset + 30 <= archive.length) {
    const signature = view.getUint32(offset, true)
    if (signature !== 0x04034b50) {
      break
    }
    const nameLength = view.getUint16(offset + 26, true)
    const dataLength = view.getUint32(offset + 18, true)
    names.push(
      new TextDecoder().decode(
        archive.slice(offset + 30, offset + 30 + nameLength)
      )
    )
    offset += 30 + nameLength + dataLength
  }
  const end = archive.length - 22
  expect(view.getUint32(end, true)).toBe(0x06054b50)
  expect(view.getUint16(end + 10, true)).toBe(names.length)
  return names
}

describe('board archive', () => {
  it('stores each json entry without compression', () => {
    const first = text('{"title":"one"}')
    const second = text('{"title":"two"}')
    const archive = buildStoredZip([
      { name: 'one.json', data: first },
      { name: 'two.json', data: second }
    ])

    expect(readZipNames(archive)).toEqual(['one.json', 'two.json'])
    expect(crc32(first)).not.toBe(0)
    const firstOffset = 30 + text('one.json').length
    expect(archive.slice(firstOffset, firstOffset + first.length)).toEqual(
      first
    )
  })

  it('keeps duplicate titles as separate files', () => {
    const used = new Set<string>()
    expect(uniqueBoardFileName('sketch', 'abc12345-ff', used)).toBe(
      'sketch.json'
    )
    expect(uniqueBoardFileName('sketch', 'abc12345-ff', used)).toBe(
      'sketch-abc12345.json'
    )
    expect(uniqueBoardFileName('a/b:c', 'id', used)).toBe('a b c.json')
    expect(uniqueBoardFileName('   ', 'id', used)).toBe('paint-board.json')
  })

  it('separates packaging failure from file generation', () => {
    expect(
      boardArchiveOutcome({ total: 3, generated: 3, zipFailed: false })
    ).toBe('all-started')
    expect(
      boardArchiveOutcome({ total: 3, generated: 2, zipFailed: false })
    ).toBe('partial')
    expect(
      boardArchiveOutcome({ total: 3, generated: 0, zipFailed: false })
    ).toBe('all-failed')
    expect(
      boardArchiveOutcome({ total: 3, generated: 2, zipFailed: true })
    ).toBe('zip-failed')
  })
})
