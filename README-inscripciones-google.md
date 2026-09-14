# Automatizacion de inscripciones en Google Sheets

Este proyecto ya deja el formulario preparado para enviar cada inscripcion a Google Apps Script. El script crea o reutiliza una hoja de calculo llamada `Inscripciones Mosco Events` dentro de la carpeta `📝 Inscripciones — Mosco Events`, crea una pestana por partida y guarda ahi todas las respuestas.

## Activacion

1. Entra con la cuenta de MoscoEvents en Google Drive.
2. Crea o abre la carpeta `📝 Inscripciones — Mosco Events`.
3. Pulsa `Nuevo` > `Mas` > `Google Apps Script`.
4. Borra el contenido inicial y pega el codigo de `google-apps-script-inscripciones.js`.
5. Pulsa `Implementar` > `Nueva implementacion`.
6. En tipo selecciona `Aplicacion web`.
7. Configura:
   - Ejecutar como: `Yo`.
   - Quien tiene acceso: `Cualquier usuario` o `Cualquier usuario con el enlace`.
8. Autoriza los permisos que pida Google.
9. Copia la URL terminada en `/exec`.
10. Pega esa URL en `inscripciones-config.js`, dentro de `appsScriptUrl`.

Cuando `appsScriptUrl` tenga la URL de Apps Script, cada envio del formulario:

- Se guardara en Google Sheets en la pestana de la partida correcta.
- Guardara la firma en una carpeta `Firmas inscripciones`.
- Enviara el aviso a `inscripciones@moscoevents.com`.
- Enviara una copia de las respuestas al correo del participante desde
  `inscripciones@moscoevents.com` (ver "Mensajero de correo" mas abajo).
- Guardara el metodo, importe y estado del pago seleccionado, calculado siempre a partir del
  precio de la partida elegida (mas el suplemento de alquiler si aplica), nunca un importe fijo.
- Exigira que el participante haya confirmado el pago en PayPal antes de aceptar la inscripcion.

Cuando cambie `google-apps-script-inscripciones.js`, crea una nueva version del despliegue
desde `Implementar` > `Gestionar implementaciones` para que la aplicacion web use los cambios,
**o usa el despliegue automatizado con `clasp` descrito abajo.**

El valor `SPREADSHEET_ID` de `google-apps-script-inscripciones.js` fija la hoja activa para evitar que una carpeta renombrada o una hoja duplicada desvie nuevas inscripciones y el contador de plazas.

Si `appsScriptUrl` esta vacio, la web conserva el envio anterior por FormSubmit como respaldo.

## Cloudflare: la CSP tiene que dejar pasar Apps Script

**Esto no vive en el repositorio y rompe las inscripciones sin dar ningun error visible.**

`www.moscoevents.com` no lo sirve GitHub Pages directamente: delante hay Cloudflare, que
inyecta cabeceras de respuesta que no estan en ningun fichero de este repositorio. Entre ellas
va la `Content-Security-Policy`, y de ella depende que el navegador pueda hablar siquiera con
el backend de Apps Script.

Hasta el 2026-09-13 la politica era `script-src 'self'` y no declaraba `connect-src`. Eso
bloqueaba las dos vias que usa `registro.js`:

- El sondeo de aforo, que es un `<script>` JSONP a `script.google.com` (`script-src`).
- El envio del formulario por `fetch` (`connect-src`, que al no estar declarado caia en
  `default-src 'self'`).

Las inscripciones seguian entrando solo porque `form-action` no estaba declarado, asi que el
respaldo por navegacion real del formulario sobrevivia; pero el contador de plazas nunca
funcionaba, una partida llena parecia abierta hasta despues de que el participante hubiera
pagado en PayPal, y el comprobante se mostraba en una pagina pelada de Apps Script en vez de en
la web.

El fallo era invisible en local (el servidor de desarrollo no manda ninguna CSP) y con `curl`
(que ignora la CSP por completo). **Solo se ve en un navegador real contra el dominio publicado.**

### Donde se configura

Dos sitios del panel de Cloudflare, ninguno de los dos versionado aqui:

| Sitio | Que pone |
| --- | --- |
| Rules > Transform Rules > Modify Response Header, regla `security` | `Content-Security-Policy`, `Cross-Origin-Resource-Policy`, `Referrer-Policy`, `X-Content-Type-Options` |
| Rules > Settings > Managed Transforms > "Add security headers" | Ponia `x-xss-protection`, `x-frame-options` y `expect-ct` (las tres obsoletas). Apagado el 2026-09-13 |

### Reglas que hay que respetar

- La CSP debe mantener `https://script.google.com https://script.googleusercontent.com` en
  **`script-src` y en `connect-src`**. Hacen falta los dos dominios porque Apps Script redirige
  `/exec` a `script.googleusercontent.com` para servir la respuesta.
