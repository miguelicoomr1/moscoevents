# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Usuario principal: **el jugador habitual**. Airsofter de la zona de Zaragoza que ya
conoce Mosco Events, llega casi siempre desde el móvil tras ver el aviso de una partida
en la comunidad de WhatsApp o en Instagram, y viene con una intención concreta: ver si
quedan plazas, inscribirse y pagar. Su éxito es terminar la inscripción sin fricción y
salir con la confirmación en el correo.

Audiencia secundaria: **el novato que evalúa si probar**. No ha jugado nunca o viene de
otro campo; necesita entender qué es una partida, qué equipo hace falta, si puede
alquilar, cuánto cuesta y qué normas se aplican antes de decidirse. Hay que ganarle,
pero nunca a costa de estorbar el camino del habitual.

## Product Purpose

moscoevents.com es la web oficial de Mosco Events, organizador de partidas de airsoft,
TCSIM y simulación táctica en Pedrola (Zaragoza). La web publica el calendario de
partidas, explica cada evento (fecha, horario, ubicación, precio, aforo, normas),
gestiona la inscripción y el pago online, y conserva la galería de cada partida jugada.
Éxito = partidas llenas con inscripciones completas y correctamente registradas, y una
comunidad que vuelve a la web para cada convocatoria.

## Positioning

Tres cosas a la vez, y es la combinación lo que no se copia honestamente:

1. **TCSIM como formato propio** — simulación táctica con sistema de curaciones reales,
   explosivos y granadas permitidas, no partida de airsoft al uso.
2. **Partidas privadas de grupo reducido** — aforo limitado (típicamente 26 plazas),
   ambiente cerrado y conocido frente al campo abierto masificado.
3. **Organización seria y trazable** — inscripción online real con control de aforo,
   normas por escrito, consentimiento y firma legal, comprobante por correo y galería
   publicada de cada partida.

## Operating Context

- El anuncio de cada partida circula primero por la comunidad de WhatsApp y por
  Instagram (@mosco.events); la web es el destino al que esos avisos apuntan.
- Consumo mayoritariamente móvil, a menudo con prisa (las plazas vuelan) y a veces con
  mala cobertura.
- Las partidas se juegan en Laser Counter (Pedrola, Zaragoza), habitualmente en franja
  de tarde.
- El ciclo de vida de un evento en la web: aparece en Próximos Eventos y Calendario →
  se abre inscripción en `registro.html` → se juega → pasa a Eventos anteriores y se
  publica su galería en `Galeria/`.
- Algunas partidas exigen contraseña de acceso (evento privado) y/o normas específicas
  en PDF además del reglamento general.

## Capabilities and Constraints

**Capacidades**

- Portada, Próximos Eventos, Calendario, Eventos anteriores, Galería, Normas, Contacto,
  Legales y Registro/inscripción.
- Catálogo de eventos definido a mano en `datos.js` y renderizado por
  `eventos-dinamicos.js` en listados, fichas de evento, calendario y galerías.
- Inscripción en `registro.html` / `registro.js`: datos del participante, equipo y
  equipamiento, selección de bando cuando el evento lo requiere, alquiler opcional,
  contraseña del evento, lectura de normas, consentimiento de imágenes, firma legal y
  confirmación de pago por PayPal.
- Sondeo de aforo en vivo por JSONP contra Apps Script.
- PWA instalable con `manifest.json` y `service-worker.js`.

**Restricciones duraderas**

- **Sitio estático sin build.** HTML, CSS y JS planos servidos por GitHub Pages con
  Cloudflare delante. No hay bundler, framework ni paso de compilación. El cache-busting
  es manual: cada cambio sube el `?v=N` del recurso en todas las páginas que lo cargan.
- **Cuatro idiomas: es, en, ca, fr.** Todo texto visible pasa por el sistema `data-i18n`
  de `i18n.js` y debe existir en los cuatro diccionarios `i18n-lang.*.js`. Añadir copy
  sin sus cuatro traducciones es una regresión.
- **Backends en Google Apps Script.** Inscripciones, pagos y correo viven en proyectos
  Apps Script separados (`apps-script*/`), desplegados con clasp. La `Content-Security-
  Policy` la inyecta Cloudflare, no el repositorio, y debe permitir `script.google.com`
  en `script-src` y `connect-src`: si no, las inscripciones fallan en silencio y solo se
  ve contra el dominio publicado, nunca en local ni con curl.
- El código de los backends está excluido de la publicación en `_config.yml`; no debe
  volver a servirse en abierto.
- Contenido en español como idioma base y fuente de verdad de las traducciones.

## Brand Commitments

- Nombre: **Mosco Events**. Dominio `www.moscoevents.com`.
- **La identidad visual actual es vinculante**: el tema editorial de campo implementado
  en `style.css` — papel cálido, tinta oliva-negra, naranja señal y lima de marcaje, con
  oscuro reservado al hero, la franja de datos y el pie. Oswald para titulares y Rajdhani
  para texto, tono operativo en mayúsculas. No se sustituye; el trabajo futuro la
  preserva y la afina. DESIGN.md es la autoridad sobre sus valores concretos.
- Voz: directa, operativa, sin adornos. Terminología propia: partida, TCSIM, bando,
  aforo/plazas, privada.
- Canales oficiales: comunidad de WhatsApp, WhatsApp directo (+34 698 125 932),
  Instagram @mosco.events, `info@moscoevents.com` (general) e
  `inscripciones@moscoevents.com` (inscripciones).

## Evidence on Hand

- Fotografía real y propia de cada partida jugada en `images/<fecha>/`, usada en las
  galerías y como portada de las tarjetas de evento.
- Reglamento general (`normas.html`, `Normas MOSCO EVENTS.pdf`) y normas específicas por
  partida en PDF cuando aplican.
- Página de legales completa (`legales-mosco-events.html`).
- Histórico real de partidas jugadas en `Eventos anteriores/` y `Galeria/`.
- **No existen** testimonios, reseñas, cifras de asistencia agregadas, premios ni
  menciones de prensa. No se inventan.

## Product Principles

1. **La inscripción es el producto.** Cualquier cambio que alargue o enturbie el camino
   de "veo la partida → me inscribo → pago → recibo confirmación" es un retroceso.
2. **Móvil primero, y con prisa.** El escenario real es un pulgar en la calle justo
   después de ver el aviso en WhatsApp.
3. **Decir la verdad del evento.** Fecha, horario, precio, aforo, normas y requisitos se
   muestran completos y exactos; nada de aforo optimista ni condiciones escondidas.
4. **El novato tiene que poder entrar solo.** Qué es, qué se necesita, qué cuesta y qué
   se puede alquilar debe ser respondible sin preguntar por WhatsApp.
5. **Sin build significa disciplina.** Cada cambio respeta el cache-busting, los cuatro
   diccionarios y la CSP; lo que no se verifica contra el dominio publicado no está
   verificado.

## Accessibility & Inclusion

No se ha establecido un estándar formal. Requisitos conocidos por el contexto de uso:
soporte real de los cuatro idiomas, legibilidad sobre fondo oscuro en exteriores y con
brillo de móvil, y objetivos táctiles cómodos en el formulario de inscripción, que es
largo y se completa desde el teléfono.
