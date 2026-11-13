# Malla 3D

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-000000?logo=threedotjs&logoColor=white)](https://threejs.org/)
[![Electron](https://img.shields.io/badge/Electron-Escritorio-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![GPL-3.0](https://img.shields.io/badge/Licencia-GPL--3.0-blue)](LICENSE)

[Español](#español) · [English](#english)

---

## Español

### Índice

- [Descripción](#descripción)
- [Documentación](#documentación)
- [Alcance actual](#alcance-actual)
- [Atajos](#atajos)
- [Requisitos](#requisitos)
- [Ejecución](#ejecución)
- [Versión de escritorio](#versión-de-escritorio)
- [Verificación](#verificación)
- [Licencia](#licencia)

### Descripción

**Malla 3D** es un prototipo independiente de editor 3D para navegador y escritorio. El nombre es provisional y el proyecto **no incorpora código, recursos ni marca de Blender**: usa un formato de escena propio (`malla-scene`, versión 1) que no es compatible con `.blend`.

Está construido con **React**, **Three.js**, **TypeScript** y **Vite**, y se empaqueta con **Electron** para Windows.

### Documentación

Toda la documentación detallada vive en [`docs/`](docs/README.md):

- [Guía de usuario](docs/usuario.md) — interfaz, modos de edición y atajos.
- [Formato de escena](docs/formato-escena.md) — especificación de `malla-scene` v1.
- [Arquitectura](docs/arquitectura.md) — módulos y flujo de datos.
- [Desarrollo](docs/desarrollo.md) — entorno, scripts y pruebas.
- [Checklist de release](docs/release.md) — cómo publicar una versión.
- [Roadmap](docs/roadmap.md) — fases hacia un modelado completo.
- [Licencias](docs/licencias.md) — GPL-3.0 y dependencias.

### Alcance actual

- Escena 3D interactiva con órbita, zoom y cuadrícula.
- Primitivas **cubo**, **esfera** y **cilindro**.
- Selección, duplicación, eliminación y transformación con manipuladores o valores numéricos.
- Modos **Vértice** y **Cara** para cubos, con selección en viewport o lista lateral.
- Edición de vértices por manipulador o coordenadas.
- **Extrusión** de la cara cuadrangular seleccionada a lo largo de su normal, con caras laterales persistidas.
- **Inset** de la cara seleccionada con anillo y cara interior persistidos.
- Color base por objeto.
- Guardado y carga en JSON propio (`malla-scene`, versión 1).
- **Deshacer/rehacer** de hasta 100 operaciones.

Todavía **no** incluye selección de aristas, operaciones interactivas de malla, subdivisión, modificadores, animación, materiales avanzados, importación/exportación estándar ni render final. La edición de malla solo está disponible para cubos y la extrusión e inset usan valores fijos.

### Atajos

| Tecla | Acción |
|---|---|
| `Tab` | Modo Vértice |
| `G` / `R` / `S` | Mover / rotar / escalar |
| `E` | Extruir la cara seleccionada |
| `I` | Inset de la cara seleccionada |
| `Ctrl/Cmd+Z` | Deshacer |
| `Ctrl/Cmd+Shift+Z` o `Ctrl/Cmd+Y` | Rehacer |
| `Delete` | Eliminar la selección |
| `Ctrl/Cmd+S` / `Ctrl/Cmd+O` | Guardar / abrir escena |

### Requisitos

- **Node.js 22.12 o posterior**.
- npm.
- Para la versión de escritorio: Windows 10/11 x64.

### Ejecución

```bash
npm install
npm run dev
```

Vite levanta la aplicación en el navegador con recarga en caliente.

### Versión de escritorio

```bash
npm run electron:start   # probar la app de escritorio
npm run dist             # generar los ejecutables de Windows
```

Los binarios se generan en `release/`:

- `release/Malla 3D-Portable-1.0.1.exe` — ejecutable único y portable.
- `release/Malla 3D Setup 1.0.1.exe` — instalador completo.
- `release/win-unpacked/Malla 3D.exe` — carpeta lista para abrir.

### Verificación

```bash
npm run lint
npm run build
```

También hay pruebas end-to-end con Playwright en `e2e/editor.spec.ts`.

### Licencia

**GNU General Public License v3.0 (GPL-3.0)** — el texto completo está en [LICENSE](LICENSE). Puedes usar, modificar y redistribuir el proyecto, incluso con fines comerciales, siempre que publiques el código fuente de tus versiones modificadas bajo la misma licencia. Copyright (C) 2026 Alberto Ortiz.

Se conservan los avisos y licencias de las dependencias (Electron, Chromium, React, Three.js) en los binarios.

---

## English

### Table of contents

- [Overview](#overview)
- [Documentation](#documentation)
- [Current scope](#current-scope)
- [Shortcuts](#shortcuts)
- [Requirements](#requirements)
- [Running](#running)
- [Desktop build](#desktop-build)
- [Verification](#verification)
- [License](#license)

### Overview

**Malla 3D** is an independent 3D editor prototype for the browser and desktop. The name is provisional and the project includes **no code, assets or branding from Blender**: it uses its own scene format (`malla-scene`, version 1), which is not compatible with `.blend`.

It is built with **React**, **Three.js**, **TypeScript** and **Vite**, and packaged with **Electron** for Windows.

### Documentation

All detailed documentation lives in [`docs/`](docs/README.md):

- [User guide](docs/usuario.md) — interface, editing modes and shortcuts.
- [Scene format](docs/formato-escena.md) — `malla-scene` v1 specification.
- [Architecture](docs/arquitectura.md) — modules and data flow.
- [Development](docs/desarrollo.md) — environment, scripts and tests.
- [Release checklist](docs/release.md) — how to publish a version.
- [Roadmap](docs/roadmap.md) — phases toward full modeling.
- [Licenses](docs/licencias.md) — GPL-3.0 and dependencies.

### Current scope

- Interactive 3D scene with orbit, zoom and grid.
- **Cube**, **sphere** and **cylinder** primitives.
- Selection, duplication, deletion and transformation with gizmos or numeric inputs.
- **Vertex** and **Face** modes for cubes, selecting in the viewport or the side list.
- Vertex editing by gizmo or coordinates.
- **Extrusion** of the selected quad face along its normal, with side faces persisted.
- **Inset** of the selected face with a ring and inner face persisted.
- Per-object base colour.
- Save and load in the custom JSON format (`malla-scene`, version 1).
- **Undo/redo** of up to 100 operations.

It does **not** yet include edge selection, interactive mesh operations, subdivision, modifiers, animation, advanced materials, standard import/export or final rendering. Mesh editing is cube-only, and extrusion and inset use fixed values.

### Shortcuts

| Key | Action |
|---|---|
| `Tab` | Vertex mode |
| `G` / `R` / `S` | Move / rotate / scale |
| `E` | Extrude the selected face |
| `I` | Inset the selected face |
| `Ctrl/Cmd+Z` | Undo |
| `Ctrl/Cmd+Shift+Z` or `Ctrl/Cmd+Y` | Redo |
| `Delete` | Delete selection |
| `Ctrl/Cmd+S` / `Ctrl/Cmd+O` | Save / open scene |

### Requirements

- **Node.js 22.12 or later**.
- npm.
- For the desktop build: Windows 10/11 x64.

### Running

```bash
npm install
npm run dev
```

Vite serves the app in the browser with hot reload.

### Desktop build

```bash
npm run electron:start   # try the desktop app
npm run dist             # build the Windows executables
```

The binaries land in `release/`:

- `release/Malla 3D-Portable-1.0.1.exe` — single portable executable.
- `release/Malla 3D Setup 1.0.1.exe` — full installer.
- `release/win-unpacked/Malla 3D.exe` — ready-to-open app folder.

### Verification

```bash
npm run lint
npm run build
```

There are also Playwright end-to-end tests in `e2e/editor.spec.ts`.

### License

**GNU General Public License v3.0 (GPL-3.0)** — the full text is in [LICENSE](LICENSE). You may use, modify and redistribute the project, including commercially, as long as you publish the source of your modified versions under the same license. Copyright (C) 2026 Alberto Ortiz.

Notices and licenses of the dependencies (Electron, Chromium, React, Three.js) are retained in the binaries.
