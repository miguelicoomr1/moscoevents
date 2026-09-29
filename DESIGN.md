---
name: Mosco Events
description: Parte de operaciones sobre papel de campo — airsoft y simulación táctica en Pedrola
colors:
  field-ink: "#151713"
  field-ink-soft: "#292d26"
  field-olive: "#59644e"
  field-signal: "#f25c35"
  field-signal-dark: "#bd3d20"
  field-lime: "#d7ee62"
  field-paper: "#f3f1e9"
  field-paper-warm: "#e9e4d8"
  field-surface: "#fffdf7"
  surface-strong: "#dfdbcf"
  text-soft: "#4e554c"
  text-muted: "#72786f"
  field-line: "rgba(21, 23, 19, 0.16)"
  field-line-strong: "rgba(21, 23, 19, 0.34)"
  night-floor: "#070806"
typography:
  display:
    fontFamily: "Oswald, sans-serif"
    fontSize: "clamp(4.4rem, 10vw, 9.7rem)"
    fontWeight: 700
    lineHeight: 0.82
    letterSpacing: "-0.055em"
  headline:
    fontFamily: "Oswald, sans-serif"
    fontSize: "clamp(2.7rem, 6vw, 5.5rem)"
    fontWeight: 700
    lineHeight: 0.94
    letterSpacing: "-0.045em"
  title:
    fontFamily: "Oswald, sans-serif"
    fontSize: "clamp(1.7rem, 3vw, 2.45rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "normal"
  body:
    fontFamily: "Rajdhani, sans-serif"
    fontSize: "1.1rem"
    fontWeight: 600
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Rajdhani, sans-serif"
    fontSize: "0.86rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  sm: "10px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  xxl: "32px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "22px"
  lg: "30px"
  xl: "50px"
  section: "clamp(78px, 9vw, 132px)"
components:
  button-primary:
    backgroundColor: "{colors.field-signal}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "14px 24px"
    height: "54px"
  button-primary-hover:
    backgroundColor: "{colors.field-signal-dark}"
    textColor: "#ffffff"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.field-ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "0 14px"
    height: "44px"
  nav-link-hover:
    backgroundColor: "{colors.field-lime}"
    textColor: "{colors.field-ink}"
  card:
    backgroundColor: "rgba(255, 253, 247, 0.94)"
    textColor: "{colors.field-ink}"
    rounded: "{rounded.xxl}"
    padding: "clamp(28px, 5vw, 52px)"
  input-field:
    backgroundColor: "{colors.field-paper}"
    textColor: "{colors.field-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
    height: "52px"
  stat-tile:
    backgroundColor: "rgba(255, 255, 255, 0.06)"
    textColor: "{colors.field-lime}"
    rounded: "{rounded.xl}"
    padding: "24px 30px"
---

# Design System: Mosco Events

## Overview

**Creative North Star: "El Parte de Operaciones"**

