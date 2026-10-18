import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { TransformControls } from 'three/addons/controls/TransformControls.js'
import { defaultCubeFaces, defaultCubeVertices, type SceneObject, type TransformMode, type Vector3Tuple } from './sceneTypes'

interface SceneViewportProps {
  objects: SceneObject[]
  selectedId: string | null
  transformMode: TransformMode
  showGrid: boolean
  editMode?: boolean
  editSelectionMode?: 'vertex' | 'face'
  selectedVertexIndex?: number | null
  selectedFaceIndex?: number | null
  onSelect: (id: string | null) => void
  onSelectVertex?: (index: number | null) => void
  onSelectFace?: (index: number | null) => void
  onTransformCommit: (id: string, transform: Pick<SceneObject, 'position' | 'rotation' | 'scale'>) => void
  onVertexCommit?: (id: string, index: number, position: Vector3Tuple) => void
}

interface ViewportState {
  objects: SceneObject[]
  selectedId: string | null
  editMode: boolean
  editSelectionMode: 'vertex' | 'face'
  selectedVertexIndex: number | null
  selectedFaceIndex: number | null
  onSelect: SceneViewportProps['onSelect']
  onSelectVertex: SceneViewportProps['onSelectVertex']
  onSelectFace: SceneViewportProps['onSelectFace']
  onTransformCommit: SceneViewportProps['onTransformCommit']
  onVertexCommit: SceneViewportProps['onVertexCommit']
}

const toTuple = (vector: THREE.Vector3): Vector3Tuple => [vector.x, vector.y, vector.z]
const toEulerTuple = (rotation: THREE.Euler): Vector3Tuple => [rotation.x, rotation.y, rotation.z]

function createGeometry(object: SceneObject): THREE.BufferGeometry {
  if (object.kind === 'sphere') return new THREE.SphereGeometry(0.58, 32, 24)
  if (object.kind === 'cylinder') return new THREE.CylinderGeometry(0.48, 0.48, 1.1, 32)

  const vertices = object.vertices ?? defaultCubeVertices
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices.flat(), 3))
  const faces = object.faces ?? defaultCubeFaces
  const indices: number[] = []
  const triangleFaceIndices: number[] = []
  for (let faceIndex = 0; faceIndex < faces.length; faceIndex += 1) {
    const face = faces[faceIndex]
    for (let index = 1; index < face.length - 1; index += 1) {
      indices.push(face[0], face[index], face[index + 1])
      triangleFaceIndices.push(faceIndex)
    }
  }
  geometry.setIndex(indices)
  geometry.userData.triangleFaceIndices = triangleFaceIndices
  geometry.computeVertexNormals()
  return geometry
}

