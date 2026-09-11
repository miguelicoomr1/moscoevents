// Despliega el mensajero con la cuenta "inscripciones" de clasp. La primera
// vez crea la implementacion y guarda su ID; despues la actualiza en el
// sitio para que la URL /exec (MAIL_RELAY_URL del backend) no cambie.
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Igual que en apps-script/deploy.js: en Windows solo funciona bien un
// comando ya citado a mano con execSync.
function quoteArg(value) {
    return `"${String(value).replace(/"/g, '""')}"`;
}

const idFile = path.join(__dirname, "deployment-id.txt");
const description = `Actualizacion automatica ${new Date().toISOString()}`;
const savedId = fs.existsSync(idFile) ? fs.readFileSync(idFile, "utf8").trim() : "";
const command = savedId
    ? `clasp -u inscripciones deploy -i ${quoteArg(savedId)} -d ${quoteArg(description)}`
    : `clasp -u inscripciones deploy -d ${quoteArg(description)}`;

console.log(savedId ? `Desplegando en la implementacion ${savedId}...` : "Creando la implementacion del mensajero...");

const output = execSync(command, { cwd: __dirname, encoding: "utf8" });
process.stdout.write(output);

const match = output.match(/Deployed (\S+) @\d+/);
const deploymentId = savedId || (match && match[1]);

if (!deploymentId) {
    console.error("No se ha podido leer el ID de la implementacion en la salida de clasp.");
    process.exit(1);
}

if (!savedId) {
    fs.writeFileSync(idFile, `${deploymentId}\n`);
}

console.log(`URL del mensajero: https://script.google.com/macros/s/${deploymentId}/exec`);
