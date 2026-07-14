"""Tu Compra — listas de la compra multi-tienda, 100% local en Home Assistant.

Registra:
  * un panel lateral que sirve la SPA (Astro/Svelte) dentro de HA,
  * los estáticos de la SPA y su wrapper de autenticación,
  * una API REST autenticada con el propio usuario de HA.

Sin servicios externos: los datos viven en `.storage/tucompra`.
"""
from __future__ import annotations

import logging
from datetime import timedelta
from pathlib import Path

import voluptuous as vol

from homeassistant.components import panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.event import async_call_later, async_track_time_interval
from homeassistant.helpers.typing import ConfigType

from .api import async_register_views
from .const import (
    DOMAIN,
    PANEL_ICON,
    PANEL_TITLE,
    PANEL_URL_PATH,
    STATIC_PATH,
)
from .store import TuCompraStore

_LOGGER = logging.getLogger(__name__)

ADD_ITEM_SCHEMA = vol.Schema(
    {
        vol.Required("name"): cv.string,
        vol.Optional("quantity", default=1): vol.Coerce(float),
        vol.Optional("unit"): cv.string,
        vol.Optional("share_id"): cv.string,
    }
)

# Config opcional de `configuration.yaml`. `tucompra:` a secas (sin nada) sigue
# valiendo; el bloque `google_keep` activa el puente con la lista de Google.
_KEEP_SCHEMA = vol.Schema(
    {
        vol.Required("email"): cv.string,
        vol.Required("master_token"): cv.string,
        vol.Optional("list_name"): cv.string,
        vol.Optional("interval", default=120): cv.positive_int,
        vol.Optional("share_id"): cv.string,
    }
)

CONFIG_SCHEMA = vol.Schema(
    {
        DOMAIN: vol.Any(
            None,
            vol.Schema({vol.Optional("google_keep"): _KEEP_SCHEMA}),
        )
    },
    extra=vol.ALLOW_EXTRA,
)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Arranque de la integración (config: solo la línea `tucompra:` en YAML)."""
    store = TuCompraStore(hass)
    await store.async_load()
    hass.data[DOMAIN] = store

    # Sirve el wrapper (tucompra-panel.js) y el build de la SPA (panel/app).
    panel_dir = Path(__file__).parent / "panel"
    await hass.http.async_register_static_paths(
        [StaticPathConfig(STATIC_PATH, str(panel_dir), False)]
    )

    async_register_views(hass)

    async def _handle_add_item(call: ServiceCall) -> dict:
        result = await store.async_add_named_item(
            name=call.data["name"],
            quantity=call.data.get("quantity", 1),
            unit=call.data.get("unit"),
            share_id=call.data.get("share_id"),
        )
        _LOGGER.debug("add_item(%s) → %s", call.data.get("name"), result)
        return result

    hass.services.async_register(
        DOMAIN,
        "add_item",
        _handle_add_item,
        schema=ADD_ITEM_SCHEMA,
        supports_response=SupportsResponse.OPTIONAL,
    )

    # Puente opcional con la lista de la compra de Google (Google Keep).
    keep_conf = (config.get(DOMAIN) or {}).get("google_keep")
    if keep_conf:
        from .keep_bridge import KeepBridge

        bridge = KeepBridge(hass, store, keep_conf)
        interval = timedelta(seconds=keep_conf.get("interval", 120))
        # Primer sondeo poco después del arranque y luego periódico.
        async_call_later(hass, 15, bridge.async_poll)
        hass.data[f"{DOMAIN}_keep_unsub"] = async_track_time_interval(
            hass, bridge.async_poll, interval
        )
        _LOGGER.info(
            "Tu Compra: puente Google Keep activo (cada %ss)", keep_conf.get("interval", 120)
        )

    # Panel lateral: HA carga el web component `tucompra-panel`, que a su vez
    # incrusta la SPA en un iframe y le pasa el token de acceso del usuario.
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL_PATH,
        webcomponent_name="tucompra-panel",
        module_url=f"{STATIC_PATH}/tucompra-panel.js",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        require_admin=False,
        config={"static": STATIC_PATH},
        embed_iframe=False,
    )

    _LOGGER.info("Tu Compra: panel y API registrados en %s", PANEL_URL_PATH)
    return True
