(function () {
    const INFO_NORMAS_URL =
        "https://drive.google.com/file/d/16wq9zk_kPDmea1O83lBgBRN1R4EVqurj/view?usp=drive_link";

    function crearGaleria({ carpeta, prefijo, extension, desde = 1, hasta = 0, excluir = [] }) {
        const omitidos = new Set(excluir);
        const carpetaLimpia = carpeta.replace(/\/$/, "");
        const imagenes = [];

        for (let numero = desde; numero <= hasta; numero += 1) {
            if (!omitidos.has(numero)) {
                imagenes.push(encodeURI(`${carpetaLimpia}/${prefijo}${numero}.${extension}`));
            }
        }

        return imagenes;
    }

    const eventos = [
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
            plazas: "17 reservas \u00b7 9 plazas libres",
            plazasTotales: 26,
            reservasIniciales: 17,
            contadorInscripciones: true,
            horario: "09:00 a 14:30",
            precio: "18\u20ac en efectivo en el campo o 18\u20ac por PayPal",
            inscripcionUrl: "/registro.html?id=sabado-29-08-2026",
            normasUrl: INFO_NORMAS_URL,
            seccion: "proximos",
            url: "/Proximos%20Eventos/sabado29082026.html",
            galeria: {
                activa: true,
                titulo: "GALER\u00cdA",
                descripcion: "Fotograf\u00edas de Mosco Events en la PARTIDA del 29-08-2026",
                url: "/Galeria/galeria-sabado29082026.html",
                botonListado: "FOTOS EVENTO 29-08-2026 \u2192",
                mensajeVacio: "a\u00fan no hay fotos",
                imagenes: []
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
            plazas: "26 participantes",
            duracion: "6 horas",
            premios: "Sorteos y recompensas especiales",
            precio: "25\u20ac",
            inscripcionUrl: "/registro.html?id=operacion-verano-2026",
            normasUrl: INFO_NORMAS_URL,
            seccion: "anteriores",
            url: "/Eventos%20anteriores/operaci%C3%B3n-verano.html",
            galeria: {
                activa: true,
                titulo: "GALER\u00cdA VERANO",
                descripcion: "Fotograf\u00edas del evento del verano de Mosco Events",
                url: "/Galeria/galeria-verano.html",
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
            plazas: "26 participantes",
            horario: "10:00 - 15:00",
            precio: "18\u20ac en efectivo en el campo",
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
            plazas: "20 participantes",
            horario: "18:00 - 21:30",
            precio: "15\u20ac en efectivo en el campo",
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
            plazas: "20 participantes",
            duracion: "3 horas",
            precio: "13\u20ac en efectivo en el campo",
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
            plazas: "20 participantes",
            duracion: "3 horas",
            precio: "13\u20ac en efectivo en el campo",
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
            plazas: "20 participantes",
            duracion: "3 horas",
            precio: "12\u20ac en efectivo en el campo",
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

    eventos.forEach((evento) => {
        evento.url = evento.url || `/evento.html?id=${encodeURIComponent(evento.id)}`;

        if (evento.galeria?.activa) {
            evento.galeria.url = evento.galeria.url || `/galeria-evento.html?id=${encodeURIComponent(evento.id)}`;
        }
    });

    window.MOSCO_EVENTOS = eventos;
})();
