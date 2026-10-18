# Checklist de release

Proceso para publicar una versión de Malla 3D en GitHub Releases. Los
ejemplos usan la versión `1.0.0`; sustitúyela por la que toque.

## 1. Preparar el código

1. Rama limpia y actualizada en `main`:

   ```bash
   git checkout main
   git pull origin main
   git status        # debe estar limpio
   ```

2. Actualizar la versión **solo** en `package.json` (`"version"`). El nombre
   de los binarios y el tag derivan de ese campo.
3. Verificación completa:

   ```bash
   npm run lint
   npm run test:model
   npm run build
   npx playwright install chromium   # solo si faltan navegadores
   npm run test:e2e
   ```

   Todo debe quedar en verde. Si se cambia el código de la app, las pruebas
   e2e son obligatorias.

## 2. Compilar los binarios

```bash
npm run dist
```

Comprobar en `release/`:

- `Malla 3D Setup <v>.exe` (instalador NSIS)
- `Malla 3D-Portable-<v>.exe` (portable)
- `latest.yml` y `<instalador>.exe.blockmap` (solo si se quiere
  auto-actualización con electron-updater)

## 3. Prueba manual mínima

1. Cerrar cualquier instancia abierta de Malla 3D.
2. Abrir `win-unpacked\Malla 3D.exe`: debe aparecer la ventana con el cubo y
   la cuadrícula renderizados.
3. Abrir el **portable**: debe arrancar igual.
4. Comprobar al menos: crear esfera, moverla con `G`, deshacer/rehacer,
   guardar (descarga `escena-malla.json`) y volver a abrirlo.
5. Cerrar las instancias de prueba antes de continuar.

## 4. Commit y etiqueta

```bash
git add -A
git commit -m "chore: release v1.0.0"
git tag -a v1.0.0 -m "Malla 3D v1.0.0 - <resumen>"
git push origin main
git push -f origin v1.0.0
```

Regla: **el tag debe apuntar al commit cuyo código generó los binarios**. Si
se corrige algo después, repetir build + tag + push forzado del tag mientras
la release no esté publicada.

## 5. Publicar en GitHub

1. <https://github.com/alberto2005-coder/malla-3d/releases> → **Draft a new
   release**.
2. Tag `v1.0.0`, target `main`.
3. Título: `Malla 3D v<versión>`.
4. Descripción: qué incluye, cómo instalar y aviso de SmartScreen (ver
   ejemplo abajo).
5. Subir los dos `.exe` desde `release/`. Opcionalmente `latest.yml` y los
   `.blockmap` si se habilitan auto-actualizaciones.
6. **Publish release** (marcar *pre-release* solo si es una prueba).

No subir `win-unpacked/`, `dist/`, `release/` completo ni `node_modules`; en
`.gitignore` ya están excluidos del repo, pero el drop de la release admite
cualquier archivo y es fácil colar basura.

### Plantilla de descripción

```markdown
## Qué incluye
- Escena 3D interactiva (órbita, zoom, cuadrícula) con cubo, esfera y cilindro
- Selección, duplicado, eliminación y transformación con manipuladores o valores numéricos
- Modos Vértice y Cara para cubos, edición de vértices, extrusión e inset
- Guardado/carga en formato propio `malla-scene` (JSON v1) y deshacer/rehacer de 100 pasos

## Instalación
- **Instalador:** `Malla 3D Setup <v>.exe`
- **Portable:** `Malla 3D-Portable-<v>.exe`

> Ejecutable no firmado: SmartScreen puede mostrarse la primera vez →
> *Más información → Ejecutar de todos modos*. Solo Windows x64.
> Prototipo no afiliado a Blender. Licencia de código disponible no
> comercial (ver LICENSE).
```

## 6. Después de publicar

- Verificar que la release carga y que ambos archivos se descargan completos.
- Probar la descarga e instalación en otra máquina o usuario si es posible.
- Si algo falla: corregir, repetir los pasos 2–5 y marcar la release anterior
  como *deprecated* (editar → *Set as a pre-release* o *Delete* + recrear).

## Historial de versiones

| Versión | Contenido |
| --- | --- |
| 1.0.0 | Primera release pública: editor 3D con primitivas, transformación, edición de malla de cubos (vértice/cara/extrusión/inset), color, `malla-scene` v1 y deshacer/rehacer. Windows x64 (NSIS + portable). |