export function SceneViewport({
  objects,
  selectedId,
  transformMode,
  showGrid,
  editMode = false,
  editSelectionMode = 'vertex',
  selectedVertexIndex = null,
  selectedFaceIndex = null,
  onSelect,
  onSelectVertex,
  onSelectFace,
  onTransformCommit,
  onVertexCommit,
}: SceneViewportProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const objectMeshesRef = useRef(new Map<string, THREE.Mesh>())
  const vertexHandlesRef = useRef(new Map<number, THREE.Mesh>())
  const transformControlsRef = useRef<TransformControls | null>(null)
  const gridRef = useRef<THREE.GridHelper | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const stateRef = useRef<ViewportState>({
    objects,
    selectedId,
    editMode,
    editSelectionMode,
    selectedVertexIndex,
    selectedFaceIndex,
    onSelect,
    onSelectVertex,
    onSelectFace,
    onTransformCommit,
    onVertexCommit,
  })

  useEffect(() => {
    stateRef.current = {
      objects,
      selectedId,
      editMode,
      editSelectionMode,
      selectedVertexIndex,
      selectedFaceIndex,
      onSelect,
      onSelectVertex,
      onSelectFace,
      onTransformCommit,
      onVertexCommit,
    }
  }, [objects, selectedId, editMode, editSelectionMode, selectedVertexIndex, selectedFaceIndex, onSelect, onSelectVertex, onSelectFace, onTransformCommit, onVertexCommit])

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const meshes = objectMeshesRef.current
    const vertexHandles = vertexHandlesRef.current

    const scene = new THREE.Scene()
    sceneRef.current = scene
    scene.background = new THREE.Color('#151d20')
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 500)
    camera.position.set(7.5, 6.2, 8.5)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.08
    renderer.domElement.className = 'scene-canvas'
    renderer.domElement.setAttribute('aria-label', 'Viewport 3D interactivo')
    host.appendChild(renderer.domElement)

    const hemisphere = new THREE.HemisphereLight('#eef1de', '#4b5354', 2.2)
    scene.add(hemisphere)

    const keyLight = new THREE.DirectionalLight('#fff0d7', 3.4)
    keyLight.position.set(-4, 8, 6)
    keyLight.castShadow = true
    keyLight.shadow.mapSize.set(1024, 1024)
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight('#91b7c6', 1.4)
    fillLight.position.set(6, 4, -5)
    scene.add(fillLight)

    const grid = new THREE.GridHelper(24, 24, '#718277', '#39474a')
    grid.position.y = -0.015
    const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material]
    for (const material of gridMaterials) {
      material.transparent = true
      material.opacity = 0.55
    }
    scene.add(grid)
    gridRef.current = grid

    const axes = new THREE.AxesHelper(1.25)
    axes.position.set(-5.4, 0.008, -5.4)
    scene.add(axes)

    const orbitControls = new OrbitControls(camera, renderer.domElement)
    orbitControls.enableDamping = true
    orbitControls.dampingFactor = 0.075
    orbitControls.target.set(0, 0.45, 0)
    orbitControls.minDistance = 2.4
    orbitControls.maxDistance = 36
    orbitControls.maxPolarAngle = Math.PI * 0.49

    const transformControls = new TransformControls(camera, renderer.domElement)
    transformControls.setSize(0.9)
    scene.add(transformControls.getHelper())
    transformControlsRef.current = transformControls

    transformControls.addEventListener('dragging-changed', (event) => {
      const dragging = Boolean((event as unknown as { value?: boolean }).value)
      orbitControls.enabled = !dragging
      if (dragging) return

      const mesh = transformControls.object
      const id = mesh?.userData.sceneObjectId
      if (typeof id !== 'string') return

      const vertexIndex = mesh.userData.vertexIndex
      if (typeof vertexIndex === 'number') {
        const owner = meshes.get(id)
        if (!owner || !stateRef.current.onVertexCommit) return
        const worldPosition = mesh.getWorldPosition(new THREE.Vector3())
        const localPosition = owner.worldToLocal(worldPosition)
        stateRef.current.onVertexCommit(id, vertexIndex, toTuple(localPosition))
        return
      }

      stateRef.current.onTransformCommit(id, {
        position: toTuple(mesh.position),
        rotation: toEulerTuple(mesh.rotation),
        scale: toTuple(mesh.scale),
      })
    })

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const handlePointerDown = (event: PointerEvent) => {
      if (transformControls.dragging) return
      const bounds = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
      pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      if (stateRef.current.editMode) {
        if (stateRef.current.editSelectionMode === 'vertex') {
          const vertexHits = raycaster.intersectObjects([...vertexHandlesRef.current.values()], false)
          const vertexIndex = vertexHits[0]?.object.userData.vertexIndex
          if (typeof vertexIndex === 'number') {
            stateRef.current.onSelectVertex?.(vertexIndex)
            return
          }
        }
        const editOwner = meshes.get(stateRef.current.selectedId ?? '')
        const editHit = editOwner ? raycaster.intersectObject(editOwner, false)[0] : undefined
        if (stateRef.current.editSelectionMode === 'face') {
          const faceMap = editOwner?.geometry.userData.triangleFaceIndices as number[] | undefined
          const faceIndex = editHit?.faceIndex == null ? undefined : faceMap?.[editHit.faceIndex]
          stateRef.current.onSelectFace?.(faceIndex ?? null)
          return
        }
        if (!editHit) stateRef.current.onSelectVertex?.(null)
        return
      }
      const hits = raycaster.intersectObjects([...meshes.values()], false)
      const objectId = hits[0]?.object.userData.sceneObjectId
      stateRef.current.onSelectVertex?.(null)
      stateRef.current.onSelect(typeof objectId === 'string' ? objectId : null)
    }
    renderer.domElement.addEventListener('pointerdown', handlePointerDown)

    const resize = () => {
      const width = Math.max(host.clientWidth, 1)
      const height = Math.max(host.clientHeight, 1)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)
    resize()

    let animationFrame = 0
    const render = () => {
      animationFrame = window.requestAnimationFrame(render)
      orbitControls.update()
      renderer.render(scene, camera)
    }
    render()

    return () => {
      window.cancelAnimationFrame(animationFrame)
      resizeObserver.disconnect()
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown)
      orbitControls.dispose()
      transformControls.dispose()
      for (const mesh of meshes.values()) {
        mesh.geometry.dispose()
        const material = mesh.material
        if (Array.isArray(material)) material.forEach((item) => item.dispose())
        else material.dispose()
        scene.remove(mesh)
      }
      meshes.clear()
      for (const handle of vertexHandles.values()) {
        handle.geometry.dispose()
        if (handle.material instanceof THREE.Material) handle.material.dispose()
        scene.remove(handle)
      }
      vertexHandles.clear()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  useEffect(() => {
    const meshes = objectMeshesRef.current
    const currentIds = new Set(objects.map((object) => object.id))

    for (const [id, mesh] of meshes) {
      if (currentIds.has(id)) continue
      mesh.parent?.remove(mesh)
      mesh.geometry.dispose()
      const material = mesh.material
      if (Array.isArray(material)) material.forEach((item) => item.dispose())
      else material.dispose()
      meshes.delete(id)
    }

    const scene = sceneRef.current
    if (!scene) return

    for (const object of objects) {
      let mesh = meshes.get(object.id)
      if (mesh && mesh.userData.primitiveKind !== object.kind) {
        mesh.parent?.remove(mesh)
        mesh.geometry.dispose()
        const previousMaterial = mesh.material
        if (Array.isArray(previousMaterial)) previousMaterial.forEach((item) => item.dispose())
        else previousMaterial.dispose()
        meshes.delete(object.id)
        mesh = undefined
      }
      if (!mesh) {
        const material = new THREE.MeshStandardMaterial({
          color: object.color,
          roughness: 0.42,
          metalness: 0.04,
          flatShading: true,
        })
        mesh = new THREE.Mesh(createGeometry(object), material)
        mesh.castShadow = true
        mesh.receiveShadow = true
        mesh.userData.sceneObjectId = object.id
        mesh.userData.primitiveKind = object.kind
        mesh.userData.vertexCount = object.vertices?.length ?? defaultCubeVertices.length
        mesh.userData.topologyKey = JSON.stringify(object.faces ?? defaultCubeFaces)
        meshes.set(object.id, mesh)
        scene.add(mesh)
      }
      mesh.name = object.name
      if (object.kind === 'cube') {
        const vertices = object.vertices ?? defaultCubeVertices
        const topologyKey = JSON.stringify(object.faces ?? defaultCubeFaces)
        if (
          mesh.userData.vertexCount !== vertices.length ||
          mesh.userData.topologyKey !== topologyKey
        ) {
          mesh.geometry.dispose()
          mesh.geometry = createGeometry(object)
          mesh.userData.vertexCount = vertices.length
          mesh.userData.topologyKey = topologyKey
        }
        const position = mesh.geometry.getAttribute('position')
        for (let index = 0; index < vertices.length; index += 1) {
          position.setXYZ(index, ...vertices[index])
        }
        position.needsUpdate = true
        mesh.geometry.computeVertexNormals()
        mesh.geometry.computeBoundingSphere()
      }
      mesh.position.fromArray(object.position)
      mesh.rotation.set(...object.rotation)
      mesh.scale.fromArray(object.scale)
      const material = mesh.material
      if (Array.isArray(material)) {
        material.forEach((item) => {
          if (item instanceof THREE.MeshStandardMaterial) item.color.set(object.color)
        })
      } else if (material instanceof THREE.MeshStandardMaterial) {
        material.color.set(object.color)
      }
    }
    for (const handle of vertexHandlesRef.current.values()) {
      handle.geometry.dispose()
      if (handle.material instanceof THREE.Material) handle.material.dispose()
      handle.parent?.remove(handle)
    }
    vertexHandlesRef.current.clear()

    if (editMode && editSelectionMode === 'vertex' && selectedId) {
      const selectedObject = objects.find((object) => object.id === selectedId)
      const selectedMesh = meshes.get(selectedId)
      const vertices = selectedObject?.kind === 'cube'
        ? selectedObject.vertices ?? defaultCubeVertices
        : []
      if (selectedMesh) {
        vertices.forEach((vertex, index) => {
          const material = new THREE.MeshBasicMaterial({
            color: index === selectedVertexIndex ? '#e9ae4a' : '#f3eee0',
            depthTest: false,
          })
          const handle = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 8), material)
          handle.position.copy(selectedMesh.localToWorld(new THREE.Vector3(...vertex)))
          handle.renderOrder = 10
          handle.userData.sceneObjectId = selectedId
          handle.userData.vertexIndex = index
          scene.add(handle)
          vertexHandlesRef.current.set(index, handle)
        })
      }
    }

    for (const object of objects) {
      const mesh = meshes.get(object.id)
      if (!mesh) continue
      const overlay = mesh?.userData.selectedFaceOverlay as THREE.Mesh | undefined
      if (overlay) {
        mesh.remove(overlay)
        overlay.geometry.dispose()
        if (overlay.material instanceof THREE.Material) overlay.material.dispose()
        delete mesh.userData.selectedFaceOverlay
      }
    }

    if (editMode && editSelectionMode === 'face' && selectedId && selectedFaceIndex !== null) {
      const selectedObject = objects.find((object) => object.id === selectedId)
      const selectedMesh = meshes.get(selectedId)
      const vertices = selectedObject?.vertices ?? defaultCubeVertices
      const face = selectedObject?.faces?.[selectedFaceIndex]
      if (selectedObject?.kind === 'cube' && selectedMesh && face) {
        const positions = face.flatMap((index) => vertices[index])
        const indices: number[] = []
        for (let index = 1; index < face.length - 1; index += 1) {
          indices.push(0, index, index + 1)
        }
        const geometry = new THREE.BufferGeometry()
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
        geometry.setIndex(indices)
        geometry.computeVertexNormals()
        const material = new THREE.MeshBasicMaterial({
          color: '#f0b94f',
          transparent: true,
          opacity: 0.38,
          depthWrite: false,
          side: THREE.DoubleSide,
          polygonOffset: true,
          polygonOffsetFactor: -1,
        })
        const overlay = new THREE.Mesh(geometry, material)
        overlay.renderOrder = 2
        overlay.raycast = () => undefined
        selectedMesh.add(overlay)
        selectedMesh.userData.selectedFaceOverlay = overlay
      }
    }
  }, [objects, selectedId, editMode, editSelectionMode, selectedVertexIndex, selectedFaceIndex])

  useEffect(() => {
    const controls = transformControlsRef.current
    if (!controls) return

    const selectedHandle = selectedVertexIndex === null
      ? undefined
      : vertexHandlesRef.current.get(selectedVertexIndex)
    const selectedMesh = selectedId ? objectMeshesRef.current.get(selectedId) : undefined
    const target = editMode && editSelectionMode === 'vertex' ? selectedHandle : selectedMesh
    if (target) controls.attach(target)
    else controls.detach()
    controls.setMode(transformMode)
  }, [objects, selectedId, editMode, editSelectionMode, selectedVertexIndex, transformMode])

  useEffect(() => {
    if (gridRef.current) gridRef.current.visible = showGrid
  }, [showGrid])

  return <div className="viewport-host" ref={hostRef} />
}
