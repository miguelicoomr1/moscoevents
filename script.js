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

// MENÚ MÓVIL

const menuToggle = document.getElementById("menu-toggle");
const menu = document.getElementById("menu");

if (menuToggle && menu) {
    menuToggle.addEventListener("click", () => {
        menu.classList.toggle("active");
    });
}
