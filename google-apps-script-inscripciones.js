const CONFIG = {
    OWNER_EMAIL: "moscoeventes@gmail.com",
    DRIVE_FOLDER_NAME: "MoscoEvents",
    SPREADSHEET_NAME: "Inscripciones Mosco Events",
    SIGNATURES_FOLDER_NAME: "Firmas inscripciones",
    MAX_REGISTRATIONS_PER_EVENT: 20,
    RESERVATIONS_SHEET_NAME: "Reservas",
    WEBSITE_URL: "https://www.moscoevents.com",
    LOGO_URL: "https://www.moscoevents.com/images/base%20web/logo-header.webp",
    WHATSAPP_NUMBER: "34698125932",
    WHATSAPP_DISPLAY: "+34 698 125 932"
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

const RESERVATION_HEADERS = [
    "Fecha y hora registro",
    "Evento ID",
    "Evento",
    "Nombre",
    "Telefono"
];

function doGet(e) {
    const params = e && e.parameter ? e.parameter : {};

    if (value_(params.action) === "status") {
        return capacityStatusResponse_(params);
    }

    return html_("Inscripciones Mosco Events", "El sistema de inscripciones esta activo.");
}

function doPost(e) {
    const lock = LockService.getScriptLock();

    try {
        lock.waitLock(30000);

        const payload = e && e.parameter ? e.parameter : {};

        if (value_(payload.tipoRegistro) === "Reserva") {
            return saveReservation_(payload);
        }

        const record = normalizeRegistration_(payload);

        validateRegistration_(record);

        const folder = getOrCreateFolder_(CONFIG.DRIVE_FOLDER_NAME);
        const spreadsheet = getOrCreateSpreadsheet_(folder);
        const sheet = getOrCreateSheet_(spreadsheet, record.evento);

        if (registrationCount_(sheet) >= CONFIG.MAX_REGISTRATIONS_PER_EVENT) {
            return html_(
                "Partida llena",
                "La partida ya ha alcanzado el limite de 20 inscripciones. Vuelve al formulario para apuntarte a reservas."
            );
        }

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

function capacityStatusResponse_(params) {
    const eventId = value_(params.eventId);
    const eventName = value_(params.eventName);
    const callback = safeCallback_(params.callback);
    let count = 0;

    if (eventName) {
        const folder = getOrCreateFolder_(CONFIG.DRIVE_FOLDER_NAME);
        const spreadsheet = getOrCreateSpreadsheet_(folder);
        const sheet = spreadsheet.getSheetByName(sheetName_(eventName));

        count = registrationCount_(sheet);
    }

    const payload = {
        eventId: eventId,
        count: count,
        limit: CONFIG.MAX_REGISTRATIONS_PER_EVENT,
        full: count >= CONFIG.MAX_REGISTRATIONS_PER_EVENT
    };
    const content = callback
        ? `${callback}(${JSON.stringify(payload)});`
        : JSON.stringify(payload);
    const mimeType = callback
        ? ContentService.MimeType.JAVASCRIPT
        : ContentService.MimeType.JSON;

    return ContentService
        .createTextOutput(content)
        .setMimeType(mimeType);
}

function safeCallback_(value) {
    const callback = value_(value);

    return /^[A-Za-z_$][0-9A-Za-z_$]{0,80}$/.test(callback) ? callback : "";
}

function registrationCount_(sheet) {
    if (!sheet) {
        return 0;
    }

    return Math.max(0, sheet.getLastRow() - 1);
}

function saveReservation_(payload) {
    const reservation = {
        fechaRegistro: new Date(),
        eventoId: value_(payload.eventoId),
        evento: value_(payload.eventoTitulo),
        nombre: value_(payload.nombreReserva),
        telefono: value_(payload.telefonoReserva)
    };
    const missing = [];

    if (!reservation.eventoId) missing.push("Evento ID");
    if (!reservation.evento) missing.push("Evento");
    if (!reservation.nombre) missing.push("Nombre");
    if (!reservation.telefono) missing.push("Telefono");

    if (missing.length) {
        throw new Error(`Faltan campos obligatorios de la reserva: ${missing.join(", ")}`);
    }

    const folder = getOrCreateFolder_(CONFIG.DRIVE_FOLDER_NAME);
    const spreadsheet = getOrCreateSpreadsheet_(folder);
    const eventSheet = spreadsheet.getSheetByName(sheetName_(reservation.evento));

    if (registrationCount_(eventSheet) < CONFIG.MAX_REGISTRATIONS_PER_EVENT) {
        throw new Error("La partida todavia tiene plazas disponibles.");
    }

    const reservationSheet = getOrCreateNamedSheet_(
        spreadsheet,
        CONFIG.RESERVATIONS_SHEET_NAME,
        RESERVATION_HEADERS
    );

    reservationSheet.appendRow([
        reservation.fechaRegistro,
        safeCell_(reservation.eventoId),
        safeCell_(reservation.evento),
        safeCell_(reservation.nombre),
        safeCell_(reservation.telefono)
    ]);
    reservationSheet.autoResizeColumns(1, RESERVATION_HEADERS.length);

    return html_(
        "Reserva recibida",
        "Te hemos anadido a la lista de reservas. Contactaremos contigo cuando quede una plaza libre."
    );
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

    return getOrCreateNamedSheet_(spreadsheet, name, HEADERS);
}

function getOrCreateNamedSheet_(spreadsheet, name, headers) {
    let sheet = spreadsheet.getSheetByName(name);

    if (!sheet) {
        sheet = spreadsheet.insertSheet(name);
    }

    ensureHeaders_(sheet, headers);
    removeDefaultSheet_(spreadsheet);

    return sheet;
}

function ensureHeaders_(sheet, headers) {
    if (sheet.getLastRow() > 0) {
        return;
    }

    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length)
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
    const lines = includeAdminLinks ? [
        "Nueva inscripcion Mosco Events",
        "",
        "Se ha recibido una nueva inscripcion.",
        ""
    ] : [
        "Gracias por apuntarte a Mosco Events",
        "",
        `Hola ${record.nombre}, hemos recibido correctamente tu inscripcion para ${record.evento}.`,
        "Guarda este correo como comprobante de tu registro.",
        "",
    ];

    lines.push(
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
    );

    if (includeAdminLinks) {
        lines.push("", `Google Sheets: ${spreadsheetUrl}`, `Firma: ${signatureUrl || "No guardada"}`);
    } else {
        lines.push(
            "",
            "Si tienes cualquier problema o necesitas modificar algun dato, escribenos por WhatsApp:",
            `WhatsApp: ${CONFIG.WHATSAPP_DISPLAY}`,
            `https://wa.me/${CONFIG.WHATSAPP_NUMBER}`,
            "",
            "Nos vemos en la partida.",
            "Equipo Mosco Events"
        );
    }

    return lines.join("\n");
}

function buildHtmlBody_(record, spreadsheetUrl, signatureUrl, includeAdminLinks) {
    const eventRows = [
        ["Referencia", record.referencia],
        ["Evento", record.evento],
        ["Fecha evento", record.fechaEvento],
        ["Ubicacion", record.ubicacion],
        ["Horario", record.horario],
        ["Precio", record.precio]
    ];
    const participantRows = [
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
        participantRows.push(["Google Sheets", spreadsheetUrl], ["Firma", signatureUrl || "No guardada"]);
    }

    const renderRows = rows => rows.map(([label, value], index) => {
        const border = index === rows.length - 1 ? "" : "border-bottom:1px solid #e5e8e1;";

        return `
            <tr>
                <td width="36%" valign="top" style="padding:12px 14px;${border}color:#667061;font-size:13px;font-weight:700;line-height:1.35">
                    ${escapeHtml_(label)}
                </td>
                <td valign="top" style="padding:12px 14px;${border}color:#171c15;font-size:14px;line-height:1.35;word-break:break-word">
                    ${linkOrText_(value)}
                </td>
            </tr>
        `;
    }).join("");

    const title = includeAdminLinks ? "Nueva inscripci&oacute;n recibida" : "&iexcl;Gracias por apuntarte!";
    const intro = includeAdminLinks
        ? `Se ha registrado una nueva inscripci&oacute;n para <strong>${escapeHtml_(record.evento)}</strong>.`
        : `Hola <strong>${escapeHtml_(record.nombre)}</strong>, hemos recibido correctamente tu inscripci&oacute;n para <strong>${escapeHtml_(record.evento)}</strong>.`;
    const whatsappText = encodeURIComponent(`Hola Mosco Events, tengo una consulta sobre mi inscripcion ${record.referencia}.`);
    const whatsappUrl = `https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${whatsappText}`;
    const helpBlock = includeAdminLinks ? "" : `
        <tr>
            <td style="padding:0 28px 28px">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f6ef;border:1px solid #dce3d5;border-radius:12px">
                    <tr>
                        <td style="padding:20px;text-align:center">
                            <p style="margin:0 0 7px;color:#171c15;font-size:16px;font-weight:700">&iquest;Necesitas ayuda?</p>
                            <p style="margin:0 0 16px;color:#65705f;font-size:14px;line-height:1.55">Si tienes cualquier problema o necesitas modificar alg&uacute;n dato, escr&iacute;benos por WhatsApp.</p>
                            <a href="${escapeHtml_(whatsappUrl)}" style="display:inline-block;background:#25d366;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:12px 22px;border-radius:8px">CONTACTAR POR WHATSAPP</a>
                            <p style="margin:12px 0 0;color:#65705f;font-size:13px;font-weight:700">${escapeHtml_(CONFIG.WHATSAPP_DISPLAY)}</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    `;

    return `
        <!doctype html>
        <html lang="es">
        <head>
            <meta name="viewport" content="width=device-width,initial-scale=1">
            <meta name="color-scheme" content="light">
        </head>
        <body style="margin:0;padding:0;background:#eef0eb;font-family:Arial,Helvetica,sans-serif;color:#171c15">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#eef0eb">
                <tr>
                    <td align="center" style="padding:28px 12px">
                        <table role="presentation" width="620" cellpadding="0" cellspacing="0" style="width:100%;max-width:620px;background:#ffffff;border:1px solid #dfe3dc;border-radius:18px;overflow:hidden;box-shadow:0 8px 28px rgba(23,28,21,0.08)">
                            <tr>
                                <td style="padding:26px 28px;background:#11170f;border-bottom:4px solid #d6b96f">
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td width="82" valign="middle">
                                                <img src="${escapeHtml_(CONFIG.LOGO_URL)}" width="68" height="68" alt="Mosco Events" style="display:block;width:68px;height:68px;border:0;border-radius:50%">
                                            </td>
                                            <td valign="middle">
                                                <p style="margin:0 0 4px;color:#d6b96f;font-size:12px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase">Mosco Events</p>
                                                <p style="margin:0;color:#ffffff;font-size:22px;font-weight:800;line-height:1.2">Confirmaci&oacute;n de inscripci&oacute;n</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:30px 28px 22px;text-align:center">
                                    <span style="display:inline-block;margin-bottom:14px;padding:7px 12px;background:#edf5e8;border:1px solid #cfe0c5;border-radius:999px;color:#3d6131;font-size:12px;font-weight:800;letter-spacing:.5px">&#10003;&nbsp; INSCRIPCI&Oacute;N REGISTRADA</span>
                                    <h1 style="margin:0 0 12px;color:#171c15;font-size:28px;line-height:1.2">${title}</h1>
                                    <p style="margin:0 auto;max-width:500px;color:#596255;font-size:15px;line-height:1.65">${intro}</p>
                                    <p style="margin:18px 0 0;color:#7a8276;font-size:12px;text-transform:uppercase;letter-spacing:1px">Referencia</p>
                                    <p style="margin:5px 0 0;color:#171c15;font-family:Consolas,Monaco,monospace;font-size:18px;font-weight:800">${escapeHtml_(record.referencia)}</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:0 28px 22px">
                                    <p style="margin:0 0 9px;color:#778070;font-size:12px;font-weight:800;letter-spacing:1.1px;text-transform:uppercase">Datos de la partida</p>
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #dfe3dc;border-radius:12px;border-collapse:separate;border-spacing:0;overflow:hidden">
                                        ${renderRows(eventRows)}
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding:0 28px 24px">
                                    <p style="margin:0 0 9px;color:#778070;font-size:12px;font-weight:800;letter-spacing:1.1px;text-transform:uppercase">Datos del jugador</p>
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #dfe3dc;border-radius:12px;border-collapse:separate;border-spacing:0;overflow:hidden">
                                        ${renderRows(participantRows)}
                                    </table>
                                </td>
                            </tr>
                            ${helpBlock}
                            <tr>
                                <td style="padding:22px 28px;background:#171c15;text-align:center">
                                    <p style="margin:0 0 7px;color:#ffffff;font-size:14px;font-weight:700">Nos vemos en la partida.</p>
                                    <p style="margin:0;color:#aeb7a8;font-size:12px;line-height:1.5">Equipo Mosco Events &middot; <a href="${escapeHtml_(CONFIG.WEBSITE_URL)}" style="color:#d6b96f;text-decoration:none">moscoevents.com</a></p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
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

    if (payload.nombreReserva) {
        payload.nombreReserva = "[nombre recibido]";
    }

    if (payload.telefonoReserva) {
        payload.telefonoReserva = "[telefono recibido]";
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
