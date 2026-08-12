# Automatizacion de inscripciones en Google Sheets

Este proyecto ya deja el formulario preparado para enviar cada inscripcion a Google Apps Script. El script crea o reutiliza una hoja de calculo llamada `Inscripciones Mosco Events` dentro de la carpeta `MoscoEvents`, crea una pestana por partida y guarda ahi todas las respuestas.

## Activacion

1. Entra con la cuenta de MoscoEvents en Google Drive.
2. Crea o abre la carpeta `MoscoEvents`.
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

Si `appsScriptUrl` esta vacio, la web conserva el envio anterior por FormSubmit como respaldo.
