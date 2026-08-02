// GALERÍA

const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");

const images = document.querySelectorAll(".zoomable");

const closeBtn = document.querySelector(".close");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");

let currentIndex = 0;

function showImage(index) {
    currentIndex = index;
    modalImg.src = images[currentIndex].src;
    modal.classList.add("active");
}

images.forEach((img, index) => {
    img.addEventListener("click", () => {
        showImage(index);
    });
});

if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        currentIndex++;

        if (currentIndex >= images.length) {
            currentIndex = 0;
        }

        modalImg.src = images[currentIndex].src;
    });
}

if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        currentIndex--;

        if (currentIndex < 0) {
            currentIndex = images.length - 1;
        }

        modalImg.src = images[currentIndex].src;
    });
}

if (closeBtn) {
    closeBtn.addEventListener("click", () => {
        modal.classList.remove("active");
    });
}

if (modal) {
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.classList.remove("active");
        }
    });
}

/* ===== CUENTA ATRÁS OPERACIÓN VERANO ===== */

const fechaEvento = new Date("2026-08-09T09:00:00").getTime();

function actualizarContador() {

    const ahora = new Date().getTime();
    const diferencia = fechaEvento - ahora;

    if (diferencia <= 0) {

        document.querySelector(".countdown").innerHTML =
            "<div class='time-box'><span>🔥</span><small>¡EVENTO EN CURSO!</small></div>";

        return;
    }

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

    document.getElementById("dias").textContent = dias;
    document.getElementById("horas").textContent = horas;
    document.getElementById("minutos").textContent = minutos;
    document.getElementById("segundos").textContent = segundos;
}

actualizarContador();
setInterval(actualizarContador, 1000);
