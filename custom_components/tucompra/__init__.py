"""Tu Compra — listas de la compra multi-tienda, 100% local en Home Assistant.

Registra:
  * un panel lateral que sirve la SPA (Astro/Svelte) dentro de HA,
  * los estáticos de la SPA y su wrapper de autenticación,
  * una API REST autenticada con el propio usuario de HA.

Sin servicios externos: los datos viven en `.storage/tucompra`.
"""
from __future__ import annotations

import json
import logging
import mimetypes
from pathlib import Path

import voluptuous as vol

from homeassistant.components import panel_custom
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant, ServiceCall, SupportsResponse
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.typing import ConfigType

from .api import async_register_views
from .const import (
    DOMAIN,
    LOOKUP_ENABLED,
    PANEL_ICON,
    PANEL_TITLE,
    PANEL_URL_PATH,
    STATIC_PATH,
)
from .store import TuCompraStore

_LOGGER = logging.getLogger(__name__)

# Versión del manifest (el release la fija = tag). Se usa como cache-buster del
# wrapper del panel: así cada actualización carga un wrapper fresco, que a su vez
# refresca la SPA, sin que el usuario tenga que limpiar caché.
_VERSION = json.loads(
    (Path(__file__).parent / "manifest.json").read_text(encoding="utf-8")
).get("version", "0")

ADD_ITEM_SCHEMA = vol.Schema(
    {
        vol.Required("name"): cv.string,
        vol.Optional("quantity", default=1): vol.Coerce(float),
        vol.Optional("unit"): cv.string,
        vol.Optional("store"): cv.string,
        vol.Optional("note"): cv.string,
        vol.Optional("share_id"): cv.string,
    }
)

FIND_PRODUCTS_SCHEMA = vol.Schema(
    {
        vol.Required("name"): cv.string,
        vol.Optional("share_id"): cv.string,
    }
)

LIST_PENDING_SCHEMA = vol.Schema(
    {
        vol.Optional("store"): cv.string,
        vol.Optional("share_id"): cv.string,
    }
)

MARK_DONE_SCHEMA = vol.Schema(
    {
        vol.Required("name"): cv.string,
        vol.Optional("store"): cv.string,
        vol.Optional("share_id"): cv.string,
    }
)

SET_NOTE_SCHEMA = vol.Schema(
    {
        vol.Required("name"): cv.string,
        vol.Optional("note", default=""): cv.string,
        vol.Optional("store"): cv.string,
        vol.Optional("share_id"): cv.string,
    }
)

REMOVE_ITEM_SCHEMA = vol.Schema(
    {
        vol.Required("name"): cv.string,
        vol.Optional("store"): cv.string,
        vol.Optional("share_id"): cv.string,
    }
)

SET_QTY_SCHEMA = vol.Schema(
    {
        vol.Required("name"): cv.string,
        vol.Optional("quantity"): vol.Coerce(float),
        vol.Optional("delta"): vol.Coerce(float),
        vol.Optional("unit"): cv.string,
        vol.Optional("store"): cv.string,
        vol.Optional("share_id"): cv.string,
    }
)

MARK_PENDING_SCHEMA = MARK_DONE_SCHEMA

MOVE_ITEM_SCHEMA = vol.Schema(
    {
        vol.Required("name"): cv.string,
        vol.Required("to_store"): cv.string,
        vol.Optional("store"): cv.string,
        vol.Optional("share_id"): cv.string,
    }
)

CLEAR_DONE_SCHEMA = vol.Schema(
    {
        vol.Optional("store"): cv.string,
        vol.Optional("share_id"): cv.string,
        vol.Optional("confirm", default=False): cv.boolean,
    }
)

SET_URL_SCHEMA = vol.Schema(
    {
        vol.Required("name"): cv.string,
        vol.Optional("url", default=""): cv.string,
        vol.Optional("store"): cv.string,
        vol.Optional("share_id"): cv.string,
    }
)

