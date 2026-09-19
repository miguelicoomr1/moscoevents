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
                            \uD83C\uDFAF Pr\u00F3ximos Eventos
                        </a>

                        <a href="/registro.html" data-i18n="nav.inscripciones">
                            \uD83D\uDCDD Inscripciones
                        </a>

                        <a href="/Eventos%20anteriores/eventos-anteriores.html" data-i18n="nav.anteriores">
                            \uD83D\uDDC2\uFE0F Eventos Anteriores
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

    // El pie de pagina se monta desde aqui, igual que la cabecera: son 28
    // paginas HTML y antes cada una llevaba su propio <footer> con un
    // copyright y nada mas. Ahora hay un solo sitio que tocar y todas las
    // paginas tienen salida hacia normas, legales, calendario y contacto,
    // que es justo lo que se busca al llegar al final.
    const footerHtml = `
        <footer class="site-footer">
            <div class="site-footer-inner">

                <div class="site-footer-brand">
                    <img
                        src="/images/base%20web/logo-header.webp"
                        alt="Mosco Events"
                        width="64"
                        height="64"
                        loading="lazy"
                    >

                    <p data-i18n="footer.tagline">
                        Airsoft, TCSIM y simulación táctica en Pedrola, Zaragoza.
                    </p>

                    <div class="site-footer-social">
                        <a
                            href="https://wa.me/34698125932"
                            target="_blank"
                            rel="noopener noreferrer"
                        >WhatsApp</a>

                        <a
                            href="https://www.instagram.com/mosco.events/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >Instagram</a>
                    </div>
                </div>

                <nav class="site-footer-col" aria-labelledby="site-footer-partidas">
                    <h2 id="site-footer-partidas" data-i18n="footer.col_partidas">Partidas</h2>

                    <ul>
                        <li><a href="/Proximos%20Eventos/proximos-eventos.html" data-i18n="footer.proximos">Próximas partidas</a></li>
                        <li><a href="/Calendario/calendario.html" data-i18n="footer.calendario">Calendario</a></li>
                        <li><a href="/registro.html" data-i18n="footer.inscripciones">Inscripciones</a></li>
                        <li><a href="/Eventos%20anteriores/eventos-anteriores.html" data-i18n="footer.anteriores">Eventos anteriores</a></li>
                        <li><a href="/Galeria/galeria.html" data-i18n="footer.galeria">Galería</a></li>
                    </ul>
                </nav>

                <nav class="site-footer-col" aria-labelledby="site-footer-info">
                    <h2 id="site-footer-info" data-i18n="footer.col_info">Información</h2>

                    <ul>
                        <li><a href="/normas.html" data-i18n="footer.normas">Normas</a></li>
                        <li><a href="/contacto.html" data-i18n="footer.contacto">Contacto</a></li>
                        <li><a href="/legales-mosco-events.html" data-i18n="footer.legal">Aviso legal y privacidad</a></li>
                        <li><a href="mailto:info@moscoevents.com">info@moscoevents.com</a></li>
                    </ul>
                </nav>

            </div>

            <div class="site-footer-bottom">
                <a class="site-footer-credit" href="https://miguelicoomr1.github.io/portfolio/" target="_blank" rel="noopener noreferrer">Diseñado y desarrollado por MiguelicooMR1</a>

                <p>
                    © <span id="footer-year">2026</span> Mosco Events ·
                    <span data-i18n="footer.rights">Todos los derechos reservados</span>
                </p>
            </div>
        </footer>
    `;

    const mountFooter = () => {
        if (document.querySelector(".site-footer")) {
            return;
        }

        const wrapper = document.createElement("div");
        wrapper.innerHTML = footerHtml.trim();
        const nuevo = wrapper.firstElementChild;

        // Las paginas traen su <footer> antiguo escrito a mano: se sustituye.
        // Las que no lo tengan reciben el pie al final del body.
        const anterior = document.querySelector("body > footer");

        if (anterior) {
            anterior.replaceWith(nuevo);
        } else {
            document.body.appendChild(nuevo);
        }

        // script.js tambien pone el ano en #footer-year, pero se ejecuta antes
        // de que este pie exista (el suyo corre al final del body y este se
        // monta en DOMContentLoaded), asi que lo escribimos aqui.
        const ano = nuevo.querySelector("#footer-year");

        if (ano) {
            ano.textContent = String(new Date().getFullYear());
        }
    };

    // Deja la URL en una forma comparable: sin %20, en minusculas y con la
    // portada siempre como "/index.html".
    const normalizarRuta = (ruta) => {
        let limpia = ruta;

        try {
            limpia = decodeURIComponent(ruta);
        } catch (error) {
            // Ruta con un escape raro: se compara tal cual.
        }

        limpia = limpia.toLowerCase().replace(/\/+$/, "");

        return limpia === "" ? "/index.html" : limpia;
    };

    // Paginas de detalle que no tienen enlace propio en el menu pero pertenecen
    // a una seccion: la marca se lleva al enlace de esa seccion.
    const SECCIONES = [
        { prueba: (p) => p.startsWith("/proximos eventos/") || p === "/evento.html", destino: "/proximos eventos/proximos-eventos.html" },
        { prueba: (p) => p.startsWith("/galeria/") || p === "/galeria-evento.html", destino: "/galeria/galeria.html" },
        { prueba: (p) => p.startsWith("/eventos anteriores/"), destino: "/eventos anteriores/eventos-anteriores.html" },
        { prueba: (p) => p.startsWith("/calendario/"), destino: "/calendario/calendario.html" }
    ];

    const marcarPaginaActual = (menu) => {
        const actual = normalizarRuta(window.location.pathname);
        const seccion = SECCIONES.find((entrada) => entrada.prueba(actual));
        const objetivo = seccion ? seccion.destino : actual;

        const enlace = Array.from(menu.querySelectorAll("a")).find(
            (candidato) => normalizarRuta(new URL(candidato.href, window.location.origin).pathname) === objetivo
        );

        if (!enlace) {
            return;
        }

        enlace.classList.add("is-current");
        enlace.setAttribute("aria-current", "page");

        // Si el enlace vive dentro de un desplegable, tambien se marca el boton
        // que lo abre: si no, en escritorio no se veria nada.
        enlace.closest(".dropdown")?.classList.add("has-current");
    };

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

        marcarPaginaActual(menu);

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

    // El pie, al contrario que la cabecera, no puede montarse en cuanto existe
    // el body: este script se carga al principio del body y en ese momento el
    // <main> y el <footer> de la pagina todavia no se han leido, asi que el
    // pie acabaria colocado por delante de la portada. Se espera al documento
    // completo.
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", mountFooter);
    } else {
        mountFooter();
    }

    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("/service-worker.js").catch(() => {});
        });
    }

    const IOS_BANNER_DISMISSED_KEY = "moscoIosInstallBannerDismissed";

    function isIos() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    function isStandalone() {
        return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    }

    function mountIosInstallBanner() {
        if (!isIos() || isStandalone()) {
            return;
        }

        let dismissed = false;
        try {
            dismissed = localStorage.getItem(IOS_BANNER_DISMISSED_KEY) === "1";
        } catch (error) {
            dismissed = false;
        }

        if (dismissed) {
            return;
        }

        const banner = document.createElement("div");
        banner.className = "ios-install-banner";
        banner.innerHTML = `
            <p>
                <strong>Instala Mosco Events</strong> en tu iPhone: toca
                <span class="ios-install-banner-icon">📤</span> y luego "Añadir a pantalla de inicio".
            </p>
            <button type="button" class="ios-install-banner-close" aria-label="Cerrar aviso">×</button>
        `;

        document.body.appendChild(banner);

        banner.querySelector(".ios-install-banner-close").addEventListener("click", () => {
            banner.remove();
            try {
                localStorage.setItem(IOS_BANNER_DISMISSED_KEY, "1");
            } catch (error) {
                /* localStorage unavailable, ignore */
            }
        });
    }

    if (document.body) {
        mountIosInstallBanner();
    } else {
        document.addEventListener("DOMContentLoaded", mountIosInstallBanner);
    }
})();
