# Malla 3D

Prototipo independiente de editor 3D. El nombre es provisional. No incorpora código, recursos ni marca de Blender.
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

**Política prevista; no es aún un texto de licencia ni asesoría legal.** El código se publicará bajo términos personalizados de código disponible, no como open source formal: no se contempla la venta ni el uso comercial del código o de forks sin autorización escrita. El ejecutable oficial podrá ejecutarse sin costo; su redistribución o venta requerirá autorización. Los forks y usos deberán conservar una marca Malla visible. La interfaz ya muestra el aviso y el JSON de escena conserva metadata de marca.

Antes de distribuir públicamente el código o los binarios, redactar y revisar legalmente la licencia completa y comprobar las licencias/avisos de dependencias y recursos. Los formatos de imagen y vídeo aún no se exportan, por lo que todavía no hay marca de agua visible en esos resultados.
