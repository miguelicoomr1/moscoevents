// Copia el backend versionado en el repo (fuente de verdad) al fichero
// que clasp sube a Google Apps Script, para no mantener dos copias a mano.
const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "..", "google-apps-script-inscripciones.js");
// El proyecto de Apps Script ya tiene su archivo de codigo llamado "Código.js"
// (con tilde) - hay que escribir en ese mismo nombre. Si se crea un "Code.js"
// aparte, Apps Script tendria las funciones (doGet, CONFIG...) declaradas dos
// veces y el script dejaria de funcionar.
const target = path.join(__dirname, "Código.js");
// Claves que viven solo en esta maquina (fuera de Git) y se insertan en el
// codigo al subirlo.
const secrets = [
    {
        // Compartida con el mensajero de correo (apps-script-correo/).
        keyFile: path.join(__dirname, "clave-mensajero.txt"),
        placeholder: "\"__CLAVE_MENSAJERO__\"",
        warning: "Sin apps-script/clave-mensajero.txt: el mensajero de correo queda desactivado."
    },
    {
        // Usada por la rutina automatica que revisa el correo de PayPal.
        keyFile: path.join(__dirname, "clave-automatizacion.txt"),
        placeholder: "\"__CLAVE_AUTOMATIZACION__\"",
        warning: "Sin apps-script/clave-automatizacion.txt: los endpoints pendingPayments/markPaid quedan desactivados."
    }
];

let code = fs.readFileSync(source, "utf8");

secrets.forEach(({ keyFile, placeholder, warning }) => {
    if (fs.existsSync(keyFile)) {
        code = code.replace(placeholder, JSON.stringify(fs.readFileSync(keyFile, "utf8").trim()));
    } else {
        console.warn(warning);
    }
});

fs.writeFileSync(target, code);
console.log(`Copiado ${source} -> ${target}`);
