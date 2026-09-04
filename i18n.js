(function () {
    const SUPPORTED_LANGS = ["es", "en", "fr", "ca"];
    const DEFAULT_LANG = "es";
    const STORAGE_KEY = "mosco_lang";

    function dict() {
        return window.MOSCO_I18N_DICT || {};
    }

    function detectInitialLanguage() {
        try {
            const saved = window.localStorage.getItem(STORAGE_KEY);
            if (saved && SUPPORTED_LANGS.includes(saved)) {
                return saved;
            }
        } catch (error) {
            // localStorage no disponible (modo privado, etc.): seguimos sin persistencia.
        }

        const navegador = (window.navigator.language || DEFAULT_LANG).slice(0, 2).toLowerCase();

        return SUPPORTED_LANGS.includes(navegador) ? navegador : DEFAULT_LANG;
    }

    let currentLang = detectInitialLanguage();

    const LOCALE_MAP = { es: "es-ES", en: "en-GB", fr: "fr-FR", ca: "ca-ES" };

    function getLocale() {
        return LOCALE_MAP[currentLang] || LOCALE_MAP[DEFAULT_LANG];
    }

    function t(key, vars) {
        const idioma = dict()[currentLang] || {};
        const es = dict()[DEFAULT_LANG] || {};
        let texto = idioma[key] ?? es[key] ?? key;

        if (vars) {
            Object.keys(vars).forEach((nombre) => {
                texto = texto.replace(new RegExp(`\\{\\{${nombre}\\}\\}`, "g"), vars[nombre]);
            });
        }

        return texto;
    }

    function applyStaticTranslations(root) {
        const contenedor = root || document;

        contenedor.querySelectorAll("[data-i18n]").forEach((elemento) => {
            elemento.textContent = t(elemento.getAttribute("data-i18n"));
        });

        contenedor.querySelectorAll("[data-i18n-html]").forEach((elemento) => {
            elemento.innerHTML = t(elemento.getAttribute("data-i18n-html"));
        });

        contenedor.querySelectorAll("[data-i18n-placeholder]").forEach((elemento) => {
            elemento.setAttribute("placeholder", t(elemento.getAttribute("data-i18n-placeholder")));
        });

        contenedor.querySelectorAll("[data-i18n-attr-aria-label]").forEach((elemento) => {
            elemento.setAttribute("aria-label", t(elemento.getAttribute("data-i18n-attr-aria-label")));
        });

        contenedor.querySelectorAll("[data-i18n-attr-title]").forEach((elemento) => {
            elemento.setAttribute("title", t(elemento.getAttribute("data-i18n-attr-title")));
        });

        contenedor.querySelectorAll("[data-i18n-attr-alt]").forEach((elemento) => {
            elemento.setAttribute("alt", t(elemento.getAttribute("data-i18n-attr-alt")));
        });

        const tituloDoc = document.body?.getAttribute("data-i18n-doc-title");
        if (tituloDoc) {
            document.title = t(tituloDoc);
        }
    }

    function updateSwitcherUI() {
        document.querySelectorAll("[data-lang-current]").forEach((elemento) => {
            elemento.textContent = currentLang.toUpperCase();
        });

        document.querySelectorAll("[data-lang]").forEach((enlace) => {
            enlace.classList.toggle("is-active-lang", enlace.dataset.lang === currentLang);
        });
    }

    function setLanguage(lang) {
        if (!SUPPORTED_LANGS.includes(lang)) {
            return;
        }

        currentLang = lang;

        try {
            window.localStorage.setItem(STORAGE_KEY, lang);
        } catch (error) {
            // Sin persistencia disponible: el idioma solo dura la sesion actual.
        }

        document.documentElement.lang = lang;
        applyStaticTranslations();
        updateSwitcherUI();
        window.dispatchEvent(new CustomEvent("mosco:langchange", { detail: { lang } }));
    }

    function bindSwitcher() {
        document.addEventListener("click", (event) => {
            const enlace = event.target.closest?.("[data-lang]");

            if (!enlace) {
                return;
            }

            event.preventDefault();
            setLanguage(enlace.dataset.lang);
        });
    }

    document.documentElement.lang = currentLang;
    bindSwitcher();

    function init() {
        applyStaticTranslations();
        updateSwitcherUI();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    window.MoscoI18n = {
        t,
        setLanguage,
        getLanguage: () => currentLang,
        getLocale,
        applyStaticTranslations
    };
})();
