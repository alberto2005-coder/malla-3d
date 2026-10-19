# Plan de mejora — hoja de ruta hacia un modelado completo

Objetivo declarado: **que Malla 3D pueda hacer lo mismo que Blender y
SketchUp juntos**. Este documento convierte esa ambición en fases concretas,
con entregables, esfuerzo estimado y las decisiones técnicas que hay que
tomar antes de cada una.

> **Aviso de realismo.** Blender acumula ~20 años de desarrollo y millones de
> líneas de código; SketchUp décadas de flujo de trabajo pulido. La meta
> razonable no es "igualar feature a feature", sino **cubrir el 80 % del
> flujo de trabajo de un usuario** (modelado, organización, materiales,
> presentación y exportación) con una app web/escritorio mantenible, e
> iterar. Este plan asume una persona a tiempo completo con ayuda
> esporádica; en equipo se comprime.

---

## 1. Estado actual vs. objetivo

| Área | Blender | SketchUp | Malla 3D hoy |
| --- | --- | --- | --- |
| Modelado de malla | Muy completo | Limitado | Solo cubos, extrusión e inset con valores fijos |
| Dibujo sobre planos | Limitado (grease/metadata) | Núcleo del flujo | No existe |
| Push/Pull directo | Extrusión interactiva | Herramienta central | Extrusión por botón (0,8 fijo) |
| Snapping / inferencias | Avanzado | Estrella de SketchUp | No existe |
| Grupos y componentes | Colecciones | Componentes con instancias | Solo objetos sueltos |
| Modificadores / stack | Muy completo | Extensiones | No existe |
| Materiales y UV | Nodes, UV editor | Texturas simples | Color plano `#RRGGBB` |
| Render | Cycles/EEVEE | Estilos / ráster | Captura del canvas |
| Animación | Completa | No | No |
| Import/export | glTF, OBJ, FBX, USD… | SKP, DAE, DWG… | JSON propio `malla-scene` |
| Undo | Sistema por pasos | Muy bueno | Snapshots, límite 100 |
| API / scripting | Python | Ruby/JS | No |
| Plataforma | Multiplataforma | Multiplataforma | Windows x64 + web |

---

## 2. Principios del plan

1. **Entregas usables**: cada fase deja una versión que un usuario puede
   adoptar; nada de "18 meses sin ver producto".
2. **El modelo de datos manda**: la mayoría de bloqueos viene de que hoy la
   malla es `vertices + faces` sin aristas compartidas. Se arregla primero.
3. **Serialización siempre**: todo estado nuevo debe caber en
   `sceneTypes.ts` y en el formato de archivo (con `version` incremental y
   migración), salvo lo derivado (se puede recalcular).
4. **No copiar Blender ni SketchUp**: nombres genéricos de herramientas
   (p. ej. "extrusión de cara" en lugar de marcas como *Push/Pull*), UI y
   activos propios. Regla fija del repositorio.
5. **Presupuesto de rendimiento**: editar una malla de 100 k vértices debe
   seguir siendo interactivo (< 16 ms por operación visualizada).

---

## 3. Fases

### Fase 0 — Cimientos (obligatoria antes que nada) · 4–6 semanas

| Tarea | Por qué |
| --- | --- |
| **Topología real**: estructura de malla con aristas compartidas (vértices + caras + índice de aristas o *half-edge* ligero), generada a partir del formato actual | Sin aristas no hay loop cut, bevel, merge, selección de aristas ni snapping exacto |
| **Undo por comandos**: sustituir snapshots por `ICommand { apply, revert }` con nombre visible en el historial | Los snapshots de mallas grandes con 100 pasos matan la memoria; además se puede mostrar "Deshacer: extruir cara" |
| **Migración de formato a `malla-scene` v2** (aristas calculadas, grupos, unidades) con loader v1 → v2 | Mantener compatibilidad con lo ya guardado |
| **Split de código real**: vendor chunk de Three.js, rutas de herramientas bajo demanda | El warning de 500 kB y el arranque |
| **Sistema de herramientas (state machine)**: `Tool { onPointerDown/Move/Up, onKey, overlay }` con entrada numérica en pantalla | Es la base de SketchUp (herramienta activa + medida dinámica) y de Blender (operador modal) |
| **Cobertura de tests** de topología e historial | Las fases siguientes son imposibles de mantener sin ello |

**Entregable:** mismo aspecto que hoy, pero con malla indexada, historial por
comandos y arquitectura de herramientas. Nada visible para el usuario.

### Fase 1 — Flujo SketchUp: dibujo, inferencias y medida · 3–4 meses

