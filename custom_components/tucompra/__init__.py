"""Tu Compra — listas de la compra multi-tienda, 100% local en Home Assistant.

Registra:
  * un panel lateral que sirve la SPA (Astro/Svelte) dentro de HA,
  * los estáticos de la SPA y su wrapper de autenticación,
  * una API REST autenticada con el propio usuario de HA.

Sin servicios externos: los datos viven en `.storage/tucompra`.
"""
from __future__ import annotations

import logging
from pathlib import Path

from homeassistant.components import panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant
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
