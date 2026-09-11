// Verificador de pagos PayPal de Mosco Events.
//
// Este proyecto de Apps Script pertenece a la cuenta info@moscoevents.com,
// que es donde llegan de verdad los avisos "Ha recibido dinero" de PayPal
// (el buzon que usa PayPal.Me/MoscoEvents). Un disparador de tiempo,
// instalado una vez a mano con instalarDisparador(), ejecuta revisarPagos()
// cada 6 horas.
//
// En cada ejecucion: pregunta al backend de inscripciones
// (google-apps-script-inscripciones.js) que inscripciones por PayPal
// siguen sin verificar, busca en este Gmail el correo que confirme cada
// una y, si lo encuentra, le pide al backend que la marque como pagada.
// Si una inscripcion lleva mas de UNPAID_AFTER_HOURS sin ese correo, avisa
// al organizador por si hay que reclamar el pago.
const CONFIG = {
    BACKEND_URL: "https://script.google.com/macros/s/AKfycbxaT_6V3G37RpEtUuW6HpiEkLcL4NbZ1yvXiYJbD6eaGE-v8ixz4Lb1GqXUnwmIbUgH/exec",
    // apps-script-pagos/sync.js sustituye el marcador por la clave real
    // (apps-script/clave-automatizacion.txt, fuera de Git) al subir el
    // codigo. Es la misma clave que valida google-apps-script-inscripciones.js.
    BACKEND_KEY: "__CLAVE_AUTOMATIZACION__",
    NOTIFY_EMAIL: "inscripciones@moscoevents.com",
    UNPAID_AFTER_HOURS: 24,
    // Ventana de busqueda de correos de PayPal ya confirmados o de avisos
    // de impago ya enviados, para no repetir ni reprocesar de mas.
    SEARCH_WINDOW_DAYS: 45
};

function revisarPagos() {
    if (!backendConfigured_()) {
        console.error("Sin clave de automatizacion: revisarPagos no puede hablar con el backend.");
        return;
    }

    const pendientes = fetchPendingPayments_();
    const usedMessageIds = {};

    console.log(`Inscripciones por PayPal sin verificar: ${pendientes.length}`);

    pendientes.forEach((inscripcion) => {
        const match = findPaypalConfirmation_(inscripcion, usedMessageIds);

        if (match) {
            const result = markPaid_(inscripcion.referencia, match.transactionId);
            console.log(`${inscripcion.referencia} (${inscripcion.nombre}): ${result.ok ? "marcada pagada" : `fallo - ${result.error}`}`);
            return;
        }

        if (isOverdue_(inscripcion.fechaRegistro)) {
            notifyPossibleNonPayment_(inscripcion);
        }
    });
}

function backendConfigured_() {
    return Boolean(CONFIG.BACKEND_URL) && CONFIG.BACKEND_KEY.length >= 32;
}

function fetchPendingPayments_() {
    const url = `${CONFIG.BACKEND_URL}?action=pendingPayments&secret=${encodeURIComponent(CONFIG.BACKEND_KEY)}`;
    const data = callBackend_(url);

    if (!data.ok) {
        throw new Error(`pendingPayments fallo: ${data.error}`);
    }

    return data.pendientes || [];
}

function markPaid_(referencia, transactionId) {
    const url = `${CONFIG.BACKEND_URL}?action=markPaid&secret=${encodeURIComponent(CONFIG.BACKEND_KEY)}`
        + `&ref=${encodeURIComponent(referencia)}&nota=${encodeURIComponent(transactionId || "")}`;

    return callBackend_(url);
}

function callBackend_(url) {
    const response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });

    return JSON.parse(response.getContentText());
}

// Busca, entre los correos "Ha recibido dinero" de PayPal, uno que
// confirme esta inscripcion en concreto: mismo importe exacto y un nombre
// razonablemente compatible. Un mismo correo no se usa dos veces en la
// misma ejecucion (usedMessageIds), para no confirmar dos inscripciones
// distintas con un solo pago.
function findPaypalConfirmation_(inscripcion, usedMessageIds) {
    const amountCents = parseAmountCents_(inscripcion.importe);

    if (!amountCents) {
        return null;
    }

    const threads = GmailApp.search(
        `from:servicio@paypal.es subject:"Ha recibido dinero" newer_than:${CONFIG.SEARCH_WINDOW_DAYS}d`
    );

    for (const thread of threads) {
        for (const message of thread.getMessages()) {
            const messageId = message.getId();

            if (usedMessageIds[messageId]) {
                continue;
            }

            const parsed = parsePaypalEmail_(message.getPlainBody());

            if (!parsed || parsed.amountCents !== amountCents) {
                continue;
            }

            if (!namesLooselyMatch_(inscripcion.nombre, parsed.nombre)) {
                continue;
            }

            usedMessageIds[messageId] = true;

            return { transactionId: parsed.transactionId };
        }
    }

    return null;
}

