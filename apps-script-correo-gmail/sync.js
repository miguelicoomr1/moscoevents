// Copia el mensajero versionado en el repo (fuente de verdad) al fichero
// que clasp sube a Google Apps Script, insertando la clave compartida y la
// cuenta desde la que saldran los correos (este proyecto es el de respaldo;
// el gemelo de apps-script-correo/ pone la cuenta del dominio).
const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "..", "google-apps-script-correo.js");
const target = path.join(__dirname, "Code.js");
// La misma clave que usa el backend de inscripciones (ver apps-script/sync.js).
const keyFile = path.join(__dirname, "..", "apps-script", "clave-mensajero.txt");
const keyPlaceholder = "\"__CLAVE_MENSAJERO__\"";
const senderPlaceholder = "\"__CUENTA_REMITENTE__\"";
const senderEmail = "moscoeventes@gmail.com";

if (!fs.existsSync(keyFile)) {
    console.error("Falta apps-script/clave-mensajero.txt: sin clave el mensajero rechazaria todos los envios.");
    process.exit(1);
}

const code = fs.readFileSync(source, "utf8")
    .replace(keyPlaceholder, JSON.stringify(fs.readFileSync(keyFile, "utf8").trim()))
    .replace(senderPlaceholder, JSON.stringify(senderEmail));

fs.writeFileSync(target, code);
console.log(`Copiado ${source} -> ${target} (remitente: ${senderEmail})`);
