(function () {
    const form = document.getElementById("registration-form");
    const canvas = document.getElementById("signature-canvas");
    const clearButton = document.getElementById("clear-signature");
    const signatureInput = document.getElementById("signature-data");
    const signatureError = document.querySelector("[data-signature-error]");
    const eventSelect = document.getElementById("registration-event-select");
    const emptyMessage = document.querySelector("[data-registration-empty]");
    const rulesInput = form?.elements.normasLeidas;
    const rulesError = document.querySelector("[data-rules-error]");
    const submitButton = form?.querySelector(".registration-submit");
    const result = document.getElementById("registration-result");
    const submissionConfig = window.MOSCO_INSCRIPCIONES_CONFIG || {};
    const fallbackAction = submissionConfig.fallbackAction || "https://formsubmit.co/moscoeventes@gmail.com";
    const appsScriptUrl = String(submissionConfig.appsScriptUrl || "").trim();
    const mailFields = {
        reference: document.querySelector("[data-mail-reference]"),
        subject: document.querySelector("[data-mail-subject]"),
        replyTo: document.querySelector("[data-mail-reply-to]"),
        copyTo: document.querySelector("[data-mail-copy-to]"),
        next: document.querySelector("[data-mail-next]"),
        event: document.querySelector("[data-mail-event]"),
        date: document.querySelector("[data-mail-date]"),
        location: document.querySelector("[data-mail-location]"),
        time: document.querySelector("[data-mail-time]"),
        price: document.querySelector("[data-mail-price]"),
        rules: document.querySelector("[data-mail-rules]"),
        legalText: document.querySelector("[data-mail-legal-text]")
    };

    if (!form || !canvas || !signatureInput || !eventSelect || !rulesInput || !submitButton || !result) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const eventos = Array.isArray(window.MOSCO_EVENTOS) ? window.MOSCO_EVENTOS : [];
    const selectedEventId = params.get("id");
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let selectedEvent = null;

    function isUpcomingEvent(evento) {
        if (evento.seccion) {
            return evento.seccion === "proximos";
        }

        const eventDate = new Date(`${evento.fecha}T00:00:00`);

        return eventDate >= today;
    }

    const upcomingEvents = eventos
        .filter(isUpcomingEvent)
        .sort((a, b) => a.fecha.localeCompare(b.fecha));

    function submissionAction() {
        return appsScriptUrl || fallbackAction;
    }

    function configureSubmissionTarget() {
        const action = submissionAction();

        if (action) {
            form.action = action;
        }
    }

    function formatEventLabel(evento) {
        return `${evento.tituloListado || evento.titulo} - ${evento.fechaCorta || evento.fechaTexto}`;
    }

    function eventDetails(evento) {
        return {
            id: evento?.id || "",
            titulo: evento?.titulo || "Selecciona una partida",
            fechaTexto: evento?.fechaTexto || "Pendiente de seleccionar",
            ubicacion: evento?.ubicacion || "-",
            horario: evento?.horario || "-",
            precio: evento?.precio || "-"
        };
    }

    function updateEventSummary(evento) {
        const details = eventDetails(evento);
        const fields = [
            ["[data-registration-event-title]", details.titulo],
            ["[data-registration-hero]", details.fechaTexto],
            ["[data-registration-event-date]", details.fechaTexto],
            ["[data-registration-event-location]", details.ubicacion],
            ["[data-registration-event-time]", details.horario],
            ["[data-registration-event-price]", details.precio],
            ["[data-registration-event-id]", details.id],
            ["[data-registration-event-name]", details.titulo]
        ];

        fields.forEach(([selector, value]) => {
            const element = document.querySelector(selector);

            if (!element) {
                return;
            }

            if ("value" in element) {
                element.value = value;
                return;
            }

            element.textContent = value;
        });
    }

    function populateEventSelect() {
        upcomingEvents.forEach((evento) => {
            const option = document.createElement("option");

            option.value = evento.id;
            option.textContent = formatEventLabel(evento);
            eventSelect.appendChild(option);
        });

        if (!upcomingEvents.length) {
            eventSelect.disabled = true;
            emptyMessage.hidden = false;
            updateEventSummary(null);
            return;
        }

        const initialEvent = upcomingEvents.find((evento) => evento.id === selectedEventId) || upcomingEvents[0];

        eventSelect.value = initialEvent.id;
        selectedEvent = initialEvent;
        updateEventSummary(selectedEvent);
    }

    function updateSubmitAvailability() {
        const requiredControls = Array.from(form.querySelectorAll("[required]"))
            .filter((control) => !control.disabled);
        const requiredFieldsReady = requiredControls.every((control) => {
            if (control.type === "radio") {
                return Boolean(form.elements[control.name]?.value);
            }

            if (control.type === "checkbox") {
                return control.checked;
            }

            return control.checkValidity() && String(control.value || "").trim() !== "";
        });
        const canSubmit = Boolean(
            selectedEvent &&
            requiredFieldsReady &&
            hasSignature &&
            signatureInput.value
        );

        submitButton.disabled = !canSubmit;
        submitButton.setAttribute("aria-disabled", String(!canSubmit));
        submitButton.classList.toggle("is-disabled", !canSubmit);

        if (rulesInput.checked && rulesError) {
            rulesError.hidden = true;
        }
    }

    let hasSignature = false;
    let isDrawing = false;
    let lastPoint = null;
    let context = null;

    function prepareCanvas() {
        const rect = canvas.getBoundingClientRect();
        const ratio = window.devicePixelRatio || 1;

        canvas.width = Math.max(1, Math.floor(rect.width * ratio));
        canvas.height = Math.max(1, Math.floor(rect.height * ratio));

        context = canvas.getContext("2d");
        context.scale(ratio, ratio);
        context.lineCap = "round";
        context.lineJoin = "round";
        context.lineWidth = 2.4;
        context.strokeStyle = "#f4efe4";
        context.fillStyle = "#0d100c";
        context.fillRect(0, 0, rect.width, rect.height);
    }

    function pointFromEvent(event) {
        const rect = canvas.getBoundingClientRect();

        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    function startDrawing(event) {
        event.preventDefault();
        isDrawing = true;
        hasSignature = true;
        lastPoint = pointFromEvent(event);
        canvas.setPointerCapture?.(event.pointerId);
        signatureError.hidden = true;
    }

    function draw(event) {
        if (!isDrawing || !context || !lastPoint) {
            return;
        }

        event.preventDefault();

        const nextPoint = pointFromEvent(event);

        context.beginPath();
        context.moveTo(lastPoint.x, lastPoint.y);
        context.lineTo(nextPoint.x, nextPoint.y);
        context.stroke();

        lastPoint = nextPoint;
        signatureInput.value = canvas.toDataURL("image/png");
    }

    function stopDrawing(event) {
        if (!isDrawing) {
            return;
        }

        isDrawing = false;
        lastPoint = null;
        canvas.releasePointerCapture?.(event.pointerId);
        signatureInput.value = canvas.toDataURL("image/png");
        updateSubmitAvailability();
    }

    function clearSignature() {
        hasSignature = false;
        signatureInput.value = "";
        prepareCanvas();
        updateSubmitAvailability();
    }

    function createRow(label, value) {
        const row = document.createElement("div");
        const term = document.createElement("dt");
        const definition = document.createElement("dd");

        term.textContent = label;
        definition.textContent = value || "-";
        row.append(term, definition);

        return row;
    }

    function storeRegistration(record) {
        const key = "moscoEventsRegistrations";

        try {
            const saved = JSON.parse(window.localStorage.getItem(key) || "[]");

            saved.push(record);
            window.localStorage.setItem(key, JSON.stringify(saved));
        } catch (error) {
            // El envio por correo sigue funcionando aunque el navegador bloquee el guardado local.
        }
    }

    function setMailValue(field, value) {
        if (field) {
            field.value = value || "";
        }
    }

    function prepareMailFields(record) {
        const legalText =
            "Acepta normas, condiciones de participacion, aviso legal y politica de privacidad de Mosco Events.";

        setMailValue(mailFields.reference, record.referencia);
        setMailValue(mailFields.subject, `Nueva inscripcion Mosco Events - ${record.evento.titulo}`);
        setMailValue(mailFields.replyTo, record.participante.correo);
        setMailValue(mailFields.copyTo, record.participante.correo);
        setMailValue(mailFields.next, `${window.location.origin}${window.location.pathname}?enviado=1`);
        setMailValue(mailFields.event, record.evento.titulo);
        setMailValue(mailFields.date, record.evento.fecha);
        setMailValue(mailFields.location, record.evento.ubicacion);
        setMailValue(mailFields.time, record.evento.horario);
        setMailValue(mailFields.price, record.evento.precio);
        setMailValue(mailFields.rules, record.normasLeidas);
        setMailValue(mailFields.legalText, legalText);
    }

    function showSentNotice() {
        if (params.get("enviado") !== "1") {
            return;
        }

        const title = document.createElement("h2");
        const message = document.createElement("p");

        title.textContent = "Inscripcion enviada";
        message.textContent =
            "Hemos recibido la inscripcion. Se ha enviado una copia al correo electronico indicado.";
        result.replaceChildren(title, message);
        result.hidden = false;
    }

    function downloadRegistration(record) {
        const blob = new Blob([JSON.stringify(record, null, 2)], {
            type: "application/json"
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `${record.referencia}.json`;
        link.click();

        URL.revokeObjectURL(url);
    }

    function renderResult(record) {
        const title = document.createElement("h2");
        const intro = document.createElement("p");
        const data = document.createElement("dl");
        const signature = document.createElement("img");
        const download = document.createElement("button");

        title.textContent = "Inscripcion registrada";
        intro.textContent = `Referencia: ${record.referencia}`;
        data.className = "registration-receipt";
        signature.className = "signature-preview";
        signature.alt = "Firma del participante";
        signature.src = record.firmaLegal;

        [
            ["Evento", record.evento.titulo],
            ["Fecha", record.evento.fecha],
            ["Ubicacion", record.evento.ubicacion],
            ["Nombre", record.participante.nombre],
            ["Equipo", record.participante.equipo],
            ["Equipamiento", record.participante.equipamiento],
            ["Telefono", record.participante.telefono],
            ["Correo electronico", record.participante.correo],
            ["Consentimiento imagenes", record.consentimientoImagenes],
            ["Normas leidas", record.normasLeidas],
            ["Fecha de firma", record.fechaFirma]
        ].forEach(([label, value]) => data.appendChild(createRow(label, value)));

        download.className = "btn registration-secondary";
        download.type = "button";
        download.textContent = "DESCARGAR FICHA";
        download.addEventListener("click", () => downloadRegistration(record));

        result.replaceChildren(title, intro, data, signature, download);
        result.hidden = false;
        result.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    canvas.addEventListener("pointerdown", startDrawing);
    canvas.addEventListener("pointermove", draw);
    canvas.addEventListener("pointerup", stopDrawing);
    canvas.addEventListener("pointercancel", stopDrawing);
    clearButton?.addEventListener("click", clearSignature);
    form.addEventListener("input", updateSubmitAvailability);
    form.addEventListener("change", updateSubmitAvailability);
    eventSelect.addEventListener("change", () => {
        selectedEvent = upcomingEvents.find((evento) => evento.id === eventSelect.value) || null;
        updateEventSummary(selectedEvent);
        result.hidden = true;
        updateSubmitAvailability();
    });

    populateEventSelect();
    updateSubmitAvailability();
    showSentNotice();
    prepareCanvas();

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!rulesInput.checked) {
            if (rulesError) {
                rulesError.hidden = false;
            }

            rulesInput.focus();
            form.reportValidity();
            updateSubmitAvailability();
            return;
        }

        if (!hasSignature || !signatureInput.value) {
            signatureError.hidden = false;
        }

        if (!selectedEvent || !form.checkValidity() || !hasSignature || !signatureInput.value) {
            form.reportValidity();
            return;
        }

        const formData = new FormData(form);
        const now = new Date();
        const record = {
            referencia: `MOSCO-${now.getTime().toString(36).toUpperCase()}`,
            fechaFirma: now.toLocaleString("es-ES"),
            evento: {
                id: selectedEvent.id,
                titulo: selectedEvent.titulo,
                fecha: selectedEvent.fechaTexto,
                ubicacion: selectedEvent.ubicacion,
                horario: selectedEvent.horario,
                precio: selectedEvent.precio
            },
            participante: {
                nombre: formData.get("nombre"),
                equipo: formData.get("equipo"),
                equipamiento: formData.get("equipamiento"),
                telefono: formData.get("telefono"),
                correo: formData.get("email")
            },
            consentimientoImagenes: formData.get("consentimientoImagenes"),
            normasLeidas: formData.get("normasLeidas"),
            textoLegalFirmado:
                "Acepta normas, condiciones de participacion, aviso legal y politica de privacidad de Mosco Events.",
            firmaLegal: signatureInput.value
        };

        storeRegistration(record);
        prepareMailFields(record);
        configureSubmissionTarget();
        HTMLFormElement.prototype.submit.call(form);
    });

    configureSubmissionTarget();
})();
