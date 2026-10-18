import assert from 'node:assert/strict'
import test from 'node:test'
import {
  commitScene,
  createSceneHistory,
  redoScene,
  resetSceneHistory,
  undoScene,
} from '../src/sceneHistory.ts'

test('undo and redo restore snapshots in order', () => {
  const initial = [{ value: 0 }]
  const first = [{ value: 1 }]
  const second = [{ value: 2 }]
  const history = createSceneHistory(initial)

  commitScene(history, first)
  commitScene(history, second)
  assert.equal(undoScene(history), first)
  assert.equal(undoScene(history), initial)
  assert.equal(undoScene(history), null)
  assert.equal(redoScene(history), first)
  assert.equal(redoScene(history), second)
  assert.equal(redoScene(history), null)
})

test('a new edit after undo clears the redo branch', () => {
  const initial = { value: 0 }
  const first = { value: 1 }
  const branch = { value: 2 }
  const history = createSceneHistory(initial)

  commitScene(history, first)
  undoScene(history)
  commitScene(history, branch)

  assert.equal(history.present, branch)
  assert.equal(redoScene(history), null)
})

test('history is bounded and reset clears both directions', () => {
  const history = createSceneHistory(0, 2)
  commitScene(history, 1)
  commitScene(history, 2)
  commitScene(history, 3)
  assert.deepEqual(history.past, [1, 2])
  assert.equal(undoScene(history), 2)
  resetSceneHistory(history, 10)
  assert.equal(history.present, 10)
  assert.deepEqual(history.past, [])
  assert.deepEqual(history.future, [])
})