| Tarea | Detalle |
| --- | --- |
| **Ejes y planos de dibujo** | Ejes X/Y/Z + planos de trabajo (cara seleccionada, eje custom con Shift) |
| **Herramientas de dibujo** | Línea, rectángulo, círculo, arco, polilínea; cierre automático de caras planas |
| **Motor de inferencias** | Snap a: punto final, punto medio, intersección, perpendicular, paralelo, punto en cara, rejilla; punto verde/azul/rosa como referencia visual propia (no copiar la paleta de SketchUp) |
| **Snapping general** | Umbral en píxeles, `three-mesh-bvh` para intersecciones rápidas, snap a rejilla con red de hashes espaciales |
| **Empuje/estirado de superficie** (nombre propio, p. ej. *Estirar cara*) | Arrastrar una cara para moverla, estirando las adyacentes, con guía numérica en vivo |
| **Medida dinámica y caja de entrada numérica** | Como en Blender: mientras arrastras, escribes `1.5` y Enter |
| **Grupos y componentes** | Definición + instancias: editar uno, cambian todos; desagrupar |
| **Herramientas de guía** | Cinta métrica, líneas de referencia, medir distancia/ángulo |
| **Cámaras de presentación** | Isométrica/ortográfica, vistas estándar (arriba, frente, derecha), "Ajustar a selección" |
| **Undo con nombres** | Historial visible: "Extruir cara", "Crear componente" |

**Entregable:** se puede modelar un objeto, una pieza o una sala de la misma
forma que en SketchUp, con medidas exactas.

### Fase 2 — Modelado estilo Blender · 6–9 meses

| Tarea | Detalle |
| --- | --- |
| Selección de **aristas, vértices y caras** + selección por doble clic (loop) | Requiere topología de Fase 0 |
| **Extrusión e inset interactivos** | Gizmo + valor numérico, no constantes fijas |
| **Bisel/chamfer** de arista y vértice | |
| **Loop cut y slide**, **vertex slide**, **merge** (en centro, en primer/último, por distancia) | |
| **Knife/corte** libre y **bisectar** | |
| **Escalado de malla con pivototes** (medio, activo, curso 3D) | |
| **Operadores de simetría**: espejo, array, alejar/radio | |
| **Stack de modificadores** (`base → modificadores → malla evaluada`) | Mirror, Array, Bevel, Subdivision (Catmull-Clark), Solidify, Wireframe |
| **Booleanas** (unión, diferencia, intersección) en worker con `three-bvh-csg` | Nunca en el hilo principal |
| **Distribución de selección** (igualar espaciado, alinear) | |

**Entregable:** modelado orgánico y hard-surface de nivel intermedio sin
salir de Malla 3D.

### Fase 3 — Materiales, UV y texturas · 2–3 meses

- Editor de UV 2D (unwrap por proyección, isla, mover/escalar vértices UV).
- Materiales **PBR**: base color, roughness, metalness, normal map, AO.
- Texturas desde archivo (PNG/JPG/WebP) y color plano.
- Paleta de materiales reutilizables + asignación por cara.
- Soporte KTX2 / Basis y DRACO para que los assets no disparen el tamaño.

### Fase 4 — Presentación, iluminación y render · 2–3 meses

- Luces editables (sol, punto, área) y entorno HDRI con IBL.
- Sombras, SSAO, tone mapping por escena, niebla.
- **Render a imagen** (PNG/JPEG a cualquier resolución, con transparencia) y
  **render de secuencia/clip** (imágenes → WebM/MP4 con `ffmpeg.wasm`).
- Planos de sección y "estilos" de línea (boceto/no-contorno) para la vena
  SketchUp.
- Opción de renderador de trayecto de rayos con
  `three-gpu-pathtracer` (experimental, GPU).

### Fase 5 — Animación · 3–4 meses

- Línea de tiempo, keyframes de transformación y de color/material.
- Curvas de animación (editor de f-curves simplificado).
- Interpolación lineal / suave y anticipación.
- Cámaras animadas y exportación de clip.
- Rig básico: jerarquía de huesos + IK de dos huesos (suficiente para
  personajes simples; un rig completo tipo Blender queda fuera de alcance a
  corto plazo).

### Fase 6 — Interoperabilidad · 2–3 meses

| Formato | Dirección | Nota |
| --- | --- | --- |
| **glTF 2.0** (`.gltf`/`.glb`) | import + export | Estándar web, sin licencia problemática |
| **OBJ** + MTL | import + export | |
| **STL** | import + export | Para impresión 3D |
| **Collada DAE** | import | Formato típico de SketchUp |
| **FBX** | solo import opcional | SDK con licencia restrictiva; preferir glTF |
| **DWG/DXF** | import opcional | Requiere SDK de ODA (licencia/comercial): evaluar |
| **SKP** | no | Formato propietario de Trimble, sin API abierta |
| `.malla-scene` | propio | Migraciones versionadas |

Export/import de materiales y jerarquías respetando unidades (1 unidad = 1 m).

