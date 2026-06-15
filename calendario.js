const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");

let currentDate = new Date();

const meses = [
"Enero","Febrero","Marzo","Abril",
"Mayo","Junio","Julio","Agosto",
"Septiembre","Octubre","Noviembre","Diciembre"
];

function renderCalendar(){

    calendar.innerHTML = "";

    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    monthYear.textContent = meses[month] + " " + year;

    ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"].forEach(day => {

        const el = document.createElement("div");
        el.className = "day-name";
        el.textContent = day;

        calendar.appendChild(el);

    });

    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1;

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for(let i=0;i<firstDay;i++){

        const empty = document.createElement("div");
        calendar.appendChild(empty);

    }

    for(let day=1; day<=daysInMonth; day++){

        const cell = document.createElement("div");
        cell.className = "day";

        const dateKey =
            year + "-" +
            String(month + 1).padStart(2,"0") + "-" +
            String(day).padStart(2,"0");

        cell.innerHTML =
            '<div class="day-number">'+day+'</div>';

        if(eventos[dateKey]){

            cell.classList.add("event-day");

            const ev = document.createElement("div");

            ev.className = "event";

            ev.innerHTML =
                '<a href="' +
                eventos[dateKey].enlace +
                '">' +
                eventos[dateKey].titulo +
                '</a>';

            cell.appendChild(ev);
        }

        calendar.appendChild(cell);
    }
}

document.getElementById("prevMonth")
.addEventListener("click", () => {

    currentDate.setMonth(
        currentDate.getMonth() - 1
    );

    renderCalendar();

});

document.getElementById("nextMonth")
.addEventListener("click", () => {

    currentDate.setMonth(
        currentDate.getMonth() + 1
    );

    renderCalendar();

});

renderCalendar();