- **No anadir nunca una directiva `form-action`** sin incluir `https://script.google.com` y
  `https://formsubmit.co`. Ahora mismo no existe, y es el ultimo camino que queda si `fetch`
  falla.
- Una `<meta>` CSP en el HTML solo puede restringir mas, nunca relajar la cabecera: no hay
  arreglo posible desde el repositorio. Cualquier cambio se hace en el panel de Cloudflare.

Valor vigente desde el 2026-09-13:

```
default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' https://script.google.com https://script.googleusercontent.com; connect-src 'self' https://script.google.com https://script.googleusercontent.com; frame-ancestors 'none';
```

## Arranques en frio del backend

Google apaga el proyecto de Apps Script tras unos minutos sin uso. Medido contra el despliegue
real: con la instancia caliente el endpoint `action=status` responde en unos 2,4 s, pero en frio
tarda mucho mas (12 s, 23 s y 26 s en distintos arranques). En un sitio de poco trafico la
mayoria de visitas caen en el camino frio.

Por eso el sondeo de aforo de `registro.js` espera 30 s y no 8, y por eso, si aun asi caduca, la
pagina avisa de que no ha podido comprobar las plazas en vez de dar por hecho que hay sitio: el
pago por PayPal se hace ANTES de enviar la inscripcion, asi que asumir en silencio que queda
hueco puede costarle el dinero a alguien.

## Cuenta que ejecuta el backend: inscripciones@moscoevents.com

Desde el 2026-09-12 el proyecto de Apps Script activo (`apps-script-inscripciones/`) pertenece y
se ejecuta como `inscripciones@moscoevents.com`, no como la cuenta personal `moscoeventes@gmail.com`
usada originalmente. Motivo: para que las notificaciones al organizador y (si el mensajero fallara)
la copia de respaldo al participante salgan ya con la identidad correcta, sin depender de un relay.

El proyecto viejo (carpeta `apps-script/`, cuenta `moscoeventes@gmail.com`) se deja de usar pero no
se borra, por si hiciera falta volver atras. Su URL `/exec` antigua puede seguir viva un tiempo como
respaldo silencioso; no debe usarse para nada nuevo.

**Limitacion descubierta al migrar:** un despliegue de "Aplicacion web" con acceso "Cualquier
usuario" creado *solo* por API/`clasp` (`clasp deploy` sin pasar por el editor) se queda con un
nivel de acceso mas restrictivo del que pide el manifest en cuentas de Google Workspace — la URL
da 403 "Necesitas acceso" aunque `appsscript.json` diga `"access": "ANYONE_ANONYMOUS"`. Google
parece exigir una confirmacion interactiva (solo disponible en `Implementar > Gestionar
implementaciones > editar > Implementar`) para activar de verdad el acceso anonimo en una cuenta
de dominio. Si se necesita crear una implementacion nueva alguna vez, hay que abrirla en el editor
web (logueado con la cuenta del dominio) y pulsar "Implementar" una vez a mano, aunque los campos
ya muestren los valores correctos.

## Despliegue automatizado con clasp

Cada proyecto de Apps Script tiene su propia carpeta con `clasp`, y clasp guarda varias sesiones
con nombre (`-u <nombre>`) en el mismo `~/.clasprc.json` para poder desplegar cada uno con la
cuenta de Google correcta sin cerrar sesion entre medias:

| Carpeta | Cuenta | Perfil de clasp |
| --- | --- | --- |
| `apps-script-inscripciones/` | `inscripciones@moscoevents.com` | `-u inscripciones` |
| `apps-script-correo/` (mensajero) | `inscripciones@moscoevents.com` | `-u inscripciones` |
| `apps-script-pagos/` (verificador PayPal) | `info@moscoevents.com` | `-u info` |
| `apps-script/` (**legacy, ya no se despliega**) | `moscoeventes@gmail.com` | `-u default` (sin `-u`) |

### Configuracion inicial de una cuenta nueva (una sola vez)

1. Instala Node.js si no esta instalado, y `npm install -g @google/clasp` (ya hecho en esta
   maquina).
2. `clasp -u <nombre> login` — abre el navegador y pide autorizar el acceso con esa cuenta de
   Google. Si el entorno no puede abrir un servidor local (`localhost:xxxxx no disponible` en el
   navegador), usa `clasp -u <nombre> login --no-localhost`: da una URL para abrir a mano y pide
   pegar de vuelta la URL de redireccion (`http://localhost:8888/?code=...`) tras autorizar.
3. Las sesiones caducan de vez en cuando (error `invalid_grant` / `invalid_rapt`, tipico en cuentas
   de Workspace) y hay que repetir el login.

### Uso habitual (dentro de la carpeta de cada proyecto)

- `npm run push`: copia la ultima version del `.js` correspondiente del repo y la sube al proyecto
  de Apps Script con `clasp push`, sin crear una implementacion nueva ni cambiar la URL `/exec`.
