import { describe, expect, it, vi } from 'vitest'
import { releaseModel, whenModelReleased } from './releaseModel'

describe('releaseModel', () => {
  it('ignores a missing model or one without dispose', async () => {
    await expect(releaseModel(undefined)).resolves.toBeUndefined()
    await expect(releaseModel({})).resolves.toBeUndefined()
  })

  it('waits for dispose and keeps a rejection off the caller', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const order: string[] = []
    await expect(
      releaseModel({
        dispose: async () => {
          order.push('start')
          await Promise.resolve()
          order.push('end')
          throw new Error('dispose failed')
        }
      })
    ).resolves.toBeUndefined()
    expect(order).toEqual(['start', 'end'])
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  it('does not start the next release until the previous dispose finishes', async () => {
    const order: string[] = []
    let finishFirst = () => undefined
    const first = releaseModel({
      dispose: () =>
        new Promise<void>((resolve) => {
          finishFirst = () => {
            order.push('first')
            resolve()
          }
        })
    })
    const second = releaseModel({
      dispose: async () => {
        order.push('second')
      }
    })

    await Promise.resolve()
    expect(order).toEqual([])
    finishFirst()
    await first
    await second
    await whenModelReleased()
    expect(order).toEqual(['first', 'second'])
  })
})
