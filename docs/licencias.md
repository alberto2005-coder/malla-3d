# Licencias

## Licencia del proyecto

Malla 3D se publica bajo una **licencia propia de código disponible no
comercial**: [LICENSE](../LICENSE) en la raíz del repositorio.

En corto:

- No es software libre ni open source (no está avalada por la OSI).
- Uso, estudio y modificación privados y no comerciales: permitidos.
- Ejecutar el binario oficial: sin coste.
- Vender, usar comercialmente o redistribuir binarios: requiere autorización
  escrita del autor.
- Los forks no comerciales deben conservar el nombre y la marca «Malla», la
  marca de agua de la interfaz y el aviso `NO COMERCIAL` del JSON de escena.
- Las escenas y modelos 3D creados por el usuario son del usuario.

El texto completo manda siempre: léelo en [LICENSE](../LICENSE).

## Dependencias de terceros

El binario incluye las siguientes dependencias, cada una bajo su propia
licencia (independiente de la licencia de Malla 3D):

### Embebidas en el ejecutable (Electron)

| Componente | Licencia |
| --- | --- |
| Electron | MIT (texto en `LICENSE.electron.txt` dentro del binario) |
| Chromium / Blink / V8 | BSD-3-Clause y otras (texto en `LICENSES.chromium.html`) |
| ffmpeg (reproducción multimedia de Chromium) | LGPL v2.1 / usos adicionales — deshabilitado de fábrica en Electron |

### Dependencias de la aplicación (incluidas en `app.asar`)

| Paquete | Licencia | Uso |
| --- | --- | --- |
| `react`, `react-dom` | MIT | UI |
| `three` | MIT | Viewport 3D y WebGL |
| `lucide-react` | ISC | Iconografía |

### Dependencias de desarrollo (no se distribuyen en el binario)

| Paquete | Licencia |
| --- | --- |
| `vite` | MIT |
| `typescript` | Apache-2.0 |
| `electron-builder` | MIT |
| `@playwright/test` | Apache-2.0 |
| `oxlint` | MIT |
| `pngjs` | MIT |
| `@types/*` | MIT |

## Fuentes y activos

- El icono, la marca «Malla» y la interfaz son originales del proyecto.
- El proyecto es independiente: no incorpora código, recursos ni marca de
  Blender ni de ningún otro editor 3D.
- Si se añade una fuente tipográfica o un asset de terceros, registrar aquí
  su licencia antes de publicar la release.

## Nota

Conviene revisar legalmente tanto la licencia propia como el listado anterior
antes de una distribución amplia, en particular el apartado de ffmpeg en los
binarios de Electron.
