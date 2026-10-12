import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('file hydration', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('ends the wait when storage reports an error and stops persisting', async () => {
    const { markFileHydrationFailed, shouldPersistFiles, waitForHydration } =
      await import('./fileHydration')
    let finished = false
    const pending = waitForHydration({
      hasHydrated: () => false,
      onFinishHydration: () => () => {}
    }).then(() => {
      finished = true
    })

    await Promise.resolve()
    expect(finished).toBe(false)

    markFileHydrationFailed()
    await pending
    expect(finished).toBe(true)
    expect(shouldPersistFiles()).toBe(false)
  })

  it('stops persisting after a later write fails', async () => {
    const { markFilePersistFailed, shouldPersistFiles } = await import(
      './fileHydration'
    )
    expect(shouldPersistFiles()).toBe(true)
    markFilePersistFailed()
    expect(shouldPersistFiles()).toBe(false)
  })

  it('resolves immediately if hydration already failed', async () => {
    const { markFileHydrationFailed, waitForHydration } = await import(
      './fileHydration'
    )
    markFileHydrationFailed()
    let subscribed = false
    await waitForHydration({
      hasHydrated: () => false,
      onFinishHydration: () => {
        subscribed = true
        return () => {}
      }
    })
    expect(subscribed).toBe(false)
  })

  it('still resolves when persist finishes successfully', async () => {
    const { hasFileHydrationFailed, shouldPersistFiles, waitForHydration } =
      await import('./fileHydration')
    let listener: (() => void) | undefined
    const pending = waitForHydration({
      hasHydrated: () => false,
      onFinishHydration: (callback) => {
        listener = callback
        return () => {
          listener = undefined
        }
      }
    })

    listener?.()
    await pending
    expect(hasFileHydrationFailed()).toBe(false)
    expect(shouldPersistFiles()).toBe(true)
    expect(listener).toBeUndefined()
  })
})
