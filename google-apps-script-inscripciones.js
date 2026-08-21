const CONFIG = {
    OWNER_EMAIL: "moscoeventes@gmail.com",
    DRIVE_FOLDER_NAME: "MoscoEvents",
    SPREADSHEET_NAME: "Inscripciones Mosco Events",
    SIGNATURES_FOLDER_NAME: "Firmas inscripciones",
    MAX_REGISTRATIONS_PER_EVENT: 26,
    EVENT_SHEET_NAMES: {
        "sabado-29-08-2026": "29-08-2026"
    },
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
        const sheet = getOrCreateSheet_(spreadsheet, record.evento, record.eventoId);

        if (registrationCount_(sheet) >= CONFIG.MAX_REGISTRATIONS_PER_EVENT) {
            return html_(
                "Partida llena",
                `La partida ya ha alcanzado el limite de ${CONFIG.MAX_REGISTRATIONS_PER_EVENT} inscripciones. Vuelve al formulario para apuntarte a reservas.`
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
        const sheet = spreadsheet.getSheetByName(eventSheetName_(eventName, eventId));

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
    const eventSheet = spreadsheet.getSheetByName(
        eventSheetName_(reservation.evento, reservation.eventoId)
    );

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

function getOrCreateSheet_(spreadsheet, eventName, eventId) {
    const name = eventSheetName_(eventName, eventId);

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
        const border = index === rows.length - 1 ? "" : "border-bottom:1px solid #e6e1d6;";

        return `
            <tr>
                <td width="36%" valign="top" style="padding:13px 14px;${border}background:#f3f1e9;color:#62685f;font-size:12px;font-weight:800;line-height:1.35;text-transform:uppercase;letter-spacing:.35px">
                    ${escapeHtml_(label)}
                </td>
                <td valign="top" style="padding:13px 14px;${border}background:#fffdf8;color:#11150f;font-size:14px;font-weight:600;line-height:1.4;word-break:break-word">
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
            <td class="email-pad" style="padding:0 30px 30px">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#11150f;border:1px solid #2d332b;border-radius:16px">
                    <tr>
                        <td style="padding:24px;text-align:center">
                            <p style="margin:0 0 8px;color:#d8f65a;font-size:12px;font-weight:900;letter-spacing:1.2px;text-transform:uppercase">Soporte de la partida</p>
                            <p style="margin:0 0 7px;color:#ffffff;font-size:20px;font-weight:900">&iquest;Necesitas ayuda?</p>
                            <p style="margin:0 auto 18px;max-width:440px;color:#b8bdb5;font-size:14px;line-height:1.6">Si tienes cualquier problema o necesitas modificar alg&uacute;n dato, escr&iacute;benos por WhatsApp.</p>
                            <a href="${escapeHtml_(whatsappUrl)}" style="display:inline-block;background:#ff5a36;color:#ffffff;text-decoration:none;font-size:13px;font-weight:900;padding:14px 24px;border-radius:999px;letter-spacing:.25px">CONTACTAR POR WHATSAPP</a>
                            <p style="margin:13px 0 0;color:#d8f65a;font-size:13px;font-weight:800">${escapeHtml_(CONFIG.WHATSAPP_DISPLAY)}</p>
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
            <style>
                @media only screen and (max-width: 520px) {
                    .email-shell { border-radius: 0 !important; }
                    .email-pad { padding-left: 18px !important; padding-right: 18px !important; }
                    .brand-title { font-size: 18px !important; }
                    .hero-title { font-size: 27px !important; }
                    .logo-cell { width: 66px !important; }
                }
            </style>
        </head>
        <body style="margin:0;padding:0;background:#e8e6dc;font-family:Arial,Helvetica,sans-serif;color:#11150f">
            <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">Tu inscripci&oacute;n en Mosco Events ha quedado registrada.</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;background:#e8e6dc">
                <tr>
                    <td align="center" style="padding:30px 12px">
                        <table class="email-shell" role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:#f7f5ee;border:1px solid #d7d3c7;border-radius:24px;overflow:hidden">
                            <tr>
                                <td height="7" style="height:7px;background:#ff5a36;font-size:0;line-height:0">&nbsp;</td>
                            </tr>
                            <tr>
                                <td class="email-pad" style="padding:25px 30px;background:#11150f">
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                        <tr>
                                            <td class="logo-cell" width="78" valign="middle">
                                                <img src="${escapeHtml_(CONFIG.LOGO_URL)}" width="62" height="62" alt="Mosco Events" style="display:block;width:62px;height:62px;border:2px solid #d8f65a;border-radius:50%">
                                            </td>
                                            <td valign="middle">
                                                <p style="margin:0 0 5px;color:#d8f65a;font-size:11px;font-weight:900;letter-spacing:1.8px;text-transform:uppercase">TCSIM &middot; Simulaci&oacute;n &middot; Experiencias</p>
                                                <p class="brand-title" style="margin:0;color:#ffffff;font-size:22px;font-weight:900;line-height:1.15;letter-spacing:-.4px">MOSCO EVENTS / INSCRIPCIONES</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td class="email-pad" style="padding:34px 30px 25px;text-align:center;background:#f7f5ee">
                                    <span style="display:inline-block;margin-bottom:16px;padding:8px 13px;background:#d8f65a;border-radius:999px;color:#11150f;font-size:11px;font-weight:900;letter-spacing:.7px">&#10003;&nbsp; INSCRIPCI&Oacute;N REGISTRADA</span>
                                    <h1 class="hero-title" style="margin:0 0 13px;color:#11150f;font-size:32px;font-weight:900;line-height:1.08;letter-spacing:-.8px">${title}</h1>
                                    <p style="margin:0 auto;max-width:510px;color:#5d645b;font-size:15px;line-height:1.65">${intro}</p>
                                    <p style="margin:22px 0 8px;color:#6f756c;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:1.4px">Referencia de inscripci&oacute;n</p>
                                    <p style="display:inline-block;margin:0;padding:11px 17px;background:#11150f;color:#ffffff;border-left:5px solid #ff5a36;font-family:Consolas,Monaco,monospace;font-size:17px;font-weight:900;letter-spacing:.5px">${escapeHtml_(record.referencia)}</p>
                                </td>
                            </tr>
                            <tr>
                                <td class="email-pad" style="padding:0 30px 23px">
                                    <p style="margin:0 0 10px;color:#ff5a36;font-size:11px;font-weight:900;letter-spacing:1.25px;text-transform:uppercase">01 / Datos de la partida</p>
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #d9d5c9;border-radius:14px;border-collapse:separate;border-spacing:0;overflow:hidden">
                                        ${renderRows(eventRows)}
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td class="email-pad" style="padding:0 30px 27px">
                                    <p style="margin:0 0 10px;color:#ff5a36;font-size:11px;font-weight:900;letter-spacing:1.25px;text-transform:uppercase">02 / Datos del jugador</p>
                                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #d9d5c9;border-radius:14px;border-collapse:separate;border-spacing:0;overflow:hidden">
                                        ${renderRows(participantRows)}
                                    </table>
                                </td>
                            </tr>
                            ${helpBlock}
                            <tr>
                                <td class="email-pad" style="padding:24px 30px;background:#11150f;border-top:6px solid #d8f65a;text-align:center">
                                    <p style="margin:0 0 7px;color:#ffffff;font-size:15px;font-weight:900">NOS VEMOS EN LA PARTIDA.</p>
                                    <p style="margin:0;color:#aeb4ab;font-size:12px;line-height:1.5">Equipo Mosco Events &middot; <a href="${escapeHtml_(CONFIG.WEBSITE_URL)}" style="color:#ff7a5c;text-decoration:none;font-weight:800">moscoevents.com</a></p>
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
        .setTitle(title)
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function sheetName_(value) {
    const name = String(value || "Sin evento")
        .replace(/[\\\/?*\[\]:]/g, " ")
        .replace(/\s+/g, " ")
        .trim();

    return (name || "Sin evento").slice(0, 90);
}

function eventSheetName_(eventName, eventId) {
    return CONFIG.EVENT_SHEET_NAMES[value_(eventId)] || sheetName_(eventName);
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
