let fileHydrationFailed = false

const failureListeners = new Set<() => void>()

export const markFileHydrationFailed = () => {
  fileHydrationFailed = true
  const pending = [...failureListeners]
  failureListeners.clear()
  pending.forEach((listener) => listener())
}

export const hasFileHydrationFailed = () => fileHydrationFailed

export const shouldPersistFiles = () => !fileHydrationFailed

const subscribeFileHydrationFailed = (listener: () => void) => {
  failureListeners.add(listener)
  return () => {
    failureListeners.delete(listener)
  }
}

/**
 * Zustand 4.4 persist does not set hasHydrated or emit onFinishHydration when
 * storage rejects. Callers still need the wait to end so the UI can show the
 * failure and keep the in-memory files from being written back.
 */
export const waitForHydration = (persist: {
  hasHydrated: () => boolean
  onFinishHydration: (listener: () => void) => () => void
}) => {
  if (persist.hasHydrated() || fileHydrationFailed) {
    return Promise.resolve()
  }

  return new Promise<void>((resolve) => {
    const subscriptions = {
      hydrated: () => {},
      failed: () => {}
    }
    let settled = false
    const finish = () => {
      if (settled) {
        return
      }
      settled = true
      subscriptions.hydrated()
      subscriptions.failed()
      resolve()
    }

    const unsubscribeHydrated = persist.onFinishHydration(finish)
    subscriptions.hydrated = unsubscribeHydrated
    if (settled) {
      unsubscribeHydrated()
      return
    }

    const unsubscribeFailed = subscribeFileHydrationFailed(finish)
    subscriptions.failed = unsubscribeFailed
    if (persist.hasHydrated() || fileHydrationFailed) {
      finish()
    }
  })
}
