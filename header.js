(function () {
    const headerHtml = `
        <header id="top">
            <div class="logo">
                <a href="/index.html">
                    <img
                        src="/images/base%20web/logo-header.webp"
                        alt="Mosco Events"
                    >
                </a>
            </div>

            <button
                class="menu-toggle"
                id="menu-toggle"
                type="button"
                aria-label="Abrir men\u00FA"
                data-i18n-attr-aria-label="nav.open_menu"
                aria-expanded="false"
                aria-controls="menu"
            >
                \u2630
            </button>

            <nav id="menu">
                <a href="/index.html" data-i18n="nav.inicio">Inicio</a>

                <div class="dropdown">
                    <button
                        class="dropbtn"
                        type="button"
                    >
                        <span data-i18n="nav.eventos">Eventos</span> \u25BE
                    </button>

                    <div class="dropdown-content">
                        <a href="/Calendario/calendario.html" data-i18n="nav.calendario">
                            \uD83D\uDCC5\uFE0F Calendario
                        </a>

                        <a href="/Proximos%20Eventos/proximos-eventos.html" data-i18n="nav.proximos">
                            \uD83D\uDD1C Pr\u00F3ximos Eventos
                        </a>

                        <a href="/registro.html" data-i18n="nav.inscripciones">
                            \uD83D\uDCDD Inscripciones
                        </a>

                        <a href="/Eventos%20anteriores/eventos-anteriores.html" data-i18n="nav.anteriores">
                            \uD83D\uDD19 Eventos Anteriores
                        </a>
                    </div>
                </div>

                <a href="/Galeria/galeria.html" data-i18n="nav.galeria">
                    Galer\u00EDa
                </a>

                <div class="dropdown">
                    <button
                        class="dropbtn"
                        type="button"
                    >
                        <span data-i18n="nav.informacion">Informaci\u00F3n</span> \u25BE
                    </button>

                    <div class="dropdown-content">
                        <a href="/normas.html" data-i18n="nav.normas">
                            \uD83D\uDCDC Normas
                        </a>

                        <a href="/contacto.html" data-i18n="nav.contacto">
                            \uD83D\uDCDE Contacto
                        </a>

                        <a href="/legales-mosco-events.html" data-i18n="nav.legal">
                            \u2696\uFE0F Informaci\u00F3n legal
                        </a>
                    </div>
                </div>

                <div class="dropdown">
                    <button
                        class="dropbtn"
                        type="button"
                    >
                        \uD83C\uDF10 <span data-lang-current>ES</span> \u25BE
                    </button>

                    <div class="dropdown-content">
                        <a href="#" data-lang="es">Espa\u00F1ol</a>
                        <a href="#" data-lang="en">English</a>
                        <a href="#" data-lang="fr">Fran\u00E7ais</a>
                        <a href="#" data-lang="ca">Catal\u00E0</a>
                    </div>
                </div>
            </nav>
        </header>
    `;

    const mountHeader = () => {
        if (document.getElementById("top")) {
            return;
        }

        const wrapper = document.createElement("div");
        wrapper.innerHTML = headerHtml.trim();
        document.body.prepend(wrapper.firstElementChild);

        const menuToggle = document.getElementById("menu-toggle");
        const menu = document.getElementById("menu");

        if (!menuToggle || !menu) {
            return;
        }

        menuToggle.addEventListener("click", () => {
            const isOpen = menu.classList.toggle("active");
            menuToggle.setAttribute("aria-expanded", String(isOpen));

            if (!isOpen) {
                menu.querySelectorAll(".dropdown.open").forEach((dropdown) => {
                    dropdown.classList.remove("open");
                    dropdown.querySelector(".dropbtn")?.setAttribute("aria-expanded", "false");
                });
            }
        });

        menu.querySelectorAll(".dropbtn").forEach((button) => {
            button.setAttribute("aria-expanded", "false");

            button.addEventListener("click", (event) => {
                if (!window.matchMedia("(max-width: 900px)").matches) {
                    return;
                }

                event.preventDefault();

                const dropdown = button.closest(".dropdown");
                if (!dropdown) {
                    return;
                }

                menu.querySelectorAll(".dropdown.open").forEach((openDropdown) => {
                    if (openDropdown !== dropdown) {
                        openDropdown.classList.remove("open");
                        openDropdown.querySelector(".dropbtn")?.setAttribute("aria-expanded", "false");
                    }
                });

                const isOpen = dropdown.classList.toggle("open");
                button.setAttribute("aria-expanded", String(isOpen));
            });
        });

        menu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", () => {
                menu.classList.remove("active");
                menuToggle.setAttribute("aria-expanded", "false");
                menu.querySelectorAll(".dropdown.open").forEach((dropdown) => {
                    dropdown.classList.remove("open");
                    dropdown.querySelector(".dropbtn")?.setAttribute("aria-expanded", "false");
                });
            });
        });
    };

    if (document.body) {
        mountHeader();
    } else {
        document.addEventListener("DOMContentLoaded", mountHeader);
    }

    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("/service-worker.js").catch(() => {});
        });
    }
})();
