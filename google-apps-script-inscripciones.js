const CONFIG = {
    OWNER_EMAIL: "moscoeventes@gmail.com",
    DRIVE_FOLDER_NAME: "MoscoEvents",
    SPREADSHEET_NAME: "Inscripciones Mosco Events",
    SIGNATURES_FOLDER_NAME: "Firmas inscripciones"
};

const HEADERS = [
    "Fecha registro",
    "Referencia",
    "Evento ID",
    "Evento",
    "Fecha evento",
    "Ubicacion",
    "Horario",
    "Precio",
    "Nombre",
    "Equipo",
    "Equipamiento",
    "Telefono",
    "Correo electronico",
    "Consentimiento imagenes",
    "Normas leidas",
    "Texto legal firmado",
    "Firma URL"
];

function doGet() {
    return html_("Inscripciones Mosco Events", "El sistema de inscripciones esta activo.");
}

function doPost(e) {
    const lock = LockService.getScriptLock();

    try {
        lock.waitLock(30000);

        const payload = e && e.parameter ? e.parameter : {};
        const record = normalizeRegistration_(payload);

        validateRegistration_(record);

        const folder = getOrCreateFolder_(CONFIG.DRIVE_FOLDER_NAME);
        const spreadsheet = getOrCreateSpreadsheet_(folder);
        const sheet = getOrCreateSheet_(spreadsheet, record.evento);
        const signatureUrl = saveSignature_(folder, record.firmaLegal, record.referencia);
        const row = buildSheetRow_(record, signatureUrl);
        let emailsSent = true;

        sheet.appendRow(row);
        sheet.autoResizeColumns(1, HEADERS.length);

        try {
            sendEmails_(record, spreadsheet.getUrl(), signatureUrl);
        } catch (mailError) {
            emailsSent = false;
            notifyError_(mailError, e);
        }

        return html_(
            "Inscripcion recibida",
            emailsSent
                ? "La inscripcion se ha registrado correctamente. Se ha enviado una copia al correo indicado."
                : "La inscripcion se ha registrado correctamente. Mosco Events revisara el envio de correo."
        );
    } catch (error) {
        notifyError_(error, e);

        return html_(
            "No se ha podido registrar",
            "Ha habido un problema al guardar la inscripcion. Contacta con Mosco Events para confirmarla."
        );
    } finally {
        try {
            lock.releaseLock();
        } catch (lockError) {
            console.error(lockError);
        }
    }
}

function normalizeRegistration_(payload) {
    return {
        fechaRegistro: new Date(),
        referencia: value_(payload.referencia) || `MOSCO-${Utilities.getUuid().slice(0, 8).toUpperCase()}`,
        eventoId: value_(payload.eventoId || payload.eventoSeleccionado),
        evento: value_(payload.Evento || payload.eventoTitulo) || "Sin evento",
        fechaEvento: value_(payload["Fecha del evento"]),
        ubicacion: value_(payload.Ubicacion),
        horario: value_(payload.Horario),
        precio: value_(payload.Precio),
        nombre: value_(payload.nombre),
        equipo: value_(payload.equipo),
        equipamiento: value_(payload.equipamiento),
        telefono: value_(payload.telefono),
        correo: value_(payload.email || payload._replyto),
        consentimientoImagenes: value_(payload.consentimientoImagenes),
        normasLeidas: value_(payload.normasLeidas || payload["Normas leidas y aceptadas"]),
        textoLegalFirmado: value_(payload["Texto legal firmado"]) ||
            "Acepta normas, condiciones de participacion, aviso legal y politica de privacidad de Mosco Events.",
        firmaLegal: value_(payload.firmaLegal)
    };
}

function validateRegistration_(record) {
    const missing = [];

    if (!record.evento || record.evento === "Sin evento") missing.push("Evento");
    if (!record.nombre) missing.push("Nombre");
    if (!record.equipo) missing.push("Equipo");
    if (!record.equipamiento) missing.push("Equipamiento");
    if (!record.telefono) missing.push("Telefono");
    if (!record.correo) missing.push("Correo electronico");
    if (!record.consentimientoImagenes) missing.push("Consentimiento imagenes");
    if (record.normasLeidas !== "Si") missing.push("Normas leidas");
    if (!record.firmaLegal) missing.push("Firma");

    if (missing.length) {
        throw new Error(`Faltan campos obligatorios: ${missing.join(", ")}`);
    }
}

function getOrCreateFolder_(name) {
    const folders = DriveApp.getFoldersByName(name);

    if (folders.hasNext()) {
        return folders.next();
    }

    return DriveApp.createFolder(name);
}