Este sistema es un informe de campo, no un folleto. La página se lee como un parte
operativo mecanografiado sobre papel cálido (#f3f1e9) y anotado a mano con un rotulador
naranja fluorescente: titulares condensados en mayúsculas apretadas, reglas gruesas de
color que abren cada bloque, y datos duros — fecha, hora, plazas, importe — expuestos sin
adorno. La información gana siempre a la decoración porque quien lee está decidiendo si
se apunta a una partida.

El contraste papel/noche es deliberado y estructural. El hero, la franja de datos y el
pie caen a tinta casi negra con fotografía real de partida debajo; todo lo demás vive
sobre papel. Ese salto marca el ritmo del documento: la portada es la escena, el cuerpo
es el parte. La rejilla de 56px superpuesta al hero y el remate naranja de 8px en su base
son la firma del sistema — la cuadrícula del mapa y el subrayado del anotador.

La tipografía sostiene el carácter: Oswald condensada, en mayúsculas, con
interletrado negativo agresivo (hasta -0.055em) y `line-height` por debajo de 1 para que
los titulares se compacten como un sello. Rajdhani en peso 600 lleva el texto corrido con
su propia rigidez técnica. Los acentos — Naranja Señal y Lima Marcaje — aparecen en dosis
pequeñas y siempre con función: señalar acción o abrir sección.

**Key Characteristics:**

- Papel cálido como suelo por defecto; el oscuro es un recurso de escena, no el tema.
- Titulares condensados, en mayúsculas, con interletrado negativo y líneas apretadas.
- Reglas de color de 7–8px como puntuación estructural: abren `h2`, tarjetas y hero.
- Acentos escasos y funcionales; nunca superficie amplia.
- Sombras difusas y anchas: hojas de papel apoyadas, no cajas flotando.
- Fotografía documental propia de cada partida como único registro de imagen.

## Colors

Paleta de campo: papel envejecido y tinta oliva como base, con dos marcadores de alta
visibilidad que hacen todo el trabajo de señalización.

### Primary

- **Naranja Señal** (`#f25c35`): el color de "aquí se actúa". Fondo de todo botón y
  enlace de acción, remate de 7px bajo cada `h2`, banda de 8px al pie del hero, y color
  del anillo de foco (`outline: 2px solid`) en todo el formulario de inscripción. Su
  versión profunda, **Naranja Señal Oscuro** (`#bd3d20`), aparece solo en `:hover`/
  `:active` y como base de la sombra proyectada de los botones.
- **Lima Marcaje** (`#d7ee62`): el subrayado fluorescente del parte. Marca lo vivo, no lo
  accionable: fondo del enlace de navegación bajo el cursor, regla de 54px que abre cada
  tarjeta, cifra grande de la franja de datos, y halo radial difuso que ilumina la
  esquina de las secciones de eventos y calendario.

### Secondary

- **Oliva de Campo** (`#59644e`): el verde apagado del sistema, presente como token de
  marca heredado. Uso contenido; no compite con los dos marcadores.

### Neutral

- **Tinta de Campo** (`#151713`): el negro verdoso del texto. Titulares, cuerpo sobre
  papel, fondo de la franja de datos y del botón de menú móvil.
- **Tinta Suave** (`#292d26`): enlaces de navegación en reposo y texto de segundo rango.
- **Papel de Campo** (`#f3f1e9`): el suelo del documento. Fondo de `html`, de las
  secciones claras, y de todo campo de formulario.
- **Papel Cálido** (`#e9e4d8`) y **Papel Cansado** (`#dfdbcf`): escalones tonales para
  separar bloques sin recurrir a bordes ni sombras.
- **Superficie** (`#fffdf7`): el blanco roto de las tarjetas y desplegables, siempre a
  ~94% de opacidad para que el papel de debajo se transparente.
- **Texto Apagado** (`#4e554c`) y **Texto Mudo** (`#72786f`): párrafo secundario y
  metadatos.
- **Línea** (`rgba(21,23,19,0.16)`) y **Línea Marcada** (`rgba(21,23,19,0.34)`): el borde
  del sistema. La versión marcada es el trazo de los campos de formulario y el estado
  hover de las tarjetas.
- **Suelo de Noche** (`#070806`): el negro del pie y de la escena del hero.

### Named Rules

**La Regla del Marcador.** Naranja Señal y Lima Marcaje son rotuladores, no pintura. Cada
uno ocupa como mucho un 5% de la superficie visible: una píldora, una regla de 7px, una
cifra. En cuanto un acento se convierte en fondo de un bloque entero, ha dejado de
señalar y el parte se ha vuelto cartel.

**La Regla del Reparto.** El naranja señala **acción**; la lima señala **estado o
apertura**. Un enlace que no lleva a ninguna parte nunca es naranja, y una regla de
apertura de sección nunca es lima si la sección es accionable. Cruzar los dos roles
rompe la lectura del documento.

**La Regla del Papel por Defecto.** El oscuro es escena, no tema. Se reserva al hero
(sobre fotografía), a la franja de datos y al pie. Una sección de contenido nueva nace
sobre papel; volcarla a oscuro requiere una razón narrativa, no una preferencia.

## Typography

**Display Font:** Oswald (con `sans-serif` de reserva), pesos 500 y 700.
**Body Font:** Rajdhani (con `sans-serif` de reserva), pesos 400, 600 y 700.
**Label Font:** Rajdhani 700 en mayúsculas; no hay familia de etiqueta aparte.

**Character:** Dos condensadas técnicas que hablan el mismo idioma. Oswald aporta la
verticalidad del cartel de servicio público; Rajdhani, la rigidez cuadrada de un panel de
instrumentos. Juntas suenan a documento operativo impreso, no a marca de consumo. La
pareja es cerrada a propósito: el sistema no admite una tercera voz.

### Hierarchy

- **Display** (Oswald 700, `clamp(4.4rem, 10vw, 9.7rem)`, `line-height: 0.82`,
  `letter-spacing: -0.055em`): exclusivo del `h1` del hero, en blanco sobre fotografía,
  alineado a la izquierda, con sombra de texto amplia para sobrevivir a cualquier foto.
- **Headline** (Oswald 700, `clamp(2.7rem, 6vw, 5.5rem)`, `line-height: 0.94`,
  `letter-spacing: -0.045em`): los `h2` de sección. Siempre en mayúsculas, alineados a la
  izquierda, seguidos de su regla naranja de 72×7px.
- **Title** (Oswald 700, `clamp(1.7rem, 3vw, 2.45rem)`, `line-height: 1.05`): títulos de
  tarjeta de evento y `legend` del formulario (1.45rem).
- **Body** (Rajdhani 600, `1.1rem`, `line-height: 1.6`): párrafo del sistema. El cuerpo
  nunca baja de 600 — en 400 la familia se deshace sobre papel cálido.
- **Label** (Rajdhani 700, `0.86rem`, mayúsculas, interletrado abierto): navegación,
  botones (0.92rem), kickers, `dt` de las fichas de evento. La única capa del sistema con
  interletrado positivo.

### Named Rules

**La Regla de las Dos Voces.** Oswald titula, Rajdhani informa. Ninguna superficie nueva
carga una tercera familia, ni siquiera para código, cifras o citas. Si un texto no encaja
en ninguna de las dos, el problema es la jerarquía, no la fuente.

**La Regla de la Compresión.** Todo lo que va en Oswald va en mayúsculas, con
interletrado negativo y `line-height` por debajo de 1.05. Un titular Oswald con
interletrado neutro y línea holgada deja de pertenecer a este sistema.

## Layout

Columna centrada de 1240px (`--field-content`) como medida del documento; la cabecera
flotante es más ancha (hasta 1380px) porque se despega del cuerpo. Las secciones respiran
con `padding: clamp(78px, 9vw, 132px) max(6vw, 24px)` — vertical generoso, lateral que
nunca baja de 24px.

Todo se alinea a la izquierda. Titulares, reglas de color, contenido de hero y tarjetas
arrancan del mismo eje; el centrado se reserva a la franja de datos y a la sección de
contacto, donde el bloque es corto y simétrico por naturaleza.

Cada sección que no es el hero se separa de la anterior con un `border-top` de 1px en
Línea, no con un cambio de fondo. La galería rompe el patrón con una rejilla de 12
columnas, `grid-auto-rows: 150px` y flujo denso: cada séptima imagen ocupa un bloque
mayor, de modo que el mosaico nunca se lee como una cuadrícula regular.

Breakpoints reales del sistema: 1200px y 900px (`min-width`, para ampliaciones), y 1040px,
900px y 640px (`max-width`, para el colapso). 900px es la frontera principal: por debajo,
la navegación pasa a menú desplegable y el hero cambia a su recorte vertical
(`mosco9-movil.webp`). El sistema respeta `prefers-reduced-motion` y
`(hover: none), (pointer: coarse)`.

Ritmo de espaciado observado: 8 / 12 / 22 / 30 / 50px, con `clamp()` para el relleno
interno de tarjeta (28→52px) y para el aire de sección.

### Named Rules

**La Regla del Margen Izquierdo.** El documento tiene un margen y todo cuelga de él.
Centrar un titular, una regla o un bloque de contenido largo rompe la lectura de parte.

## Elevation & Depth

**Papel sobre mesa.** Las tarjetas son hojas apoyadas sobre el fondo, y la sombra es la
luz ambiente que se cuela por debajo: muy difusa, muy amplia, muy tenue (hasta 70px de
desenfoque al 14% de opacidad). Nunca es dramática ni direccional. Al pasar el cursor la
hoja se levanta 4px y su sombra se ensancha: es el mismo objeto un poco más arriba, no un
objeto distinto.

La cabecera es el único elemento que no obedece a esta lógica: flota sobre el contenido
con `backdrop-filter: blur(24px) saturate(145%)` y un borde blanco translúcido — cristal
esmerilado apoyado sobre el parte.

### Shadow Vocabulary

- **Sombra de hoja** (`0 12px 34px rgba(30, 32, 26, 0.1)`): estado de reposo de tarjetas,
  paneles de formulario y tejas de datos.
- **Sombra de hoja levantada** (`0 24px 70px rgba(30, 32, 26, 0.14)`): estado `:hover` de
  tarjeta y reposo de los desplegables de navegación.
- **Sombra de cabecera** (`0 16px 48px rgba(11, 13, 10, 0.16)`): la barra flotante.
- **Sombra de acción** (`0 12px 28px rgba(189, 61, 32, 0.22)` → `0 16px 34px
  rgba(189, 61, 32, 0.3)` en hover): única sombra teñida del sistema. Lleva el color del
  propio botón, de modo que el naranja proyecta naranja.
- **Sombra de modal** (`0 30px 90px rgba(0, 0, 0, 0.52)`): solo la imagen ampliada, que
  sí flota sobre un fondo oscurecido.

### Named Rules

**La Regla de la Luz Ambiente.** Ninguna sombra del sistema tiene desplazamiento lateral
ni opacidad por encima del 22% sobre papel. Una sombra dura y corta convierte la hoja en
una caja y saca la página del parte operativo.

## Shapes

Sistema de esquinas generosamente redondeadas, escalonado por tamaño de objeto: 10px
(enlaces de desplegable), 12px (campos de formulario, enlaces de navegación, avisos),
14–16px (bloques de consentimiento, desplegables), 20px `--field-radius` (galería, tejas
de datos, modal) y 32px `--field-radius-lg` (tarjetas y paneles grandes). Cuanto mayor la
superficie, más blanda la esquina.

La píldora (`999px`) es una forma con significado propio: marca todo lo pulsable
(botones, badges del hero) y todas las reglas de color. Una regla de sección es
literalmente una píldora de 72×7px; un botón es la misma forma escalada. Esa coherencia
es la que hace que el subrayado naranja bajo un `h2` se lea como "de aquí sale acción".

El borde es de 1px y casi siempre en Línea o Línea Marcada; el sistema no usa bordes
gruesos. El único trazo grueso del vocabulario son las reglas de color de 7–8px, que no
son bordes sino marcas.

### Named Rules

**La Regla de la Marca de Apertura.** Todo bloque de primer nivel se abre con una marca
de color: `h2` con su píldora naranja de 72×7px, tarjeta con su píldora lima de 54×8px,
hero con su píldora naranja de 88×8px. Es la puntuación del documento; un bloque nuevo
sin marca de apertura se lee como continuación del anterior.

## Components

### Buttons

Carácter: **táctil y decidido**. Es un botón físico que se pulsa con el pulgar en la
calle, no una etiqueta clicable.

- **Shape:** píldora completa (`999px`), altura mínima 54px, relleno `14px 24px`.
- **Primary:** fondo Naranja Señal con borde del mismo color, texto blanco en Rajdhani
  700 mayúsculas a 0.92rem, sombra de acción teñida.
- **Hover:** fondo y borde a Naranja Señal Oscuro, `translateY(-3px)`, sombra más ancha.
- **Active:** `translateY(-1px)` — el botón se hunde a medio camino, no vuelve a cero.
- **Variantes:** `.whatsapp`, `.instagram` y `.galeria-btn` comparten exactamente la
  misma base; se diferencian por contexto, no por estilo. En el hero, el segundo botón en
  adelante se invierte a superficie translúcida sobre la fotografía.
- **Transición:** `0.18s ease` sobre transform, box-shadow, background y color.

### Navigation

- **Contenedor:** barra fija a 14px del borde superior, centrada, ancho
  `min(100% - 28px, 1380px)`, esquinas de 18px, papel al 46% con desenfoque de 24px.
- **Enlaces:** Rajdhani 700, 0.86rem, mayúsculas, Tinta Suave, altura mínima 44px,
  esquinas de 12px.
- **Hover / focus:** fondo Lima Marcaje, texto a Tinta de Campo, `translateY(-1px)`. El
  resaltado lima es la firma de la navegación.
- **Página actual:** la marca la aplica `header.js` sobre el enlace que corresponde a la
  URL abierta, nunca por posición.
- **Móvil (≤900px):** botón de menú de 44×44px en Tinta de Campo con esquinas de 12px.

### Cards / Containers

- **Corner Style:** 32px (`--field-radius-lg`).
- **Background:** Superficie al 94% sobre el papel de la sección.
- **Border:** 1px en Línea; pasa a Línea Marcada en hover.
- **Shadow Strategy:** sombra de hoja en reposo, sombra de hoja levantada en hover con
  `translateY(-4px)`.
- **Internal Padding:** `clamp(28px, 5vw, 52px)`.
- **Marcas propias:** píldora Lima Marcaje de 54×8px como apertura (`::before`), y un
  disco de 210px con trama diagonal naranja al 10% asomando por la esquina superior
  derecha, recortado por el `overflow: hidden` de la tarjeta (`::after`). Esa trama es el
  sello del sistema — una marca de registro que se sale del papel.

### Inputs / Fields

- **Style:** fondo Papel de Campo, borde de 1px en Línea Marcada, esquinas de 12px,
  altura mínima 52px, `font: inherit`.
- **Label:** `span` en Rajdhani 700 Tinta de Campo, sobre el campo, con 8px de separación.
- **Focus:** `outline: 2px solid` Naranja Señal con `outline-offset: 3px` — el anillo de
  foco es del color de acción y es visible, nunca suprimido.
- **Select:** flecha construida con dos gradientes lineales en Tinta de Campo; sin
  apariencia nativa.
- **Casillas de consentimiento:** bloque de 14px sobre Papel de Campo con borde en Línea y
  esquinas de 14px; la casilla mide 20×20px con `accent-color` Naranja Señal.

### Stat Tiles

Franja a ancho completo en Tinta de Campo con tejas translúcidas (blanco al 6%, borde
blanco al 14%, esquinas de 20px, relleno `24px 30px`, mínimo 190px de ancho). La cifra va
en Oswald 700 a 4rem y en Lima Marcaje — el único lugar del sistema donde la lima aparece
en tamaño grande, porque sobre tinta oscura es el dato lo que tiene que saltar.

### Gallery Grid

Rejilla de 12 columnas con filas automáticas de 150px, `grid-auto-flow: dense` y 12px de
hueco. Cada séptima imagen (`7n+1`, `7n+4`, `7n+6`) recibe un tramo mayor, de modo que el
mosaico se desordena con ritmo fijo. Las imágenes llevan esquinas de 20px, sin sombra en
reposo, y usan carga diferida con transición de opacidad al montarse. Es el componente
donde el sistema se aparta: sin marcas de color, sin bordes, solo fotografía.

## Do's and Don'ts

### Do:

- **Do** abrir todo bloque de primer nivel con su marca de color: píldora naranja de
  72×7px bajo un `h2`, píldora lima de 54×8px en una tarjeta.
- **Do** alinear a la izquierda por defecto y colgar titular, marca y contenido del mismo
  eje.
- **Do** componer los titulares en Oswald mayúsculas con interletrado negativo
  (−0.045em a −0.055em) y `line-height` por debajo de 1.05.
- **Do** mantener el cuerpo en Rajdhani 600 o superior; en 400 la familia pierde cuerpo
  sobre papel cálido.
- **Do** dar 44px de alto mínimo a todo destino táctil, y 52–54px en el formulario de
  inscripción, que se completa con el pulgar.
- **Do** teñir la sombra de un botón con su propio color (`rgba(189, 61, 32, …)`), como
  hace el botón primario.
- **Do** usar fotografía propia de una partida jugada para cualquier imagen nueva.
- **Do** respetar `prefers-reduced-motion` y las consultas de puntero grueso ya presentes
  en el sistema.

### Don't:

- **Don't** usar Naranja Señal o Lima Marcaje como fondo de un bloque entero ni como
  relleno decorativo; son marcadores, no pintura.
- **Don't** cruzar los roles de acento: naranja es acción, lima es estado o apertura.
- **Don't** cargar una tercera familia tipográfica. Oswald y Rajdhani son el sistema
  cerrado, también para cifras, código o citas.
- **Don't** añadir `!important` nuevo. El CSS arrastra muchos por capas históricas; el
  trabajo futuro no suma más y los retira del bloque que toque.
- **Don't** volcar una sección de contenido a fondo oscuro sin una razón narrativa: el
  oscuro es escena (hero, franja de datos, pie), no tema.
- **Don't** usar sombras duras, cortas o con desplazamiento lateral sobre papel; el
  vocabulario es luz ambiente difusa.
- **Don't** suprimir ni debilitar el anillo de foco naranja de 2px con 3px de separación.
- **Don't** usar stock ni ilustración genérica en ningún punto del sitio.
- **Don't** centrar titulares, reglas de apertura o bloques de texto largo.
