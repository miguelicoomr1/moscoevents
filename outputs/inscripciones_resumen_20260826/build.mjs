import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const baseDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(?:[A-Za-z]:)/, (m) => m.slice(1)));
const rows = JSON.parse(await fs.readFile(path.join(baseDir, "data.json"), "utf8"));
const workbook = Workbook.create();
const sheet = workbook.worksheets.add("Inscripciones");

const headers = [
  "Fecha de registro",
  "Referencia",
  "Nombre",
  "Equipo",
  "Teléfono",
  "Equipamiento",
  "Correo electrónico",
  "Consentimiento imágenes",
  "Normas leídas",
  "Firma",
  "Texto legal firmado"
];

function parseSpanishDate(value) {
  const match = String(value).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})$/);
  if (!match) return value;
  const [, day, month, year, hour, minute, second] = match.map(Number);
  const spreadsheetEpoch = Date.UTC(1899, 11, 30);
  return (Date.UTC(year, month - 1, day, hour, minute, second) - spreadsheetEpoch) / 86400000;
}

sheet.getRange("A1:K1").values = [headers];
sheet.getRange("A2:K" + (rows.length + 1)).values = rows.map((r) => [
  parseSpanishDate(r.fecha),
  r.referencia,
  r.nombre,
  r.equipo,
  r.telefono,
  r.equipamiento,
  r.correo,
  r.consentimiento,
  r.normas,
  "",
  r.textoLegal
]);

sheet.getRange("A1:K1").format = {
  fill: "#E5E7EB",
  font: { bold: true, color: "#111827", size: 10 },
  verticalAlignment: "center",
  wrapText: true,
  borders: { bottom: { style: "medium", color: "#9CA3AF" } }
};
sheet.getRange("A2:K" + (rows.length + 1)).format = {
  font: { color: "#111827", size: 10 },
  verticalAlignment: "center",
  borders: { insideHorizontal: { style: "thin", color: "#E5E7EB" } }
};
sheet.getRange("A2:A" + (rows.length + 1)).format.numberFormat = "dd/mm/yyyy hh:mm:ss";
sheet.getRange("E2:E" + (rows.length + 1)).format.numberFormat = "@";
sheet.getRange("G2:G" + (rows.length + 1)).format.numberFormat = "@";
sheet.getRange("H2:I" + (rows.length + 1)).format.horizontalAlignment = "center";
sheet.getRange("K2:K" + (rows.length + 1)).format.wrapText = true;

const widths = [155, 140, 215, 160, 135, 155, 225, 145, 115, 195, 330];
for (let col = 0; col < widths.length; col += 1) {
  sheet.getRangeByIndexes(0, col, rows.length + 1, 1).format.columnWidthPx = widths[col];
}
sheet.getRange("1:1").format.rowHeightPx = 38;
sheet.getRange("2:" + (rows.length + 1)).format.rowHeightPx = 82;
sheet.freezePanes.freezeRows(1);

for (let index = 0; index < rows.length; index += 1) {
  const r = rows[index];
  const b64 = (await fs.readFile(path.join(baseDir, r.firmaFile), "utf8")).replace(/\s+/g, "");
  sheet.images.add({
    dataUrl: "data:" + r.firmaMime + ";base64," + b64,
    anchor: {
      from: { row: index + 1, col: 9, rowOffsetPx: 5, colOffsetPx: 5 },
      extent: { widthPx: 180, heightPx: 70 }
    }
  });
}

const inspect = await workbook.inspect({
  kind: "table",
  range: "Inscripciones!A1:K" + (rows.length + 1),
  include: "values,formulas",
  tableMaxRows: rows.length + 1,
  tableMaxCols: 11,
  maxChars: 12000
});
console.log("INSPECT");
console.log(inspect.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan"
});
console.log("ERRORS");
console.log(errors.ndjson);

const preview = await workbook.render({
  sheetName: "Inscripciones",
  range: "A1:K" + (rows.length + 1),
  scale: 0.75,
  format: "png"
});
await fs.writeFile(path.join(baseDir, "preview.png"), new Uint8Array(await preview.arrayBuffer()));

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(path.join(baseDir, "Inscripciones_Mosco_Events_resumen.xlsx"));
console.log(JSON.stringify({ rows: rows.length, output: path.join(baseDir, "Inscripciones_Mosco_Events_resumen.xlsx") }));
