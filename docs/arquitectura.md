# Arquitectura

Malla 3D es una aplicación **Electron** que empaqueta una SPA **React +
Three.js** construida con **Vite**. El proceso de escritorio solo sirve para
abrir una ventana y cargar el build web: toda la lógica vive en el renderer
con `contextIsolation` activo y `nodeIntegration` desactivado.

## Estructura del repositorio

```
malla-3d/
├── electron/main.cjs      Proceso principal de Electron (ventana, single-instance)
├── src/
│   ├── main.tsx           Punto de entrada React
│   ├── App.tsx            Estado de la escena, historial, paneles y atajos
│   ├── SceneViewport.tsx  Visor Three.js (cámara, luces, picking, gizmos)
│   ├── sceneTypes.ts      Modelo de datos, validación y operaciones de malla
│   ├── sceneHistory.ts    Pila deshacer/rehacer genérica (límite 100)
│   ├── index.css          Estilos globales y tema
│   └── workbench.css      Estilos del layout del editor
├── public/icon.png        Icono de la app (copiado al build)
├── build/icon.png         Icono para electron-builder (1024² → .ico)
├── tests/                 Pruebas unitarias (node --test)
├── e2e/                   Pruebas end-to-end (Playwright)
└── docs/                  Esta documentación
```

## Módulos y responsabilidades

### `sceneTypes.ts` — modelo de datos

Fuente única de verdad del dominio: tipos `SceneObject`, `Vector3Tuple`,
`TransformMode`, los cubos por defecto, la validación `isSceneObject` y las
operaciones puras `createSceneObject`, `updateVertexPosition`, `extrudeFace`,
`extrudeTopFace` e `insetFace`. Sin dependencias de React ni Three.js, por lo
que se prueba directamente con `node --test`.

Toda operación de malla es **inmutable**: devuelve un objeto nuevo en lugar
de mutar el que recibe.

### `sceneHistory.ts` — historial

Pila genérica `{ present, past, future, limit }`. `commitScene` ignora
referencias idénticas (`Object.is`) para no ensuciar el historial con
ediciones sin cambio, vacía `future` al avanzar y recorta `past` a 100
elementos. Es genérica (`SceneHistory<T>`) para poder usarse con cualquier
estado serializable.

### `App.tsx` — estado y UI

- Mantiene `objects` en `useState` y el historial en un `useRef` (para no
  disparar renders por cada snapshot).
- `commitObjects(next)` es el único punto de entrada de cambios: actualiza
  el historial, el estado, la bandera «modificado» y los botones de
  deshacer/rehacer.
- Maneja los atajos de teclado en un `keydown` global que se ignora cuando
  el foco está en `input`, `textarea`, `select` o `contenteditable`.
- El visor se importa con `React.lazy` + `Suspense` (`SceneViewport` es el
  chunk mayor, ~591 kB), así el arranque pinta la UI sin esperar a Three.js.
- Guardar genera un `Blob` y dispara la descarga `escena-malla.json`; cargar
  valida el archivo con `isSceneObject` y reinicia el historial.

### `SceneViewport.tsx` — visor 3D

| Elemento | Configuración |
| --- | --- |
| Renderer | `WebGLRenderer` con antialias, pixel ratio ≤ 2, sombras, `SRGBColorSpace`, tonemapping ACES Filmic (exposición 1,08) |
| Cámara | perspectiva 42° en `(7.5, 6.2, 8.5)`, mirando a `(0, 0.45, 0)` |
| Controles | `OrbitControls` con damping 0,075, distancia 2,4–36, ángulo polar máx. 0,49π |
| Transformación | `TransformControls` (tamaño 0,9); desactiva la órbita mientras se arrastra |
| Selección | `Raycaster` sobre los meshes; en modo edición intersecciona manejadores de vértice o el quad lógico de la cara |
| Luces | hemisférica + direccional clave con sombras 1024² + direccional de relleno |
| Rejilla | `GridHelper` 24×24 con opacidad 0,55, más `AxesHelper` |

Puntos de diseño importantes:

- **Un único bucle `requestAnimationFrame`** para toda la escena; los
  callbacks de React se leen desde un `stateRef` siempre actualizado, de modo
  que la recreación del visor no depende de los cambios de props.
- **Sincronización selectiva:** un segundo `useEffect` reconstruye
  geometrías/materials solo cuando cambian los objetos o el modo de edición.
- **Commit al soltar:** los cambios de `TransformControls` se emiten en
  `dragging-changed` (no en cada frame), lo que produce una sola entrada de
  historial por arrastre.
- **Limpieza completa** en el retorno del `useEffect`: RAF cancelado,
  `ResizeObserver` desconectado, listeners retirados y geometrías/materials
  dispuestos para evitar fugas de memoria.

## Flujo de datos

```
usuario → App.tsx (acción) → commitObjects → sceneHistory + setState
                                        ↓
                              React re-render con props
                                        ↓
                     SceneViewport (effect de sincronización) → Three.js
                                        ↓
                    callbacks (onSelect / onTransformCommit / onVertexCommit)
                                        ↓
                              App.tsx (commitObjects, cierra el bucle)
```

`SceneViewport` no tiene estado de escena propio: es un renderizador
controlado desde `App.tsx`.

## Empaquetado de escritorio

`electron/main.cjs` crea una `BrowserWindow` de 1366 × 868 (mínimo
1024 × 700), con `sandbox`, `contextIsolation`, sin `nodeIntegration`, menú
oculto y el icono de `public/icon.png`. Usa `requestSingleInstanceLock` para
que un segundo lanzamiento enfoca la ventana existente en vez de abrir otra.
Carga `dist/index.html` vía `file://`, por eso Vite se configura con
`base: './'` (rutas relativas).

`electron-builder` compila los targets `nsis` (instalador con elección de
carpeta y accesos directos) y `portable` (exe autoextraíble) para Windows
x64, con salida en `release/`.

## Decisiones técnicas y trade-offs

- **Three.js imperativo dentro de React:** el visor vive fuera del ciclo de
  renders de React para no recrear la escena WebGL en cada cambio de estado.
- **Estado serializable en `sceneTypes.ts`:** el formato de archivo y el
  estado en memoria son el mismo modelo, así que guardar/cargar no requiere
  transformaciones.
- **Edición limitada a cubos:** extrusión e inset operan sobre mallas
  indexadas propias (no sobre `BufferGeometry` de Three.js), por lo que
  esferas y cilindros siguen siendo geometrías primitivas no editables.
- **Advertencias conocidas:** el build avisa de que `SceneViewport` supera
  los 500 kB (chunk con Three.js) y, en Three.js ≥ 0.186,
  `PCFSoftShadowMap` emite un aviso de deprecación y cae en `PCFShadowMap`.

## Seguridad

No hay integración Node en el renderer, no se usan `preload` ni IPC, no se
abren enlaces externos y el único contacto con el sistema de archivos son la
descarga y la selección de archivos mediante la API nativa del navegador.
