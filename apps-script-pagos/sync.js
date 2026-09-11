// Copia el verificador de pagos versionado en el repo (fuente de verdad)
// al fichero que clasp sube a Google Apps Script, insertando la clave
// compartida con el backend de inscripciones.
const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "..", "google-apps-script-pagos.js");
const target = path.join(__dirname, "Code.js");
// La misma clave que valida los endpoints pendingPayments/markPaid del
// backend de inscripciones (ver apps-script/sync.js).
const keyFile = path.join(__dirname, "..", "apps-script", "clave-automatizacion.txt");
const placeholder = "\"__CLAVE_AUTOMATIZACION__\"";

if (!fs.existsSync(keyFile)) {
    console.error("Falta apps-script/clave-automatizacion.txt: sin clave el verificador no puede hablar con el backend.");
    process.exit(1);
}

const code = fs.readFileSync(source, "utf8")
    .replace(placeholder, JSON.stringify(fs.readFileSync(keyFile, "utf8").trim()));

fs.writeFileSync(target, code);
console.log(`Copiado ${source} -> ${target}`);
