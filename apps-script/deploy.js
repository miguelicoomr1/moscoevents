// Actualiza la implementacion (deployment) existente para que la URL /exec
// de inscripciones-config.js siga sirviendo, en vez de crear una nueva.
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// execFileSync con un array de argumentos + shell:true no cita bien los
// argumentos en Windows (clasp los recibia mal separados). execSync con un
// string ya citado a mano es lo que realmente funciona aqui.
function quoteArg(value) {
    return `"${String(value).replace(/"/g, '""')}"`;
}

const idFile = path.join(__dirname, "deployment-id.txt");

if (!fs.existsSync(idFile)) {
    console.error(
        "Falta apps-script/deployment-id.txt con el ID de la implementacion existente.\n" +
        "Ejecuta 'clasp deployments' dentro de apps-script/ para verlo y guardalo en ese fichero (una linea, sin espacios)."
    );
    process.exit(1);
}

const deploymentId = fs.readFileSync(idFile, "utf8").trim();

if (!deploymentId) {
    console.error("apps-script/deployment-id.txt esta vacio.");
    process.exit(1);
}

const description = `Actualizacion automatica ${new Date().toISOString()}`;

console.log(`Desplegando en la implementacion ${deploymentId}...`);
execSync(
    `clasp deploy -i ${quoteArg(deploymentId)} -d ${quoteArg(description)}`,
    { stdio: "inherit", cwd: __dirname }
);
console.log("Despliegue completado.");
