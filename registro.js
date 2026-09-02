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
    const submitButton = form?.querySelector('button[type="submit"][data-registration-participant]');
    const result = document.getElementById("registration-result");
    const participantControls = document.querySelectorAll("[data-registration-participant]");
    const waitlist = document.getElementById("registration-waitlist");
    const reservationForm = document.getElementById("reservation-form");
    const reservationSubmit = document.getElementById("reservation-submit");
    const reservationName = reservationForm?.querySelector("[name='nombreReserva']");
    const reservationPhone = reservationForm?.querySelector("[name='telefonoReserva']");
    const reservationControls = reservationForm?.querySelectorAll("input, button");
    const reservationEventId = document.querySelector("[data-reservation-event-id]");
    const reservationEventName = document.querySelector("[data-reservation-event-name]");
    const reservationDate = document.querySelector("[data-reservation-date]");
    const paymentButton = document.getElementById("paypal-payment-button");
    const paymentButtonLabel = paymentButton?.querySelector("[data-paypal-button-label]");
    const paymentMethodInputs = Array.from(form?.querySelectorAll("[name='Metodo de pago']") || []);
    const paypalPaymentInput = form?.querySelector("[name='Metodo de pago'][value='PayPal']");
    const paymentMethodError = document.querySelector("[data-payment-method-error]");
    const paymentConfirmInput = document.getElementById("payment-confirmed");
    const paymentConfirmAmount = document.querySelector("[data-payment-confirm-amount]");
    const paymentConfirmHelp = document.querySelector("[data-payment-confirm-help]");
    const submissionConfig = window.MOSCO_INSCRIPCIONES_CONFIG || {};
    const fallbackAction = submissionConfig.fallbackAction || "https://formsubmit.co/moscoeventes@gmail.com";
    const appsScriptUrl = String(submissionConfig.appsScriptUrl || "").trim();
    const referenceStorageKey = "moscoEventsRegistrationReference";
    // Solo tiene que sobrevivir al salto al backend y la vuelta con ?enviado=1.
    const referenceLifetime = 2 * 60 * 60 * 1000;
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
        amount: document.querySelector("[data-mail-amount]"),
        paymentBreakdown: document.querySelector("[data-mail-payment-breakdown]"),
        paymentStatus: document.querySelector("[data-mail-payment-status]"),
        paymentTarget: document.querySelector("[data-mail-payment-target]"),
        paymentLink: document.querySelector("[data-mail-payment-link]"),
        capacity: document.querySelector("[data-mail-capacity]"),
        rules: document.querySelector("[data-mail-rules]"),
        legalText: document.querySelector("[data-mail-legal-text]")
    };

    if (
        !form ||
        !canvas ||
        !signatureInput ||
        !eventSelect ||
        !rulesInput ||
        !submitButton ||
        !result ||
        !waitlist ||
        !reservationForm ||
        !reservationSubmit ||
        !reservationName ||
        !reservationPhone ||
        !reservationControls ||
        !reservationEventId ||
        !reservationEventName ||
        !reservationDate ||
        !paymentButton ||
        !paymentButtonLabel ||
        paymentMethodInputs.length !== 1 ||
        !paypalPaymentInput ||
        !paymentMethodError ||
        !paymentConfirmInput ||
        !paymentConfirmHelp
    ) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const eventos = Array.isArray(window.MOSCO_EVENTOS) ? window.MOSCO_EVENTOS : [];
    const selectedEventId = params.get("id");
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let selectedEvent = null;
    let isSubmitting = false;
    let isSubmittingReservation = false;
    let selectedEventFull = false;
    let capacityChecking = false;
    let capacityRequestId = 0;
    let silentCapacityChecking = false;
    // URL de PayPal que el participante realmente abrio. Si el importe
    // cambia despues (otro evento, alquiler...) deja de coincidir y hay
    // que pulsar "PAGAR CON PAYPAL" otra vez antes de poder confirmar.
    let paypalOpenedForUrl = "";
    const paypalHandle = window.MOSCO_PAYPAL_HANDLE || "martinlopezmoscoso";
    // Suplemento por alquilar equipo. Se suma al precio de la partida.
    const RENTAL_SURCHARGE = 20;

    function formatPaymentAmount(amount) {
        return new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    function rentalSurcharge() {
        return String(form.elements.equipamiento?.value || "").startsWith("Alquiler")
            ? RENTAL_SURCHARGE
            : 0;
    }

    // El importe sale SIEMPRE del evento seleccionado, nunca de una constante fija.
    function paymentAmount() {
        if (typeof selectedEvent?.importe !== "number") {
            return 0;
        }

        return selectedEvent.importe + rentalSurcharge();
    }

    function paypalPaymentUrl() {
        const amount = paymentAmount();

        if (!amount) {
            return "";
        }

        return `https://paypal.me/${paypalHandle}/${amount.toFixed(2).replace(/\.00$/, "")}EUR`;
    }

    function selectedPaymentMethod() {
        return String(form.elements["Metodo de pago"]?.value || "");
    }

    function paymentDetails(method = selectedPaymentMethod()) {
        const value = paymentAmount();
        const amount = value ? formatPaymentAmount(value) : "";
        const surcharge = rentalSurcharge();
        const breakdown = surcharge && selectedEvent
            ? `${formatPaymentAmount(selectedEvent.importe)} partida + ${formatPaymentAmount(surcharge)} alquiler`
            : "";

        if (method === "PayPal" && value) {
            return {
                metodo: method,
                importe: amount,
                desglose: breakdown,
                estado: isPaymentConfirmed()
                    ? "Confirmado por el participante (pendiente de verificación manual en PayPal)"
                    : "Pendiente de confirmar el pago en PayPal",
                destino: `@${paypalHandle}`,
                enlace: paypalPaymentUrl(),
                confirmado: isPaymentConfirmed() ? "Si" : "No"
            };
        }

        return {
            metodo: method === "PayPal" ? method : "",
            importe: amount,
            desglose: breakdown,
            estado: value
                ? "Pendiente de seleccionar método de pago"
                : "Pendiente de seleccionar partida",
            destino: "",
            enlace: "",
            confirmado: "No"
        };
    }

    function syncPaymentMethod() {
        const details = paymentDetails();

        document.querySelectorAll("[data-payment-option]").forEach((option) => {
            option.classList.toggle("is-selected", option.dataset.paymentOption === details.metodo);
        });

        if (details.metodo) {
            paymentMethodError.hidden = true;
        }
    }

    function syncPaypalPayment() {
        const hasEvent = Boolean(selectedEvent);
        const isReady = hasEvent && !capacityChecking && !selectedEventFull;

        paymentButton.classList.toggle("is-disabled", !isReady);
        paymentButton.setAttribute("aria-disabled", String(!isReady));

        if (!hasEvent) {
            paymentButton.removeAttribute("href");
            paymentButtonLabel.textContent = "SELECCIONA UNA PARTIDA";
        } else if (selectedEventFull) {
            paymentButton.removeAttribute("href");
            paymentButtonLabel.textContent = "PARTIDA LLENA";
        } else if (capacityChecking) {
            paymentButton.removeAttribute("href");
            paymentButtonLabel.textContent = "COMPROBANDO DISPONIBILIDAD...";
        } else {
            const paymentUrl = paypalPaymentUrl();
            const amount = paymentAmount();

            if (paymentUrl) {
                paymentButton.href = paymentUrl;
                paymentButtonLabel.textContent = `PAGAR ${formatPaymentAmount(amount)} CON PAYPAL`;
            } else {
                paymentButton.removeAttribute("href");
                paymentButtonLabel.textContent = "PRECIO POR CONFIRMAR";
            }
        }

        syncPaymentConfirmation();
        syncPaymentFields();
    }

    // La casilla de confirmacion solo se desbloquea si el enlace que se
    // acaba de pulsar es exactamente el que hay calculado ahora mismo. Si
    // cambia el evento, el alquiler o el aforo, hay que pulsar "PAGAR CON
    // PAYPAL" otra vez antes de poder confirmar el pago.
    function syncPaymentConfirmation() {
        const currentUrl = paymentButton.getAttribute("href") || "";
        const isUnlocked = Boolean(currentUrl) && currentUrl === paypalOpenedForUrl;

        paymentConfirmInput.disabled = !isUnlocked;

        if (!isUnlocked) {
            paymentConfirmInput.checked = false;
        }

        paymentConfirmHelp.hidden = isUnlocked;

        if (paymentConfirmAmount) {
            const amount = paymentAmount();
            paymentConfirmAmount.textContent = amount ? formatPaymentAmount(amount) : "-";
        }
    }

    function isPaymentConfirmed() {
        return !paymentConfirmInput.disabled && paymentConfirmInput.checked;
    }

    // Vuelca el pago calculado en los campos ocultos que viajan al backend.
    function syncPaymentFields() {
        const details = paymentDetails();

        setMailValue(mailFields.amount, details.importe);
        setMailValue(mailFields.paymentBreakdown, details.desglose);
        setMailValue(mailFields.paymentStatus, details.estado);
        setMailValue(mailFields.paymentTarget, details.destino);
        setMailValue(mailFields.paymentLink, details.enlace);
        setMailValue(mailFields.capacity, selectedEvent?.plazas);
    }

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

    function submitWithPageNavigation(action, formData) {
        const relay = document.createElement("form");

        relay.action = action;
        relay.method = "POST";
        relay.hidden = true;

        formData.forEach((value, name) => {
            if (typeof value !== "string") {
                return;
            }

            const input = document.createElement("input");

            input.type = "hidden";
            input.name = name;
            input.value = value;
            relay.appendChild(input);
        });

        document.body.appendChild(relay);
        HTMLFormElement.prototype.submit.call(relay);
    }

    function checkEventCapacity(evento) {
        if (!evento || !appsScriptUrl) {
            return Promise.resolve(null);
        }

        return new Promise((resolve) => {
            const callbackName = `moscoCapacity${Date.now()}${Math.random().toString(36).slice(2)}`;
            const script = document.createElement("script");
            const timeout = window.setTimeout(() => finish(null), 8000);
            let completed = false;

            function finish(status) {
                if (completed) {
                    return;
                }

                completed = true;
                window.clearTimeout(timeout);
                script.remove();

                try {
                    delete window[callbackName];
                } catch (error) {
                    window[callbackName] = undefined;
                }

                resolve(status);
            }

            try {
                const url = new URL(appsScriptUrl, window.location.href);

                url.searchParams.set("action", "status");
                url.searchParams.set("eventId", evento.id);
                url.searchParams.set("eventName", evento.titulo);

                // Aforo real de esta partida (20, 26...), no un tope global.
                if (evento.plazas) {
                    url.searchParams.set("capacity", String(evento.plazas));
                }

                url.searchParams.set("callback", callbackName);
                url.searchParams.set("_", String(Date.now()));

                window[callbackName] = (payload) => {
                    if (!payload || payload.eventId !== evento.id) {
                        finish(null);
                        return;
                    }

                    finish({ full: Boolean(payload.full) });
                };

                script.async = true;
                script.src = url.toString();
                script.onerror = () => finish(null);
                document.head.appendChild(script);
            } catch (error) {
                finish(null);
            }
        });
    }

    function setRegistrationFull(isFull) {
        selectedEventFull = Boolean(isFull && selectedEvent);

        participantControls.forEach((element) => {
            element.hidden = selectedEventFull;

            if ("disabled" in element) {
                element.disabled = selectedEventFull;
            }
        });

        reservationControls.forEach((control) => {
            control.disabled = !selectedEventFull;
        });

        waitlist.hidden = !selectedEventFull;
        reservationEventId.value = selectedEventFull ? selectedEvent.id : "";
        reservationEventName.value = selectedEventFull ? selectedEvent.titulo : "";

        if (!selectedEventFull) {
            reservationName.value = "";
            reservationPhone.value = "";
        }

        updateSubmitAvailability();
    }

    async function refreshEventCapacity(evento) {
        const requestId = ++capacityRequestId;

        setRegistrationFull(false);

        if (!evento) {
            capacityChecking = false;
            updateSubmitAvailability();
            return null;
        }

        capacityChecking = Boolean(appsScriptUrl);
        updateSubmitAvailability();

        const status = await checkEventCapacity(evento);

        if (requestId !== capacityRequestId || selectedEvent?.id !== evento.id) {
            return null;
        }

        capacityChecking = false;
        setRegistrationFull(Boolean(status?.full));

        return status;
    }

    async function refreshSelectedEventCapacitySilently() {
        if (
            silentCapacityChecking ||
            capacityChecking ||
            isSubmitting ||
            isSubmittingReservation ||
            !selectedEvent ||
            document.visibilityState === "hidden"
        ) {
            return;
        }

        const eventAtRequest = selectedEvent;

        silentCapacityChecking = true;

        try {
            const status = await checkEventCapacity(eventAtRequest);

            if (!status || selectedEvent?.id !== eventAtRequest.id) {
                return;
            }

            setRegistrationFull(Boolean(status.full));
        } finally {
            silentCapacityChecking = false;
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
            participantes: evento?.participantes || "-",
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
            ["[data-registration-event-participants]", details.participantes],
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

        syncPaypalPayment();
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

        const initialEvent = upcomingEvents.find((evento) => evento.id === selectedEventId) || null;

        eventSelect.value = initialEvent?.id || "";
        selectedEvent = initialEvent;
        updateEventSummary(initialEvent);
        refreshEventCapacity(initialEvent);
    }

    function updateSubmitAvailability() {
        // La casilla de pago se valida aparte con isPaymentConfirmed(): al
        // estar deshabilitada mientras no se abre PayPal, el bucle generico
        // la saltaria sin exigirla.
        const requiredControls = Array.from(form.querySelectorAll("[required]"))
            .filter((control) => !control.disabled && control !== paymentConfirmInput);
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
            !isSubmitting &&
            !capacityChecking &&
            !selectedEventFull &&
            selectedEvent &&
            requiredFieldsReady &&
            isPaymentConfirmed() &&
            hasSignature &&
            signatureInput.value
        );

        submitButton.disabled = !canSubmit;
        submitButton.setAttribute("aria-disabled", String(!canSubmit));
        submitButton.classList.toggle("is-disabled", !canSubmit);
        submitButton.textContent = isSubmitting
            ? "ENVIANDO..."
            : capacityChecking
                ? "COMPROBANDO DISPONIBILIDAD..."
                : "ENVIAR INSCRIPCIÓN";

        if (rulesInput.checked && rulesError) {
            rulesError.hidden = true;
        }

        syncPaypalPayment();
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

    function clearExpiredReference() {
        try {
            window.localStorage.removeItem("moscoEventsRegistrations");

            const saved = JSON.parse(window.localStorage.getItem(referenceStorageKey) || "null");

            if (!saved?.referencia || Number(saved.expiresAt) <= Date.now()) {
                window.localStorage.removeItem(referenceStorageKey);
                return null;
            }

            return saved;
        } catch (error) {
            try {
                window.localStorage.removeItem(referenceStorageKey);
            } catch (storageError) {
                // No hay almacenamiento local disponible en este navegador.
            }

            return null;
        }
    }

    // Guardamos el registro completo para poder mostrar el comprobante y su
    // descarga cuando el backend nos devuelva a esta pagina con ?enviado=1.
    function storeReference(reference, record) {
        try {
            window.localStorage.setItem(referenceStorageKey, JSON.stringify({
                referencia: reference,
                registro: record || null,
                expiresAt: Date.now() + referenceLifetime
            }));
        } catch (error) {
            // La confirmacion sigue llegando por correo aunque se bloquee el guardado local.
        }
    }

    function forgetReference() {
        try {
            window.localStorage.removeItem(referenceStorageKey);
        } catch (error) {
            // Sin almacenamiento local no hay nada que limpiar.
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
        setMailValue(mailFields.amount, record.pago.importe);
        setMailValue(mailFields.paymentBreakdown, record.pago.desglose);
        setMailValue(mailFields.paymentStatus, record.pago.estado);
        setMailValue(mailFields.paymentTarget, record.pago.destino);
        setMailValue(mailFields.paymentLink, record.pago.enlace);
        setMailValue(mailFields.capacity, record.evento.plazas);
        setMailValue(mailFields.rules, record.normasLeidas);
        setMailValue(mailFields.legalText, legalText);
    }

    function showSentNotice() {
        if (params.get("enviado") !== "1") {
            return;
        }

        const saved = clearExpiredReference();

        // Con el registro guardado mostramos el comprobante completo y su descarga.
        if (saved?.registro) {
            renderResult(saved.registro);
            forgetReference();
            return;
        }

        const title = document.createElement("h2");
        const message = document.createElement("p");

        title.textContent = "Inscripción enviada";
        message.textContent = saved?.referencia
            ? `Hemos recibido la inscripción. Referencia: ${saved.referencia}.`
            : "Hemos recibido la inscripción correctamente.";
        result.replaceChildren(title, message);
        result.hidden = false;
        forgetReference();
    }

    function receiptData(record) {
        return [
            ["Referencia", record.referencia],
            ["Evento", record.evento.titulo],
            ["Fecha", record.evento.fecha],
            ["Ubicación", record.evento.ubicacion],
            ["Horario", record.evento.horario],
            ["Precio", record.evento.precio],
            ["Método de pago", record.pago.metodo],
            ["Importe del pago", record.pago.importe],
            ["Desglose del pago", record.pago.desglose],
            ["Estado del pago", record.pago.estado],
            ["Nombre", record.participante.nombre],
            ["Equipo", record.participante.equipo],
            ["Equipamiento", record.participante.equipamiento],
            ["Teléfono", record.participante.telefono],
            ["Correo electrónico", record.participante.correo],
            ["Consentimiento de imágenes", record.consentimientoImagenes],
            ["Normas leídas", record.normasLeidas],
            ["Fecha de firma", record.fechaFirma]
        ];
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function downloadRegistration(record) {
        const rows = receiptData(record)
            .map(([label, value]) => (
                `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`
            ))
            .join("");
        const signature = String(record.firmaLegal || "").startsWith("data:image/png;base64,")
            ? `<img src="${record.firmaLegal}" alt="Firma del participante">`
            : "";
        const receipt = `<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Comprobante ${escapeHtml(record.referencia)}</title>
    <style>
        body{margin:0;padding:32px;background:#10150f;color:#f4efe4;font:16px Arial,sans-serif}
        main{max-width:760px;margin:auto;padding:28px;border:1px solid #d7c08b;background:#171d16}
        h1{margin-top:0;color:#d7c08b}table{width:100%;border-collapse:collapse}
        th,td{padding:10px;text-align:left;border-bottom:1px solid rgba(215,192,139,.25)}
        th{width:38%;color:#d7c08b}img{display:block;max-width:460px;width:100%;margin-top:24px;border:1px solid #d7c08b}
        p{line-height:1.5}@media print{body{padding:0;background:#fff;color:#111}main{border:0;background:#fff}}
    </style>
</head>
<body>
    <main>
        <h1>Comprobante de inscripción</h1>
        <p>Conserva este documento como justificante de tu registro en Mosco Events.</p>
        <table>${rows}</table>
        ${signature}
    </main>
</body>
</html>`;
        const blob = new Blob([receipt], {
            type: "text/html;charset=utf-8"
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = `comprobante-${record.referencia}.html`;
        link.click();

        URL.revokeObjectURL(url);
    }

    function renderSending(record) {
        const title = document.createElement("h2");
        const message = document.createElement("p");

        title.textContent = "Enviando";
        message.textContent = `Estamos registrando tu inscripción para ${record.evento.titulo}. No cierres esta página.`;
        result.replaceChildren(title, message);
        result.classList.add("is-sending");
        result.hidden = false;
        result.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function renderResult(record) {
        const title = document.createElement("h2");
        const intro = document.createElement("p");
        const data = document.createElement("dl");
        const signature = document.createElement("img");
        const download = document.createElement("button");

        title.textContent = "Inscripción registrada";
        intro.textContent = `Tu registro se ha enviado correctamente. Referencia: ${record.referencia}`;
        data.className = "registration-receipt";
        signature.className = "signature-preview";
        signature.alt = "Firma del participante";
        signature.src = record.firmaLegal;

        receiptData(record).forEach(([label, value]) => data.appendChild(createRow(label, value)));

        download.className = "btn registration-secondary";
        download.type = "button";
        download.textContent = "DESCARGAR COMPROBANTE";
        download.addEventListener("click", () => downloadRegistration(record));

        result.replaceChildren(title, intro, data, signature, download);
        result.classList.remove("is-sending");
        result.hidden = false;
        result.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function showSubmissionDelay(customMessage) {
        if (!isSubmitting) {
            return;
        }

        const title = document.createElement("h2");
        const message = document.createElement("p");

        isSubmitting = false;
        title.textContent = "No se ha podido confirmar el envío";
        message.textContent =
            customMessage ||
            "La respuesta está tardando más de lo esperado. Antes de repetir la inscripción, contacta con Mosco Events para comprobarla.";
        result.replaceChildren(title, message);
        result.classList.remove("is-sending");
        result.hidden = false;
        updateSubmitAvailability();
    }

    function renderReservationResult(record) {
        const title = document.createElement("h2");
        const message = document.createElement("p");
        const details = document.createElement("dl");

        title.textContent = "Reserva registrada";
        message.textContent =
            "Te hemos añadido a la lista de reservas. Te contactaremos si podemos confirmar tu participación.";
        details.className = "registration-receipt";
        details.appendChild(createRow("Evento", record.evento));
        details.appendChild(createRow("Nombre", record.nombre));
        details.appendChild(createRow("Teléfono", record.telefono));
        details.appendChild(createRow("Fecha y hora", record.fechaHora));

        result.replaceChildren(title, message, details);
        result.classList.remove("is-sending");
        result.hidden = false;
        result.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    function renderReservationError(messageText) {
        const title = document.createElement("h2");
        const message = document.createElement("p");

        title.textContent = "No se ha podido guardar la reserva";
        message.textContent = messageText;
        result.replaceChildren(title, message);
        result.classList.remove("is-sending");
        result.hidden = false;
    }

    canvas.addEventListener("pointerdown", startDrawing);
    canvas.addEventListener("pointermove", draw);
    canvas.addEventListener("pointerup", stopDrawing);
    canvas.addEventListener("pointercancel", stopDrawing);
    clearButton?.addEventListener("click", clearSignature);
    paymentMethodInputs.forEach((input) => {
        input.addEventListener("change", syncPaymentMethod);
    });
    paymentButton.addEventListener("click", (event) => {
        if (paymentButton.getAttribute("aria-disabled") === "true") {
            event.preventDefault();
            eventSelect.focus();
            return;
        }

        paypalPaymentInput.checked = true;
        syncPaymentMethod();
        // Marca el enlace que se acaba de abrir para poder desbloquear la
        // casilla de confirmacion con ese mismo importe.
        paypalOpenedForUrl = paymentButton.getAttribute("href") || "";
        syncPaymentConfirmation();
        updateSubmitAvailability();
    });
    paymentConfirmInput.addEventListener("change", () => {
        if (paymentConfirmInput.checked) {
            paymentMethodError.hidden = true;
        }
    });
    form.addEventListener("input", updateSubmitAvailability);
    form.addEventListener("change", updateSubmitAvailability);
    eventSelect.addEventListener("change", async () => {
        selectedEvent = upcomingEvents.find((evento) => evento.id === eventSelect.value) || null;
        updateEventSummary(selectedEvent);
        result.hidden = true;
        await refreshEventCapacity(selectedEvent);
    });

    clearExpiredReference();
    setRegistrationFull(false);
    populateEventSelect();
    syncPaymentMethod();
    updateSubmitAvailability();
    showSentNotice();
    prepareCanvas();

    const capacityRefreshInterval = window.setInterval(
        refreshSelectedEventCapacitySilently,
        15000
    );

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
            refreshSelectedEventCapacitySilently();
        }
    });
    window.addEventListener("focus", refreshSelectedEventCapacitySilently);
    window.addEventListener(
        "pagehide",
        () => window.clearInterval(capacityRefreshInterval),
        { once: true }
    );

    reservationSubmit.addEventListener("click", async () => {
        if (!selectedEvent || !selectedEventFull || isSubmittingReservation) {
            return;
        }

        const invalidControl = [reservationName, reservationPhone]
            .find((control) => !control.checkValidity() || !String(control.value || "").trim());

        if (invalidControl) {
            invalidControl.reportValidity();
            invalidControl.focus();
            return;
        }

        const reservationEvent = selectedEvent;
        const submittedAt = new Date();
        const record = {
            evento: reservationEvent.titulo,
            nombre: String(reservationName.value || "").trim(),
            telefono: String(reservationPhone.value || "").trim(),
            fechaHora: submittedAt.toLocaleString("es-ES")
        };
        const reservationData = new FormData();

        reservationEventId.value = reservationEvent.id;
        reservationEventName.value = reservationEvent.titulo;
        reservationDate.value = submittedAt.toISOString();
        reservationData.set("tipoRegistro", "Reserva");
        reservationData.set("eventoId", reservationEventId.value);
        reservationData.set("eventoTitulo", reservationEventName.value);
        reservationData.set("nombreReserva", record.nombre);
        reservationData.set("telefonoReserva", record.telefono);
        reservationData.set("fechaHoraRegistro", reservationDate.value);
        // Aforo real de esta partida: el backend lo necesita para no rechazar
        // reservas de eventos con menos plazas que el tope global.
        reservationData.set("plazas", String(reservationEvent.plazas || ""));
        isSubmittingReservation = true;
        reservationSubmit.disabled = true;
        reservationSubmit.textContent = "ENVIANDO RESERVA...";
        eventSelect.disabled = true;

        const title = document.createElement("h2");
        const message = document.createElement("p");

        title.textContent = "Enviando reserva";
        message.textContent = "Estamos guardando tus datos en la lista de reservas.";
        result.replaceChildren(title, message);
        result.classList.add("is-sending");
        result.hidden = false;
        result.scrollIntoView({ behavior: "smooth", block: "start" });

        try {
            submitWithPageNavigation(submissionAction(), reservationData);
            return;
        } catch (error) {
            renderReservationError(
                "No se ha podido conectar con el sistema de reservas. Comprueba tu conexión e inténtalo de nuevo."
            );
        } finally {
            isSubmittingReservation = false;
            reservationSubmit.disabled = false;
            reservationSubmit.textContent = "APUNTARME A RESERVAS";
            eventSelect.disabled = !upcomingEvents.length;
        }
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        if (!rulesInput.checked) {
            if (rulesError) {
                rulesError.hidden = false;
            }

            rulesInput.focus();
            form.reportValidity();
            updateSubmitAvailability();
            return;
        }

        if (!selectedPaymentMethod()) {
            paymentMethodError.hidden = false;
            paymentMethodInputs[0].focus();
            form.reportValidity();
            updateSubmitAvailability();
            return;
        }

        // Sin el pago confirmado (casilla desbloqueada solo tras abrir
        // PayPal con el importe vigente) no se puede enviar la inscripcion.
        if (!isPaymentConfirmed()) {
            paymentMethodError.hidden = false;
            paymentButton.scrollIntoView({ behavior: "smooth", block: "center" });
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

        const eventToSubmit = selectedEvent;

        capacityChecking = Boolean(appsScriptUrl);
        updateSubmitAvailability();

        const capacityStatus = await checkEventCapacity(eventToSubmit);

        capacityChecking = false;
        if (selectedEvent?.id !== eventToSubmit.id) {
            await refreshEventCapacity(selectedEvent);
            return;
        }

        if (capacityStatus?.full) {
            setRegistrationFull(true);
            waitlist.scrollIntoView({ behavior: "smooth", block: "start" });
            return;
        }

        updateSubmitAvailability();

        const formData = new FormData(form);
        const paymentMethod = selectedPaymentMethod();
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
                precio: selectedEvent.precio,
                plazas: selectedEvent.plazas
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
            pago: paymentDetails(paymentMethod),
            textoLegalFirmado:
                "Acepta normas, condiciones de participacion, aviso legal y politica de privacidad de Mosco Events.",
            firmaLegal: signatureInput.value
        };

        prepareMailFields(record);
        configureSubmissionTarget();
        isSubmitting = true;
        renderSending(record);
        updateSubmitAvailability();

        try {
            storeReference(record.referencia, record);
            submitWithPageNavigation(form.action, new FormData(form));
            return;
        } catch (error) {
            showSubmissionDelay("No se ha podido conectar con el sistema de inscripciones. Comprueba tu conexión e inténtalo de nuevo.");
        }
    });

    configureSubmissionTarget();
})();
