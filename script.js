// GALERIA

const modal = document.getElementById("modal");
const modalImg = document.getElementById("modal-img");
const closeBtn = modal?.querySelector(".close");
const prevBtn = modal?.querySelector(".prev");
const nextBtn = modal?.querySelector(".next");

const GALLERY_PLACEHOLDER_SRC =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
const GALLERY_INITIAL_ITEMS = window.matchMedia("(max-width: 700px)").matches ? 6 : 12;
const GALLERY_BATCH_SIZE = window.matchMedia("(max-width: 700px)").matches ? 6 : 12;
const GALLERY_PRELOAD_MARGIN = window.matchMedia("(max-width: 700px)").matches ? "360px 0px" : "620px 0px";

let currentIndex = 0;
let modalDownload = null;
let previousFocus = null;
let galleryImageObserver = null;

function getGalleryImages() {
    return Array.from(document.querySelectorAll(".gallery-grid img.zoomable"));
}

function getImageSource(img) {
    return img.dataset.fullSrc || img.dataset.src || img.currentSrc || img.getAttribute("src") || img.src;
}

function getDownloadSource(img) {
    return img.dataset.downloadSrc || getImageSource(img);
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
    const source = getDownloadSource(img);

    link.href = source;
    link.download = getDownloadName(source, index);
}

function createDownloadButton() {
    const button = document.createElement("a");

    button.className = "gallery-download";
    button.textContent = "Descargar";
    button.setAttribute("aria-label", "Descargar imagen");
    button.setAttribute("title", "Descargar imagen");

    button.addEventListener("click", (event) => {
        event.stopPropagation();
    });

    return button;
}

function markImageLoaded(img) {
    img.classList.remove("gallery-lazy");
    img.classList.add("is-loaded");
}

function loadGalleryImage(img) {
    const source = img.dataset.src || img.dataset.fullSrc;

    if (!source || img.dataset.loaded === "true") {
        return;
    }

    img.dataset.loaded = "true";

    img.addEventListener("load", () => markImageLoaded(img), { once: true });
    img.addEventListener("error", () => markImageLoaded(img), { once: true });
    img.src = source;

    if (img.complete) {
        markImageLoaded(img);
    }
}

function observeGalleryImage(img) {
    if (img.dataset.loaded === "true") {
        return;
    }

    if (galleryImageObserver) {
        galleryImageObserver.observe(img);
        return;
    }

    loadGalleryImage(img);
}

function prepareGalleryImage(img) {
    const currentSource = img.getAttribute("src");
    const lazySource = img.dataset.src || img.dataset.fullSrc || currentSource;

    if (!lazySource) {
        return;
    }

    img.dataset.src = lazySource;
    img.dataset.fullSrc = img.dataset.fullSrc || lazySource;
    img.width = img.width || 640;
    img.height = img.height || 480;

    if (currentSource !== GALLERY_PLACEHOLDER_SRC && img.dataset.loaded !== "true") {
        img.src = GALLERY_PLACEHOLDER_SRC;
    }

    if (img.dataset.loaded !== "true") {
        img.classList.add("gallery-lazy");
    }
}

function revealGalleryBatch(grid, images) {
    const hiddenImages = images.filter((img) => img.hidden).slice(0, GALLERY_BATCH_SIZE);

    hiddenImages.forEach((img) => {
        img.hidden = false;
        img.classList.remove("gallery-item-deferred");
        observeGalleryImage(img);
    });

    return images.some((img) => img.hidden);
}

