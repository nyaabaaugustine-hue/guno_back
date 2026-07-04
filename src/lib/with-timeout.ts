/**
 * Bounds a promise to a maximum duration, rejecting with a clear error if it
 * doesn't settle in time. Used so a slow/unreachable database never leaves a
 * request (e.g. sign-in) hanging until the serverless function itself times
 * out with no useful error for the user.
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        clearTimeout(timer)
        reject(error)
      }
    )
  })
}