function getOrCreateChildFolder_(parent, name) {
    const folders = parent.getFoldersByName(name);

    if (folders.hasNext()) {
        return folders.next();
    }

    return parent.createFolder(name);
}

function getOrCreateSpreadsheet_(folder) {
    const files = folder.getFilesByName(CONFIG.SPREADSHEET_NAME);

    while (files.hasNext()) {
        const file = files.next();

        if (file.getMimeType() === "application/vnd.google-apps.spreadsheet") {
            return SpreadsheetApp.openById(file.getId());
        }
    }

    const spreadsheet = SpreadsheetApp.create(CONFIG.SPREADSHEET_NAME);
    const file = DriveApp.getFileById(spreadsheet.getId());

    folder.addFile(file);

    try {
        DriveApp.getRootFolder().removeFile(file);
    } catch (error) {
        // En algunas cuentas Google no permite quitar el archivo de la raiz.
    }

    return spreadsheet;
}

function getOrCreateSheet_(spreadsheet, eventName) {
    const name = sheetName_(eventName);
    let sheet = spreadsheet.getSheetByName(name);

    if (!sheet) {
        sheet = spreadsheet.insertSheet(name);
    }

    ensureHeaders_(sheet);
    removeDefaultSheet_(spreadsheet);

    return sheet;
}

function ensureHeaders_(sheet) {
    if (sheet.getLastRow() > 0) {
        return;
    }

    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length)
        .setFontWeight("bold")
        .setBackground("#d6b96f")
        .setFontColor("#10150f");
}

function removeDefaultSheet_(spreadsheet) {
    if (spreadsheet.getSheets().length <= 1) {
        return;
    }

    ["Sheet1", "Hoja 1"].forEach((name) => {
        const sheet = spreadsheet.getSheetByName(name);

        if (sheet && sheet.getLastRow() === 0 && spreadsheet.getSheets().length > 1) {
            spreadsheet.deleteSheet(sheet);
        }
    });
}

function buildSheetRow_(record, signatureUrl) {
    return [
        record.fechaRegistro,
        safeCell_(record.referencia),
        safeCell_(record.eventoId),
        safeCell_(record.evento),
        safeCell_(record.fechaEvento),
        safeCell_(record.ubicacion),
        safeCell_(record.horario),
        safeCell_(record.precio),
        safeCell_(record.nombre),
        safeCell_(record.equipo),
        safeCell_(record.equipamiento),
        safeCell_(record.telefono),
        safeCell_(record.correo),
        safeCell_(record.consentimientoImagenes),
        safeCell_(record.normasLeidas),
        safeCell_(record.textoLegalFirmado),
        safeCell_(signatureUrl)
    ];
}

function saveSignature_(folder, dataUrl, reference) {
    const match = String(dataUrl || "").match(/^data:image\/png;base64,(.+)$/);

    if (!match) {
        return "";
    }

    const signaturesFolder = getOrCreateChildFolder_(folder, CONFIG.SIGNATURES_FOLDER_NAME);
    const bytes = Utilities.base64Decode(match[1].replace(/\s/g, "+"));
    const blob = Utilities.newBlob(bytes, "image/png", `${reference}.png`);
    const file = signaturesFolder.createFile(blob);

    return file.getUrl();
}

function sendEmails_(record, spreadsheetUrl, signatureUrl) {
    const ownerSubject = `Nueva inscripcion - ${record.evento}`;
    const participantSubject = `Copia de tu inscripcion - ${record.evento}`;
    const ownerBody = buildPlainBody_(record, spreadsheetUrl, signatureUrl, true);
    const ownerHtml = buildHtmlBody_(record, spreadsheetUrl, signatureUrl, true);

    MailApp.sendEmail({
        to: CONFIG.OWNER_EMAIL,
        subject: ownerSubject,
        body: ownerBody,
        htmlBody: ownerHtml,
        replyTo: record.correo,
        name: "Mosco Events Inscripciones"
    });

    MailApp.sendEmail({
        to: record.correo,
        subject: participantSubject,
        body: buildPlainBody_(record, "", "", false),
        htmlBody: buildHtmlBody_(record, "", "", false),
        name: "Mosco Events"
    });
}

