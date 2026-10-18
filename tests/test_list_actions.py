"""Acciones de lista del Bot: borrar, cantidad, desmarcar, mover, limpiar, enlace.

No arrancan Home Assistant. Cargan store.py con un stub del helper Store.
"""
from __future__ import annotations

import asyncio
import importlib.util
import sys
import types
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def _load_store():
    comp = ROOT / "custom_components" / "tucompra"
    if "homeassistant.helpers.storage" not in sys.modules:
        ha = types.ModuleType("homeassistant")
        core = types.ModuleType("homeassistant.core")
        helpers = types.ModuleType("homeassistant.helpers")
        storage = types.ModuleType("homeassistant.helpers.storage")

        class _Store:
            def __init__(self, *args, **kwargs):
                pass

        storage.Store = _Store
        core.HomeAssistant = object
        sys.modules["homeassistant"] = ha
        sys.modules["homeassistant.core"] = core
        sys.modules["homeassistant.helpers"] = helpers
        sys.modules["homeassistant.helpers.storage"] = storage

    pkg = "tucompra_list_actions"
    if pkg not in sys.modules:
        module = types.ModuleType(pkg)
        module.__path__ = [str(comp)]
        module.__package__ = pkg
        sys.modules[pkg] = module

    def load(name: str):
        full = f"{pkg}.{name}"
        if full in sys.modules:
            return sys.modules[full]
        spec = importlib.util.spec_from_file_location(full, comp / f"{name}.py")
        mod = importlib.util.module_from_spec(spec)
        mod.__package__ = pkg
        sys.modules[full] = mod
        assert spec.loader is not None
        spec.loader.exec_module(mod)
        return mod

    load("const")
    load("routing")
    return load("store")


store_mod = _load_store()

CATALOG = {
    "products": [
        {"id": "leche", "name": "Leche", "categoryId": "lac", "defaultUnit": "l"},
        {"id": "entera", "name": "Leche entera", "categoryId": "lac", "defaultUnit": "l"},
        {"id": "desnatada", "name": "Leche desnatada", "categoryId": "lac", "defaultUnit": "l"},
        {"id": "aceite", "name": "Aceite", "categoryId": "lac", "defaultUnit": "unidad"},
        {"id": "pan", "name": "Pan", "categoryId": "lac", "defaultUnit": "unidad"},
    ],
    "categories": [{"id": "lac", "typeId": "super"}],
    "stores": [
        {"id": "eroski", "name": "Eroski", "typeId": "super", "enabled": True},
        {"id": "amazon", "name": "Amazon", "typeId": "super", "enabled": True, "online": True},
        {"id": "aldi", "name": "Aldi", "typeId": "super", "enabled": True},
    ],
}


class _Cfg:
    language = "es"
    country = "ES"


class _Hass:
    config = _Cfg()


def _item(item_id: str, product_id: str, *, qty=1, unit="l", done=False, note="", url=""):
    item = {
        "id": item_id,
        "productId": product_id,
        "qty": qty,
        "unit": unit,
        "done": done,
        "addedAt": 1,
    }
    if done:
        item["doneAt"] = 2
    if note:
        item["note"] = note
    if url:
        item["url"] = url
    return item


def _snap(items_by_store: dict) -> dict:
    lists = {
        store_id: {"storeId": store_id, "items": items, "updatedAt": 1}
        for store_id, items in items_by_store.items()
    }
    return {
        "lists": lists,
        "customProducts": [],
        "customStores": [],
        "defaultStores": {"super": "aldi"},
        "updatedAt": 1,
    }


def _store(snap: dict):
    store = store_mod.TuCompraStore.__new__(store_mod.TuCompraStore)
    store._hass = _Hass()
    store._data = {"shares": {"shared:casa": {
        "id": "shared:casa",
        "snapshot": snap,
        "updatedAt": 1,
    }}}
    store.catalog = CATALOG

    async def _save():
        return None

    store._async_save = _save
    return store


def _run(coro):
    return asyncio.run(coro)


def _pending(snap: dict, store_id: str, product_id: str) -> list[dict]:
    return [
        item for item in snap["lists"].get(store_id, {}).get("items", [])
        if item.get("productId") == product_id and not item.get("done")
    ]


