(function () {
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

    function esSeccion(evento, seccion) {
        if (evento.seccion) {
            return evento.seccion === seccion;
        }

        const hoy = new Date();
        const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        const fechaEvento = new Date(`${evento.fecha}T00:00:00`);

        return seccion === "proximos" ? fechaEvento >= inicioHoy : fechaEvento < inicioHoy;
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
            "INSCRIBIRSE"
        );
    }

    function textoBotonEvento(evento) {
        return evento.botonEvento || `VER EVENTO ${evento.fechaCorta}`;
    }

    function crearTarjetaEvento(evento) {
        const tarjeta = crearElemento("div", "card");
        const titulo = crearElemento("h2", "", evento.tituloListado || evento.titulo);
        const resumen = crearElemento("p", "", evento.resumen || "Evento oficial de Mosco Events");
        const enlace = crearEnlace(evento.url, "btn", textoBotonEvento(evento));

        tarjeta.append(titulo, resumen, enlace);

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
                aviso.appendChild(crearElemento("p", "", "No hay eventos para mostrar."));
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
                    evento.galeria.botonListado || `FOTOS EVENTO ${evento.fechaCorta} \u2192`
                ));

            if (!enlaces.length) {
                const aviso = crearElemento("div", "card event-empty");
                aviso.appendChild(crearElemento("p", "", "No hay galer\u00edas para mostrar."));
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

    function crearImagenGaleria(src, index, titulo) {
        const imagen = document.createElement("img");
        const miniatura = obtenerMiniatura(src);
        const ampliada = obtenerImagenAmpliada(src);

        imagen.className = "zoomable";
        imagen.alt = titulo ? `Foto ${index + 1} - ${titulo}` : `Foto ${index + 1}`;
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
        const fuerte = crearElemento("strong", "", "Precio partida: ");

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
            crearDetalle("Ubicaci\u00f3n", evento.ubicacion),
            crearDetalle("Fecha", evento.fechaTexto),
            crearDetalle("Participantes", evento.participantes),
            crearDetalle("Horario", evento.horario),
            crearDetalle("Duraci\u00f3n", evento.duracion),
            crearDetalle("Premios", evento.premios),
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
            ["dias", "D\u00cdAS"],
            ["horas", "HORAS"],
            ["minutos", "MINUTOS"],
            ["segundos", "SEGUNDOS"]
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
        actualizarTexto("[data-event-hero-title]", "Evento no encontrado");
        actualizarTexto("[data-event-hero-subtitle]", "No se ha encontrado el evento solicitado.");
        actualizarTexto("[data-event-title]", "EVENTO NO ENCONTRADO");

        const contenedor = document.querySelector("[data-event-details]");

        if (contenedor) {
            const tarjeta = crearElemento("div", "card event-empty");
            tarjeta.appendChild(crearElemento("p", "", "Revisa el enlace del evento o vuelve al calendario."));
            tarjeta.appendChild(crearEnlace("/Calendario/calendario.html", "btn", "VOLVER AL CALENDARIO"));
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
        actualizarMetaDescripcion(`Informaci\u00f3n e inscripci\u00f3n para ${evento.titulo} de Mosco Events.`);
        actualizarCanonical(evento.url);
        actualizarTexto("[data-event-hero-title]", evento.titulo);
        actualizarTexto("[data-event-hero-subtitle]", evento.subtitulo || "Evento oficial de Mosco Events");
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
        if (evento.inscripcionUrl && esSeccion(evento, "proximos")) {
            acciones.appendChild(crearEnlaceRegistro(evento));
        }

        if (evento.normasUrl) {
            acciones.appendChild(crearBotonExterno(evento.normasUrl, "INFO & NORMAS"));
        }

        if (evento.galeria?.activa) {
            acciones.appendChild(crearEnlace(
                evento.galeria.url,
                "galeria-btn",
                evento.botonGaleria || `FOTOS EVENTO ${evento.fechaCorta} \u2192`
            ));
        }

        if (acciones.children.length) {
            tarjeta.appendChild(acciones);
        }

        contenedor.replaceChildren(tarjeta);
    }

    function renderizarGaleriaNoEncontrada() {
        actualizarTexto("[data-gallery-hero-title]", "GALER\u00cdA");
        actualizarTexto("[data-gallery-hero-subtitle]", "No se ha encontrado la galer\u00eda solicitada.");
        actualizarTexto("[data-gallery-title]", "GALER\u00cdA NO ENCONTRADA");

        const contenedor = document.querySelector("[data-gallery-grid]");

        if (contenedor) {
            const tarjeta = crearElemento("div", "card event-empty");
            tarjeta.appendChild(crearElemento("p", "", "Revisa el enlace de la galer\u00eda o vuelve al listado."));
            tarjeta.appendChild(crearEnlace("/Galeria/galeria.html", "btn", "VOLVER A GALER\u00cdA"));
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
        actualizarMetaDescripcion(`Galer\u00eda oficial de Mosco Events para ${evento.titulo}.`);
        actualizarCanonical(galeria.url);
        actualizarTexto("[data-gallery-hero-title]", galeria.titulo || "GALER\u00cdA");
        actualizarTexto("[data-gallery-hero-subtitle]", galeria.descripcion || `Fotograf\u00edas de ${evento.titulo}`);
        actualizarTexto("[data-gallery-title]", "GALER\u00cdA DE IM\u00c1GENES");

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
                galeria.mensajeVacio || "Galer\u00eda preparada para cuando se a\u00f1adan fotograf\u00edas."
            ));
            contenedor.replaceChildren(tarjeta);
            return;
        }

        const nodos = imagenes.map((src, index) => crearImagenGaleria(src, index, evento.titulo));

        contenedor.replaceChildren(...nodos);
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

    renderizarListados();
    renderizarEnlacesGaleria();
    renderizarGaleriasAleatorias();
    renderizarPaginaEvento();
    renderizarPaginaGaleria();
})();
