import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import {
  Box,
  ArrowUp,
  ChevronRight,
  Circle,
  Copy,
  Crosshair,
  Cylinder,
  FilePlus2,
  FolderOpen,
  Grid2x2,
  Layers,
  Minimize2,
  Move3d,
  MousePointer2,
  Palette,
  Rotate3d,
  Save,
  Scaling,
  Search,
  Square,
  Trash2,
  Waypoints,
  Undo2,
  Redo2,
  type LucideIcon,
} from 'lucide-react'
import {
  createSceneObject,
  defaultCubeFaces,
  defaultCubeVertices,
  extrudeFace,
  insetFace,
  isSceneObject,
  updateVertexPosition,
  type PrimitiveKind,
  type SceneObject,
  type TransformMode,
  type Vector3Tuple,
} from './sceneTypes'
import {
  commitScene,
  createSceneHistory,
  redoScene,
  resetSceneHistory,
  undoScene,
} from './sceneHistory'
import './workbench.css'

const SceneViewport = lazy(() =>
  import('./SceneViewport').then((module) => ({ default: module.SceneViewport })),
)

interface VectorEditorProps {
  label: string
  values: Vector3Tuple
  angle?: boolean
  onChange: (axis: 0 | 1 | 2, value: number) => void
}

const axisLabels = ['X', 'Y', 'Z'] as const
const transformLabels: Record<TransformMode, string> = {
  translate: 'Mover',
  rotate: 'Rotar',
  scale: 'Escalar',
}

function IconButton({
  icon: Icon,
  label,
  onClick,
  active = false,
  disabled = false,
}: {
  icon: LucideIcon
  label: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={active}
      className={`icon-button${active ? ' is-active' : ''}`}
      disabled={disabled}
      onClick={onClick}
      title={label}
      type="button"
    >
      <Icon aria-hidden="true" size={16} strokeWidth={1.8} />
    </button>
  )
}

