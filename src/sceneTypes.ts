export type PrimitiveKind = 'cube' | 'sphere' | 'cylinder'
export type TransformMode = 'translate' | 'rotate' | 'scale'
export type Vector3Tuple = [number, number, number]

export interface SceneObject {
  id: string
  name: string
  kind: PrimitiveKind
  color: string
  position: Vector3Tuple
  rotation: Vector3Tuple
  scale: Vector3Tuple
  vertices?: Vector3Tuple[]
  faces?: number[][]
}

export const defaultCubeVertices: readonly Vector3Tuple[] = [
  [-0.5, -0.5, -0.5],
  [0.5, -0.5, -0.5],
  [0.5, 0.5, -0.5],
  [-0.5, 0.5, -0.5],
  [-0.5, -0.5, 0.5],
  [0.5, -0.5, 0.5],
  [0.5, 0.5, 0.5],
  [-0.5, 0.5, 0.5],
]

export const defaultCubeFaces: readonly (readonly number[])[] = [
  [0, 3, 2, 1],
  [4, 5, 6, 7],
  [0, 4, 7, 3],
  [1, 2, 6, 5],
  [0, 1, 5, 4],
  [3, 7, 6, 2],
]

const primitiveLabels: Record<PrimitiveKind, string> = {
  cube: 'Cubo',
  sphere: 'Esfera',
  cylinder: 'Cilindro',
}

const objectColors = ['#dc7650', '#6c9c95', '#d4aa52', '#7e8fbd', '#c47e9b']

export function createSceneObject(
  kind: PrimitiveKind,
  sequence: number,
): SceneObject {
  return {
    id: crypto.randomUUID(),
    name: sequence === 1 ? primitiveLabels[kind] : `${primitiveLabels[kind]} ${sequence}`,
    kind,
    color: objectColors[(sequence - 1) % objectColors.length],
    position: [sequence === 1 ? 0 : ((sequence - 1) % 3) * 1.4 - 1.4, 0.5, sequence > 1 ? 0.7 : 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    ...(kind === 'cube'
      ? {
          vertices: defaultCubeVertices.map((vertex) => [...vertex] as Vector3Tuple),
          faces: defaultCubeFaces.map((face) => [...face]),
        }
      : {}),
  }
}

export function isVector3Tuple(value: unknown): value is Vector3Tuple {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((component) => typeof component === 'number' && Number.isFinite(component))
  )
}

export function isSceneObject(value: unknown): value is SceneObject {
  if (value === null || typeof value !== 'object') return false

  const candidate = value as Record<string, unknown>
  const vertexCount = Array.isArray(candidate.vertices) ? candidate.vertices.length : 0
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    (candidate.kind === 'cube' || candidate.kind === 'sphere' || candidate.kind === 'cylinder') &&
    typeof candidate.color === 'string' &&
    /^#[0-9a-f]{6}$/i.test(candidate.color) &&
    isVector3Tuple(candidate.position) &&
    isVector3Tuple(candidate.rotation) &&
    isVector3Tuple(candidate.scale) &&
    (candidate.vertices === undefined ||
      (candidate.kind === 'cube' &&
        Array.isArray(candidate.vertices) &&
        candidate.vertices.length >= defaultCubeVertices.length &&
        candidate.vertices.length <= 100_000 &&
        candidate.vertices.every(isVector3Tuple))) &&
    (candidate.faces === undefined ||
      (candidate.kind === 'cube' &&
        Array.isArray(candidate.vertices) &&
        Array.isArray(candidate.faces) &&
        candidate.faces.length >= 6 &&
        candidate.faces.length <= 100_000 &&
        candidate.faces.every(
          (face) =>
            Array.isArray(face) &&
            face.length >= 3 &&
            face.length <= 1_000 &&
            face.every(
              (index) => Number.isInteger(index) && index >= 0 && index < vertexCount,
            ),
        )))
  )
}

export function updateVertexPosition(
  object: SceneObject,
  index: number,
  position: Vector3Tuple,
): SceneObject {
  if (object.kind !== 'cube' || index < 0 || index >= defaultCubeVertices.length) return object
  const vertices = object.vertices ?? defaultCubeVertices
  return {
    ...object,
    vertices: vertices.map((vertex, vertexIndex) =>
      vertexIndex === index ? [...position] as Vector3Tuple : [...vertex] as Vector3Tuple,
    ),
  }
}

