(function () {
    function t(key, vars) {
        return window.MoscoI18n ? window.MoscoI18n.t(key, vars) : key;
    }

    function formatearFechaLarga(evento) {
        if (!evento.fecha) {
            return evento.fechaTexto;
        }

        const fecha = new Date(`${evento.fecha}T00:00:00`);

        if (Number.isNaN(fecha.getTime())) {
            return evento.fechaTexto;
        }

        const locale = window.MoscoI18n?.getLocale() || "es-ES";

        return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long", year: "numeric" }).format(fecha);
    }

    const eventos = Array.isArray(window.MOSCO_EVENTOS) ? window.MOSCO_EVENTOS : [];
    const eventosPorId = new Map(eventos.map((evento) => [evento.id, evento]));
    const GALLERY_PLACEHOLDER_SRC =
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";

    function crearElemento(etiqueta, clase, texto) {
        const elemento = document.createElement(etiqueta);

        if (clase) {
            elemento.className = clase;
        }

        if (texto !== undefined && texto !== null) {
            elemento.textContent = texto;
        }

        return elemento;
    }

    function obtenerEventoSeleccionado() {
        const parametros = new URLSearchParams(window.location.search);
        const id = parametros.get("id") || document.body.dataset.eventoId;

        return eventosPorId.get(id);
    }

    function ordenarPorFechaAscendente(lista) {
        return [...lista].sort((a, b) => a.fecha.localeCompare(b.fecha));
    }

    function ordenarPorFechaDescendente(lista) {
        return [...lista].sort((a, b) => b.fecha.localeCompare(a.fecha));
    }

    // La clasifica datos.js a partir de la fecha y la hora de inicio de la
    // partida, no de un campo escrito a mano.
    function esProximo(evento) {
        return Boolean(window.MOSCO_ES_PROXIMO?.(evento));
    }

    function esSeccion(evento, seccion) {
        return seccion === "proximos" ? esProximo(evento) : !esProximo(evento);
    }

    function crearEnlace(href, clase, texto) {
        const enlace = crearElemento("a", clase, texto);
        enlace.href = href;
        return enlace;
    }

    function crearBotonExterno(href, texto) {
        const enlace = crearEnlace(href, "btn", texto);
        enlace.target = "_blank";
        enlace.rel = "noopener noreferrer";
        return enlace;
    }

    function crearEnlaceRegistro(evento) {
        const href = evento.inscripcionUrl || `/registro.html?id=${encodeURIComponent(evento.id)}`;

        return crearEnlace(
            href,
            "btn",
            t("eventos.register_button")
        );
    }

    function textoBotonEvento(evento) {
        return evento.botonEvento || t("eventos.view_event_button", { fecha: evento.fechaCorta });
    }

    // Imagen de cabecera de la tarjeta: la portada declarada en datos.js y, si
    // no hay, la primera foto de la galeria del evento. Las partidas que aun no
    // se han jugado no tienen galeria, asi que ahi la portada es obligatoria
    // para que la tarjeta salga con foto.
    function portadaEvento(evento) {
        return evento.portada || evento.galeria?.imagenes?.[0] || null;
    }

    function crearPortadaTarjeta(evento) {
        const origen = portadaEvento(evento);

        if (!origen) {
            return null;
        }

        const media = crearElemento("div", "event-card__media");
        const imagen = document.createElement("img");

        imagen.src = obtenerMiniatura(origen);
        imagen.srcset = `${obtenerMiniatura(origen)} 390w, ${obtenerImagenAmpliada(origen)} 675w`;
        imagen.sizes = "(min-width: 900px) 590px, 100vw";
        imagen.loading = "lazy";
        imagen.decoding = "async";
        imagen.width = 675;
        imagen.height = 506;

        // La foto es decorativa: el titulo de la partida va justo debajo y
        // repetirlo en el alt solo molesta a quien usa lector de pantalla.
        imagen.alt = "";

        media.append(imagen, crearChipFecha(evento));

        const estado = crearEstadoTarjeta(evento);

        if (estado) {
            media.appendChild(estado);
        }

        return media;
    }

    function crearChipFecha(evento) {
        const chip = crearElemento("div", "event-card__date");
        const fecha = evento.fecha ? new Date(`${evento.fecha}T00:00:00`) : null;

        if (!fecha || Number.isNaN(fecha.getTime())) {
            chip.appendChild(crearElemento("span", "", evento.fechaCorta || ""));
            return chip;
        }

        const locale = window.MoscoI18n?.getLocale() || "es-ES";
        const mes = new Intl.DateTimeFormat(locale, { month: "short" }).format(fecha);

        chip.append(
            crearElemento("b", "", String(fecha.getDate())),
            crearElemento("span", "", mes.replace(".", "").toUpperCase())
        );

        return chip;
    }

    // Solo se marca lo que se sabe de verdad. El aforo real se comprueba en el
    // formulario de inscripcion contra el backend, asi que aqui no se promete
    // ningun numero de plazas libres.
    function crearEstadoTarjeta(evento) {
        if (evento.inscripcionesCerradas) {
            return crearElemento("div", "event-card__state is-closed", t("eventos.state_closed"));
        }

        return null;
    }

    // Deja solo letras y numeros para poder comparar "Laser Counter - Pedrola."
    // con "Laser Counter (Pedrola)".
    function clavePlana(texto) {
        return String(texto || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .replace(/[^a-z0-9]/g, "");
    }

    function repiteUbicacion(resumen, ubicacion) {
        const a = clavePlana(resumen);
        const b = clavePlana(ubicacion);

        return Boolean(a && b && a === b);
    }

    function crearDatosTarjeta(evento) {
        // En una partida ya jugada no quedan "plazas": son los participantes
        // que hubo.
        const claveAforo = esProximo(evento) ? "eventos.meta_slots" : "eventos.meta_participants";

        const valores = [
            evento.ubicacion,
            evento.horario,
            typeof evento.importe === "number" ? window.MOSCO_FORMATEAR_IMPORTE?.(evento.importe) : null,
            evento.plazas ? t(claveAforo, { plazas: evento.plazas }) : null
        ].filter(Boolean);

        if (!valores.length) {
            return null;
        }

        const lista = crearElemento("ul", "event-card__meta");

        valores.forEach((valor) => {
            lista.appendChild(crearElemento("li", "", valor));
        });

        return lista;
    }

    function crearTarjetaEvento(evento) {
        const tarjeta = crearElemento("article", "card event-card");
        const portada = crearPortadaTarjeta(evento);

        if (portada) {
            tarjeta.appendChild(portada);
            tarjeta.classList.add("has-media");
        }

        const cuerpo = crearElemento("div", "event-card__body");

        cuerpo.appendChild(crearElemento("h2", "", evento.tituloListado || evento.titulo));

        const resumen = evento.resumen || t("eventos.default_summary");

        // Varias partidas tienen como resumen la propia ubicacion ("Laser
        // Counter - Pedrola."), que ahora ya sale como dato de la tarjeta.
        // Repetirla dos lineas mas arriba no aporta nada.
        if (!repiteUbicacion(resumen, evento.ubicacion)) {
            cuerpo.appendChild(crearElemento("p", "", resumen));
        }

        const datos = crearDatosTarjeta(evento);

        if (datos) {
            cuerpo.appendChild(datos);
        }

        const acciones = crearElemento("div", "event-card__actions");

        // En las partidas que aun se pueden jugar la accion principal es
        // inscribirse; en las pasadas no hay inscripcion que ofrecer.
        if (esProximo(evento) && !evento.inscripcionesCerradas) {
            acciones.append(
                crearEnlaceRegistro(evento),
                crearEnlace(evento.url, "btn btn-ghost", textoBotonEvento(evento))
            );
        } else {
            acciones.appendChild(crearEnlace(evento.url, "btn", textoBotonEvento(evento)));
        }

        cuerpo.appendChild(acciones);
        tarjeta.appendChild(cuerpo);

        return tarjeta;
    }

    function renderizarListados() {
        document.querySelectorAll("[data-event-list]").forEach((contenedor) => {
            const tipo = contenedor.dataset.eventList;
            const seccion = tipo === "upcoming" ? "proximos" : tipo === "past" ? "anteriores" : tipo;
            const lista = eventos.filter((evento) => esSeccion(evento, seccion));
            const ordenada = seccion === "proximos"
                ? ordenarPorFechaAscendente(lista)
                : ordenarPorFechaDescendente(lista);

            if (!ordenada.length) {
                const aviso = crearElemento("div", "card event-empty");
                aviso.appendChild(crearElemento("p", "", t("eventos.empty_list")));
                contenedor.replaceChildren(aviso);
                return;
            }

            contenedor.replaceChildren(...ordenada.map(crearTarjetaEvento));
        });
    }

    function renderizarEnlacesGaleria() {
        document.querySelectorAll("[data-gallery-list]").forEach((contenedor) => {
            // Mas recientes primero, igual que el listado de eventos.
            const enlaces = ordenarPorFechaDescendente(eventos)
                .filter((evento) => evento.galeria?.activa)
                .map((evento) => crearEnlace(
                    evento.galeria.url,
                    "galeria-btn",
                    evento.galeria.botonListado || t("eventos.gallery_button", { fecha: evento.fechaCorta })
                ));

            if (!enlaces.length) {
                const aviso = crearElemento("div", "card event-empty");
                aviso.appendChild(crearElemento("p", "", t("eventos.empty_gallery_list")));
                contenedor.replaceChildren(aviso);
                return;
            }

            contenedor.replaceChildren(...enlaces);
        });
    }

    function obtenerImagenesEventos() {
        return eventos.flatMap((evento) => {
            const imagenes = Array.isArray(evento.galeria?.imagenes) ? evento.galeria.imagenes : [];

            return imagenes.map((src) => ({
                src,
                titulo: evento.titulo
            }));
        });
    }

    function mezclar(lista) {
        const mezclada = [...lista];

        for (let index = mezclada.length - 1; index > 0; index -= 1) {
            const randomIndex = Math.floor(Math.random() * (index + 1));
            [mezclada[index], mezclada[randomIndex]] = [mezclada[randomIndex], mezclada[index]];
        }

        return mezclada;
    }

    function textoAlternativo(index, titulo) {
        return titulo
            ? t("common.photo_alt_with_title", { n: index + 1, title: titulo })
            : t("common.photo_alt", { n: index + 1 });
    }

    // Reescribe los alt de las galerias ya pintadas al cambiar de idioma. Es
    // lo unico que cambia de una imagen, y hacerlo asi evita tener que
    // recrearlas: volver a crearlas las devolvia al placeholder de 1x1 sin
    // que nadie volviera a lanzar la carga diferida de script.js, y la
    // galeria entera se quedaba en blanco tras cambiar de idioma.
    function actualizarTextosAlternativos() {
        document.querySelectorAll(".gallery-grid img[data-galeria-indice]").forEach((imagen) => {
            imagen.alt = textoAlternativo(
                Number(imagen.dataset.galeriaIndice),
                imagen.dataset.galeriaTitulo || ""
            );
        });
    }

    function crearImagenGaleria(src, index, titulo) {
        const imagen = document.createElement("img");
        const miniatura = obtenerMiniatura(src);
        const ampliada = obtenerImagenAmpliada(src);

        imagen.className = "zoomable";
        imagen.alt = textoAlternativo(index, titulo);
        imagen.dataset.galeriaIndice = String(index);

        if (titulo) {
            imagen.dataset.galeriaTitulo = titulo;
        }

        imagen.loading = "lazy";
        imagen.decoding = "async";
        imagen.fetchPriority = "low";
        imagen.width = 640;
        imagen.height = 480;
        imagen.dataset.src = miniatura;
        imagen.dataset.fullSrc = ampliada;
        imagen.src = GALLERY_PLACEHOLDER_SRC;

        if (ampliada !== src) {
            imagen.dataset.downloadSrc = src;
        }

        imagen.addEventListener("error", () => {
            if (imagen.getAttribute("src") !== src) {
                imagen.src = src;
                imagen.dataset.src = src;
                imagen.dataset.fullSrc = src;
                imagen.dataset.downloadSrc = src;
            }
        }, { once: true });

        return imagen;
    }

    function obtenerMiniatura(src) {
        const limpia = src.split(/[?#]/)[0];
        const decodificada = decodeURIComponent(limpia);

        if (!decodificada.startsWith("/images/")) {
            return src;
        }

        if (decodificada.startsWith("/images/thumbs/")) {
            return src;
        }

        if (decodificada.startsWith("/images/optimized/")) {
            return encodeURI(decodificada.replace(/^\/images\/optimized\//, "/images/thumbs/"));
        }

        const sinCarpetaImagenes = decodificada.replace(/^\/images\//, "");
        const puntoExtension = sinCarpetaImagenes.lastIndexOf(".");

        if (puntoExtension === -1) {
            return src;
        }

        const sinExtension = sinCarpetaImagenes.slice(0, puntoExtension);
        return encodeURI(`/images/thumbs/${sinExtension}.webp`);
    }

    function obtenerImagenAmpliada(src) {
        const limpia = src.split(/[?#]/)[0];
        const decodificada = decodeURIComponent(limpia);

        if (!decodificada.startsWith("/images/")) {
            return src;
        }

        if (decodificada.startsWith("/images/optimized/")) {
            return src;
        }

        const sinCarpetaImagenes = decodificada.replace(/^\/images\//, "");
        const puntoExtension = sinCarpetaImagenes.lastIndexOf(".");

        if (puntoExtension === -1) {
            return src;
        }

        const sinExtension = sinCarpetaImagenes.slice(0, puntoExtension);
        return encodeURI(`/images/optimized/${sinExtension}.webp`);
    }

    function renderizarGaleriasAleatorias() {
        const imagenesEventos = obtenerImagenesEventos();

        if (!imagenesEventos.length) {
            return;
        }

        document.querySelectorAll("[data-random-gallery]").forEach((contenedor) => {
            const cantidad = Number.parseInt(contenedor.dataset.randomGallery, 10) || 18;
            const seleccionadas = mezclar(imagenesEventos).slice(0, cantidad);
            const nodos = seleccionadas.map((imagen, index) => (
                crearImagenGaleria(imagen.src, index, imagen.titulo)
            ));

            contenedor.replaceChildren(...nodos);
        });
    }

    function actualizarTexto(selector, texto) {
        const elemento = document.querySelector(selector);

        if (elemento) {
            elemento.textContent = texto;
        }
    }

    function actualizarMeta(selector, atributo, valor) {
        const meta = document.querySelector(selector);

        if (meta) {
            meta.setAttribute(atributo, valor);
        }
    }

    function actualizarMetaDescripcion(texto) {
        actualizarMeta('meta[name="description"]', "content", texto);
        actualizarMeta('meta[property="og:description"]', "content", texto);
        actualizarMeta('meta[name="twitter:description"]', "content", texto);
    }

    // Mantiene el titulo compartible y el canonical en sintonia con el evento
    // que se esta mostrando en las paginas genericas.
    function actualizarMetaTitulo(texto) {
        actualizarMeta('meta[property="og:title"]', "content", texto);
        actualizarMeta('meta[name="twitter:title"]', "content", texto);
    }

    function actualizarCanonical(ruta) {
        const url = new URL(ruta, window.location.origin).toString();

        actualizarMeta('link[rel="canonical"]', "href", url);
        actualizarMeta('meta[property="og:url"]', "content", url);
    }

    function crearDetalle(etiqueta, valor, atributoValor) {
        if (!valor) {
            return null;
        }

        const parrafo = crearElemento("p");
        const fuerte = crearElemento("strong", "", `${etiqueta}: `);
        const contenido = crearElemento("span", "", valor);

        if (atributoValor) {
            contenido.dataset[atributoValor] = "";
        }

        parrafo.append(fuerte, contenido);

        return parrafo;
    }

    function crearDetallePago(evento) {
        if (!evento.precio) {
            return null;
        }

        const parrafo = crearElemento("p");
        const fuerte = crearElemento("strong", "", `${t("eventos.detail.price")} `);

        parrafo.appendChild(fuerte);

        if (evento.pagoUrl) {
            const enlace = crearEnlace(evento.pagoUrl, "event-payment-link", evento.precio);
            enlace.target = "_blank";
            enlace.rel = "noopener noreferrer";
            parrafo.appendChild(enlace);
        } else {
            parrafo.appendChild(crearElemento("span", "", evento.precio));
        }

        return parrafo;
    }

    function detallesEvento(evento) {
        return [
            crearDetalle(t("eventos.detail.location"), evento.ubicacion),
            crearDetalle(t("eventos.detail.date"), formatearFechaLarga(evento)),
            crearDetalle(t("eventos.detail.participants"), evento.participantes),
            crearDetalle(t("eventos.detail.schedule"), evento.horario),
            crearDetalle(t("eventos.detail.duration"), evento.duracion),
            crearDetalle(t("eventos.detail.prizes"), evento.premios),
            crearDetallePago(evento)
        ].filter(Boolean);
    }

    function crearCuentaAtras(evento) {
        if (!evento.cuentaAtras || !evento.fechaHora) {
            return null;
        }

        const cuentaAtras = crearElemento("div", "countdown");
        cuentaAtras.dataset.countdownDate = evento.fechaHora;

        [
            ["dias", t("eventos.countdown.days")],
            ["horas", t("eventos.countdown.hours")],
            ["minutos", t("eventos.countdown.minutes")],
            ["segundos", t("eventos.countdown.seconds")]
        ].forEach(([id, etiqueta]) => {
            const caja = crearElemento("div", "time-box");
            const numero = crearElemento("span", "", "00");
            const texto = crearElemento("small", "", etiqueta);

            numero.id = id;
            caja.append(numero, texto);
            cuentaAtras.appendChild(caja);
        });

        return cuentaAtras;
    }

    function renderizarEventoNoEncontrado() {
        actualizarTexto("[data-event-hero-title]", t("eventos.not_found.hero_title"));
        actualizarTexto("[data-event-hero-subtitle]", t("eventos.not_found.hero_subtitle"));
        actualizarTexto("[data-event-title]", t("eventos.not_found.title"));

        const contenedor = document.querySelector("[data-event-details]");

        if (contenedor) {
            const tarjeta = crearElemento("div", "card event-empty");
            tarjeta.appendChild(crearElemento("p", "", t("eventos.not_found.message")));
            tarjeta.appendChild(crearEnlace("/Calendario/calendario.html", "btn", t("eventos.not_found.back_button")));
            contenedor.replaceChildren(tarjeta);
        }
    }

    function renderizarPaginaEvento() {
        if (!document.querySelector("[data-event-page]")) {
            return;
        }

        const evento = obtenerEventoSeleccionado();

        if (!evento) {
            renderizarEventoNoEncontrado();
            return;
        }

        document.title = `${evento.titulo} | Mosco Events`;
        actualizarMetaTitulo(`${evento.titulo} | Mosco Events`);
        actualizarMetaDescripcion(t("eventos.meta.event_description", { title: evento.titulo }));
        actualizarCanonical(evento.url);
        actualizarTexto("[data-event-hero-title]", evento.titulo);
        actualizarTexto("[data-event-hero-subtitle]", evento.subtitulo || t("eventos.default_summary"));
        actualizarTexto("[data-event-title]", (evento.tituloDetalle || evento.titulo).toUpperCase());

        const heroContent = document.querySelector("[data-event-hero-content]");
        const cuentaAtras = crearCuentaAtras(evento);

        if (heroContent && cuentaAtras) {
            heroContent.appendChild(cuentaAtras);
        }

        const contenedor = document.querySelector("[data-event-details]");

        if (!contenedor) {
            return;
        }

        const tarjeta = crearElemento("div", "card");
        const acciones = crearElemento("div", "event-actions");

        detallesEvento(evento).forEach((detalle) => tarjeta.appendChild(detalle));

        // No mostrar INSCRIBIRSE en partidas ya pasadas: registro.js solo
        // lista eventos "proximos", asi que el enlace llevaria a un formulario vacio.
        if (evento.inscripcionesCerradas) {
            const aviso = crearElemento("p", "event-registration-notice");
            aviso.innerHTML = evento.avisoInscripcion || t("registro.form.blocked_message_default");
            acciones.appendChild(aviso);
        } else if (evento.inscripcionUrl && esSeccion(evento, "proximos")) {
            acciones.appendChild(crearEnlaceRegistro(evento));
        }

        // Las normas propias de la partida van antes que el reglamento general
        // porque son las que el jugador tiene que leer si o si para ese evento.
        if (evento.normasEventoUrl) {
            acciones.appendChild(crearElemento("p", "event-required-notice", t("eventos.event_rules_notice")));
            acciones.appendChild(crearBotonExterno(evento.normasEventoUrl, t("eventos.event_rules_button")));
        }

        if (evento.normasUrl) {
            acciones.appendChild(crearBotonExterno(evento.normasUrl, t("eventos.rules_button")));
        }

        if (evento.galeria?.activa) {
            acciones.appendChild(crearEnlace(
                evento.galeria.url,
                "galeria-btn",
                evento.botonGaleria || t("eventos.gallery_button", { fecha: evento.fechaCorta })
            ));
        }

        if (acciones.children.length) {
            tarjeta.appendChild(acciones);
        }

        contenedor.replaceChildren(tarjeta);
    }

    function renderizarGaleriaNoEncontrada() {
        actualizarTexto("[data-gallery-hero-title]", t("eventos.gallery_not_found.hero_title"));
        actualizarTexto("[data-gallery-hero-subtitle]", t("eventos.gallery_not_found.hero_subtitle"));
        actualizarTexto("[data-gallery-title]", t("eventos.gallery_not_found.title"));

        const contenedor = document.querySelector("[data-gallery-grid]");

        if (contenedor) {
            const tarjeta = crearElemento("div", "card event-empty");
            tarjeta.appendChild(crearElemento("p", "", t("eventos.gallery_not_found.message")));
            tarjeta.appendChild(crearEnlace("/Galeria/galeria.html", "btn", t("eventos.gallery_not_found.back_button")));
            contenedor.replaceChildren(tarjeta);
        }
    }

    function renderizarPaginaGaleria() {
        if (!document.querySelector("[data-gallery-page]")) {
            return;
        }

        const evento = obtenerEventoSeleccionado();
        const galeria = evento?.galeria;

        if (!evento || !galeria?.activa) {
            renderizarGaleriaNoEncontrada();
            return;
        }

        document.title = `${galeria.titulo} ${evento.fechaCorta} | Mosco Events`;
        actualizarMetaTitulo(`${galeria.titulo} ${evento.fechaCorta} | Mosco Events`);
        actualizarMetaDescripcion(t("eventos.meta.gallery_description", { title: evento.titulo }));
        actualizarCanonical(galeria.url);
        actualizarTexto("[data-gallery-hero-title]", galeria.titulo || t("eventos.gallery.title_default"));
        actualizarTexto("[data-gallery-hero-subtitle]", galeria.descripcion || t("eventos.gallery.description_default", { title: evento.titulo }));
        actualizarTexto("[data-gallery-title]", t("eventos.gallery.detail_title"));

        const contenedor = document.querySelector("[data-gallery-grid]");
        const imagenes = Array.isArray(galeria.imagenes) ? galeria.imagenes : [];

        if (!contenedor) {
            return;
        }

        if (!imagenes.length) {
            const tarjeta = crearElemento("div", "card event-empty");
            tarjeta.appendChild(crearElemento(
                "p",
                "",
                galeria.mensajeVacio || t("eventos.gallery.empty_default")
            ));
            contenedor.replaceChildren(tarjeta);
            return;
        }

        // Si estas mismas imagenes ya estan pintadas (por ejemplo al volver a
        // renderizar tras cambiar de idioma), no se tocan: solo se refrescan
        // sus alt. Recrearlas romperia la carga diferida que ya las gestiona.
        if (contenedor.dataset.galeriaEventoId === evento.id) {
            actualizarTextosAlternativos();
            return;
        }

        const nodos = imagenes.map((src, index) => crearImagenGaleria(src, index, evento.titulo));

        contenedor.replaceChildren(...nodos);
        contenedor.dataset.galeriaEventoId = evento.id;
    }

    // Datos estructurados de las partidas para Google. Sin esto, los
    // resultados de busqueda no pueden mostrar fecha, lugar, precio ni
    // disponibilidad de cada partida, que es justo lo que busca quien quiere
    // apuntarse. Solo se publican las partidas que aun no han empezado.
    function publicarDatosEstructurados() {
        const proximos = ordenarPorFechaAscendente(eventos.filter(esProximo));

        if (!proximos.length) {
            return;
        }

        const origen = "https://www.moscoevents.com";
        const eventosSchema = proximos.map((evento) => {
            const schema = {
                "@context": "https://schema.org",
                "@type": "Event",
                name: evento.titulo,
                description: evento.resumen || evento.subtitulo || "",
                startDate: evento.comienzo instanceof Date
                    ? evento.comienzo.toISOString()
                    : evento.fecha,
                eventStatus: "https://schema.org/EventScheduled",
                eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
                url: new URL(evento.url, origen).toString(),
                image: `${origen}/images/base%20web/og-image.jpg`,
                location: {
                    "@type": "Place",
                    name: evento.ubicacion || "Laser Counter (Pedrola)",
                    address: {
                        "@type": "PostalAddress",
                        addressLocality: "Pedrola",
                        addressRegion: "Zaragoza",
                        addressCountry: "ES"
                    }
                },
                organizer: {
                    "@type": "Organization",
                    name: "Mosco Events",
                    url: origen
                }
            };

            if (evento.final instanceof Date) {
                schema.endDate = evento.final.toISOString();
            }

            if (typeof evento.importe === "number") {
                schema.offers = {
                    "@type": "Offer",
                    price: String(evento.importe),
                    priceCurrency: "EUR",
                    availability: "https://schema.org/InStock",
                    url: new URL(evento.inscripcionUrl || "/registro.html", origen).toString()
                };
            }

            if (typeof evento.participantes === "number") {
                schema.maximumAttendeeCapacity = evento.participantes;
            }

            return schema;
        });

        const anterior = document.getElementById("mosco-eventos-schema");

        if (anterior) {
            anterior.remove();
        }

        const script = document.createElement("script");

        script.type = "application/ld+json";
        script.id = "mosco-eventos-schema";
        script.textContent = JSON.stringify(eventosSchema);
        document.head.appendChild(script);
    }

    window.MoscoEventos = {
        eventos,
        obtenerPorId: (id) => eventosPorId.get(id),
        obtenerEventosCalendario: () => eventos.map((evento) => ({
            fecha: evento.fecha,
            titulo: evento.tituloCalendario || evento.titulo,
            enlace: evento.url
        }))
    };

    function renderizarTodo() {
        renderizarListados();
        renderizarEnlacesGaleria();
        renderizarPaginaEvento();
        renderizarPaginaGaleria();
    }

    renderizarTodo();
    renderizarGaleriasAleatorias();
    publicarDatosEstructurados();

    window.addEventListener("mosco:langchange", () => {
        renderizarTodo();
        // Las galerias aleatorias (portada, /Galeria/galeria.html) no se
        // vuelven a sortear al cambiar de idioma, pero sus alt si se traducen.
        actualizarTextosAlternativos();
    });
})();
