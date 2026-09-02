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

fs.copyFileSync(source, target);
console.log(`Copiado ${source} -> ${target}`);