function buildPlainBody_(record, spreadsheetUrl, signatureUrl, includeAdminLinks) {
    const lines = [
        "Inscripcion Mosco Events",
        "",
        `Referencia: ${record.referencia}`,
        `Evento: ${record.evento}`,
        `Fecha evento: ${record.fechaEvento}`,
        `Ubicacion: ${record.ubicacion}`,
        `Horario: ${record.horario}`,
        `Precio: ${record.precio}`,
        "",
        `Nombre: ${record.nombre}`,
        `Equipo: ${record.equipo}`,
        `Equipamiento: ${record.equipamiento}`,
        `Telefono: ${record.telefono}`,
        `Correo electronico: ${record.correo}`,
        `Consentimiento imagenes: ${record.consentimientoImagenes}`,
        `Normas leidas: ${record.normasLeidas}`,
        `Texto legal firmado: ${record.textoLegalFirmado}`,
        "Firma legal: recibida"
    ];

    if (includeAdminLinks) {
        lines.push("", `Google Sheets: ${spreadsheetUrl}`, `Firma: ${signatureUrl || "No guardada"}`);
    }

    return lines.join("\n");
}

function buildHtmlBody_(record, spreadsheetUrl, signatureUrl, includeAdminLinks) {
    const rows = [
        ["Referencia", record.referencia],
        ["Evento", record.evento],
        ["Fecha evento", record.fechaEvento],
        ["Ubicacion", record.ubicacion],
        ["Horario", record.horario],
        ["Precio", record.precio],
        ["Nombre", record.nombre],
        ["Equipo", record.equipo],
        ["Equipamiento", record.equipamiento],
        ["Telefono", record.telefono],
        ["Correo electronico", record.correo],
        ["Consentimiento imagenes", record.consentimientoImagenes],
        ["Normas leidas", record.normasLeidas],
        ["Texto legal firmado", record.textoLegalFirmado],
        ["Firma legal", "Recibida"]
    ];

    if (includeAdminLinks) {
        rows.push(["Google Sheets", spreadsheetUrl], ["Firma", signatureUrl || "No guardada"]);
    }

    const table = rows.map(([label, value]) => (
        `<tr><th>${escapeHtml_(label)}</th><td>${linkOrText_(value)}</td></tr>`
    )).join("");

    return `
        <div style="font-family:Arial,sans-serif;color:#1c2119">
            <h2>Inscripcion Mosco Events</h2>
            <table cellpadding="8" cellspacing="0" style="border-collapse:collapse;border:1px solid #ddd">
                ${table}
            </table>
        </div>
    `;
}

function notifyError_(error, e) {
    try {
        MailApp.sendEmail({
            to: CONFIG.OWNER_EMAIL,
            subject: "Error en la automatizacion de una inscripcion",
            body: `${error && error.stack ? error.stack : error}\n\nDatos recibidos:\n${JSON.stringify(safePayload_(e), null, 2)}`
        });
    } catch (mailError) {
        console.error(mailError);
    }
}

function safePayload_(e) {
    const payload = Object.assign({}, e && e.parameter ? e.parameter : {});

    if (payload.firmaLegal) {
        payload.firmaLegal = "[firma recibida]";
    }

    return payload;
}

function html_(title, message) {
    return HtmlService
        .createHtmlOutput(`
            <!doctype html>
            <html lang="es">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>${escapeHtml_(title)}</title>
                <style>
                    body {
                        margin: 0;
                        min-height: 100vh;
                        display: grid;
                        place-items: center;
                        background: #10150f;
                        color: #f4efe4;
                        font-family: Arial, sans-serif;
                    }
                    main {
                        width: min(560px, calc(100% - 32px));
                        padding: 28px;
                        border: 1px solid rgba(214, 185, 111, .45);
                        background: #171d16;
                    }
                    h1 {
                        margin: 0 0 12px;
                        color: #d6b96f;
                        font-size: 28px;
                    }
                    p {
                        margin: 0;
                        line-height: 1.5;
                    }
                    a {
                        color: #d6b96f;
                    }
                </style>
            </head>
            <body>
                <main>
                    <h1>${escapeHtml_(title)}</h1>
                    <p>${escapeHtml_(message)}</p>
                    <p style="margin-top:18px"><a href="https://www.moscoevents.com/registro.html">Volver a inscripciones</a></p>
                </main>
            </body>
            </html>
        `)
        .setTitle(title);
}

function sheetName_(value) {
    const name = String(value || "Sin evento")
        .replace(/[\\\/?*\[\]:]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    return (name || "Sin evento").slice(0, 90);
}

function value_(value) {
    return String(value || "").trim();
}

function safeCell_(value) {
    const text = value_(value);

    return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function linkOrText_(value) {
    const text = value_(value);

    if (/^https?:\/\//.test(text)) {
        return `<a href="${escapeHtml_(text)}">${escapeHtml_(text)}</a>`;
    }

    return escapeHtml_(text || "-");
}

function escapeHtml_(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
