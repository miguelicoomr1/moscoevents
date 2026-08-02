// GALERIA

const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");
const images = document.querySelectorAll(".gallery-grid img.zoomable");
const closeBtn = document.querySelector(".close");
const prevBtn = document.querySelector(".prev");
const nextBtn = document.querySelector(".next");

let currentIndex = 0;
let modalDownload = null;

function getImageSource(img) {
    return img.getAttribute("src") || img.currentSrc || img.src;
}

function getDownloadName(source, index) {
    const cleanSource = source.split(/[?#]/)[0];
    const fileName = cleanSource.split("/").pop();

    if (!fileName) {
        return `mosco-events-${index + 1}.jpg`;
    }

    try {
        return decodeURIComponent(fileName);
    } catch (error) {
        return fileName;
    }
}

function updateDownloadLink(link, img, index) {
    const source = getImageSource(img);

    link.href = source;
    link.download = getDownloadName(source, index);
}

function createDownloadButton(img, index) {
    const button = document.createElement("a");

    button.className = "gallery-download";
    button.textContent = "Descargar";
    button.setAttribute("aria-label", "Descargar imagen");
    button.setAttribute("title", "Descargar imagen");
    updateDownloadLink(button, img, index);

    button.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    return button;
}

function setCurrentImage(index) {
    if (!modalImg || !images.length) {
        return;
    }

    currentIndex = index;
    modalImg.src = images[currentIndex].src;

    if (modalDownload) {
        updateDownloadLink(modalDownload, images[currentIndex], currentIndex);
    }
}

function showImage(index) {
    if (!modal || !modalImg || !images.length) {
        return;
    }

    setCurrentImage(index);
    modal.classList.add("active");
}

if (modal && modalImg && images.length) {
    modalDownload = createDownloadButton(images[0], 0);
    modalDownload.classList.add("modal-download");
    modal.appendChild(modalDownload);

    images.forEach((img, index) => {
        img.addEventListener("click", () => {
            showImage(index);
        });
    });

    nextBtn?.addEventListener("click", (event) => {
        event.stopPropagation();
        setCurrentImage((currentIndex + 1) % images.length);
    });

    prevBtn?.addEventListener("click", (event) => {
        event.stopPropagation();
        setCurrentImage((currentIndex - 1 + images.length) % images.length);
    });

    closeBtn?.addEventListener("click", () => {
        modal.classList.remove("active");
    });

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            modal.classList.remove("active");
        }
    });
}

/* ===== CUENTA ATRAS ===== */

const countdown = document.querySelector(".countdown");
const countdownFields = {
    dias: document.getElementById("dias"),
    horas: document.getElementById("horas"),
    minutos: document.getElementById("minutos"),
    segundos: document.getElementById("segundos")
};

if (countdown && Object.values(countdownFields).every(Boolean)) {
    const countdownDate = countdown.dataset.countdownDate || "2026-08-09T09:00:00";
    const fechaEvento = new Date(countdownDate).getTime();

    function actualizarContador() {
        if (Number.isNaN(fechaEvento)) {
            return;
        }

        const ahora = Date.now();
        const diferencia = fechaEvento - ahora;

        if (diferencia <= 0) {
            countdown.innerHTML =
                "<div class='time-box'><span>&#128293;</span><small>&iexcl;EVENTO EN CURSO!</small></div>";
            return;
        }

        const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
        const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
        const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);

        countdownFields.dias.textContent = dias;
        countdownFields.horas.textContent = horas;
        countdownFields.minutos.textContent = minutos;
        countdownFields.segundos.textContent = segundos;
    }

    actualizarContador();
    setInterval(actualizarContador, 1000);
}
