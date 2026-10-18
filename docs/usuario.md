# Guía de usuario

Malla 3D es un editor 3D de escritorio. La ventana se divide en tres zonas:
panel de escena (izquierda), viewport 3D (centro) e inspector de propiedades
(derecha), con una barra superior de acciones y una barra de estado inferior.

## Arranque

1. Doble clic en `Malla 3D Setup 1.0.0.exe` (instalador) o en
   `Malla 3D-Portable-1.0.0.exe` (portable).
2. Se abre con un cubo ya colocado en el origen y seleccionado.
3. Si Windows muestra el aviso de SmartScreen (el ejecutable no está firmado
   con certificado comercial): **Más información → Ejecutar de todos modos**.

Solo una instancia puede estar abierta: al abrir un segundo ejecutable, este
se cierra y enfoca la ventana que ya estaba en uso.

## Panel de escena (izquierda)

- **Crear objeto:** botones `Cubo`, `Esfera` y `Cilindro`. Cada objeto nuevo
  recibe un número de secuencia, una de las cinco paletas de color y una
  posición de aparición desplazada.
- **Objetos:** lista con búsqueda (campo `Buscar`; muestra el indicador `/`).
  Clic en una fila para seleccionar el objeto. Si la lista está vacía se
  muestra «Escena vacía».
- **Duplicar / Eliminar:** botones del inspector; el duplicado se nombra
  `<nombre> copia`, se desplaza +1 en X y recibe un id nuevo.

## Viewport 3D (centro)

- **Orbitar:** arrastrar con el botón izquierdo.
- **Zoom:** rueda del ratón (entre 2,4 y 36 unidades).
- **Seleccionar:** clic en un objeto; clic en el vacío quita la selección.
- **Transformar:** aparecen manejadores según la herramienta activa
  (mover/rotar/escalar). Soltar el manejador commitea el cambio en el
  historial.
- **Cuadrícula:** botón de la esquina superior derecha para mostrarla u
  ocultarla. La rejilla mide 24 × 24 unidades y 1 unidad = 1 metro.
- El viewport muestra la marca `MALLA · CÓDIGO DISPONIBLE · NO COMERCIAL`;
  no se puede quitar.

## Inspector (derecha)

- **Nombre:** editable, se refleja en la lista de objetos.
- **Transformación:** campos numéricos de Posición (X/Y/Z), Rotación (en
  grados) y Escala. El botón con icono de retícula restablece la
  transformación a `posición [0, 0.5, 0]`, `rotación 0` y `escala 1`.
- **Apariencia:** selector de color base del objeto (hex `#RRGGBB`).
- **Listas de vértices/caras:** solo en modo de edición sobre un cubo.

## Modos de edición

| Modo | Cómo entrar | Qué permite |
| --- | --- | --- |
| Objeto | pestaña `Objeto` | Seleccionar y transformar el objeto completo |
| Vértice | pestaña `Vértice` o `Tab` | Seleccionar vértices del cubo y moverlos con manejador o coordenadas locales |
| Cara | pestaña `Cara` | Seleccionar caras del cubo y aplicar Extruir o Inset |

Las pestañas `Vértice` y `Cara` están desactivadas salvo que el objeto
seleccionado sea un cubo.

### Extrusión (`E`)

Toma la cara seleccionada, calcula su normal y la desplaza **0,8 unidades**
en esa dirección. Se generan una cara superior y tantas caras laterales como
vértices tenga la cara original. La cara original se sustituye.

### Inset (`I`)

Crea dentro de la cara seleccionada una cara interior más pequeña (20 % hacia
su centroide) y el anillo de caras laterales correspondiente.

Tanto el 0,8 como el 0,2 son valores fijos: no hay control interactivo de
distancia todavía.

## Guardar y cargar

- **Guardar** (`Ctrl+S`) descarga `escena-malla.json` con formato
  `malla-scene` versión 1, incluida la marca de agua. El indicador del panel
  vuelve a «sin cambios».
- **Abrir** (`Ctrl+O`) selecciona un `.json`. Si no es una escena compatible
  aparece un aviso y la escena actual no se toca.
- **Nueva escena** borra todos los objetos y reinicia la numeración.
- El deshacer/rehacer tiene 100 pasos; al cargar un archivo se limpia el
  historial.

## Atajos de teclado

| Atajo | Acción |
| --- | --- |
| `Ctrl`/`⌘` + `S` | Guardar escena |
| `Ctrl`/`⌘` + `O` | Abrir escena |
| `Ctrl`/`⌘` + `Z` | Deshacer |
| `Ctrl`/`⌘` + `Shift` + `Z` | Rehacer |
| `Ctrl`/`⌘` + `Y` | Rehacer |
| `Tab` | Alternar modo de edición (Vértice) |
| `G` | Herramienta Mover |
| `R` | Herramienta Rotar |
| `S` | Herramienta Escalar |
| `E` | Extruir cara seleccionada (modo Cara) |
| `I` | Inset de la cara seleccionada (modo Cara) |
| `Delete` / `Retrás` | Eliminar el objeto seleccionado |

Los atajos no se disparan mientras el foco está en un campo de texto, número,
lista o zona editable.

## Comportamiento responsivo

Por debajo de 850 px de ancho los paneles pasan a disposición vertical y la
página hace scroll; por debajo de 560 px se simplifican barras y el botón
`Guardar` queda solo con icono (conserva etiqueta accesible). En móvil la
prueba e2e comprueba que no hay desbordamiento horizontal.

## Límites del prototipo

La edición de malla solo funciona con cubos; esferas y cilindros admiten
transformación y color. No hay selección de aristas, subdivisión,
modificadores, animación, iluminación editable, texturas ni exportación a
formatos 3D estándar. El formato `.malla-scene` es propio de Malla 3D.
