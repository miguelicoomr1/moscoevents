(function () {
    const headerHtml = `
        <header id="top">
            <div class="logo">
                <a href="/index.html">
                    <img
                        src="/images/base%20web/logo-png.png"
                        alt="Mosco Events"
                    >
                </a>
            </div>

            <button
                class="menu-toggle"
                id="menu-toggle"
                type="button"
                aria-label="Abrir men\u00FA"
                aria-expanded="false"
                aria-controls="menu"
            >
                \u2630
            </button>

            <nav id="menu">
                <a href="/index.html">Inicio</a>

                <div class="dropdown">
                    <button
                        class="dropbtn"
                        type="button"
                    >
                        Eventos \u25BE
                    </button>

                    <div class="dropdown-content">
                        <a href="/Calendario/calendario.html">
                            \uD83D\uDCC5\uFE0F Calendario
                        </a>

                        <a href="/Proximos%20Eventos/operaci%C3%B3n-verano.html">
                            \uD83D\uDD25 Operaci\u00F3n Verano
                        </a>

                        <a href="/Proximos%20Eventos/proximos-eventos.html">
                            \uD83D\uDD1C Pr\u00F3ximos Eventos
                        </a>

                        <a href="/Eventos%20anteriores/eventos-anteriores.html">
                            \uD83D\uDD19 Eventos Anteriores
                        </a>
                    </div>
                </div>

                <a href="/Galeria/galeria.html">
                    Galer\u00EDa
                </a>

                <div class="dropdown">
                    <button
                        class="dropbtn"
                        type="button"
                    >
                        Informaci\u00F3n \u25BE
                    </button>

                    <div class="dropdown-content">
                        <a href="/normas.html">
                            \uD83D\uDCDC Normas
                        </a>

                        <a href="/contacto.html">
                            \uD83D\uDCDE Contacto
                        </a>

                        <a href="/legales-mosco-events.html">
                            \u2696\uFE0F Informaci\u00F3n legal
                        </a>
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
})();