def test_tomate_fresco_reutiliza_el_que_ya_tiene_icono():
    snap = _snap({})
    snap["customProducts"] = [{
        "id": "tomate-casa",
        "name": "Tomate",
        "categoryId": "lac",
        "icon": {"kind": "emoji", "value": "🍅"},
        "defaultUnit": "unidad",
    }]
    encontrado = _run(_store(snap).async_find_products("tomate fresco"))
    assert encontrado["reuse"] == "Tomate"
    assert encontrado["products"] == [{"id": "tomate-casa", "name": "Tomate"}]
    result = _run(_store(snap).async_add_named_item("tomate fresco", quantity=1))
    assert result["ok"] is True
    assert result["product_id"] == "tomate-casa"
    assert result["product_name"] == "Tomate"
    assert [p["id"] for p in snap["customProducts"]] == ["tomate-casa"]
    assert snap["lists"]["aldi"]["items"][0]["productId"] == "tomate-casa"


def test_repetir_producto_suma_la_linea_que_ya_esta():
    snap = _snap({"eroski": [_item("a", "leche", qty=1)]})
    result = _run(_store(snap).async_add_named_item("leche", quantity=1))
    assert result["ok"] is True
    assert result["bumped"] is True
    assert result["store"] == "Eroski"
    assert result["qty"] == 2
    assert len(_pending(snap, "eroski", "leche")) == 1
    # La tienda por defecto es Aldi: no abre otra línea allí.
    assert "aldi" not in snap["lists"] or not _pending(snap, "aldi", "leche")


def test_add_en_otra_tienda_no_suma_la_de_la_primera():
    snap = _snap({"eroski": [_item("a", "leche", qty=1)]})
    result = _run(_store(snap).async_add_named_item("leche", quantity=1, store="Amazon"))
    assert result["ok"] is True
    assert result["bumped"] is False
    assert result["store"] == "Amazon"
    assert len(_pending(snap, "amazon", "leche")) == 1
    assert _pending(snap, "eroski", "leche")[0]["qty"] == 1


def test_varias_tiendas_no_anade_ni_suma():
    snap = _snap({
        "eroski": [_item("a", "leche")],
        "amazon": [_item("b", "leche")],
    })
    before = [item["id"] for item in snap["lists"]["eroski"]["items"]]
    result = _run(_store(snap).async_add_named_item("leche"))
    assert result["ok"] is False
    assert result["ambiguous"] is True
    assert "Eroski" in result["store_alternatives"]
    assert [item["id"] for item in snap["lists"]["eroski"]["items"]] == before


def test_remove_borra_el_pendiente_y_deja_el_resto():
    snap = _snap({"eroski": [
        _item("a", "leche"),
        _item("b", "leche", done=True),
        _item("c", "pan", unit="unidad"),
    ]})
    result = _run(_store(snap).async_remove_item("leche"))
    assert result == {
        "ok": True,
        "share_id": "shared:casa",
        "product": "Leche",
        "store": "Eroski",
        "removed": True,
    }
    left = {item["id"] for item in snap["lists"]["eroski"]["items"]}
    assert left == {"b", "c"}


def test_remove_ambiguo_no_borra_nada():
    snap = _snap({"eroski": [
        _item("a", "entera"),
        _item("b", "desnatada"),
        _item("c", "pan", unit="unidad"),
    ]})
    result = _run(_store(snap).async_remove_item("leche"))
    assert result["ok"] is False
    assert result["ambiguous"] is True
    assert {item["id"] for item in snap["lists"]["eroski"]["items"]} == {"a", "b", "c"}


def test_qty_fija_cantidad_y_unidad():
    snap = _snap({"eroski": [_item("a", "leche", qty=1, unit="unidad")]})
    result = _run(_store(snap).async_set_qty("leche", quantity=2, unit="l"))
    assert result["ok"] is True
    assert result["qty"] == 2
    assert result["unit"] == "l"
    assert snap["lists"]["eroski"]["items"][0]["qty"] == 2


def test_uno_menos_no_deja_la_cantidad_en_cero():
    snap = _snap({"eroski": [_item("a", "leche", qty=1)]})
    result = _run(_store(snap).async_set_qty("leche", delta=-1))
    assert result["ok"] is False
    assert snap["lists"]["eroski"]["items"][0]["qty"] == 1


