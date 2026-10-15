import { describe, expect, it } from 'vitest'
import { INITIAL_FILE_TITLE } from '@/store/fileModel'
import { FILE_LIST_STORAGE_KEY, fileBlobKey } from '@/store/fileRecord'
import {
  TEMPLATE_PROMPT_KEY,
  hasPersistedBoardList,
  hasSeenTemplatePrompt,
  isUntouchedDefaultBoard,
  markTemplatePromptSeen,
  shouldOfferTemplatePrompt
} from './templatePrompt'

const memoryStorage = () => {
  const values = new Map<string, string>()
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value)
    }
  }
}

describe('template prompt', () => {
  it('offers templates only for a first visit with templates available', () => {
    expect(
      shouldOfferTemplatePrompt({
        hydrationFailed: false,
        seen: false,
        hasPersistedBoards: false,
        templateCount: 3
      })
    ).toBe(true)
    expect(
      shouldOfferTemplatePrompt({
        hydrationFailed: false,
        seen: true,
        hasPersistedBoards: false,
        templateCount: 3
      })
    ).toBe(false)
    expect(
      shouldOfferTemplatePrompt({
        hydrationFailed: false,
        seen: false,
        hasPersistedBoards: true,
        templateCount: 3
      })
    ).toBe(false)
    expect(
      shouldOfferTemplatePrompt({
        hydrationFailed: true,
        seen: false,
        hasPersistedBoards: false,
        templateCount: 3
      })
    ).toBe(false)
    expect(
      shouldOfferTemplatePrompt({
        hydrationFailed: false,
        seen: false,
        hasPersistedBoards: false,
        templateCount: 0
      })
    ).toBe(false)
  })

  it('remembers that the prompt was closed', () => {
    const storage = memoryStorage()
    expect(hasSeenTemplatePrompt(storage)).toBe(false)
    markTemplatePromptSeen(storage)
    expect(storage.getItem(TEMPLATE_PROMPT_KEY)).toBe('1')
    expect(hasSeenTemplatePrompt(storage)).toBe(true)
  })

  it('treats a read failure as an existing user', async () => {
    await expect(
      hasPersistedBoardList(async () => {
        throw new Error('blocked')
      })
    ).resolves.toBe(true)
    await expect(
      hasPersistedBoardList(async () => '{"state":{"files":[{"id":"a"}]}}')
    ).resolves.toBe(true)
    await expect(hasPersistedBoardList(async () => null)).resolves.toBe(false)
    await expect(
      hasPersistedBoardList(async () => '{"state":{"files":[]}}')
    ).resolves.toBe(false)
    await expect(
      hasPersistedBoardList(async (key) => {
        if (key === FILE_LIST_STORAGE_KEY) {
          return JSON.stringify({
            state: {
              files: [
                {
                  id: 'a',
                  title: INITIAL_FILE_TITLE,
                  contentRevision: 1
                }
              ]
            }
          })
        }
        if (key === fileBlobKey('a')) {
          return JSON.stringify({ boardData: { objects: [] } })
        }
        return null
      })
    ).resolves.toBe(false)
    await expect(
      hasPersistedBoardList(async (key) => {
        if (key === FILE_LIST_STORAGE_KEY) {
          return JSON.stringify({
            state: {
              files: [
                {
                  id: 'a',
                  title: INITIAL_FILE_TITLE,
                  contentRevision: 0
                }
              ]
            }
          })
        }
        return JSON.stringify({
          boardData: { objects: [{ type: 'path' }] }
        })
      })
    ).resolves.toBe(true)
  })

  it('recognizes only the untouched default board', () => {
    expect(
      isUntouchedDefaultBoard({
        title: INITIAL_FILE_TITLE,
        contentRevision: 0,
        boardData: {}
      })
    ).toBe(true)
    expect(
      isUntouchedDefaultBoard({
        title: 'sketch',
        contentRevision: 0,
        boardData: {}
      })
    ).toBe(false)
    expect(
      isUntouchedDefaultBoard({
        title: INITIAL_FILE_TITLE,
        contentRevision: 1,
        boardData: { objects: [] }
      })
    ).toBe(true)
    expect(
      isUntouchedDefaultBoard({
        title: INITIAL_FILE_TITLE,
        backgroundImage: 'data:image/png;base64,aaa',
        boardData: {}
      })
    ).toBe(false)
    expect(
      isUntouchedDefaultBoard({
        title: INITIAL_FILE_TITLE,
        boardData: { objects: [{ type: 'path' }] }
      })
    ).toBe(false)
  })
})
