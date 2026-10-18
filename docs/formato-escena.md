# Formato de escena `malla-scene` v1

Formato propio de Malla 3D basado en JSON. **No** es compatible con `.blend`,
glTF, FBX ni OBJ. La especificación viva está en `src/sceneTypes.ts`.

## Estructura raíz

```json
{
  "format": "malla-scene",
  "version": 1,
  "watermark": { "product": "Malla 3D", "notice": "NO COMERCIAL" },
  "objects": [ ]
}
```

| Campo | Tipo | Obligatorio | Descripción |
| --- | --- | --- | --- |
| `format` | string | sí | Debe ser exactamente `"malla-scene"` |
| `version` | number | sí | Debe ser exactamente `1` |
| `watermark` | object | no al cargar | Marca de agua escrita por el editor al guardar |
| `objects` | array | sí | Lista de objetos; puede estar vacía |

Al guardar se emite siempre `watermark: { "product": "Malla 3D", "notice": "NO COMERCIAL" }`.
Al cargar se valida `format`, `version` y cada objeto; el resto de campos se
ignoran. Quitar la marca de agua al redistribuir viola la licencia.

## Objeto

```json
{
  "id": "0f4c1c5e-…",
  "name": "Cubo",
  "kind": "cube",
  "color": "#dc7650",
  "position": [0, 0.5, 0],
  "rotation": [0, 0, 0],
  "scale": [1, 1, 1],
  "vertices": [[-0.5, -0.5, -0.5], "…"],
  "faces": [[0, 3, 2, 1], "…"]
}
```

| Campo | Tipo | Obligatorio | Validación |
| --- | --- | --- | --- |
| `id` | string | sí | UUID generado por el editor |
| `name` | string | sí | Cualquier texto |
| `kind` | string | sí | `"cube"`, `"sphere"` o `"cylinder"` |
| `color` | string | sí | Hex `#RRGGBB` (regex `^#[0-9a-f]{6}$`, sin importar mayúsculas) |
| `position` | [x, y, z] | sí | Tres números finitos, unidades (1 = 1 m) |
| `rotation` | [x, y, z] | sí | Tres números finitos **en radianes** |
| `scale` | [x, y, z] | sí | Tres números finitos |
| `vertices` | array | no | Solo en `kind: "cube"`; ver límites abajo |
| `faces` | array | no | Solo en `kind: "cube"`; ver límites abajo |

### Geometría editable (solo cubos)

| Regla | Valor |
| --- | --- |
| `vertices` permitido en | únicamente `kind: "cube"` |
| Nº de vértices | entre 8 (`defaultCubeVertices`) y 100 000 |
| Cada vértice | `[x, y, z]` con números finitos, en coordenadas locales del objeto |
| `faces` permitido en | únicamente `kind: "cube"` |
| Nº de caras | entre 6 y 100 000 |
| Cada cara | array de 3 a 1000 índices **enteros** `0 ≤ índice < número de vértices` |
| Orden de índices | sentido antihorario visto desde fuera (define la normal) |

Un archivo que incumpla cualquiera de estas reglas se rechaza con el aviso
«El archivo no es una escena Malla compatible» y la escena en memoria no se
modifica. Los escenarios sin `vertices`/`faces` se aceptan (escenarios
heredados) y el editor reconstruye el cubo por defecto al renderizar.

### Cubo por defecto

8 vértices de ±0,5 en cada eje y 6 caras quad:

| Cara | Índices |
| --- | --- |
| Inferior | `0 3 2 1` |
| Superior | `4 5 6 7` |
| Trasera | `0 4 7 3` |
| Derecha | `1 2 6 5` |
| Frontal | `0 1 5 4` |
| Izquierda | `3 7 6 2` |

## Convenciones del editor

- **Unidades:** 1 unidad = 1 metro; el cubo por defecto mide 1 × 1 × 1.
- **Rotaciones:** el archivo guarda radianes; la interfaz muestra grados.
- **Aparición de objetos:** el primer objeto nace en `[0, 0.5, 0]`; los
  siguientes usan `x = ((n-1) % 3) * 1.4 - 1.4`, `y = 0.5`, `z = 0.7`.
- **Colores:** ciclan entre `#dc7650`, `#6c9c95`, `#d4aa52`, `#7e8fbd`,
  `#c47e9b`.
- **Extrusión:** añade `n` vértices (n = nº de vértices de la cara), elimina
  la cara origen y añade `n` caras laterales + 1 tapa al final de la lista.
- **Inset:** añade `n` vértices, elimina la cara origen y añade `n` caras de
  borde + 1 cara interior al final.
- El índice de cara seleccionada tras una operación apunta a la cara recién
  creada (la última de la lista).

## Ejemplo completo

```json
{
  "format": "malla-scene",
  "version": 1,
  "watermark": { "product": "Malla 3D", "notice": "NO COMERCIAL" },
  "objects": [
    {
      "id": "3f9d1d0a-6c2e-4a41-9b60-6a53f1e6d2a1",
      "name": "Cubo",
      "kind": "cube",
      "color": "#dc7650",
      "position": [0, 0.5, 0],
      "rotation": [0, 0, 0],
      "scale": [1, 1, 1],
      "vertices": [
        [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5], [0.5, 0.5, -0.5], [-0.5, 0.5, -0.5],
        [-0.5, -0.5, 0.5], [0.5, -0.5, 0.5], [0.5, 0.5, 0.5], [-0.5, 0.5, 0.5]
      ],
      "faces": [[0, 3, 2, 1], [4, 5, 6, 7], [0, 4, 7, 3], [1, 2, 6, 5], [0, 1, 5, 4], [3, 7, 6, 2]]
    },
    {
      "id": "b7a1d1f2-2b55-4f0e-9f0d-1a2c3d4e5f60",
      "name": "Esfera 2",
      "kind": "sphere",
      "color": "#6c9c95",
      "position": [0, 0.5, 0.7],
      "rotation": [0, 0, 0],
      "scale": [1, 1, 1]
    }
  ]
}
```

## Evolución del formato

Cualquier cambio incompatible debe incrementar `version` y añadir una ruta
de migración en `loadScene` (`src/App.tsx`), que hoy solo acepta `version === 1`.