def test_uno_mas_suma():
    snap = _snap({"eroski": [_item("a", "leche", qty=1)]})
    result = _run(_store(snap).async_set_qty("leche", delta=1))
    assert result["ok"] is True
    assert result["qty"] == 2


def test_desmarcar_devuelve_a_pendiente():
    snap = _snap({"eroski": [_item("a", "leche", done=True)]})
    result = _run(_store(snap).async_mark_pending("leche"))
    assert result["ok"] is True
    assert result["done"] is False
    item = snap["lists"]["eroski"]["items"][0]
    assert item["done"] is False
    assert "doneAt" not in item


def test_mover_conserva_cantidad_y_nota():
    snap = _snap({"amazon": [_item("a", "leche", qty=2, note="semi")]})
    result = _run(_store(snap).async_move_item("leche", to_store="Eroski"))
    assert result["ok"] is True
    assert result["store"] == "Eroski"
    assert result["from_store"] == "Amazon"
    assert snap["lists"]["amazon"]["items"] == []
    moved = snap["lists"]["eroski"]["items"][0]
    assert moved["id"] == "a"
    assert moved["qty"] == 2
    assert moved["note"] == "semi"


def test_limpiar_sin_confirmar_no_borra():
    snap = _snap({"eroski": [
        _item("a", "leche", done=True),
        _item("b", "pan", unit="unidad"),
    ]})
    result = _run(_store(snap).async_clear_done())
    assert result["dry_run"] is True
    assert result["count"] == 1
    assert result["items"][0]["product"] == "Leche"
    assert {item["id"] for item in snap["lists"]["eroski"]["items"]} == {"a", "b"}


def test_limpiar_confirmado_solo_quita_comprados():
    snap = _snap({"eroski": [
        _item("a", "leche", done=True),
        _item("b", "pan", unit="unidad"),
    ]})
    result = _run(_store(snap).async_clear_done(confirm=True))
    assert result["dry_run"] is False
    assert result["removed"] == 1
    assert [item["id"] for item in snap["lists"]["eroski"]["items"]] == ["b"]


def test_enlace_en_tienda_online_y_se_borra_con_vacio():
    snap = _snap({"amazon": [_item("a", "aceite", unit="unidad")]})
    store = _store(snap)
    put = _run(store.async_set_url("aceite", "amazon.es/dp/B00"))
    assert put["ok"] is True
    assert put["url"] == "https://amazon.es/dp/B00"
    assert snap["lists"]["amazon"]["items"][0]["url"] == "https://amazon.es/dp/B00"
    cleared = _run(store.async_set_url("aceite", ""))
    assert cleared["ok"] is True
    assert cleared["url"] == ""
    assert "url" not in snap["lists"]["amazon"]["items"][0]


def test_enlace_rechaza_tienda_fisica_y_javascript():
    snap = _snap({"eroski": [_item("a", "aceite", unit="unidad")]})
    refused = _run(_store(snap).async_set_url("aceite", "https://amazon.es/dp/B00"))
    assert refused["ok"] is False
    assert "url" not in snap["lists"]["eroski"]["items"][0]
    assert store_mod._normalize_product_url("javascript:alert(1)") is None


def _load_cli():
    spec = importlib.util.spec_from_file_location(
        "tucompra_cli_under_test", ROOT / "tools" / "tucompra.py"
    )
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(mod)
    return mod


def test_cli_clear_no_confirma_solo():
    cli = _load_cli()
    listed = cli.parser().parse_args(["clear", "--store", "Eroski"])
    assert cli.payload(listed) == {"store": "Eroski", "confirm": False}
    wiped = cli.parser().parse_args(["clear", "--yes"])
    assert cli.payload(wiped)["confirm"] is True


def test_cli_qty_move_y_link():
    cli = _load_cli()
    qty = cli.parser().parse_args(["qty", "leche", "--set", "2", "--unit", "l"])
    assert cli.payload(qty) == {"name": "leche", "quantity": 2.0, "unit": "l"}
    move = cli.parser().parse_args(["move", "leche", "--to", "Eroski", "--store", "Amazon"])
    assert cli.payload(move) == {"name": "leche", "to_store": "Eroski", "store": "Amazon"}
    link = cli.parser().parse_args(["link", "aceite", ""])
    assert cli.payload(link) == {"name": "aceite", "url": ""}
