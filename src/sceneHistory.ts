export interface SceneHistory<T> {
  present: T
  past: T[]
  future: T[]
  limit: number
}

export function createSceneHistory<T>(initial: T, limit = 100): SceneHistory<T> {
  return { present: initial, past: [], future: [], limit }
}

export function commitScene<T>(history: SceneHistory<T>, next: T): boolean {
  if (Object.is(history.present, next)) return false
  history.past.push(history.present)
  if (history.past.length > history.limit) history.past.shift()
  history.present = next
  history.future = []
  return true
}

export function undoScene<T>(history: SceneHistory<T>): T | null {
  const previous = history.past.pop()
  if (previous === undefined) return null
  history.future.push(history.present)
  history.present = previous
  return previous
}

export function redoScene<T>(history: SceneHistory<T>): T | null {
  const next = history.future.pop()
  if (next === undefined) return null
  history.past.push(history.present)
  history.present = next
  return next
}

export function resetSceneHistory<T>(history: SceneHistory<T>, scene: T): void {
  history.present = scene
  history.past = []
  history.future = []
}