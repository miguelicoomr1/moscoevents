(function () {
    const INFO_NORMAS_URL =
        "https://drive.google.com/file/d/16wq9zk_kPDmea1O83lBgBRN1R4EVqurj/view?usp=drive_link";

    function crearGaleria({ carpeta, prefijo, extension, desde = 1, hasta = 0, excluir = [], relleno = 0 }) {
        const omitidos = new Set(excluir);
        const carpetaLimpia = carpeta.replace(/\/$/, "");
        const imagenes = [];

        for (let numero = desde; numero <= hasta; numero += 1) {
            if (!omitidos.has(numero)) {
                const numeroArchivo = relleno > 0 ? String(numero).padStart(relleno, "0") : numero;
                imagenes.push(encodeURI(`${carpetaLimpia}/${prefijo}${numeroArchivo}.${extension}`));
            }
        }

        return imagenes;
    }

    const eventos = [
        {
            id: "miercoles-16-09-2026",
            titulo: "Privada Miércoles Tarde",
            tituloListado: "Privada Miércoles Tarde 16-09-2026",
            tituloCalendario: "Privada Miércoles Tarde 16-09-2026",
            fecha: "2026-09-16",
            fechaTexto: "16 de Septiembre de 2026",
            fechaCorta: "16/09/2026",
            subtitulo: "Evento oficial de Mosco Events",
            resumen: "Laser Counter - Pedrola.",
            ubicacion: "Laser Counter (Pedrola)",
            participantes: 26,
            horario: "16:30 - 21:00",
            importe: 15,
            contrasena: "16sep26",
            inscripcionUrl: "/registro.html?id=miercoles-16-09-2026",
            normasUrl: INFO_NORMAS_URL,
            seccion: "proximos",
            galeria: {
                activa: true,
                titulo: "GALERÍA",
                descripcion: "Fotografías de Mosco Events en la PARTIDA del 16-09-2026",
                botonListado: "FOTOS EVENTO 16-09-2026 →",
                mensajeVacio: "aún no hay fotos",
                imagenes: crearGaleria({
                    carpeta: "/images/16-09-2026",
                    prefijo: "16092026 ",
                    extension: "jpeg"
                })
            }
        },
        {
            id: "jueves-17-09-2026",
            titulo: "Jueves 17 de Septiembre",
            tituloListado: "Jueves Tarde 17-09-2026",
            tituloCalendario: "Partida 17-09-2026",
            fecha: "2026-09-17",
            fechaTexto: "17 de Septiembre de 2026",
            fechaCorta: "17/09/2026",
            subtitulo: "Evento oficial de Mosco Events",
            resumen: "Laser Counter - Pedrola.",
            ubicacion: "Laser Counter (Pedrola)",
            participantes: 26,
            horario: "16:30 - 21:00",
            importe: 15,
            inscripcionUrl: "/registro.html?id=jueves-17-09-2026",
            normasUrl: INFO_NORMAS_URL,
            seccion: "proximos",
            galeria: {
                activa: true,
                titulo: "GALERÍA",
                descripcion: "Fotografías de Mosco Events en la PARTIDA del 17-09-2026",
                botonListado: "FOTOS EVENTO 17-09-2026 →",
                mensajeVacio: "aún no hay fotos",
                imagenes: crearGaleria({
                    carpeta: "/images/17-09-2026",
                    prefijo: "17092026 ",
                    extension: "jpeg"
                })
            }
        },
        {
            id: "jueves-10-09-2026",
            titulo: "Jueves 10 de Septiembre",
            tituloListado: "Jueves Tarde 10-09-2026",
            tituloCalendario: "Partida 10-09-2026",
            fecha: "2026-09-10",
            fechaTexto: "10 de Septiembre de 2026",
            fechaCorta: "10/09/2026",
            subtitulo: "Evento oficial de Mosco Events",
            resumen: "Laser Counter - Pedrola.",
            ubicacion: "Laser Counter (Pedrola)",
            participantes: 26,
            horario: "16:30 - 21:00",
            importe: 15,
            inscripcionUrl: "/registro.html?id=jueves-10-09-2026",
            normasUrl: INFO_NORMAS_URL,
            seccion: "proximos",
            galeria: {
                activa: true,
                titulo: "GALERÍA",
                descripcion: "Fotografías de Mosco Events en la PARTIDA del 10-09-2026",
                botonListado: "FOTOS EVENTO 10-09-2026 →",
                mensajeVacio: "aún no hay fotos",
                imagenes: crearGaleria({
                    carpeta: "/images/10-09-2026",
                    prefijo: "10092026 ",
                    extension: "jpeg"
                })
            }
        },
        {
            id: "sabado-29-08-2026",
            titulo: "S\u00e1bado 29 de agosto de 2026",
            tituloListado: "S\u00e1bado 29-08-2026",
            tituloCalendario: "Partida 29-08-2026",
            fecha: "2026-08-29",
            fechaTexto: "29 de agosto de 2026",
            fechaCorta: "29/08/2026",
            subtitulo: "Evento oficial de Mosco Events",
            resumen: "Laser Counter - Pedrola.",
            ubicacion: "Laser Counter - Pedrola",
            participantes: 26,
            horario: "09:00 a 14:30",
            importe: 18,
            normasUrl: INFO_NORMAS_URL,
            seccion: "anteriores",
            galeria: {
                activa: true,
                titulo: "GALER\u00cdA",
                descripcion: "Fotograf\u00edas de Mosco Events en la PARTIDA del 29-08-2026",
                botonListado: "FOTOS EVENTO 29-08-2026 \u2192",
                mensajeVacio: "a\u00fan no hay fotos",
                imagenes: crearGaleria({
                    carpeta: "/images/29-08-2026",
                    prefijo: "2026-08-29_",
                    extension: "jpeg",
                    hasta: 31,
                    relleno: 3
                })
            }
        },
        {
            id: "operacion-verano-2026",
            titulo: "Operaci\u00f3n Verano",
            tituloListado: "Operaci\u00f3n Verano",
            tituloCalendario: "\ud83d\udd25 Operaci\u00f3n Verano",
            fecha: "2026-08-09",
            fechaTexto: "9 de Agosto de 2026",
            fechaCorta: "09/08/2026",
            subtitulo: "Evento oficial de Mosco Events",
            resumen: "Laser Counter - Pedrola.",
            ubicacion: "Laser Counter (Pedrola)",
            participantes: 26,
            duracion: "6 horas",
            premios: "Sorteos y recompensas especiales",
            importe: 25,
            inscripcionUrl: "/registro.html?id=operacion-verano-2026",
            normasUrl: INFO_NORMAS_URL,
            seccion: "anteriores",
            galeria: {
                activa: true,
                titulo: "GALER\u00cdA VERANO",
                descripcion: "Fotograf\u00edas del evento del verano de Mosco Events",
                botonListado: "FOTOS EVENTO ESPECIAL VERANO \u2192",
                imagenes: crearGaleria({
                    carpeta: "/images/optimized/evento-verano",
                    prefijo: "evento-verano-",
                    extension: "webp",
                    hasta: 113
                })
            }
        },
        {
            id: "domingo-02-08-2026",
            titulo: "Domingo 2 de Agosto",
            tituloListado: "Domingo 02-08-2026",
            tituloCalendario: "Partida 02-08-2026",
            fecha: "2026-08-02",
            fechaTexto: "2 de Agosto de 2026",
            fechaCorta: "02/08/2026",
            subtitulo: "Evento oficial de Mosco Events",
            resumen: "Laser Counter - Pedrola.",
            ubicacion: "Laser Counter (Pedrola)",
            participantes: 26,
            horario: "10:00 - 15:00",
            importe: 18,
            inscripcionUrl: "/registro.html?id=domingo-02-08-2026",
            normasUrl: INFO_NORMAS_URL,
            seccion: "anteriores",
            galeria: {
                activa: true,
                titulo: "GALER\u00cdA",
                descripcion: "Fotograf\u00edas de Mosco Events en la PARTIDA del 02-08-2026",
                botonListado: "FOTOS EVENTO 02-08-2026 \u2192",
                imagenes: crearGaleria({
                    carpeta: "/images/02-08-2026",
                    prefijo: "02082026 ",
                    extension: "jpeg",
                    hasta: 38,
                    excluir: [34]
                })
            }
        },
        {
            id: "jueves-30-07-2026",
            titulo: "Jueves 30 de Julio",
            tituloListado: "Jueves Tarde 30-07-2026",
            tituloCalendario: "Partida 30-07-2026",
            fecha: "2026-07-30",
            fechaTexto: "30 de Julio de 2026",
            fechaCorta: "30/07/2026",
            subtitulo: "Evento oficial de Mosco Events",
            resumen: "Laser Counter - Pedrola.",
            ubicacion: "Laser Counter (Pedrola)",
            participantes: 20,
            horario: "18:00 - 21:30",
            importe: 15,
            inscripcionUrl: "/registro.html?id=jueves-30-07-2026",
            normasUrl: INFO_NORMAS_URL,
            seccion: "anteriores",
            galeria: {
                activa: true,
                titulo: "GALER\u00cdA",
                descripcion: "Fotograf\u00edas de Mosco Events en la PARTIDA del 30-07-2026",
                botonListado: "FOTOS EVENTO 30-07-2026 \u2192",
                imagenes: crearGaleria({
                    carpeta: "/images/30-07-2026",
                    prefijo: "30072026 ",
                    extension: "jpeg",
                    hasta: 26
                })
            }
        },
        {
            id: "jueves-23-07-2026",
            titulo: "Jueves 23 de Julio",
            tituloListado: "Jueves Tarde 23-07-2026",
            tituloCalendario: "Partida 23-07-2026",
            fecha: "2026-07-23",
            fechaTexto: "23 de Julio de 2026",
            fechaCorta: "23/07/2026",
            subtitulo: "Evento oficial de Mosco Events",
            resumen: "Laser Counter - Pedrola.",
            ubicacion: "Laser Counter (Pedrola)",
            participantes: 20,
            duracion: "3 horas",
            importe: 13,
            inscripcionUrl: "/registro.html?id=jueves-23-07-2026",
            normasUrl: INFO_NORMAS_URL,
            seccion: "anteriores",
            galeria: {
                activa: true,
                titulo: "GALER\u00cdA",
                descripcion: "Fotograf\u00edas de Mosco Events en la PARTIDA del 23-07-2026",
                botonListado: "FOTOS EVENTO 23-07-2026 \u2192",
                imagenes: crearGaleria({
                    carpeta: "/images/23-07-2026",
                    prefijo: "23072026 ",
                    extension: "jpeg",
                    hasta: 41,
                    excluir: [36]
                })
            }
        },
        {
            id: "jueves-16-07-2026",
            titulo: "Jueves 16 de Julio",
            tituloListado: "Jueves Tarde 16-07-2026",
            tituloCalendario: "Partida 16-07-2026",
            fecha: "2026-07-16",
            fechaTexto: "16 de Julio de 2026",
            fechaCorta: "16/07/2026",
            subtitulo: "Evento oficial de Mosco Events",
            resumen: "Laser Counter - Pedrola.",
            ubicacion: "Laser Counter (Pedrola)",
            participantes: 20,
            duracion: "3 horas",
            importe: 13,
            inscripcionUrl: "/registro.html?id=jueves-16-07-2026",
            normasUrl: INFO_NORMAS_URL,
            seccion: "anteriores",
            galeria: {
                activa: true,
                titulo: "GALER\u00cdA",
                descripcion: "Fotograf\u00edas de Mosco Events en la PARTIDA del 16-07-2026",
                botonListado: "FOTOS EVENTO 16-07-2026 \u2192",
                imagenes: crearGaleria({
                    carpeta: "/images/16-07-2026",
                    prefijo: "160726 ",
                    extension: "jpg",
                    hasta: 57
                })
            }
        },
        {
            id: "jueves-09-07-2026",
            titulo: "Jueves 9 de Julio",
            tituloListado: "Jueves Tarde 09-07-2026",
            tituloCalendario: "Partida 09-07-2026",
            fecha: "2026-07-09",
            fechaTexto: "9 de Julio de 2026",
            fechaCorta: "09/07/2026",
            subtitulo: "Evento oficial de Mosco Events",
            resumen: "Laser Counter - Pedrola.",
            ubicacion: "Laser Counter (Pedrola)",
            participantes: 20,
            duracion: "3 horas",
            importe: 12,
            inscripcionUrl: "/registro.html?id=jueves-09-07-2026",
            normasUrl: INFO_NORMAS_URL,
            seccion: "anteriores",
            galeria: {
                activa: true,
                titulo: "GALER\u00cdA",
                descripcion: "Fotograf\u00edas de Mosco Events en la PARTIDA del 09-07-2026",
                botonListado: "FOTOS EVENTO 09-07-2026 \u2192",
                imagenes: crearGaleria({
                    carpeta: "/images/09-07-2026",
                    prefijo: "2026-07-09 ",
                    extension: "jpg",
                    hasta: 56
                })
            }
        },
        {
            id: "partida-23-05-2026",
            titulo: "23-05-2026",
            tituloListado: "23-05-2026",
            tituloCalendario: "Partida 23-05-2026",
            fecha: "2026-05-23",
            fechaTexto: "23 de Mayo de 2026",
            fechaCorta: "23/05/2026",
            subtitulo: "Evento oficial de Mosco Events",
            resumen: "Laser Counter - Pedrola.",
            ubicacion: "Laser Counter (Pedrola)",
            seccion: "anteriores",
            galeria: {
                activa: true,
                titulo: "GALER\u00cdA",
                descripcion: "Fotograf\u00edas de Mosco Events en la PARTIDA del 23-05-2026",
                botonListado: "FOTOS EVENTO 23-05-2026 \u2192",
                imagenes: crearGaleria({
                    carpeta: "/images/evento",
                    prefijo: "evento",
                    extension: "jpeg",
                    hasta: 58
                })
            }
        },
        {
            id: "tcsim-16-04-2026",
            titulo: "TCSIM 16-04-2026",
            tituloListado: "TCSIM 16-04-2026",
            tituloCalendario: "TCSIM 16-04-2026",
            fecha: "2026-04-16",
            fechaTexto: "16 de Abril de 2026",
            fechaCorta: "16/04/2026",
            subtitulo: "Evento oficial de Mosco Events",
            resumen: "Laser Counter - Pedrola.",
            ubicacion: "Laser Counter (Pedrola)",
            seccion: "anteriores",
            galeria: {
                activa: true,
                titulo: "GALER\u00cdA",
                descripcion: "Fotograf\u00edas de Mosco Events en la TCSIM del 16-04-2026",
                botonListado: "FOTOS TCSIM 16-04-2026 \u2192",
                imagenes: crearGaleria({
                    carpeta: "/images/TCSIM",
                    prefijo: "TCSIM ",
                    extension: "jpeg",
                    hasta: 72
                })
            }
        }
    ];

    // Paginas dedicadas ya publicadas. Se mantienen para no romper enlaces
    // antiguos; su contenido lo genera eventos-dinamicos.js a partir de aqui.
    const PAGINAS_EVENTO = {
        "sabado-29-08-2026": "/Eventos%20anteriores/sabado29082026.html",
        "operacion-verano-2026": "/Eventos%20anteriores/operaci%C3%B3n-verano.html",
        "domingo-02-08-2026": "/Eventos%20anteriores/domingo02082026.html",
        "jueves-30-07-2026": "/Eventos%20anteriores/jueves30072026.html",
        "jueves-23-07-2026": "/Eventos%20anteriores/jueves23072026.html",
        "jueves-16-07-2026": "/Eventos%20anteriores/jueves16.html",
        "jueves-09-07-2026": "/Eventos%20anteriores/jueves9.html"
    };

    const PAGINAS_GALERIA = {
        "sabado-29-08-2026": "/Galeria/galeria-sabado29082026.html",
        "operacion-verano-2026": "/Galeria/galeria-verano.html",
        "domingo-02-08-2026": "/Galeria/galeria-domingo02082026.html",
        "jueves-30-07-2026": "/Galeria/galeria-jueves30072026.html",
        "jueves-23-07-2026": "/Galeria/galeria-jueves23072026.html",
        "jueves-16-07-2026": "/Galeria/galeria-jueves16072026.html",
        "jueves-09-07-2026": "/Galeria/galeria-jueves09072026.html",
        "partida-23-05-2026": "/Galeria/23-05-2026.html",
        "tcsim-16-04-2026": "/Galeria/TCSIM-16-04-2026.html"
    };

    const PAYPAL_HANDLE = "martinlopezmoscoso";

    function formatearImporte(importe) {
        return new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: Number.isInteger(importe) ? 0 : 2,
            maximumFractionDigits: 2
        }).format(importe);
    }

    function enlacePaypal(importe) {
        const cantidad = Number(importe).toFixed(2).replace(/\.00$/, "");

        return `https://paypal.me/${PAYPAL_HANDLE}/${cantidad}EUR`;
    }

    eventos.forEach((evento) => {
        // El importe numerico es la unica fuente de verdad del precio:
        // el texto y el enlace de PayPal se derivan de el.
        if (typeof evento.importe === "number") {
            evento.precio = evento.precio || `${formatearImporte(evento.importe)} por PayPal`;
            evento.pagoUrl = evento.pagoUrl || enlacePaypal(evento.importe);
        }

        // Aforo de la partida: lo usa el registro para comprobar plazas.
        evento.plazas = evento.plazas
            || (typeof evento.participantes === "number" ? evento.participantes : null);

        evento.url = evento.url
            || PAGINAS_EVENTO[evento.id]
            || `/evento.html?id=${encodeURIComponent(evento.id)}`;

        if (evento.galeria?.activa) {
            evento.galeria.url = evento.galeria.url
                || PAGINAS_GALERIA[evento.id]
                || `/galeria-evento.html?id=${encodeURIComponent(evento.id)}`;
        }
    });

    window.MOSCO_EVENTOS = eventos;
    window.MOSCO_PAYPAL_HANDLE = PAYPAL_HANDLE;
    window.MOSCO_FORMATEAR_IMPORTE = formatearImporte;
    window.MOSCO_ENLACE_PAYPAL = enlacePaypal;
})();
