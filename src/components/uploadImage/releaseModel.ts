let releaseQueue: Promise<void> = Promise.resolve()

const disposeModel = async (model: object | undefined) => {
  const disposable = model as
    | { dispose?: () => void | Promise<unknown> }
    | undefined
  if (typeof disposable?.dispose !== 'function') {
    return
  }
  try {
    await disposable.dispose()
  } catch (error) {
    console.warn('Failed to release model', error)
  }
}

/**
 * Drop a Transformers model. dispose() is asynchronous; failures are logged
 * and do not reject, so effect cleanup can fire this without an unhandled rejection.
 * Releases run one after another.
 */
export const releaseModel = (model: object | undefined): Promise<void> => {
  const job = releaseQueue.then(() => disposeModel(model))
  releaseQueue = job.then(
    () => undefined,
    () => undefined
  )
  return job
}

/** Resolves when every releaseModel() call so far has finished. */
export const whenModelReleased = () => releaseQueue