function VectorEditor({ label, values, angle = false, onChange }: VectorEditorProps) {
  return (
    <fieldset className="vector-editor">
      <legend>{label}</legend>
      <div className="vector-fields">
        {axisLabels.map((axis, index) => {
          const tupleIndex = index as 0 | 1 | 2
          const value = angle ? (values[tupleIndex] * 180) / Math.PI : values[tupleIndex]
          return (
            <label className="number-field" key={axis}>
              <span>{axis}</span>
              <input
                aria-label={`${label}, eje ${axis}`}
                onChange={(event) => onChange(tupleIndex, Number(event.target.value))}
                step={angle ? 5 : 0.1}
                type="number"
                value={Number(value.toFixed(2))}
              />
              {angle && <small>°</small>}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

function App() {
  const [initialObject] = useState(() => createSceneObject('cube', 1))
  const [objects, setObjects] = useState<SceneObject[]>([initialObject])
  const historyRef = useRef(createSceneHistory<SceneObject[]>([initialObject]))
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false })
  const [selectedId, setSelectedId] = useState<string | null>(initialObject.id)
  const [transformMode, setTransformMode] = useState<TransformMode>('translate')
  const [editMode, setEditMode] = useState(false)
  const [editSelectionMode, setEditSelectionMode] = useState<'vertex' | 'face'>('vertex')
  const [selectedVertexIndex, setSelectedVertexIndex] = useState<number | null>(null)
  const [selectedFaceIndex, setSelectedFaceIndex] = useState<number | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  const [isDirty, setIsDirty] = useState(false)
  const [filter, setFilter] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const sequenceRef = useRef(2)

  const selectedObject = objects.find((object) => object.id === selectedId) ?? null
  const editableVertices = selectedObject?.kind === 'cube'
    ? selectedObject.vertices ?? defaultCubeVertices
    : []
  const editableFaces = selectedObject?.kind === 'cube'
    ? selectedObject.faces ?? defaultCubeFaces
    : []
  const selectedVertex = selectedVertexIndex === null
    ? null
    : editableVertices[selectedVertexIndex] ?? null
  const selectedFace = selectedFaceIndex === null
    ? null
    : editableFaces[selectedFaceIndex] ?? null

  function syncHistoryState() {
    setHistoryState({
      canUndo: historyRef.current.past.length > 0,
      canRedo: historyRef.current.future.length > 0,
    })
  }

  function commitObjects(next: SceneObject[]) {
    if (!commitScene(historyRef.current, next)) return
    setObjects(next)
    syncHistoryState()
    setIsDirty(true)
  }

  function undo() {
    const previous = undoScene(historyRef.current)
    if (!previous) return
    setObjects(previous)
    setSelectedVertexIndex(null)
    setSelectedFaceIndex(null)
    setIsDirty(true)
    syncHistoryState()
  }

  function redo() {
    const next = redoScene(historyRef.current)
    if (!next) return
    setObjects(next)
    setSelectedVertexIndex(null)
    setSelectedFaceIndex(null)
    setIsDirty(true)
    syncHistoryState()
  }

  function selectObject(id: string | null) {
    setSelectedId(id)
    setSelectedVertexIndex(null)
    setSelectedFaceIndex(null)
  }

  function toggleEditMode() {
    if (selectedObject?.kind !== 'cube') return
    if (editMode && editSelectionMode === 'vertex') setEditMode(false)
    else setEditMode(true)
    setEditSelectionMode('vertex')
    setSelectedVertexIndex(null)
    setSelectedFaceIndex(null)
  }

  function enterSelectionMode(mode: 'vertex' | 'face') {
    if (selectedObject?.kind !== 'cube') return
    setEditMode(true)
    setEditSelectionMode(mode)
    setSelectedVertexIndex(null)
    setSelectedFaceIndex(null)
  }

  function updateSelectedVertex(axis: 0 | 1 | 2, value: number) {
    if (!selectedObject || selectedVertexIndex === null || !Number.isFinite(value)) return
    const position = [...(selectedVertex ?? [0, 0, 0])] as Vector3Tuple
    position[axis] = value
    const updated = updateVertexPosition(selectedObject, selectedVertexIndex, position)
    commitObjects(objects.map((object) => object.id === updated.id ? updated : object))
  }

  function updateVertexFromViewport(id: string, index: number, position: Vector3Tuple) {
    const object = objects.find((item) => item.id === id)
    if (!object) return
    const updated = updateVertexPosition(object, index, position)
    commitObjects(objects.map((item) => item.id === id ? updated : item))
  }

  function extrudeSelectedFace() {
    if (
      !selectedObject ||
      selectedObject.kind !== 'cube' ||
      selectedFaceIndex === null ||
      editSelectionMode !== 'face'
    ) return
    const extruded = extrudeFace(selectedObject, selectedFaceIndex)
    if (extruded === selectedObject) return
    commitObjects(objects.map((object) => object.id === extruded.id ? extruded : object))
    setSelectedVertexIndex(null)
    setSelectedFaceIndex(extruded.faces ? extruded.faces.length - 1 : null)
  }

  function insetSelectedFace() {
    if (
      !selectedObject ||
      selectedObject.kind !== 'cube' ||
      selectedFaceIndex === null ||
      editSelectionMode !== 'face'
    ) return
    const inset = insetFace(selectedObject, selectedFaceIndex)
    if (inset === selectedObject) return
    commitObjects(objects.map((object) => object.id === inset.id ? inset : object))
    setSelectedVertexIndex(null)
    setSelectedFaceIndex(inset.faces ? inset.faces.length - 1 : null)
  }

  function addObject(kind: PrimitiveKind) {
    const object = createSceneObject(kind, sequenceRef.current)
    sequenceRef.current += 1
    commitObjects([...objects, object])
    setSelectedId(object.id)
    setEditMode(false)
    setSelectedVertexIndex(null)
    setSelectedFaceIndex(null)
  }

  function updateObject(id: string, patch: Partial<SceneObject>) {
    commitObjects(objects.map((object) => (object.id === id ? { ...object, ...patch } : object)))
  }

  function updateVector(
    field: 'position' | 'rotation' | 'scale',
    axis: 0 | 1 | 2,
    value: number,
  ) {
    if (!selectedObject || !Number.isFinite(value)) return
    const next = [...selectedObject[field]] as Vector3Tuple
    next[axis] = field === 'rotation' ? (value * Math.PI) / 180 : value
    updateObject(selectedObject.id, { [field]: next })
  }

  function removeSelected() {
    if (!selectedId) return
    commitObjects(objects.filter((object) => object.id !== selectedId))
    setSelectedId(null)
    setEditMode(false)
    setSelectedVertexIndex(null)
    setSelectedFaceIndex(null)
  }

  function duplicateSelected() {
    if (!selectedObject) return
    const object: SceneObject = {
      ...selectedObject,
      id: crypto.randomUUID(),
      name: `${selectedObject.name} copia`,
      position: [selectedObject.position[0] + 1, selectedObject.position[1], selectedObject.position[2]],
    }
    commitObjects([...objects, object])
    setSelectedId(object.id)
  }

  function saveScene() {
    const scene = {
      format: 'malla-scene',
      version: 1,
      watermark: { product: 'Malla 3D', notice: 'NO COMERCIAL' },
      objects,
    }
    const blob = new Blob([JSON.stringify(scene, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'escena-malla.json'
    link.click()
    URL.revokeObjectURL(url)
    setIsDirty(false)
  }

  async function loadScene(file: File) {
    try {
      const imported: unknown = JSON.parse(await file.text())
      if (imported === null || typeof imported !== 'object') throw new Error('Formato no válido')
      const candidate = imported as { format?: unknown; version?: unknown; objects?: unknown }
      if (
        candidate.format !== 'malla-scene' ||
        candidate.version !== 1 ||
        !Array.isArray(candidate.objects) ||
        !candidate.objects.every(isSceneObject)
      ) {
        throw new Error('El archivo no es una escena Malla compatible')
      }
      resetSceneHistory(historyRef.current, candidate.objects)
      setObjects(candidate.objects)
      syncHistoryState()
      setSelectedId(candidate.objects[0]?.id ?? null)
      setEditMode(false)
      setSelectedVertexIndex(null)
      setSelectedFaceIndex(null)
      sequenceRef.current = candidate.objects.length + 1
      setIsDirty(false)
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'No se pudo abrir la escena')
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function newScene() {
    commitObjects([])
    setSelectedId(null)
    setEditMode(false)
    setSelectedVertexIndex(null)
    setSelectedFaceIndex(null)
    sequenceRef.current = 1
  }

  const visibleObjects = objects.filter((object) =>
    object.name.toLocaleLowerCase().includes(filter.trim().toLocaleLowerCase()),
  )

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target
      if (
        target instanceof HTMLElement &&
        target.closest('input, textarea, select, [contenteditable="true"]')
      ) {
        return
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault()
        saveScene()
        return
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
        return
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault()
        redo()
        return
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'o') {
        event.preventDefault()
        fileInputRef.current?.click()
        return
      }
      if (event.key === 'Tab') {
        event.preventDefault()
        toggleEditMode()
        return
      }
      if (event.key.toLowerCase() === 'e' && editMode && editSelectionMode === 'face') {
        event.preventDefault()
        extrudeSelectedFace()
        return
      }
      if (event.key.toLowerCase() === 'i' && editMode && editSelectionMode === 'face') {
        event.preventDefault()
        insetSelectedFace()
        return
      }
      if (event.key === 'Delete' || event.key === 'Backspace') removeSelected()
      if (event.key.toLowerCase() === 'g') setTransformMode('translate')
      if (event.key.toLowerCase() === 'r') setTransformMode('rotate')
      if (event.key.toLowerCase() === 's' && !event.ctrlKey && !event.metaKey) {
        setTransformMode('scale')
      }
    }

    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  })

  const modeTools: { mode: TransformMode; icon: LucideIcon }[] = [
    { mode: 'translate', icon: Move3d },
    { mode: 'rotate', icon: Rotate3d },
    { mode: 'scale', icon: Scaling },
  ]

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div aria-hidden="true" className="brand-mark">
            <span />
            <span />
            <span />
          </div>
          <div className="brand-type">
            <strong>Malla</strong>
            <small>EDITOR 3D</small>
          </div>
        </div>

        <div className="project-title">
          <span className={`save-state${isDirty ? ' is-dirty' : ''}`} />
          <span>Escena sin título</span>
          <span className="project-extension">.MALLA</span>
        </div>

        <div className="topbar-actions">
          <input
            accept="application/json,.json"
            className="visually-hidden"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) void loadScene(file)
            }}
            ref={fileInputRef}
            type="file"
          />
          <IconButton icon={FilePlus2} label="Nueva escena" onClick={newScene} />
          <IconButton icon={FolderOpen} label="Abrir escena" onClick={() => fileInputRef.current?.click()} />
          <IconButton icon={Undo2} label="Deshacer" disabled={!historyState.canUndo} onClick={undo} />
          <IconButton icon={Redo2} label="Rehacer" disabled={!historyState.canRedo} onClick={redo} />
          <span className="topbar-divider" />
          <button className="save-button" onClick={saveScene} type="button">
            <Save aria-hidden="true" size={15} />
            <span>Guardar</span>
          </button>
        </div>
      </header>

      <main className="workbench">
        <aside aria-label="Escena" className="scene-panel">
          <div className="panel-title-row">
            <div>
              <span className="panel-kicker">PROYECTO</span>
              <h1>Escena</h1>
            </div>
            <span className="object-count">{objects.length.toString().padStart(2, '0')}</span>
          </div>

          <div className="panel-section">
            <div className="section-label-row">
              <span>Crear objeto</span>
              <span className="section-count">01</span>
            </div>
            <div className="primitive-grid">
              <button className="primitive-button" onClick={() => addObject('cube')} type="button">
                <Box aria-hidden="true" size={18} />
                <span>Cubo</span>
              </button>
              <button className="primitive-button" onClick={() => addObject('sphere')} type="button">
                <Circle aria-hidden="true" size={18} />
                <span>Esfera</span>
              </button>
              <button className="primitive-button" onClick={() => addObject('cylinder')} type="button">
                <Cylinder aria-hidden="true" size={18} />
                <span>Cilindro</span>
              </button>
            </div>
          </div>

          <div className="outliner-heading">
            <div className="section-label-row">
              <span>Objetos</span>
              <Layers aria-hidden="true" size={14} />
            </div>
            <label className="search-box">
              <Search aria-hidden="true" size={14} />
              <input
                aria-label="Buscar objeto"
                onChange={(event) => setFilter(event.target.value)}
                placeholder="Buscar"
                type="search"
                value={filter}
              />
              <span>/</span>
            </label>
          </div>

          <div className="object-tree" role="listbox" aria-label="Objetos de la escena">
            {objects.length === 0 ? (
              <div className="empty-tree">
                <span className="empty-tree-mark"><Crosshair aria-hidden="true" size={19} /></span>
                <strong>Escena vacía</strong>
                <span>Añade una primitiva para empezar</span>
              </div>
            ) : visibleObjects.length === 0 ? (
              <div className="empty-filter">Sin objetos con ese nombre</div>
            ) : (
              visibleObjects.map((object, index) => {
                const ObjectIcon = object.kind === 'sphere' ? Circle : object.kind === 'cylinder' ? Cylinder : Box
                return (
                  <button
                    aria-selected={selectedId === object.id}
                    className={`tree-row${selectedId === object.id ? ' is-selected' : ''}`}
                    key={object.id}
                    onClick={() => setSelectedId(object.id)}
                    role="option"
                    type="button"
                  >
                    <ChevronRight aria-hidden="true" className="tree-chevron" size={13} />
                    <ObjectIcon aria-hidden="true" className="tree-object-icon" size={15} />
                    <span className="tree-name">{object.name}</span>
                    <span className="tree-index">{String(index + 1).padStart(2, '0')}</span>
                  </button>
                )
              })
            )}
          </div>

          <div className="panel-bottom-note">
            <span className="status-led" />
            <span>ESCENA LOCAL</span>
          </div>
        </aside>

        <section aria-label="Editor 3D" className="editor-column">
          <div className="editor-toolbar">
            <div className="toolbar-context">
              <span className="context-dot" />
              <span>MODELADO</span>
              <ChevronRight aria-hidden="true" size={13} />
              <strong>Vista 3D</strong>
            </div>
            <div className="editor-edit-tools">
              <div aria-label="Modo de edición" className="editor-mode-tools" role="group">
                <button
                  aria-pressed={!editMode}
                  className={`mode-tab${!editMode ? ' is-active' : ''}`}
                  onClick={() => { setEditMode(false); setSelectedVertexIndex(null); setSelectedFaceIndex(null) }}
                  type="button"
                >
                  <MousePointer2 aria-hidden="true" size={13} />
                  <span>Objeto</span>
                </button>
                <button
                  aria-label="Modo Vértice (Tab)"
                  aria-pressed={editMode}
                  className={`mode-tab${editMode ? ' is-active' : ''}`}
                  disabled={selectedObject?.kind !== 'cube'}
                  onClick={() => enterSelectionMode('vertex')}
                  title="Editar los vértices del cubo (Tab)"
                  type="button"
                >
                  <Waypoints aria-hidden="true" size={14} />
                  <span>Vértice</span>
                </button>
                <button
                  aria-label="Modo Cara"
                  aria-pressed={editMode && editSelectionMode === 'face'}
                  className={`mode-tab${editMode && editSelectionMode === 'face' ? ' is-active' : ''}`}
                  disabled={selectedObject?.kind !== 'cube'}
                  onClick={() => enterSelectionMode('face')}
                  title="Seleccionar caras del cubo"
                  type="button"
                >
                  <Square aria-hidden="true" size={13} />
                  <span>Cara</span>
                </button>
              </div>
              {editMode && selectedObject?.kind === 'cube' && (
                <div className="face-actions">
                  <button
                    aria-label="Extruir cara seleccionada"
                    className="extrude-button"
                    disabled={editSelectionMode !== 'face' || selectedFaceIndex === null}
                    onClick={extrudeSelectedFace}
                    type="button"
                  >
                    <ArrowUp aria-hidden="true" size={13} />
                    <span>Extruir</span>
                    <kbd>E</kbd>
                  </button>
                  <button
                    aria-label="Inset de cara seleccionada"
                    className="extrude-button inset-button"
                    disabled={editSelectionMode !== 'face' || selectedFaceIndex === null}
                    onClick={insetSelectedFace}
                    type="button"
                  >
                    <Minimize2 aria-hidden="true" size={13} />
                    <span>Inset</span>
                    <kbd>I</kbd>
                  </button>
                </div>
              )}
            </div>
            <div aria-label="Herramientas de transformación" className="transform-tools" role="toolbar">
              {modeTools.map(({ mode, icon }) => (
                <IconButton
                  active={transformMode === mode}
                  icon={icon}
                  key={mode}
                  label={`${transformLabels[mode]} (${mode === 'translate' ? 'G' : mode === 'rotate' ? 'R' : 'S'})`}
                  onClick={() => setTransformMode(mode)}
                />
              ))}
            </div>
            <div className="toolbar-end">
              <span className="world-label"><span>W</span> Mundo</span>
              <IconButton
                active={showGrid}
                icon={Grid2x2}
                label={showGrid ? 'Ocultar cuadrícula' : 'Mostrar cuadrícula'}
                onClick={() => setShowGrid((visible) => !visible)}
              />
            </div>
          </div>

          <div className="viewport-frame">
            <div className="viewport-meta">
              <span className="view-chip"><span className="view-chip-dot" />PERSPECTIVA</span>
              <span className="view-scale">1 unidad = 1 m</span>
            </div>
            <div className="viewport-watermark">MALLA · CÓDIGO DISPONIBLE · NO COMERCIAL</div>
            <Suspense fallback={<div className="viewport-loading">Preparando escena 3D…</div>}>
              <SceneViewport
                objects={objects}
                editMode={editMode}
                editSelectionMode={editSelectionMode}
                onSelect={selectObject}
                onSelectVertex={setSelectedVertexIndex}
                onSelectFace={setSelectedFaceIndex}
                onTransformCommit={(id, transform) => updateObject(id, transform)}
                onVertexCommit={updateVertexFromViewport}
                selectedId={selectedId}
                selectedFaceIndex={selectedFaceIndex}
                selectedVertexIndex={selectedVertexIndex}
                showGrid={showGrid}
                transformMode={transformMode}
              />
            </Suspense>
            <div className="viewport-hint">
              <span><MousePointer2 aria-hidden="true" size={13} /> Seleccionar</span>
              <i />
              <span>Arrastrar para orbitar</span>
              <i />
              <span>Rueda para zoom</span>
            </div>
            <div className="axis-widget" aria-label="Orientación de los ejes">
              <span className="axis-line axis-x"><b>X</b></span>
              <span className="axis-line axis-y"><b>Y</b></span>
              <span className="axis-line axis-z"><b>Z</b></span>
              <span className="axis-center" />
            </div>
          </div>

          <footer className="statusbar">
            <div className="statusbar-left">
              <span className="status-indicator" />
              <span>{editMode ? editSelectionMode === 'face' ? 'MODO CARA' : 'MODO VÉRTICE' : isDirty ? 'MODIFICADO' : 'LISTO'}</span>
              <span className="status-divider" />
              <span>{objects.length} {objects.length === 1 ? 'objeto' : 'objetos'}</span>
            </div>
            <div className="statusbar-right">
              <span>G <small>MOVER</small></span>
              <span>R <small>ROTAR</small></span>
              <span>S <small>ESCALAR</small></span>
            </div>
          </footer>
        </section>

        <aside aria-label="Propiedades del objeto" className="properties-panel">
          <div className="panel-title-row properties-title">
            <div>
              <span className="panel-kicker">INSPECTOR</span>
              <h2>Propiedades</h2>
            </div>
            <button className="panel-menu-button" aria-label="Opciones de propiedades" type="button">
              <span>···</span>
            </button>
          </div>

          {selectedObject ? (
            <>
              <div className="object-identity">
                <div className={`identity-icon identity-${selectedObject.kind}`}>
                  {selectedObject.kind === 'sphere' ? <Circle size={19} /> : selectedObject.kind === 'cylinder' ? <Cylinder size={19} /> : <Box size={19} />}
                </div>
                <div className="identity-fields">
                  <input
                    aria-label="Nombre del objeto"
                    onChange={(event) => updateObject(selectedObject.id, { name: event.target.value })}
                    value={selectedObject.name}
                  />
                  <span>{editMode ? `${selectedObject.kind.toUpperCase()} · ${editSelectionMode === 'face' ? `${editableFaces.length} CARAS` : `${editableVertices.length} VÉRTICES`}` : `${selectedObject.kind.toUpperCase()} · MALLA`}</span>
                </div>
                <span className="identity-visibility" title="Visible en escena"><span /></span>
              </div>

              <div className="property-section transform-section">
                <div className="property-section-heading">
                  <div><Crosshair aria-hidden="true" size={14} /><span>{editMode ? editSelectionMode === 'face' ? selectedFaceIndex === null ? 'Edición de caras' : `Cara ${selectedFaceIndex + 1}` : selectedVertexIndex === null ? 'Edición de vértices' : `Vértice ${selectedVertexIndex + 1}` : 'Transformación'}</span></div>
                  <IconButton
                    icon={Crosshair}
                    label={editMode ? editSelectionMode === 'face' ? 'Deseleccionar cara' : 'Deseleccionar vértice' : 'Restablecer transformación'}
                    onClick={() => {
                      if (editMode && editSelectionMode === 'face') setSelectedFaceIndex(null)
                      else if (editMode) setSelectedVertexIndex(null)
                      else updateObject(selectedObject.id, { position: [0, 0.5, 0], rotation: [0, 0, 0], scale: [1, 1, 1] })
                    }}
                  />
                </div>
                {editMode ? (
                  editSelectionMode === 'face' ? (
                    selectedFace ? (
                      <p className="edit-hint">Cara de {selectedFace.length} vértices. Usa Extruir cara para crear volumen desde su normal.</p>
                    ) : (
                      <p className="edit-hint">Selecciona una cara en el viewport o en la lista de caras.</p>
                    )
                  ) : selectedVertex ? (
                      <VectorEditor label="Posición local" onChange={updateSelectedVertex} values={selectedVertex} />
                    ) : (
                      <p className="edit-hint">Selecciona un punto en el viewport o en la lista de vértices.</p>
                    )
                ) : (
                  <>
                    <VectorEditor label="Posición" onChange={(axis, value) => updateVector('position', axis, value)} values={selectedObject.position} />
                    <VectorEditor angle label="Rotación" onChange={(axis, value) => updateVector('rotation', axis, value)} values={selectedObject.rotation} />
                    <VectorEditor label="Escala" onChange={(axis, value) => updateVector('scale', axis, value)} values={selectedObject.scale} />
                  </>
                )}
              </div>

              <div className="property-section appearance-section">
                <div className="property-section-heading">
                  <div><Palette aria-hidden="true" size={14} /><span>Apariencia</span></div>
                  <span className="section-label-muted">MATERIAL</span>
                </div>
                <label className="color-property">
                  <span className="color-preview" style={{ backgroundColor: selectedObject.color }} />
                  <span>Color base</span>
                  <code>{selectedObject.color.toUpperCase()}</code>
                  <input
                    aria-label="Color base"
                    onChange={(event) => updateObject(selectedObject.id, { color: event.target.value })}
                    type="color"
                    value={selectedObject.color}
                  />
                </label>
              </div>

              <div className="object-actions">
                {editMode && editSelectionMode === 'vertex' && (
                  <details className="vertex-list" open>
                    <summary>
                      <span>Vértices del cubo</span>
                      <span>{String(editableVertices.length).padStart(2, '0')}</span>
                    </summary>
                    <div className="vertex-rows">
                      {editableVertices.map((vertex, index) => (
                        <button
                          aria-pressed={selectedVertexIndex === index}
                          className={`vertex-row${selectedVertexIndex === index ? ' is-selected' : ''}`}
                          key={index}
                          onClick={() => setSelectedVertexIndex(index)}
                          type="button"
                        >
                          <span>V{String(index + 1).padStart(2, '0')}</span>
                          <code>{vertex.map((value) => Number(value.toFixed(2))).join(', ')}</code>
                        </button>
                      ))}
                    </div>
                  </details>
                )}
                {editMode && editSelectionMode === 'face' && (
                  <details className="vertex-list face-list" open>
                    <summary>
                      <span>Caras de la malla</span>
                      <span>{String(editableFaces.length).padStart(2, '0')}</span>
                    </summary>
                    <div className="vertex-rows">
                      {editableFaces.map((face, index) => (
                        <button
                          aria-pressed={selectedFaceIndex === index}
                          className={`vertex-row${selectedFaceIndex === index ? ' is-selected' : ''}`}
                          key={index}
                          onClick={() => setSelectedFaceIndex(index)}
                          type="button"
                        >
                          <span>F{String(index + 1).padStart(2, '0')}</span>
                          <code>{face.length} vértices · {face.map((vertex) => `V${vertex + 1}`).join(' ')}</code>
                        </button>
                      ))}
                    </div>
                  </details>
                )}
                <button className="secondary-action" onClick={duplicateSelected} type="button">
                  <Copy aria-hidden="true" size={14} /> Duplicar
                </button>
                <button className="danger-action" onClick={removeSelected} type="button">
                  <Trash2 aria-hidden="true" size={14} /> Eliminar
                </button>
              </div>
            </>
          ) : (
            <div className="inspector-empty">
              <div><Crosshair aria-hidden="true" size={20} /></div>
              <strong>Sin selección</strong>
              <span>Selecciona un objeto en la escena o en la lista.</span>
            </div>
          )}

          <div className="inspector-footer">
            <span>FORMATO DE ESCENA</span>
            <span>JSON · v1</span>
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App