function parsePaypalEmail_(text) {
    const body = String(text || "");
    const nameAndAmount = body.match(/([^\n\r]{2,80}?)\s+le ha enviado\s+([\d.,]+)\s*€/i);

    if (!nameAndAmount) {
        return null;
    }

    const amountCents = parseAmountCents_(nameAndAmount[2]);

    if (!amountCents) {
        return null;
    }

    const transactionMatch = body.match(/Id\.\s*de\s*transacci\S*[:\s]+(\S+)/i);

    return {
        nombre: nameAndAmount[1].trim(),
        amountCents: amountCents,
        transactionId: transactionMatch ? transactionMatch[1].trim() : ""
    };
}

// "15,00 €" / "19.01" / "15 EUR" -> 1500 (centimos), para comparar importes
// sin depender del formato exacto.
function parseAmountCents_(value) {
    const normalized = String(value || "")
        .replace(/[^\d.,]/g, "")
        .replace(",", ".");
    const amount = Number(normalized);

    return Number.isFinite(amount) && amount > 0 ? Math.round(amount * 100) : 0;
}

function normalizeText_(value) {
    return String(value || "")
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase();
}

function significantTokens_(value) {
    return normalizeText_(value)
        .split(/[^a-z0-9]+/)
        .filter((token) => token.length >= 3);
}

// No exige que coincidan todos los tokens (apodos, apellidos incompletos,
// orden distinto...), pero si la mayoria, para no confirmar una
// inscripcion con el pago de otra persona por casualidad de importe.
function namesLooselyMatch_(nombreInscripcion, nombrePaypal) {
    const tokensInscripcion = significantTokens_(nombreInscripcion);
    const tokensPaypal = significantTokens_(nombrePaypal);

    if (!tokensInscripcion.length || !tokensPaypal.length) {
        return false;
    }

    const coincidencias = tokensInscripcion.filter((token) => tokensPaypal.includes(token)).length;
    const requeridas = tokensInscripcion.length <= 1 ? 1 : Math.ceil(tokensInscripcion.length / 2);

    return coincidencias >= requeridas;
}

function isOverdue_(fechaRegistroIso) {
    const fecha = new Date(fechaRegistroIso);

    if (Number.isNaN(fecha.getTime())) {
        return false;
    }

    return (Date.now() - fecha.getTime()) >= CONFIG.UNPAID_AFTER_HOURS * 60 * 60 * 1000;
}

function notifyPossibleNonPayment_(inscripcion) {
    const yaAvisado = GmailApp.search(
        `in:sent subject:"Posible impago" "${inscripcion.referencia}" newer_than:1d`
    ).length > 0;

    if (yaAvisado) {
        return;
    }

    MailApp.sendEmail({
        to: CONFIG.NOTIFY_EMAIL,
        subject: `Posible impago: ${inscripcion.nombre} - ${inscripcion.evento} (${inscripcion.referencia})`,
        body: [
            "No he encontrado un correo de PayPal (\"Ha recibido dinero\") que confirme este pago"
                + ` en los ultimos ${CONFIG.UNPAID_AFTER_HOURS} horas desde la inscripcion:`,
            "",
            `Nombre: ${inscripcion.nombre}`,
            `Evento: ${inscripcion.evento}`,
            `Importe: ${inscripcion.importe}`,
            `Referencia: ${inscripcion.referencia}`,
            `Correo del participante: ${inscripcion.correo}`,
            `Fecha de inscripcion: ${inscripcion.fechaRegistro}`,
            "",
            "Puede que el pago no haya llegado, o que haya llegado con un nombre/importe distinto y el sistema no lo haya podido casar automaticamente. Conviene revisarlo a mano."
        ].join("\n")
    });
}

// Ejecutar una vez a mano desde el editor de Apps Script (con la cuenta
// info@moscoevents.com) para conceder los permisos de Gmail y dejar
// instalado el disparador que llama a revisarPagos() cada 6 horas.
function instalarDisparador() {
    ScriptApp.getProjectTriggers()
        .filter((trigger) => trigger.getHandlerFunction() === "revisarPagos")
        .forEach((trigger) => ScriptApp.deleteTrigger(trigger));

    ScriptApp.newTrigger("revisarPagos").timeBased().everyHours(6).create();

    console.log("Disparador instalado: revisarPagos() cada 6 horas.");

    revisarPagos();
}
