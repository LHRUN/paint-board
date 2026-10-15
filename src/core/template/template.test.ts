import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  boardFromTemplate,
  parseTemplateDocument,
  parseTemplateIndex,
  resolveTemplateAsset,
  type BoardTemplate
} from './template'

const templateDir = resolve(
  fileURLToPath(new URL('.', import.meta.url)),
  '../../../public/templates'
)

const objectIds = (value: unknown, found: string[]) => {
  if (Array.isArray(value)) {
    value.forEach((item) => objectIds(item, found))
    return
  }
  if (!value || typeof value !== 'object') {
    return
  }
  const record = value as Record<string, unknown>
  if (typeof record.id === 'string') {
    found.push(record.id)
  }
  objectIds(record.objects, found)
}

describe('template documents', () => {
  it('keeps only safe file names from the index', () => {
    expect(
      parseTemplateIndex({
        templates: [
          'brush-showcase.json',
          '../secret.json',
          'nested/file.json',
          'ok.JSON',
          1,
          ''
        ]
      })
    ).toEqual(['brush-showcase.json', 'ok.JSON'])
    expect(parseTemplateIndex(null)).toEqual([])
  })

  it('resolves public paths and rejects traversal', () => {
    expect(resolveTemplateAsset('../templates/a.json')).toBe('')
    expect(resolveTemplateAsset('templates/a.png')).toContain('templates/a.png')
    expect(resolveTemplateAsset('https://example.com/a.png')).toBe(
      'https://example.com/a.png'
    )
  })

  it('uses the active language and falls back to the default copy', () => {
    const parsed = parseTemplateDocument(
      {
        templateId: 'demo',
        name: '默认',
        thumbnail: 'templates/demo.png',
        locales: {
          en: { name: 'Demo' }
        },
        boardData: { objects: [{ type: 'path', id: 'keep' }] }
      },
      'en'
    )

    expect(parsed?.name).toBe('Demo')
    expect(parsed?.thumbnailUrl).toContain('templates/demo.png')

    const fallback = parseTemplateDocument(
      {
        templateId: 'demo',
        name: '默认',
        boardData: { objects: [{ type: 'path' }] }
      },
      'en'
    )
    expect(fallback?.name).toBe('默认')
  })

  it('rejects documents that cannot become a board', () => {
    expect(parseTemplateDocument({ name: 'x' }, 'zh')).toBeNull()
    expect(
      parseTemplateDocument(
        { templateId: 'x', name: 'x', boardData: { objects: [] } },
        'zh'
      )
    ).toBeNull()
    expect(
      parseTemplateDocument(
        { templateId: 'x', name: ' ', boardData: { objects: [{}] } },
        'zh'
      )
    ).toBeNull()
  })

  it('copies a template into an independent board', () => {
    const template = parseTemplateDocument(
      {
        templateId: 'demo',
        name: 'Demo',
        boardVersion: '2.0.0',
        zoom: 1.5,
        canvasWidth: 1,
        canvasHeight: 1,
        backgroundColorList: ['#fff'],
        currentBackgroundColor: 0,
        boardData: {
          objects: [
            {
              type: 'group',
              id: 'group-1',
              objects: [{ type: 'path', id: 'path-1' }]
            }
          ]
        }
      },
      'zh'
    ) as BoardTemplate

    const first = boardFromTemplate(template, ' 新画板 ')
    const second = boardFromTemplate(template, '另一张')
    const created = first.boardData as { objects: Array<{ id: string }> }
    created.objects[0].id = 'changed'

    expect(first.id).not.toBe(second.id)
    expect(first.title).toBe('新画板')
    expect(first.contentRevision).toBe(0)
    expect(first.zoom).toBe(1.5)
    expect(first.backgroundColorList).toEqual(['#fff'])
    expect(template.boardData).toEqual({
      objects: [
        {
          type: 'group',
          id: 'group-1',
          objects: [{ type: 'path', id: 'path-1' }]
        }
      ]
    })
    const ids: string[] = []
    objectIds(second.boardData, ids)
    expect(ids).toHaveLength(2)
    expect(ids).not.toContain('group-1')
    expect(ids).not.toContain('path-1')
    expect(new Set(ids).size).toBe(2)
  })

  it('loads the shipped templates as editable boards', () => {
    const index = parseTemplateIndex(
      JSON.parse(readFileSync(resolve(templateDir, 'index.json'), 'utf8'))
    )
    expect(index).toEqual([
      'hello.json',
      'simple-image.json',
      'art-font.json',
      'simple-design.json',
      'brush-showcase.json',
      'simple-shape.json'
    ])

    const names = {
      'hello.json': '欢迎来到 PAINT BOARD',
      'simple-image.json': '图像处理',
      'art-font.json': '艺术字体',
      'simple-design.json': '简单设计',
      'brush-showcase.json': '画笔展示',
      'simple-shape.json': '图形展示'
    }

    index.forEach((name) => {
      const raw = JSON.parse(readFileSync(resolve(templateDir, name), 'utf8'))
      expect(raw.description).toBeUndefined()
      const parsed = parseTemplateDocument(raw, 'zh')
      expect(parsed?.name).toBe(names[name as keyof typeof names])
      expect(parsed?.thumbnailUrl).toContain(
        `templates/${name.replace('.json', '.png')}`
      )
      const board = boardFromTemplate(parsed as BoardTemplate, 'from template')
      expect(board.contentRevision).toBe(0)
      expect(JSON.stringify(board)).not.toContain('templateId')
    })
  })
})
