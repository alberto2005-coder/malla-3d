# Documentación de Malla 3D

Documentación del proyecto **Malla 3D**, editor 3D independiente de escritorio
(Electron) y web (React + Three.js). Prototipo no afiliado a Blender.

| Documento | Para quién | Contenido |
| --- | --- | --- |
| [usuario.md](usuario.md) | Usuario final | Interfaz, paneles, modos de edición, atajos y flujo de guardado |
| [formato-escena.md](formato-escena.md) | Usuarios y desarrolladores | Especificación del formato de archivo `malla-scene` JSON v1 |
| [arquitectura.md](arquitectura.md) | Desarrolladores | Estructura del código, módulos, flujo de datos y decisiones técnicas |
| [desarrollo.md](desarrollo.md) | Desarrolladores | Entorno, scripts, pruebas, lint y empaquetado |
| [release.md](release.md) | Mantenedor | Checklist para publicar una versión (build, verificación, tag, upload) |
| [roadmap.md](roadmap.md) | Mantenedor / colaboradores | Plan de mejora: fases hacia un modelado completo (Blender + SketchUp) |
| [licencias.md](licencias.md) | Todos | Licencia propia y licencias de dependencias de terceros |

## Resumen del proyecto

- **Alcance actual:** escena 3D interactiva con primitivas (cubo, esfera,
  cilindro), selección y transformación, edición de malla solo para cubos
  (vértices, extrusión e inset), color por objeto, guardado/carga en JSON
  propio y deshacer/rehacer de 100 pasos.
- **Plataformas:** Windows x64 (instalador NSIS y ejecutable portable). El
  código también corre en navegador, pero solo el binario de Windows es una
  salida oficial.
- **Formato propio:** `malla-scene` JSON v1. **No** es compatible con `.blend`
  ni exporta glTF/FBX/OBJ.
- **Limitaciones conocidas:** sin selección de aristas, sin operaciones
  interactivas (los valores de extrusión e inset son fijos), sin subdivisión,
  sin modificadores, sin animación, sin materiales avanzados, sin render final.

## Requisitos mínimos

| Concepto | Requisito |
| --- | --- |
| Ejecutar el binario | Windows 10/11 x64 |
| Desarrollo | Node.js 22.12 o posterior + npm |
| Tarjeta gráfica | WebGL 1.0 (software con SwiftShader si no hay GPU) |

## Enlaces rápidos

- Repositorio: <https://github.com/alberto2005-coder/malla-3d>
- Releases: <https://github.com/alberto2005-coder/malla-3d/releases>
- Licencia: [../LICENSE](../LICENSE)