# Config opcional. `tucompra:` a secas sigue valiendo y deja la app 100% local.
# `product_lookup: true` es lo ÚNICO que permite una petición saliente (a Open
# Food Facts, para traducir un código de barras a producto).
CONFIG_SCHEMA = vol.Schema(
    {
        DOMAIN: vol.Any(
            None,
            vol.Schema({vol.Optional("product_lookup", default=False): cv.boolean}),
        )
    },
    extra=vol.ALLOW_EXTRA,
)


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Arranque de la integración (config: solo la línea `tucompra:` en YAML)."""
    store = TuCompraStore(hass)
    await store.async_load()
    hass.data[DOMAIN] = store

    conf = config.get(DOMAIN) or {}
    hass.data[LOOKUP_ENABLED] = bool(conf.get("product_lookup", False))
    if hass.data[LOOKUP_ENABLED]:
        _LOGGER.info(
            "Tu Compra: búsqueda de productos por código de barras ACTIVADA "
            "(consulta Open Food Facts; es la única petición saliente)"
        )

    # El escáner de iOS usa un decodificador WebAssembly, y Safari EXIGE que el
    # .wasm se sirva como application/wasm o se niega a instanciarlo. Python no
    # siempre trae esa extensión en su tabla de tipos, así que la registramos.
    mimetypes.add_type("application/wasm", ".wasm")

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
            store=call.data.get("store"),
            note=call.data.get("note"),
        )
        _LOGGER.debug("add_item(%s) → %s", call.data.get("name"), result)
        return result

    async def _handle_find_products(call: ServiceCall) -> dict:
        return await store.async_find_products(
            name=call.data["name"],
            share_id=call.data.get("share_id"),
        )

    async def _handle_list_pending(call: ServiceCall) -> dict:
        return await store.async_list_pending(
            store=call.data.get("store"),
            share_id=call.data.get("share_id"),
        )

    async def _handle_mark_done(call: ServiceCall) -> dict:
        return await store.async_mark_done(
            name=call.data["name"],
            store=call.data.get("store"),
            share_id=call.data.get("share_id"),
        )

    async def _handle_set_note(call: ServiceCall) -> dict:
        return await store.async_set_note(
            name=call.data["name"],
            note=call.data.get("note", ""),
            store=call.data.get("store"),
            share_id=call.data.get("share_id"),
        )

    async def _handle_remove_item(call: ServiceCall) -> dict:
        return await store.async_remove_item(
            name=call.data["name"],
            store=call.data.get("store"),
            share_id=call.data.get("share_id"),
        )

    async def _handle_set_qty(call: ServiceCall) -> dict:
        return await store.async_set_qty(
            name=call.data["name"],
            quantity=call.data.get("quantity"),
            delta=call.data.get("delta"),
            unit=call.data.get("unit"),
            store=call.data.get("store"),
            share_id=call.data.get("share_id"),
        )

    async def _handle_mark_pending(call: ServiceCall) -> dict:
        return await store.async_mark_pending(
            name=call.data["name"],
            store=call.data.get("store"),
            share_id=call.data.get("share_id"),
        )

    async def _handle_move_item(call: ServiceCall) -> dict:
        return await store.async_move_item(
            name=call.data["name"],
            to_store=call.data["to_store"],
            store=call.data.get("store"),
            share_id=call.data.get("share_id"),
        )

    async def _handle_clear_done(call: ServiceCall) -> dict:
        return await store.async_clear_done(
            store=call.data.get("store"),
            share_id=call.data.get("share_id"),
            confirm=bool(call.data.get("confirm", False)),
        )

    async def _handle_set_url(call: ServiceCall) -> dict:
        return await store.async_set_url(
            name=call.data["name"],
            url=call.data.get("url", ""),
            store=call.data.get("store"),
            share_id=call.data.get("share_id"),
        )

    for service, handler, schema in (
        ("add_item", _handle_add_item, ADD_ITEM_SCHEMA),
        ("find_products", _handle_find_products, FIND_PRODUCTS_SCHEMA),
        ("list_pending", _handle_list_pending, LIST_PENDING_SCHEMA),
        ("mark_done", _handle_mark_done, MARK_DONE_SCHEMA),
        ("set_note", _handle_set_note, SET_NOTE_SCHEMA),
        ("remove_item", _handle_remove_item, REMOVE_ITEM_SCHEMA),
        ("set_qty", _handle_set_qty, SET_QTY_SCHEMA),
        ("mark_pending", _handle_mark_pending, MARK_PENDING_SCHEMA),
        ("move_item", _handle_move_item, MOVE_ITEM_SCHEMA),
        ("clear_done", _handle_clear_done, CLEAR_DONE_SCHEMA),
        ("set_url", _handle_set_url, SET_URL_SCHEMA),
    ):
        hass.services.async_register(
            DOMAIN,
            service,
            handler,
            schema=schema,
            supports_response=SupportsResponse.OPTIONAL,
        )

    # Panel lateral: HA carga el web component `tucompra-panel`, que a su vez
    # incrusta la SPA en un iframe y le pasa el token de acceso del usuario.
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path=PANEL_URL_PATH,
        webcomponent_name="tucompra-panel",
        module_url=f"{STATIC_PATH}/tucompra-panel.js?v={_VERSION}",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        require_admin=False,
        config={"static": STATIC_PATH},
        embed_iframe=False,
    )

    _LOGGER.info("Tu Compra: panel y API registrados en %s", PANEL_URL_PATH)
    return True