export function extrudeFace(object: SceneObject, faceIndex: number, distance = 0.8): SceneObject {
  if (object.kind !== 'cube' || !Number.isFinite(distance) || distance <= 0) return object

  const vertices = object.vertices ?? defaultCubeVertices
  const faces = object.faces ?? defaultCubeFaces.map((face) => [...face])
  const selectedFace = faces[faceIndex]
  if (!selectedFace || selectedFace.length < 3) return object

  const origin = vertices[selectedFace[0]]
  const edgeA = vertices[selectedFace[1]].map((value, axis) => value - origin[axis]) as Vector3Tuple
  let normal: Vector3Tuple | null = null
  for (let index = 2; index < selectedFace.length; index += 1) {
    const edgeB = vertices[selectedFace[index]].map((value, axis) => value - origin[axis]) as Vector3Tuple
    const cross: Vector3Tuple = [
      edgeA[1] * edgeB[2] - edgeA[2] * edgeB[1],
      edgeA[2] * edgeB[0] - edgeA[0] * edgeB[2],
      edgeA[0] * edgeB[1] - edgeA[1] * edgeB[0],
    ]
    const magnitude = Math.hypot(...cross)
    if (magnitude > 1e-8) {
      normal = cross.map((component) => component / magnitude) as Vector3Tuple
      break
    }
  }
  if (!normal) return object

  const newVertices = selectedFace.map((index) => {
    const vertex = vertices[index]
    return vertex.map((component, axis) => component + normal![axis] * distance) as Vector3Tuple
  })
  const firstNewVertex = vertices.length
  const newTopFace = newVertices.map((_, index) => firstNewVertex + index)
  const sideFaces = selectedFace.map((vertexIndex, index) => {
    const nextIndex = (index + 1) % selectedFace.length
    return [vertexIndex, selectedFace[nextIndex], newTopFace[nextIndex], newTopFace[index]]
  })

  return {
    ...object,
    vertices: [...vertices.map((vertex) => [...vertex] as Vector3Tuple), ...newVertices],
    faces: [
      ...faces.filter((_, index) => index !== faceIndex).map((face) => [...face]),
      ...sideFaces,
      newTopFace,
    ],
  }
}

export function extrudeTopFace(object: SceneObject, distance = 0.8): SceneObject {
  const faces = object.faces ?? defaultCubeFaces
  return extrudeFace(object, faces.length - 1, distance)
}

export function insetFace(object: SceneObject, faceIndex: number, amount = 0.2): SceneObject {
  if (object.kind !== 'cube' || !Number.isFinite(amount) || amount <= 0 || amount >= 1) {
    return object
  }

  const vertices = object.vertices ?? defaultCubeVertices
  const faces = object.faces ?? defaultCubeFaces.map((face) => [...face])
  const selectedFace = faces[faceIndex]
  if (!selectedFace || selectedFace.length < 3) return object

  const center: Vector3Tuple = [0, 0, 0]
  for (const vertexIndex of selectedFace) {
    const vertex = vertices[vertexIndex]
    center[0] += vertex[0] / selectedFace.length
    center[1] += vertex[1] / selectedFace.length
    center[2] += vertex[2] / selectedFace.length
  }

  const insetVertices = selectedFace.map((vertexIndex) => {
    const vertex = vertices[vertexIndex]
    return vertex.map((component, axis) => component + (center[axis] - component) * amount) as Vector3Tuple
  })
  const firstInsetVertex = vertices.length
  const insetFace = insetVertices.map((_, index) => firstInsetVertex + index)
  const borderFaces = selectedFace.map((vertexIndex, index) => {
    const nextIndex = (index + 1) % selectedFace.length
    return [vertexIndex, selectedFace[nextIndex], insetFace[nextIndex], insetFace[index]]
  })

  return {
    ...object,
    vertices: [...vertices.map((vertex) => [...vertex] as Vector3Tuple), ...insetVertices],
    faces: [
      ...faces.filter((_, index) => index !== faceIndex).map((face) => [...face]),
      ...borderFaces,
      insetFace,
    ],
  }
}