function setupGalleryBatching(grid) {
    const images = Array.from(grid.querySelectorAll("img.zoomable"));

    if (!images.length) {
        return;
    }

    images.forEach((img, index) => {
        prepareGalleryImage(img);

        if (index >= GALLERY_INITIAL_ITEMS) {
            img.hidden = true;
            img.classList.add("gallery-item-deferred");
            return;
        }

        observeGalleryImage(img);
    });

    if (images.length <= GALLERY_INITIAL_ITEMS) {
        return;
    }

    const loader = document.createElement("span");
    loader.className = "gallery-loader";
    loader.setAttribute("aria-hidden", "true");
    grid.after(loader);

    const revealMore = () => {
        const hasHiddenImages = revealGalleryBatch(grid, images);

        if (!hasHiddenImages) {
            loader.remove();
            return false;
        }

        return true;
    };

    if (!("IntersectionObserver" in window)) {
        while (revealMore()) {
            // Compatibility fallback: old browsers get the complete gallery.
        }

        return;
    }

    const batchObserver = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
            const hasHiddenImages = revealMore();

            if (!hasHiddenImages) {
                batchObserver.disconnect();
            }
        }
    }, { rootMargin: GALLERY_PRELOAD_MARGIN });

    batchObserver.observe(loader);
}

function initGalleryPerformance() {
    const grids = document.querySelectorAll(".gallery-grid");

    if (!grids.length) {
        return;
    }

    if ("IntersectionObserver" in window) {
        galleryImageObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                galleryImageObserver.unobserve(entry.target);
                loadGalleryImage(entry.target);
            });
        }, { rootMargin: GALLERY_PRELOAD_MARGIN });
    }

    grids.forEach(setupGalleryBatching);
}

function setCurrentImage(index) {
    const images = getGalleryImages();

    if (!modalImg || !images.length) {
        return;
    }

    currentIndex = (index + images.length) % images.length;

    const image = images[currentIndex];
    modalImg.alt = image.alt || `Imagen ampliada ${currentIndex + 1}`;
    modalImg.src = getImageSource(image);

    if (modalDownload) {
        updateDownloadLink(modalDownload, image, currentIndex);
    }

    const hasMultipleImages = images.length > 1;
    prevBtn?.toggleAttribute("hidden", !hasMultipleImages);
    nextBtn?.toggleAttribute("hidden", !hasMultipleImages);
}

function openModal() {
    if (!modal) {
        return;
    }

    if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
    }

    previousFocus = document.activeElement;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("modal-open");
    document.body.classList.add("modal-open");
    closeBtn?.focus?.({ preventScroll: true });
}

function closeModal() {
    if (!modal || !modalImg) {
        return;
    }

    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("modal-open");
    document.body.classList.remove("modal-open");
    modalImg.removeAttribute("src");

    if (previousFocus instanceof HTMLElement) {
        previousFocus.focus({ preventScroll: true });
    }
}

function showRelativeImage(delta) {
    const images = getGalleryImages();

    if (images.length < 2) {
        return;
    }

    setCurrentImage(currentIndex + delta);
}

function showImage(index) {
    const images = getGalleryImages();

    if (!modal || !modalImg || !images.length) {
        return;
    }

    setCurrentImage(index);
    openModal();
}

function activateModalControl(control, handler) {
    if (!control) {
        return;
    }

    if (control.tagName !== "BUTTON") {
        control.setAttribute("role", "button");
        control.setAttribute("tabindex", "0");
    }

    control.addEventListener("click", handler);
    control.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") {
            return;
        }

        event.preventDefault();
        handler(event);
    });
}

if (modal && modalImg) {
    initGalleryPerformance();

    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-hidden", "true");

    modalDownload = createDownloadButton();
    modalDownload.classList.add("modal-download");
    modal.appendChild(modalDownload);

    document.addEventListener("click", (event) => {
        const image = event.target.closest?.(".gallery-grid img.zoomable");

        if (!image) {
            return;
        }

        const images = getGalleryImages();
        const index = images.indexOf(image);

        if (index !== -1) {
            showImage(index);
        }
    });

    activateModalControl(nextBtn, (event) => {
        event.stopPropagation();
        showRelativeImage(1);
    });

    activateModalControl(prevBtn, (event) => {
        event.stopPropagation();
        showRelativeImage(-1);
    });

    activateModalControl(closeBtn, (event) => {
        event.stopPropagation();
        closeModal();
    });

    modal.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (!modal.classList.contains("active")) {
            return;
        }

        if (event.key === "Escape") {
            closeModal();
        }

        if (event.key === "ArrowRight") {
            showRelativeImage(1);
        }

        if (event.key === "ArrowLeft") {
            showRelativeImage(-1);
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
