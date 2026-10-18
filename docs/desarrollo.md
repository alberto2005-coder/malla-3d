# Desarrollo

## Requisitos

- **Node.js 22.12 o posterior** (usa `node --test` y sintaxis moderna).
- npm (se recomienda el npm incluido con Node).
- Windows para compilar los `.exe`; el resto del flujo es multiplataforma.

## Puesta en marcha

```bash
git clone https://github.com/alberto2005-coder/malla-3d.git
cd malla-3d
npm install
npm run dev
```

`npm run dev` levanta Vite en `http://localhost:5173` con recarga en caliente.

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo Vite |
| `npm run build` | `tsc -b` (typecheck estricto) + `vite build` → `dist/` |
| `npm run preview` | Sirve el build de producción en local |
| `npm run lint` | Análisis estático con oxlint |
| `npm run electron:start` | Build + arranque de la app de escritorio |
| `npm run dist` | Build + `electron-builder --win` (NSIS + portable) |
| `npm run dist:portable` | Solo el ejecutable portable |
| `npm run dist:nsis` | Solo el instalador |
| `npm run test:model` | Pruebas unitarias (`node --test`) |
| `npm run test:e2e` | Pruebas end-to-end (Playwright) |

## Pruebas

### Unitarias (`tests/`)

Ejecutadas con el runner nativo de Node, sin framework:

- `tests/sceneTypes.test.mjs`: creación de cubos con vértices independientes,
  escenarios heredados sin datos de geometría, rechazo de geometría
  malformada, inmutabilidad al mover vértices, extrusión (cara superior y
  lateral) e inset.
- `tests/sceneHistory.test.mjs`: orden de deshacer/rehacer, purga de la rama
  de rehacer y límite de 100 pasos.

```bash
npm run test:model
```

### End-to-end (`e2e/`)

Playwright cubre un único flujo completo en dos proyectos: `desktop`
(1440 × 900) y `mobile` (iPhone 13). Comprueba render WebGL (la captura del
canvas debe tener más de 20 colores), creación de objetos, deshacer/rehacer,
descarga y validación del JSON, edición de vértices, extrusión e inset, y
ausencia de desbordamiento horizontal en móvil.

La configuración arranca Vite automáticamente en `127.0.0.1:4173` y usa
SwiftShader (`--use-angle=swiftshader`) para poder renderizar sin GPU.

```bash
# primera vez en una máquina nueva
npx playwright install chromium

npm run test:e2e
npm run test:e2e -- --project=mobile   # solo un proyecto
```

## Código y estilo

- TypeScript estricto (`tsconfig.app.json` / `tsconfig.node.json`) y ESM.
- oxlint con la configuración de `.oxlintrc.json`; el estilo del código es
  sin punto y coma, comillas simples, sangría de 2 espacios y espacios en
  objetos de tipo.
- Los iconos vienen de `lucide-react`; no hay librería de componentes.
- Tras cada cambio: `npm run lint && npm run build` (política del proyecto).

## Empaquetado

La configuración vive en el campo `build` de `package.json`:

| Clave | Valor |
| --- | --- |
| `appId` | `com.malla3d.editor` |
| `productName` | `Malla 3D` |
| `output` | `release/` |
| `files` | `dist/**`, `electron/**`, `public/**` (el `node_modules` se empaqueta aparte solo para dependencias) |
| targets Windows | `nsis` + `portable`, arquitectura x64 |
| icono | `build/icon.png` (1024 × 1024) |
| NSIS | instalación en dos pasos con elección de carpeta, acceso directo en escritorio y menú inicio |
| portable | nombre `Malla 3D-Portable-${version}.exe` |

```bash
npm run dist
# salida: release/Malla 3D Setup <v>.exe, release/Malla 3D-Portable-<v>.exe,
#         release/latest.yml y release/<instalador>.exe.blockmap
```

`release/` está en `.gitignore`: los binarios **nunca** se versionan, solo se
publican en GitHub Releases.

## Problemas conocidos

| Síntoma | Causa | Acción |
| --- | --- | --- |
| Warning «Some chunks are larger than 500 kB» | `SceneViewport` incluye Three.js (~591 kB) | Informativo; si se quiere arreglar, `build.chunkSizeWarningLimit` o dividir el visor |
| `THREE.WebGLShadowMap: PCFSoftShadowMap has been removed` | Three.js 0.186 eliminó ese modo de sombra | Sustituir `PCFSoftShadowMap` por `PCFShadowMap` en `SceneViewport.tsx` |
| `Executable doesn't exist … ms-playwright` | Faltan los navegadores de Playwright | `npx playwright install chromium` |
| El `.exe` no responde o no aparece | Otra instancia abierta (single-instance lock) | Cerrar la instancia previa |
