// Web component registrado en HA como panel lateral ("tucompra-panel").
//
// Su única responsabilidad: incrustar la SPA (servida como estático por la
// integración) en un <iframe> y entregarle, vía postMessage, el token de
// acceso del usuario logueado en HA. Con ese token la SPA llama a
// /api/tucompra/* autenticada como ese usuario — sin login propio.
//
// HA inyecta en este elemento:
//   - la propiedad `hass` (se actualiza al refrescarse el token), y
//   - la propiedad `panel` (con `panel.config.static` = STATIC_PATH).

class TuCompraPanel extends HTMLElement {
  constructor() {
    super();
    this._hass = null;
    this._iframe = null;
    this._static = "/tucompra_static";
  }

  set hass(hass) {
    this._hass = hass;
    // Cada vez que HA nos pasa un hass nuevo (p.ej. token renovado), lo
    // reenviamos al iframe para que la SPA siga autenticada.
    this._postToken();
  }

  set panel(panel) {
    if (panel && panel.config && panel.config.static) {
      this._static = panel.config.static;
    }
  }

  connectedCallback() {
    if (this._iframe) return;

    const iframe = document.createElement("iframe");
    // Anti-caché: el index.html es diminuto y así siempre trae la versión
    // recién instalada (los assets van con hash y sí se cachean).
    iframe.src = `${this._static}/app/index.html?v=${Date.now()}`;
    iframe.title = "Tu Compra";
    iframe.style.cssText =
      "border:0;width:100%;height:100%;display:block;background:transparent;";
    iframe.setAttribute("allow", "clipboard-write; camera");
    iframe.addEventListener("load", () => this._postToken());

    this.style.cssText = "display:block;height:100%;width:100%;";
    this.appendChild(iframe);
    this._iframe = iframe;

    // Mensajes de la SPA hacia el wrapper.
    window.addEventListener("message", (event) => {
      if (event.source !== iframe.contentWindow) return;
      const type = event.data && event.data.type;
      if (type === "tucompra-request-token") {
        this._postToken();
      } else if (type === "tucompra-toggle-menu") {
        // Abre/cierra la barra lateral de HA (el evento burbujea hasta
        // home-assistant-main, que la gestiona).
        this.dispatchEvent(
          new CustomEvent("hass-toggle-menu", { bubbles: true, composed: true }),
        );
      }
    });
  }

  _postToken() {
    if (!this._iframe || !this._hass) return;
    const auth = this._hass.auth || {};
    // `accessToken` (getter) es la vía preferida; caemos a data.access_token.
    const token =
      auth.accessToken ||
      (auth.data && auth.data.access_token) ||
      null;
    if (!token) return;
    const hassUrl =
      (auth.data && auth.data.hassUrl) || window.location.origin;
    // Idioma y país de HA para localizar el catálogo y mostrar la bandera.
    const language = this._hass.language || null;
    const country =
      (this._hass.config && this._hass.config.country) || null;
    // targetOrigin = mismo origen: la SPA se sirve desde el propio HA.
    this._iframe.contentWindow.postMessage(
      { type: "tucompra-token", token, hassUrl, language, country },
      window.location.origin,
    );
  }
}

if (!customElements.get("tucompra-panel")) {
  customElements.define("tucompra-panel", TuCompraPanel);
}
