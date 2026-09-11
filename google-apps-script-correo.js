// Mensajero de correo de Mosco Events.
//
// Este proyecto de Apps Script pertenece a la cuenta inscripciones@moscoevents.com
// y se despliega como aplicacion web ejecutada con esa cuenta, asi que los
// correos que envia MailApp salen desde inscripciones@moscoevents.com.
//
// Lo llama el backend de inscripciones (google-apps-script-inscripciones.js)
// con una clave compartida; sin la clave no envia nada. Si este mensajero
// falla, el backend envia la copia al participante desde su propia cuenta,
// como antes, para que nadie se quede sin su comprobante.
const CONFIG = {
    SENDER_EMAIL: "inscripciones@moscoevents.com",
    // apps-script-correo/sync.js sustituye el marcador por la clave real
    // (apps-script/clave-mensajero.txt, fuera de Git) al subir el codigo.
    RELAY_KEY: "__CLAVE_MENSAJERO__",
    MAX_BODY_LENGTH: 200000
};

function doGet() {
    return json_({ ok: true, servicio: "Mensajero de correo Mosco Events" });
}

function doPost(e) {
    let data;

    try {
        data = JSON.parse(e && e.postData ? e.postData.contents : "");
    } catch (error) {
        return json_({ ok: false, error: "json" });
    }

    if (!validKey_(data.clave)) {
        return json_({ ok: false, error: "clave" });
    }

    // Si el proyecto se hubiera creado con otra cuenta, los correos no
    // saldrian desde inscripciones@; se rechaza para que el backend use
    // su envio de respaldo y el fallo se note en la prueba.
    const account = senderAccount_();

    if (account !== CONFIG.SENDER_EMAIL) {
        return json_({ ok: false, error: "cuenta", cuenta: account });
    }

    if (value_(data.accion) === "ping") {
        return json_({ ok: true, cuenta: account, cuotaRestante: MailApp.getRemainingDailyQuota() });
    }

    const message = normalizeMessage_(data);

    if (!message) {
        return json_({ ok: false, error: "mensaje" });
    }

    try {
        MailApp.sendEmail(message);
    } catch (error) {
        console.error(error);
        return json_({ ok: false, error: "envio" });
    }

    return json_({ ok: true, cuenta: account });
}

// Ejecutar una vez desde el editor de Apps Script, con la cuenta
// inscripciones@moscoevents.com, para conceder el permiso de envio.
function autorizar() {
    console.log(`Cuenta: ${senderAccount_()} - correos restantes hoy: ${MailApp.getRemainingDailyQuota()}`);
}

function normalizeMessage_(data) {
    const to = value_(data.to);
    const subject = value_(data.subject);
    const body = String(data.body || "");
    const htmlBody = String(data.htmlBody || "");

    if (!isEmail_(to) || !subject || !body) {
        return null;
    }

    if (body.length > CONFIG.MAX_BODY_LENGTH || htmlBody.length > CONFIG.MAX_BODY_LENGTH) {
        return null;
    }

    const message = {
        to: to,
        subject: subject,
        body: body,
        name: value_(data.name) || "Mosco Events"
    };

    if (htmlBody) {
        message.htmlBody = htmlBody;
    }

    return message;
}

// La clave real mide 43 caracteres; si sync.js no la ha insertado queda el
// marcador, que es mas corto, y el mensajero no acepta ninguna peticion.
function validKey_(value) {
    return CONFIG.RELAY_KEY.length >= 32 && value_(value) === CONFIG.RELAY_KEY;
}

function senderAccount_() {
    return value_(Session.getEffectiveUser().getEmail()).toLowerCase();
}

function isEmail_(value) {
    return /^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(value);
}

function value_(value) {
    return String(value || "").trim();
}

function json_(payload) {
    return ContentService
        .createTextOutput(JSON.stringify(payload))
        .setMimeType(ContentService.MimeType.JSON);
}
