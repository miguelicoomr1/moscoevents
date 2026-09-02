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
- Enviara el aviso a `moscoeventes@gmail.com`.
- Enviara una copia de las respuestas al correo del participante.
- Guardara el metodo, importe y estado del pago seleccionado, calculado siempre a partir del
  precio de la partida elegida (mas el suplemento de alquiler si aplica), nunca un importe fijo.
- Exigira que el participante haya confirmado el pago en PayPal antes de aceptar la inscripcion.

Cuando cambie `google-apps-script-inscripciones.js`, crea una nueva version del despliegue
desde `Implementar` > `Gestionar implementaciones` para que la aplicacion web use los cambios,
**o usa el despliegue automatizado con `clasp` descrito abajo.**

El valor `SPREADSHEET_ID` de `google-apps-script-inscripciones.js` fija la hoja activa para evitar que una carpeta renombrada o una hoja duplicada desvie nuevas inscripciones y el contador de plazas.

Si `appsScriptUrl` esta vacio, la web conserva el envio anterior por FormSubmit como respaldo.

## Despliegue automatizado con clasp (opcional)

La carpeta `apps-script/` contiene una configuracion de
[`clasp`](https://github.com/google/clasp), la herramienta oficial de Google para gestionar
proyectos de Apps Script desde la linea de comandos. Permite subir y desplegar cambios de
`google-apps-script-inscripciones.js` sin abrir el editor web cada vez.

### Configuracion inicial (una sola vez, la tiene que hacer quien administra la cuenta de Google)

Estos pasos requieren iniciar sesion con la cuenta de Google que es propietaria del proyecto de
Apps Script; nadie mas los puede completar en tu lugar.

1. Instala Node.js si no esta instalado, y `npm install -g @google/clasp` (ya hecho en esta
   maquina).
2. `clasp login` — abre el navegador y pide autorizar el acceso con la cuenta de Google
   propietaria del script. Las credenciales quedan guardadas en tu usuario, no en el repositorio.
3. Abre el proyecto de Apps Script en el navegador y ve a `Configuracion del proyecto` (icono de
   engranaje) para copiar el **ID de secuencia de comandos** (Script ID).
4. Dentro de `apps-script/`, crea `.clasp.json` con:
   ```json
   { "scriptId": "PEGA_AQUI_EL_SCRIPT_ID", "rootDir": "." }
   ```
5. Ve a `Implementar` > `Gestionar implementaciones` en el editor de Apps Script, abre la
   implementacion activa (la que genera la URL `/exec` usada en `inscripciones-config.js`) y copia
   su **ID de implementacion**. Guardalo en `apps-script/deployment-id.txt` (una sola linea, sin
   espacios).
### Uso habitual (a partir de ahi)

- `npm run push` (dentro de `apps-script/`): copia la ultima version de
  `google-apps-script-inscripciones.js` y la sube al proyecto de Apps Script con `clasp push`,
  sin crear una implementacion nueva ni cambiar la URL `/exec`.
- `npm run deploy`: hace lo anterior y ademas actualiza la implementacion guardada en
  `deployment-id.txt`, para que la URL `/exec` ya sirva el codigo nuevo.

`apps-script/.clasp.json`, `apps-script/deployment-id.txt` y las credenciales de `clasp login` no
se suben a Git (ver `.gitignore`): son configuracion local de quien despliega, no del sitio.
