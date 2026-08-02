const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");

const eventos = {
    "2026-08-09": {
        titulo: "🔥 Operación Verano",
        enlace: "/Proximos%20Eventos/operaci%C3%B3n-verano.html"
    },

    "2026-05-23": {
        titulo: "Partida 23-05-2026",
        enlace: "/Galeria/23-05-2026.html"
    },

    "2026-04-16": {
        titulo: "TCSIM 16-04-2026",
        enlace: "/Galeria/TCSIM-16-04-2026.html"
    },

    "2026-07-09": {
        titulo: "Partida 09-07-2026",
        enlace: "/Eventos%20anteriores/jueves9.html"
    },

    "2026-07-16": {
        titulo: "Partida 16-07-2026",
        enlace: "/Eventos%20anteriores/jueves16.html"
    },

    "2026-07-23": {
        titulo: "Partida 23-07-2026",
        enlace: "/Eventos%20anteriores/jueves23072026.html"
    },

    "2026-07-30": {
        titulo: "Partida 30-07-2026",
        enlace: "/Eventos%20anteriores/jueves30072026.html"
    },

    "2026-08-02": {
        titulo: "Partida 02-08-2026",
        enlace: "/Proximos%20Eventos/domingo02082026.html"
    },

    "2026-08-06": {
        titulo: "Partida 06-08-2026",
        enlace: "/Proximos%20Eventos/jueves06082026.html"
    }
};

let currentDate = new Date();

const meses = [
    "Enero", "Febrero", "Marzo", "Abril",
    "Mayo", "Junio", "Julio", "Agosto",
    "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const dayNames = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function createDayName(name) {
    const element = document.createElement("div");
    element.className = "day-name";
    element.textContent = name;
    return element;
}

function createCalendarCell(day, event) {
    const cell = document.createElement("div");
    cell.className = event ? "day event-day" : "day";

    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = day;

    if (!event) {
        cell.appendChild(dayNumber);
        return cell;
    }

    const link = document.createElement("a");
    link.href = event.enlace;
    link.className = "calendar-event-link";

    const eventTitle = document.createElement("div");
    eventTitle.className = "event-title";
    eventTitle.textContent = event.titulo;

    link.append(dayNumber, eventTitle);
    cell.appendChild(link);

    return cell;
}

function renderCalendar() {
    if (!calendar || !monthYear) {
        return;
    }

    const fragment = document.createDocumentFragment();
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1;

    monthYear.textContent = `${meses[month]} ${year}`;

    dayNames.forEach((dayName) => {
        fragment.appendChild(createDayName(dayName));
    });

    for (let i = 0; i < firstDay; i++) {
        fragment.appendChild(document.createElement("div"));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        fragment.appendChild(createCalendarCell(day, eventos[dateKey]));
    }

    calendar.replaceChildren(fragment);
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