- `npm run deploy`: hace lo anterior y ademas actualiza la implementacion guardada en
  `deployment-id.txt`, para que la URL `/exec` ya sirva el codigo nuevo. Si `deployment-id.txt` no
  existe, la crea (ver la limitacion de acceso anonimo explicada arriba).

`.clasp.json`, `Code.js`/`Código.js`, `deployment-id.txt` y las credenciales de `clasp login` no se
suben a Git (ver `.gitignore`): son configuracion local de quien despliega, no del sitio.

## Mensajero de correo (inscripciones@moscoevents.com)

Ademas del backend principal, hay un segundo proyecto de Apps Script, el mensajero
(`google-apps-script-correo.js`), que tambien pertenece a `inscripciones@moscoevents.com` y se
despliega como aplicacion web independiente. Desde la migracion es redundante en el dia a dia (el
backend ya envia directamente como `inscripciones@moscoevents.com`), pero se deja activo como
segunda via: si el backend fallara o se desplegara alguna vez desde otra cuenta, sigue enviando la
copia al participante con la identidad correcta.

- El backend le pasa el correo ya montado con `UrlFetchApp` (`CONFIG.MAIL_RELAY_URL`), junto con
  una clave compartida. El mensajero rechaza cualquier peticion sin esa clave y cualquier envio si
  no se esta ejecutando con `inscripciones@moscoevents.com`.
- Si el mensajero falla o no esta configurado, el backend envia la copia el mismo (ya como
  `inscripciones@moscoevents.com`) y manda un aviso de error al organizador.
- La clave vive solo en `apps-script/clave-mensajero.txt` (fuera de Git, compartido con
  `apps-script-inscripciones/` via su `sync.js`). Los `sync.js` la insertan en el codigo al
  subirlo; en el repositorio solo queda el marcador `__CLAVE_MENSAJERO__`. Si se cambia la clave,
  hay que volver a desplegar los proyectos que la usan.
- Si se anade un permiso nuevo al mensajero, hay que abrir su proyecto en el editor con
  `inscripciones@moscoevents.com` y ejecutar `autorizar` una vez. Del mismo modo, en el backend,
  `probarMensajero` concede el permiso de `UrlFetchApp` y comprueba que el mensajero responde.

## Mensajero de respaldo (moscoeventes@gmail.com)

El 2026-09-13 se descubrio que `inscripciones@moscoevents.com` **no entrega correo fuera del
dominio**: los avisos internos al organizador llegan, pero la copia al participante no sale de
Google (comprobado con Gmail y con un servidor de diagnostico que acepta cualquier mensaje). Se
anadieron el SPF y el DMARC que faltaban en el DNS y el bloqueo siguio, asi que la causa esta en
la configuracion de Workspace, no en la autenticacion del dominio.

Como red de seguridad existe `apps-script-correo-gmail/`: el mismo `google-apps-script-correo.js`,
desplegado en un proyecto aparte de `moscoeventes@gmail.com`, cuenta que si entrega fuera. Por eso
`SENDER_EMAIL` ya no esta fijo en el codigo: cada `sync.js` sustituye el marcador
`__CUENTA_REMITENTE__` por la cuenta que le toca, y el mensajero sigue rechazando cualquier envio
si no lo ejecuta esa cuenta.

| Carpeta | Cuenta | Perfil de clasp | Uso |
| --- | --- | --- | --- |
| `apps-script-correo/` | `inscripciones@moscoevents.com` | `-u inscripciones` | El normal |
| `apps-script-correo-gmail/` | `moscoeventes@gmail.com` | por defecto (sin `-u`) | Respaldo |

Para activar el respaldo hay que cambiar `CONFIG.MAIL_RELAY_URL` en
`google-apps-script-inscripciones.js` por la URL `/exec` de este proyecto y volver a desplegar el
backend (`cd apps-script-inscripciones && npm run deploy`). Para volver atras, se restaura la URL
del mensajero del dominio y se despliega otra vez: el backend no distingue entre uno y otro.

Los dos pasos manuales que clasp no puede hacer, con el proyecto abierto en el editor web y la
sesion iniciada como `moscoeventes@gmail.com`:

1. Ejecutar la funcion `autorizar` una vez, para conceder el permiso de envio de `MailApp`.
2. `Implementar > Gestionar implementaciones > editar (lapiz) > Quien tiene acceso: Cualquier
   usuario > Implementar`. Una implementacion creada solo con `clasp` responde "Acceso denegado"
   aunque el manifest pida `ANYONE_ANONYMOUS` (la misma limitacion descrita mas arriba, que
   resulta no ser exclusiva de las cuentas de Workspace).

Mientras el bloqueo del dominio siga sin resolverse, conviene revisar el estado real del envio en
`admin.google.com > Informes > Registro de correo electronico`, que dice de cada mensaje si se
entrego, se rechazo o lo bloqueo una politica.
