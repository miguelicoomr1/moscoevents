const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");

const eventosCalendario = (
    window.MoscoEventos?.obtenerEventosCalendario?.()
    || (window.MOSCO_EVENTOS || []).map((evento) => ({
        fecha: evento.fecha,
        titulo: evento.tituloCalendario || evento.titulo,
        enlace: evento.url
    }))
).reduce((calendario, evento) => {
    if (!evento.fecha || !evento.enlace) {
        return calendario;
    }

    calendario[evento.fecha] = calendario[evento.fecha] || [];
    calendario[evento.fecha].push(evento);

    return calendario;
}, {});

let currentDate = new Date();

function capitalizar(texto) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function getLocale() {
    return window.MoscoI18n?.getLocale() || "es-ES";
}

function monthName(month, year) {
    return capitalizar(new Intl.DateTimeFormat(getLocale(), { month: "long" }).format(new Date(year, month, 1)));
}

function dayNames() {
    // 2024-01-01 es lunes: usamos esa semana como referencia para los nombres cortos.
    const lunes = new Date(2024, 0, 1);

    return Array.from({ length: 7 }, (_, indice) => {
        const dia = new Date(lunes);
        dia.setDate(lunes.getDate() + indice);
        return capitalizar(new Intl.DateTimeFormat(getLocale(), { weekday: "short" }).format(dia));
    });
}

function createDayName(name) {
    const element = document.createElement("div");
    element.className = "day-name";
    element.textContent = name;
    return element;
}

function createCalendarCell(day, eventsForDay) {
    const dayEvents = Array.isArray(eventsForDay) ? eventsForDay : [];
    const cell = document.createElement("div");
    cell.className = dayEvents.length ? "day event-day" : "day";

    const dayNumber = document.createElement("div");
    dayNumber.className = "day-number";
    dayNumber.textContent = day;
    cell.appendChild(dayNumber);

    dayEvents.forEach((event) => {
        const link = document.createElement("a");
        link.href = event.enlace;
        link.className = "calendar-event-link";

        const eventTitle = document.createElement("div");
        eventTitle.className = "event-title";
        eventTitle.textContent = event.titulo;

        link.appendChild(eventTitle);
        cell.appendChild(link);
    });

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

    monthYear.textContent = `${monthName(month, year)} ${year}`;

    dayNames().forEach((dayName) => {
        fragment.appendChild(createDayName(dayName));
    });

    for (let i = 0; i < firstDay; i++) {
        fragment.appendChild(document.createElement("div"));
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey =
            `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        fragment.appendChild(createCalendarCell(day, eventosCalendario[dateKey]));
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

window.addEventListener("mosco:langchange", renderCalendar);

renderCalendar();
