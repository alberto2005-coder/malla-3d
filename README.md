# Malla 3D

Prototipo independiente de editor 3D. El nombre es provisional. No incorpora código, recursos ni marca de Blender.

## Documentación

Toda la documentación vive en [`docs/`](docs/README.md):

- [Guía de usuario](docs/usuario.md) — interfaz, modos de edición y atajos
- [Formato de escena](docs/formato-escena.md) — especificación de `malla-scene` v1
- [Arquitectura](docs/arquitectura.md) — módulos y flujo de datos
- [Desarrollo](docs/desarrollo.md) — entorno, scripts y pruebas
- [Checklist de release](docs/release.md) — cómo publicar una versión
- [Plan de mejora / roadmap](docs/roadmap.md) — fases hacia un modelado completo
- [Licencias](docs/licencias.md) — licencia GPL-3.0 y dependencias

## Ejecutar

Requiere Node.js 22.12 o posterior.
```bash
npm install
npm run dev
```

### Ejecutar o generar versión de escritorio (.exe)

```bash
# Probar la app de escritorio directamente
npm run electron:start

# Generar los ejecutables (.exe) de Windows
npm run dist
```
Los ejecutables se generan en la carpeta `release/`:
- `release/Malla 3D-Portable-1.0.0.exe`: Ejecutable único y portable (no requiere instalación).
- `release/Malla 3D Setup 1.0.0.exe`: Instalador completo para Windows.
- `release/win-unpacked/Malla 3D.exe`: Carpeta de la app lista para abrir.

## Alcance actual

- Escena 3D interactiva con órbita, zoom y cuadrícula.
- Primitivas cubo, esfera y cilindro.
- Selección, duplicación, eliminación y transformación con manipuladores o valores numéricos.
- Modos Vértice y Cara para cubos; selección en viewport o lista lateral.
- Edición de vértices por manipulador o coordenadas.
- Extrusión de la cara quad seleccionada a lo largo de su normal, con caras laterales persistidas en el formato propio.
- Inset de la cara seleccionada con anillo y cara interior persistidos en el formato propio.
- Color base por objeto.
- Guardado y carga en JSON propio (`malla-scene`, versión 1).
- Deshacer/rehacer de hasta 100 operaciones de escena.
- Atajos `Tab` (modo Vértice), `G`, `R`, `S`, `E` (extruir cara seleccionada), `I` (inset), `Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z`, `Ctrl/Cmd+Y`, `Delete`, `Ctrl/Cmd+S` y `Ctrl/Cmd+O`.

El JSON de escena es un formato inicial, no compatible con `.blend`. La edición de malla solo está disponible para cubos; extrusión e inset usan valores fijos. Aún faltan selección de aristas, operaciones interactivas, subdivisión, modificadores, deshacer/rehacer, animación, materiales avanzados, importación/exportación estándar y render final. Este prototipo todavía está muy lejos del alcance de Blender.
## Verificación

```bash
npm run lint
npm run build
```
## Licencias

**GPL-3.0** — el texto completo está en [LICENSE](LICENSE). Puedes usar, modificar y redistribuir el proyecto, incluso con fines comerciales, siempre que publiques el código fuente de tus versiones modificadas bajo la misma licencia (copyleft). Copyright (C) 2026 Alberto Ortiz.

Se deben conservar los avisos y licencias de las dependencias y recursos (Electron, Chromium, React, Three.js) en los binarios.

---

# English Version

**Malla 3D**

An independent prototype of a 3D editor. The name is provisional. It includes no code, assets or branding from Blender.

## Documentation

All the documentation lives in [`docs/`](docs/README.md):

- [User guide](docs/usuario.md) — interface, editing modes and shortcuts
- [Scene format](docs/formato-escena.md) — `malla-scene` v1 specification
- [Architecture](docs/arquitectura.md) — modules and data flow
- [Development](docs/desarrollo.md) — environment, scripts and tests
- [Release checklist](docs/release.md) — how to publish a version
- [Improvement plan / roadmap](docs/roadmap.md) — phases toward full modeling
- [Licenses](docs/licencias.md) — GPL-3.0 license and dependencies

## Running

Requires Node.js 22.12 or later.
```bash
npm install
npm run dev
```

### Run or build the desktop version (.exe)

```bash
# Test the desktop app directly
npm run electron:start

# Build the Windows executables
npm run dist
```
The executables are generated in the `release/` folder:
- `release/Malla 3D-Portable-1.0.0.exe`: Single portable executable (no installation required).
- `release/Malla 3D Setup 1.0.0.exe`: Full Windows installer.
- `release/win-unpacked/Malla 3D.exe`: App folder ready to open.

## Current Scope

- Interactive 3D scene with orbit, zoom and grid.
- Cube, sphere and cylinder primitives.
- Selection, duplication, deletion and transformation with gizmos or numeric inputs.
- Vertex and Face modes for cubes; selection in the viewport or side list.
- Vertex editing by gizmo or coordinates.
- Extrusion of the selected quad face along its normal, with side faces persisted in the custom format.
- Inset of the selected face with ring and inner face persisted in the custom format.
- Per-object base color.
- Save and load in a custom JSON format (`malla-scene`, version 1).
- Undo/redo of up to 100 scene operations.
- Shortcuts `Tab` (Vertex mode), `G`, `R`, `S`, `E` (extrude selected face), `I` (inset), `Ctrl/Cmd+Z`, `Ctrl/Cmd+Shift+Z`, `Ctrl/Cmd+Y`, `Delete`, `Ctrl/Cmd+S` and `Ctrl/Cmd+O`.

The scene JSON is an initial format, not compatible with `.blend`. Mesh editing is only available for cubes; extrusion and inset use fixed values. Edge selection, interactive operations, subdivision, modifiers, animation, advanced materials, standard import/export and final rendering are still missing. This prototype is still very far from Blender's scope.

## Verification

```bash
npm run lint
npm run build
```

## Licenses

**GPL-3.0** — the full text is in [LICENSE](LICENSE). You may use, modify and redistribute the project, including for commercial purposes, as long as you publish the source code of your modified versions under the same license (copyleft). Copyright (C) 2026 Alberto Ortiz.

Notices and licenses of the dependencies and assets (Electron, Chromium, React, Three.js) are retained in the binaries.
