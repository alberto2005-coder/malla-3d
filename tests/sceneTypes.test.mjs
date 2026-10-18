import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createSceneObject,
  defaultCubeVertices,
  extrudeFace,
  extrudeTopFace,
  isSceneObject,
  insetFace,
  updateVertexPosition,
} from '../src/sceneTypes.ts'

test('new cubes carry independent editable vertex arrays', () => {
  const first = createSceneObject('cube', 1)
  const second = createSceneObject('cube', 2)

  assert.deepEqual(first.vertices, defaultCubeVertices)
  assert.notEqual(first.vertices, second.vertices)
  assert.notEqual(first.vertices?.[0], second.vertices?.[0])
})

test('accepts legacy scenes without optional vertex data', () => {
  const { vertices: _vertices, faces: _faces, ...legacyCube } = createSceneObject('cube', 1)

  assert.equal(isSceneObject(legacyCube), true)
})

test('rejects malformed editable geometry', () => {
  const cube = createSceneObject('cube', 1)

  assert.equal(isSceneObject({ ...cube, vertices: cube.vertices?.slice(1) }), false)
  assert.equal(
    isSceneObject({ ...cube, vertices: cube.vertices?.map((vertex) => [vertex[0], NaN, vertex[2]]) }),
    false,
  )
  assert.equal(isSceneObject({ ...createSceneObject('sphere', 1), vertices: defaultCubeVertices }), false)
})

test('moves one vertex without mutating the source scene', () => {
  const cube = createSceneObject('cube', 1)
  const moved = updateVertexPosition(cube, 6, [1, 1.5, 1])

  assert.deepEqual(cube.vertices, defaultCubeVertices)
  assert.deepEqual(moved.vertices?.[6], [1, 1.5, 1])
  assert.deepEqual(moved.vertices?.[5], defaultCubeVertices[5])
  assert.equal(isSceneObject(moved), true)
  assert.equal(updateVertexPosition(cube, 9, [0, 0, 0]), cube)
})

test('extrudes the top face into a cap and four side faces', () => {
  const cube = createSceneObject('cube', 1)
  const extruded = extrudeTopFace(cube, 0.75)

  assert.equal(extruded.vertices?.length, 12)
  assert.equal(extruded.faces?.length, 10)
  assert.equal(extruded.faces?.slice(6).every((face) => face.length === 4), true)
  assert.equal(extruded.vertices?.[8][1], 1.25)
  assert.equal(isSceneObject(extruded), true)
  assert.equal(cube.vertices?.length, 8)
  assert.equal(extrudeTopFace(cube, 0), cube)
})

test('extrudes a selected side face along its outward normal', () => {
  const cube = createSceneObject('cube', 1)
  const extruded = extrudeFace(cube, 0, 0.5)

  assert.equal(extruded.vertices?.length, 12)
  assert.equal(extruded.faces?.length, 10)
  assert.deepEqual(extruded.vertices?.slice(8, 12), [
    [-0.5, -0.5, -1],
    [-0.5, 0.5, -1],
    [0.5, 0.5, -1],
    [0.5, -0.5, -1],
  ])
  assert.equal(isSceneObject(extruded), true)
  assert.equal(extrudeFace(cube, -1), cube)
})

test('insets a selected face into a coplanar inner face and border ring', () => {
  const cube = createSceneObject('cube', 1)
  const inset = insetFace(cube, 0, 0.25)

  assert.equal(inset.vertices?.length, 12)
  assert.equal(inset.faces?.length, 10)
  assert.equal(inset.faces?.slice(6).every((face) => face.length === 4), true)
  assert.deepEqual(inset.vertices?.[8], [-0.375, -0.375, -0.5])
  assert.deepEqual(inset.vertices?.[9], [-0.375, 0.375, -0.5])
  assert.equal(isSceneObject(inset), true)
  assert.equal(cube.vertices?.length, 8)
  assert.equal(insetFace(cube, 0, 1), cube)
})