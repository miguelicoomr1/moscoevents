const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");

const eventos = {
"2026-08-09": {
    titulo: "🔥 Operación Verano",
    enlace: "../Proximos%20Eventos/operaci%C3%B3n-verano.html"
},

"2026-05-23": {
    titulo: "Partida 23-05-2026",
    enlace: "../Eventos%20anteriores/23-05-2026.html"
},

"2026-04-16": {
    titulo: "TCSIM 16-04-2026",
    enlace: "../Eventos%20anteriores/TCSIM-16-04-2026.html"
},

"2026-07-09": {
    titulo: "Partida 09-07-2026",
    enlace: "../Eventos%20anteriores/jueves9.html"
},

"2026-07-16": {
    titulo: "Partida 16-07-2026",
    enlace: "../Eventos%20anteriores/jueves16.html"
},

"2026-07-23": {
    titulo: "Partida 23-07-2026",
    enlace: "../Eventos%20anteriores/jueves23072026.html"
},

"2026-07-30": {
    titulo: "Partida 30-07-2026",
    enlace: "../Eventos%20anteriores/jueves30072026.html"
},

"2026-08-02": {
    titulo: "Partida 02-08-2026",
    enlace: "../Proximos%20Eventos/domingo02082026.html"
}
};

let currentDate = new Date();

const meses = [
"Enero","Febrero","Marzo","Abril",
"Mayo","Junio","Julio","Agosto",
"Septiembre","Octubre","Noviembre","Diciembre"
];

function renderCalendar() {


if (!calendar) return;

calendar.innerHTML = "";

const month = currentDate.getMonth();
const year = currentDate.getFullYear();

monthYear.textContent = `${meses[month]} ${year}`;

["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].forEach(dayName => {
    const el = document.createElement("div");
    el.className = "day-name";
    el.textContent = dayName;
    calendar.appendChild(el);
});

let firstDay = new Date(year, month, 1).getDay();
firstDay = firstDay === 0 ? 6 : firstDay - 1;

const daysInMonth = new Date(year, month + 1, 0).getDate();

for (let i = 0; i < firstDay; i++) {
    calendar.appendChild(document.createElement("div"));
}

for (let day = 1; day <= daysInMonth; day++) {

    const dateKey =
        `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

    const cell = document.createElement("div");

    if (eventos[dateKey]) {

        cell.className = "day event-day";

        cell.innerHTML = `
            <a href="${eventos[dateKey].enlace}" class="calendar-event-link">
                <div class="day-number">${day}</div>
                <div class="event-title">${eventos[dateKey].titulo}</div>
            </a>
        `;

    } else {

        cell.className = "day";

        cell.innerHTML = `
            <div class="day-number">${day}</div>
        `;
    }

    calendar.appendChild(cell);
}


}

document.getElementById("prevMonth")?.addEventListener("click", () => {
currentDate.setMonth(currentDate.getMonth() - 1);
renderCalendar();
});

document.getElementById("nextMonth")?.addEventListener("click", () => {
currentDate.setMonth(currentDate.getMonth() + 1);
renderCalendar();
});

renderCalendar();