### Fase 7 — Plataforma y escalabilidad · continuo

- **Render WebGPU** con el renderer de Three.js (con fallback WebGL2).
- **Workers** para topología, booleanas y subdivisión (`ArrayBuffer`
  transferibles).
- **API de scripting** en JavaScript para plugins (registro de herramientas,
  operadores y paneles) — el equivalente ligero a Python en Blender o
  extensiones en SketchUp.
- Versiones **macOS y Linux** con electron-builder (firma y notarización en
  macOS obligatorias).
- **Guardado incremental / autoguardado** y recuperación ante fallos.
- Colaboración opcional (CRDT simple sobre documentos de escena) — solo si
  hay demanda.

---

## 4. Orden recomendado y calendario orientativo

| Trimestre | Fases | Hitos visibles |
| --- | --- | --- |
| T1 | 0 | Sin cambios visibles; base sólida |
| T2 | 1 (parte) | Línea, rectángulo, snapping básico, medida |
| T3 | 1 (resto) | Componentes, estirar cara, vistas ortográficas |
| T4–T5 | 2 | Selección de aristas, bisel, loop cut, modificadores |
| T6 | 3 | UV + materiales PBR |
| T7 | 4 | Render a imagen y secuencia |
| T8–T9 | 5 | Animación básica |
| T10 | 6 | glTF/OBJ/STL/DAE |
| continuo | 7 | WebGPU, scripting, multiplataforma |

Esfuerzo acumulado estimado: **~24–30 persona-meses** para un producto que
cubra la mayoría de flujos de trabajo combinados de Blender y SketchUp a
nivel de usuario no profesional.

---

## 5. Decisiones técnicas clave

| Tema | Decisión propuesta | Alternativa descartada |
| --- | --- | --- |
| Topología | Malla indexada + mapa de aristas; *half-edge* solo si hace falta | Mantener `faces` sueltas (bloquea todo el modelado) |
| Undo | Comandos con `apply/revert` + nombre | Snapshots completos (memoria) |
| Estado global | Mantener React + `useRef` para el documento, con patches | Migrar a Redux/Zustand (no aporta aún) |
| Visor | Three.js imperativo con capa de sincronización (ya existe) | Recrear escena en cada render React (rendimiento) |
| Operaciones pesadas | Workers + `three-bvh-csg`, `three-mesh-bvh` | Todo en hilo principal (congelaría la UI) |
| Render | WebGL2 hoy → WebGPU con fallback | WebGPU exclusivo (cobertura aún limitada) |
| Formato | `malla-scene` v2 con migración v1 | Adoptar glTF como formato interno (pierde datos propios) |
| Espejo de modos | Mantener modo Objeto/Vértice/Cara, añadiendo Arista | Copiar el modo de Blender tal cual |

## 6. Riesgos

| Riesgo | Impacto | Mitigación |
| --- | --- | --- |
| Alcance desbordado (la petición es "Blender + SketchUp") | Proyecto estancado | Fases cortas con entregable usable; priorizar por uso real |
| Rendimiento en mallas grandes | Edición no usable | BVH, workers, decimado visual (`LOD`) y límites por operación |
| Incompatibilidad de formatos de terceros | Pérdida de confianza | Empezar por glTF/OBJ/STL, marcar FBX/DWG como experimentales |
| Copiar nombres o UI de Blender/SketchUp | Problemas legales | Regla del repo: nombres genéricos y activos propios |
| Memoria del historial | Cierres inesperados | Undo por comandos (Fase 0) + límite configurable |
| Mantener pruebas al ritmo | Regresiones | Unitarias en topología/historial + e2e por herramienta nueva |

## 7. Criterios de éxito por fase

- **Fase 0:** 100 % de tests verdes con malla indexada; escenas v1 siguen
  abriendo; historial con nombre por operación.
- **Fase 1:** un usuario modela una pieza con cotas exactas sin tocar el
  teclado más que para números; e2e de la herramienta de línea.
- **Fase 2:** bisel, loop cut y mirror sobre 10 k caras a ≥ 30 fps de
  manipulación.
- **Fase 3:** texturas PBR visibles en el viewport y exportadas a glTF.
- **Fase 4:** render de 1920 × 1080 con sombras en < 10 s en GPU integrada.
- **Fase 5:** clip de 5 s con keyframes exportado a vídeo.
- **Fase 6:** round-trip glTF sin pérdida de materiales ni jerarquía.

---

## 8. Qué NO está en el alcance (de momento)

- Suites de dibujo 2D tipo Blender Grease Pencil / SketchUp LayOut completas.
- Simulación física, fluidos, partículas ni cabello.
- Sculpting multiresolución (una opción sería añadirla como Fase 8).
- Node shader editor completo, compositor ni pipeline de producción tipo
  Cycles.
- Colaboración en tiempo real tipo Figma.
