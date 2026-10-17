"""Capa de almacenamiento de Tu Compra.

Los datos viven en `.storage/tucompra` (helper Store de HA → JSON en disco,
sobrevive reinicios y entra en los backups de HA). Sin dependencias externas.

Modelo: un diccionario de "shares" (espacios de lista). Cada share contiene el
snapshot completo de la app (listas, productos y tiendas personalizados) y la
lista de usuarios de HA que son miembros. La compartición es a nivel de cuenta
entera: entrar en un share da acceso a todo su contenido.
"""
from __future__ import annotations

import math
import re
import time
import urllib.parse
import uuid
from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import STORAGE_KEY, STORAGE_VERSION
from .routing import (
    INBOX_STORE_ID,
    _norm,
    catalog_for,
    load_catalog,
    match_scored,
    match_store,
    resolve,
    tied_alternatives,
)

UNITS = {"unidad", "kg", "g", "l", "ml", "paquete", "docena", "caja"}

# Mismo criterio que normalizeProductUrl en src/lib/product-link.ts.
_URL_SCHEME = re.compile(r"^[a-z][a-z\d+.-]*://", re.IGNORECASE)
_URL_SCHEME_NO_HOST = re.compile(r"^[a-z][a-z\d+.-]*:(?!\d)", re.IGNORECASE)


def _now_ms() -> int:
    return int(time.time() * 1000)


def _round_qty(qty: float) -> float:
    """Un decimal, como Math.round del panel. Solo cantidades positivas."""
    return math.floor(float(qty) * 10 + 0.5) / 10


def _normalize_product_url(value: str) -> str | None:
    """Enlace http(s). Vacío → ''. Esquema que no es http(s) → None."""
    clean = (value or "").strip()
    if not clean:
        return ""
    has_slashes = _URL_SCHEME.match(clean) is not None
    if not has_slashes and _URL_SCHEME_NO_HOST.match(clean):
        return None
    candidate = clean if has_slashes else f"https://{clean}"
    try:
        parts = urllib.parse.urlsplit(candidate)
    except ValueError:
        return None
    host = parts.hostname or ""
    if parts.scheme not in ("http", "https") or not host:
        return None
    if host != "localhost" and "." not in host:
        return None
    return urllib.parse.urlunsplit(parts)


def _titlecase_es(name: str) -> str:
    name = name.strip()
    return name[:1].upper() + name[1:].lower() if name else name


def _unique_names(names) -> list[str]:
    out: list[str] = []
    seen: set[str] = set()
    for name in names:
        key = _norm(name)
        if not key or key in seen:
            continue
        seen.add(key)
        out.append(name)
    return out


def _line_label(name: str, item: dict) -> str:
    qty = item.get("qty", 1)
    unit = item.get("unit") or "unidad"
    note = (item.get("note") or "").strip()
    label = f"{name} ({qty} {unit})"
    return f"{label}, {note}" if note else label


def _ensure_inbox_store(snapshot: dict) -> None:
    """Añade la tienda 'Por clasificar' al snapshot si aún no existe."""
    stores = snapshot.setdefault("customStores", [])
    if not any(s.get("id") == INBOX_STORE_ID for s in stores):
        stores.append(
            {
                "id": INBOX_STORE_ID,
                "name": "📥 Por clasificar",
                "typeId": "otros",
                "icon": {"kind": "emoji", "value": "📥"},
                "edited": True,
            }
        )


class TuCompraStore:
    """Envuelve el helper Store de HA con la lógica de shares y membresías."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._hass = hass
        self._store: Store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._data: dict[str, Any] = {"shares": {}}
        # Catálogo de los 6 idiomas; se aplana al de HA en cada resolución.
        self.catalog = load_catalog(Path(__file__).parent / "catalog.json")

    async def async_load(self) -> dict[str, Any]:
        data = await self._store.async_load()
        if isinstance(data, dict):
            self._data = data
        self._data.setdefault("shares", {})
        self._data.setdefault("lookup_cache", {})
        return self._data

    # ── Caché de búsquedas por código de barras ─────────────────────────
    # Evita repetir peticiones a Open Food Facts para el mismo producto.
    @property
    def lookup_cache(self) -> dict[str, Any]:
        return self._data.setdefault("lookup_cache", {})

    def get_cached_lookup(self, barcode: str) -> dict[str, Any] | None:
        return self.lookup_cache.get(barcode)

    async def async_cache_lookup(self, barcode: str, result: dict[str, Any]) -> None:
        self.lookup_cache[barcode] = result
        await self._async_save()

    async def _async_save(self) -> None:
        await self._store.async_save(self._data)

    # ── Shares ──────────────────────────────────────────────────────────
    @property
    def shares(self) -> dict[str, Any]:
        return self._data.setdefault("shares", {})

    @staticmethod
    def personal_id(user_id: str) -> str:
        return f"personal:{user_id}"

    async def async_ensure_personal(self, user_id: str) -> dict[str, Any]:
        """Crea (si no existe) el share personal del usuario."""
        sid = self.personal_id(user_id)
        if sid not in self.shares:
            self.shares[sid] = {
                "id": sid,
                "name": "Personal",
                "owner": user_id,
                "members": [user_id],
                "snapshot": None,
                "updatedAt": 0,
            }
            await self._async_save()
        return self.shares[sid]

    def shares_for(self, user_id: str) -> list[dict[str, Any]]:
        return [s for s in self.shares.values() if user_id in s.get("members", [])]

    def is_member(self, share_id: str, user_id: str) -> bool:
        share = self.shares.get(share_id)
        return bool(share and user_id in share.get("members", []))

    # ── Snapshot ────────────────────────────────────────────────────────
    def get_snapshot(self, share_id: str) -> Any:
        share = self.shares.get(share_id)
        return share.get("snapshot") if share else None

    def updated_at(self, share_id: str) -> int:
        share = self.shares.get(share_id)
        return share.get("updatedAt", 0) if share else 0

    async def async_set_snapshot(
        self, share_id: str, snapshot: Any, updated_at: int | None
    ) -> bool:
        """Guarda el snapshot. Last-write-wins por `updatedAt`: si el remoto es
        más nuevo que el que llega, no lo pisamos (el cliente reconcilia)."""
        share = self.shares.get(share_id)
        if not share:
            return False
        if updated_at is not None and updated_at < share.get("updatedAt", 0):
            return True
        share["snapshot"] = snapshot
        share["updatedAt"] = updated_at or _now_ms()
        await self._async_save()
        return True

    # ── Gestión de shares compartidas (solo admin en la capa API) ───────
    async def async_create_share(
        self, name: str | None, owner: str, members: list[str]
    ) -> dict[str, Any]:
        sid = f"shared:{uuid.uuid4().hex[:12]}"
        member_ids = list(dict.fromkeys([owner, *members]))  # dedup, owner incluido
        self.shares[sid] = {
            "id": sid,
            "name": name or "Compartida",
            "owner": owner,
            "members": member_ids,
            "snapshot": None,
            "updatedAt": 0,
        }
        await self._async_save()
        return self.shares[sid]

    async def async_update_share(
        self,
        share_id: str,
        name: str | None = None,
        members: list[str] | None = None,
    ) -> dict[str, Any] | None:
        share = self.shares.get(share_id)
        if not share:
            return None
        if name is not None:
            share["name"] = name
        if members is not None:
            # El owner siempre permanece como miembro.
            share["members"] = list(dict.fromkeys([share["owner"], *members]))
        await self._async_save()
        return share

    async def async_delete_share(self, share_id: str) -> bool:
        if share_id.startswith("personal:"):
            return False  # los personales no se borran
        if share_id in self.shares:
            del self.shares[share_id]
            await self._async_save()
            return True
        return False

    # ── Alta de producto por nombre (servicio add_item / voz) ───────────
    def _pick_target_share(self, share_id: str | None) -> dict[str, Any] | None:
        """Share destino: el indicado; si no, la compartida (hogar); si no, la
        primera personal. Coincide con el 'compartida por defecto' del frontend."""
        shares = self.shares
        if share_id and share_id in shares:
            return shares[share_id]
        shared = [s for sid, s in shares.items() if sid.startswith("shared:")]
        if shared:
            return shared[0]
        personal = [s for sid, s in shares.items() if sid.startswith("personal:")]
        return personal[0] if personal else None

    def _flat_catalog(self) -> dict[str, Any]:
        cfg = self._hass.config
        return catalog_for(self.catalog, cfg.language, cfg.country)

    def _stores_index(self, snap: dict, catalog: dict) -> dict[str, dict]:
        stores = {s["id"]: s for s in catalog.get("stores", [])}
        for store in snap.get("customStores", []):
            stores[store["id"]] = store
        return stores

    def _products_index(self, snap: dict, catalog: dict) -> dict[str, dict]:
        products = {p["id"]: p for p in catalog.get("products", [])}
        for product in snap.get("customProducts", []):
            products[product["id"]] = product
        return products

    def _empty_snap(self) -> dict[str, Any]:
        return {
            "lists": {}, "customProducts": [], "customStores": [],
            "defaultStores": {}, "updatedAt": 0,
        }

    async def async_add_named_item(
        self,
        name: str,
        quantity: float = 1,
        unit: str | None = None,
        share_id: str | None = None,
        store: str | None = None,
        note: str | None = None,
    ) -> dict[str, Any]:
        """Añade un producto por nombre: fuzzy match → tipo → tienda por defecto,
        o bandeja 'Por clasificar' si no se puede resolver.

        `store` es el nombre de una tienda ("Amazon"). Si se dice, manda sobre
        la tienda por defecto. `note` queda en esta línea.
        """
        share = self._pick_target_share(share_id)
        if not share:
            return {"ok": False, "error": "No hay ninguna lista disponible todavía."}
        if unit and unit not in UNITS:
            return {"ok": False, "error": f"Unidad no válida: {unit}.", "units": sorted(UNITS)}

        snap = share.get("snapshot") or self._empty_snap()
        catalog = self._flat_catalog()
        res = resolve(name, snap, catalog, store_name=store)
        if store:
            if res.get("store_alternatives"):
                return {
                    "ok": False,
                    "error": "Hay varias tiendas con ese nombre.",
                    "store_alternatives": res["store_alternatives"],
                }
            if not res.get("store_id"):
                return {"ok": False, "error": f"No encuentro la tienda {store!r}."}

        product = res["product"]
        # Sin tienda dicha, una línea pendiente de ese producto manda sobre la
        # tienda por defecto: repetir "leche" suma, no abre otra fila.
        hits = self._pending_hits(
            snap, catalog, product, name, res["store_id"] if store else None
        )
        stores = self._stores_index(snap, catalog)
        if len({hit["store_id"] for hit in hits}) > 1:
            return {
                "ok": False,
                "error": "Ese producto está pendiente en varias tiendas.",
                "store_alternatives": _unique_names(hit["store"] for hit in hits),
                "ambiguous": True,
            }
        if len(hits) > 1:
            return {
                "ok": False,
                "error": "Hay varias líneas pendientes de ese producto.",
                "alternatives": [
                    _line_label(hit["name"], hit["item"]) for hit in hits[:3]
                ],
                "ambiguous": True,
            }
        if len(hits) == 1:
            return await self._bump_pending(
                share, snap, hits[0], quantity or 1, unit, note, res.get("alternatives") or []
            )

        now = _now_ms()
        store_id = res["store_id"]
        if store_id is None:
            store_id = INBOX_STORE_ID
            _ensure_inbox_store(snap)
            stores = self._stores_index(snap, catalog)

        if product:
            product_id = product["id"]
            item_unit = unit or product.get("defaultUnit") or "unidad"
        else:
            # Producto no reconocido → producto libre.
            product_id = f"custom-voice-{uuid.uuid4().hex[:8]}"
            snap.setdefault("customProducts", []).append(
                {
                    "id": product_id,
                    "name": _titlecase_es(name),
                    "categoryId": "otros-otros",
                    "icon": {"kind": "emoji", "value": "🏷️"},
                    "defaultUnit": unit or "unidad",
                }
            )
            item_unit = unit or "unidad"

        item: dict[str, Any] = {
            "id": uuid.uuid4().hex,
            "productId": product_id,
            "qty": quantity or 1,
            "unit": item_unit,
            "done": False,
            "addedAt": now,
        }
        clean_note = (note or "").strip()
        if clean_note:
            item["note"] = clean_note

        lists = snap.setdefault("lists", {})
        lst = lists.setdefault(store_id, {"storeId": store_id, "items": [], "updatedAt": 0})
        lst["items"].append(item)
        lst["updatedAt"] = now
        snap["updatedAt"] = now
        share["snapshot"] = snap
        share["updatedAt"] = now
        await self._async_save()

        alternatives = res.get("alternatives") or []
        return {
            "ok": True,
            "bumped": False,
            "share_id": share["id"],
            "store_id": store_id,
            "store": stores.get(store_id, {}).get("name", store_id),
            "product_id": product_id,
            "matched": product is not None,
            "classified": store_id != INBOX_STORE_ID,
            # Nombre REAL del producto que casó, que puede no ser lo que se dijo
            # ("pan" → "Pan integral"). Se devuelve para que el intent_script lo
            # diga en voz alta y el usuario se entere en el momento de si acertó.
            "product_name": product["name"] if product else _titlecase_es(name),
            # Otros que también casaban, del más al menos probable. Assist no
            # puede repreguntar y actuar sobre la respuesta (los intents propios
            # no hacen diálogo de varios turnos), pero sí puede nombrarlos.
            "alternatives": alternatives,
            "ambiguous": bool(alternatives),
            "note": clean_note,
            "qty": item["qty"],
            "unit": item_unit,
        }

    def _item_rows(
        self, snap: dict, catalog: dict, store_id: str | None, *, done: bool
    ) -> list[dict]:
        products = self._products_index(snap, catalog)
        stores = self._stores_index(snap, catalog)
        rows: list[dict] = []
        for lst in (snap.get("lists") or {}).values():
            sid = lst.get("storeId")
            if store_id and sid != store_id:
                continue
            for item in lst.get("items") or []:
                if bool(item.get("done")) != done:
                    continue
                product = products.get(item.get("productId"), {})
                rows.append({
                    "id": item.get("id"),
                    "name": product.get("name") or item.get("productId") or "",
                    "store_id": sid,
                    "store": stores.get(sid, {}).get("name", sid),
                    "item": item,
                    "list": lst,
                })
        return rows

    def _pending_rows(self, snap: dict, catalog: dict, store_id: str | None) -> list[dict]:
        return self._item_rows(snap, catalog, store_id, done=False)

    def _pending_hits(
        self,
        snap: dict,
        catalog: dict,
        product: dict | None,
        spoken: str,
        store_id: str | None,
    ) -> list[dict]:
        """Líneas pendientes del mismo producto. Con store_id, solo esa tienda."""
        target = product.get("id") if product else None
        spoken_n = _norm(spoken)
        hits = []
        for row in self._pending_rows(snap, catalog, store_id):
            if target:
                if row["item"].get("productId") != target:
                    continue
            elif _norm(row["name"]) != spoken_n:
                continue
            hits.append(row)
        return hits

    async def _bump_pending(
        self,
        share: dict,
        snap: dict,
        hit: dict,
        quantity: float,
        unit: str | None,
        note: str | None,
        alternatives: list,
    ) -> dict[str, Any]:
        item = hit["item"]
        previous = float(item.get("qty") or 1)
        item["qty"] = _round_qty(previous + (quantity or 1))
        if unit:
            item["unit"] = unit
        clean_note = (note or "").strip()
        if clean_note:
            item["note"] = clean_note
        else:
            clean_note = item.get("note") or ""
        now = _now_ms()
        hit["list"]["updatedAt"] = now
        snap["updatedAt"] = now
        share["snapshot"] = snap
        share["updatedAt"] = now
        await self._async_save()
        return {
            "ok": True,
            "bumped": True,
            "share_id": share["id"],
            "store_id": hit["store_id"],
            "store": hit["store"],
            "product_id": item.get("productId"),
            "matched": True,
            "classified": hit["store_id"] != INBOX_STORE_ID,
            "product_name": hit["name"],
            "alternatives": alternatives,
            "ambiguous": bool(alternatives),
            "note": clean_note,
            "qty": item["qty"],
            "previous_qty": previous,
            "unit": item.get("unit") or "unidad",
        }

    def _pick_line(
        self,
        name: str,
        snap: dict,
        catalog: dict,
        store: str | None,
        *,
        done: bool,
    ) -> dict[str, Any]:
        gate = self._require_store(store, self._stores_index(snap, catalog))
        if gate and not gate.get("store_id"):
            return gate
        rows = self._item_rows(
            snap, catalog, gate["store_id"] if gate else None, done=done
        )
        scored = match_scored(name, rows)
        if not scored:
            kind = "comprado" if done else "pendiente"
            return {"ok": False, "error": f"No hay {kind} que case con {name!r}."}
        names = tied_alternatives(scored)
        if names:
            winner = scored[0][1]["name"]
            kind = "comprados" if done else "pendientes"
            return {
                "ok": False,
                "error": f"Hay varios productos {kind} que casan.",
                "product_name": winner,
                "alternatives": names,
                "ambiguous": True,
            }
        return {"ok": True, "row": scored[0][1]}

    async def _save_share(self, share: dict, snap: dict) -> None:
        now = _now_ms()
        snap["updatedAt"] = now
        share["snapshot"] = snap
        share["updatedAt"] = now
        await self._async_save()

    def _require_store(self, store: str | None, stores: dict[str, dict]) -> dict[str, Any] | None:
        if not store:
            return None
        hit = match_store(store, stores)
        if hit["alternatives"]:
            return {
                "ok": False,
                "error": "Hay varias tiendas con ese nombre.",
                "store_alternatives": hit["alternatives"],
            }
        if not hit["store_id"]:
            return {"ok": False, "error": f"No encuentro la tienda {store!r}."}
        return {"store_id": hit["store_id"]}

    async def async_list_pending(
        self,
        store: str | None = None,
        share_id: str | None = None,
    ) -> dict[str, Any]:
        share = self._pick_target_share(share_id)
        if not share:
            return {"ok": False, "error": "No hay ninguna lista disponible todavía."}
        snap = share.get("snapshot") or self._empty_snap()
        catalog = self._flat_catalog()
        gate = self._require_store(store, self._stores_index(snap, catalog))
        if gate and not gate.get("store_id"):
            return gate
        rows = self._pending_rows(snap, catalog, gate["store_id"] if gate else None)
        pending = [
            {
                "store": row["store"],
                "store_id": row["store_id"],
                "product": row["name"],
                "qty": row["item"].get("qty", 1),
                "unit": row["item"].get("unit", "unidad"),
                "note": row["item"].get("note") or "",
                "url": row["item"].get("url") or "",
            }
            for row in rows
        ]
        return {"ok": True, "share_id": share["id"], "count": len(pending), "pending": pending}

    def _pick_pending(
        self,
        name: str,
        snap: dict,
        catalog: dict,
        store: str | None,
    ) -> dict[str, Any]:
        return self._pick_line(name, snap, catalog, store, done=False)

    async def async_mark_done(
        self,
        name: str,
        store: str | None = None,
        share_id: str | None = None,
    ) -> dict[str, Any]:
        share = self._pick_target_share(share_id)
        if not share:
            return {"ok": False, "error": "No hay ninguna lista disponible todavía."}
        snap = share.get("snapshot") or self._empty_snap()
        picked = self._pick_pending(name, snap, self._flat_catalog(), store)
        if not picked.get("ok"):
            return picked
        row = picked["row"]
        now = _now_ms()
        row["item"]["done"] = True
        row["item"]["doneAt"] = now
        row["list"]["updatedAt"] = now
        snap["updatedAt"] = now
        share["snapshot"] = snap
        share["updatedAt"] = now
        await self._async_save()
        return {
            "ok": True,
            "share_id": share["id"],
            "product": row["name"],
            "store": row["store"],
        }

    async def async_set_note(
        self,
        name: str,
        note: str = "",
        store: str | None = None,
        share_id: str | None = None,
    ) -> dict[str, Any]:
        share = self._pick_target_share(share_id)
        if not share:
            return {"ok": False, "error": "No hay ninguna lista disponible todavía."}
        snap = share.get("snapshot") or self._empty_snap()
        picked = self._pick_pending(name, snap, self._flat_catalog(), store)
        if not picked.get("ok"):
            return picked
        row = picked["row"]
        clean = (note or "").strip()
        current = row["item"].get("note") or ""
        if current == clean:
            return {
                "ok": True,
                "share_id": share["id"],
                "product": row["name"],
                "store": row["store"],
                "note": clean,
                "unchanged": True,
            }
        if clean:
            row["item"]["note"] = clean
        else:
            row["item"].pop("note", None)
        now = _now_ms()
        row["list"]["updatedAt"] = now
        snap["updatedAt"] = now
        share["snapshot"] = snap
        share["updatedAt"] = now
        await self._async_save()
        return {
            "ok": True,
            "share_id": share["id"],
            "product": row["name"],
            "store": row["store"],
            "note": clean,
        }

    async def async_remove_item(
        self,
        name: str,
        store: str | None = None,
        share_id: str | None = None,
    ) -> dict[str, Any]:
        """Borra una sola línea. Primero la pendiente; si no hay, la comprada."""
        share = self._pick_target_share(share_id)
        if not share:
            return {"ok": False, "error": "No hay ninguna lista disponible todavía."}
        snap = share.get("snapshot") or self._empty_snap()
        catalog = self._flat_catalog()
        picked = self._pick_line(name, snap, catalog, store, done=False)
        if not picked.get("ok") and not picked.get("ambiguous") and not picked.get("store_alternatives"):
            picked = self._pick_line(name, snap, catalog, store, done=True)
        if not picked.get("ok"):
            return picked
        row = picked["row"]
        row["list"]["items"] = [
            item for item in row["list"].get("items") or [] if item.get("id") != row["item"].get("id")
        ]
        row["list"]["updatedAt"] = _now_ms()
        await self._save_share(share, snap)
        return {
            "ok": True,
            "share_id": share["id"],
            "product": row["name"],
            "store": row["store"],
            "removed": True,
        }

    async def async_set_qty(
        self,
        name: str,
        quantity: float | None = None,
        delta: float | None = None,
        unit: str | None = None,
        store: str | None = None,
        share_id: str | None = None,
    ) -> dict[str, Any]:
        """Fija la cantidad de un pendiente, o suma un incremento. No baja de 0.1."""
        if quantity is not None and delta is not None:
            return {"ok": False, "error": "Indica la cantidad o el incremento, no los dos."}
        if quantity is None and delta is None and not unit:
            return {"ok": False, "error": "Indica cantidad, incremento o unidad."}
        if unit and unit not in UNITS:
            return {"ok": False, "error": f"Unidad no válida: {unit}.", "units": sorted(UNITS)}
        share = self._pick_target_share(share_id)
        if not share:
            return {"ok": False, "error": "No hay ninguna lista disponible todavía."}
        snap = share.get("snapshot") or self._empty_snap()
        picked = self._pick_line(name, snap, self._flat_catalog(), store, done=False)
        if not picked.get("ok"):
            return picked
        row = picked["row"]
        item = row["item"]
        previous = float(item.get("qty") or 1)
        if quantity is not None or delta is not None:
            new_qty = float(quantity) if quantity is not None else previous + float(delta)
            if new_qty <= 0:
                return {
                    "ok": False,
                    "error": "La cantidad quedaría en cero. Para quitarla de la lista, bórrala.",
                    "product": row["name"],
                    "store": row["store"],
                    "qty": previous,
                }
            item["qty"] = _round_qty(new_qty)
        if unit:
            item["unit"] = unit
        row["list"]["updatedAt"] = _now_ms()
        await self._save_share(share, snap)
        return {
            "ok": True,
            "share_id": share["id"],
            "product": row["name"],
            "store": row["store"],
            "qty": item.get("qty", previous),
            "previous_qty": previous,
            "unit": item.get("unit") or "unidad",
        }

    async def async_mark_pending(
        self,
        name: str,
        store: str | None = None,
        share_id: str | None = None,
    ) -> dict[str, Any]:
        """Devuelve a pendiente un producto marcado como comprado."""
        share = self._pick_target_share(share_id)
        if not share:
            return {"ok": False, "error": "No hay ninguna lista disponible todavía."}
        snap = share.get("snapshot") or self._empty_snap()
        picked = self._pick_line(name, snap, self._flat_catalog(), store, done=True)
        if not picked.get("ok"):
            return picked
        row = picked["row"]
        row["item"]["done"] = False
        row["item"].pop("doneAt", None)
        row["list"]["updatedAt"] = _now_ms()
        await self._save_share(share, snap)
        return {
            "ok": True,
            "share_id": share["id"],
            "product": row["name"],
            "store": row["store"],
            "done": False,
        }

    async def async_move_item(
        self,
        name: str,
        to_store: str,
        store: str | None = None,
        share_id: str | None = None,
    ) -> dict[str, Any]:
        """Mueve un pendiente a otra tienda. Conserva cantidad, unidad y nota."""
        share = self._pick_target_share(share_id)
        if not share:
            return {"ok": False, "error": "No hay ninguna lista disponible todavía."}
        snap = share.get("snapshot") or self._empty_snap()
        catalog = self._flat_catalog()
        stores = self._stores_index(snap, catalog)
        dest = match_store(to_store, stores)
        if dest["alternatives"]:
            return {
                "ok": False,
                "error": "Hay varias tiendas con ese nombre.",
                "store_alternatives": dest["alternatives"],
            }
        if not dest["store_id"]:
            return {"ok": False, "error": f"No encuentro la tienda {to_store!r}."}
        picked = self._pick_line(name, snap, catalog, store, done=False)
        if not picked.get("ok"):
            return picked
        row = picked["row"]
        dest_id = dest["store_id"]
        if row["store_id"] == dest_id:
            return {
                "ok": True,
                "unchanged": True,
                "share_id": share["id"],
                "product": row["name"],
                "store": row["store"],
                "from_store": row["store"],
            }
        row["list"]["items"] = [
            item for item in row["list"].get("items") or [] if item.get("id") != row["item"].get("id")
        ]
        now = _now_ms()
        row["list"]["updatedAt"] = now
        lists = snap.setdefault("lists", {})
        target = lists.setdefault(dest_id, {"storeId": dest_id, "items": [], "updatedAt": 0})
        target.setdefault("items", []).append(row["item"])
        target["updatedAt"] = now
        await self._save_share(share, snap)
        dest_name = stores.get(dest_id, {}).get("name", dest_id)
        return {
            "ok": True,
            "share_id": share["id"],
            "product": row["name"],
            "store": dest_name,
            "from_store": row["store"],
        }

    async def async_clear_done(
        self,
        store: str | None = None,
        share_id: str | None = None,
        confirm: bool = False,
    ) -> dict[str, Any]:
        """Quita las líneas compradas. Sin confirm solo dice cuáles borraría."""
        share = self._pick_target_share(share_id)
        if not share:
            return {"ok": False, "error": "No hay ninguna lista disponible todavía."}
        snap = share.get("snapshot") or self._empty_snap()
        catalog = self._flat_catalog()
        gate = self._require_store(store, self._stores_index(snap, catalog))
        if gate and not gate.get("store_id"):
            return gate
        rows = self._item_rows(snap, catalog, gate["store_id"] if gate else None, done=True)
        items = [
            {
                "product": row["name"],
                "store": row["store"],
                "qty": row["item"].get("qty", 1),
                "unit": row["item"].get("unit", "unidad"),
            }
            for row in rows
        ]
        if not confirm:
            return {
                "ok": True,
                "dry_run": True,
                "share_id": share["id"],
                "count": len(items),
                "items": items,
            }
        drop = {row["item"].get("id") for row in rows}
        now = _now_ms()
        for lst in (snap.get("lists") or {}).values():
            before = lst.get("items") or []
            kept = [item for item in before if item.get("id") not in drop]
            if len(kept) != len(before):
                lst["items"] = kept
                lst["updatedAt"] = now
        await self._save_share(share, snap)
        return {
            "ok": True,
            "dry_run": False,
            "share_id": share["id"],
            "removed": len(items),
            "items": items,
        }

    async def async_set_url(
        self,
        name: str,
        url: str = "",
        store: str | None = None,
        share_id: str | None = None,
    ) -> dict[str, Any]:
        """Pone o borra el enlace de un pendiente. Solo en tienda online."""
        share = self._pick_target_share(share_id)
        if not share:
            return {"ok": False, "error": "No hay ninguna lista disponible todavía."}
        normalized = _normalize_product_url(url)
        if normalized is None:
            return {"ok": False, "error": "El enlace tiene que ser http o https."}
        snap = share.get("snapshot") or self._empty_snap()
        catalog = self._flat_catalog()
        picked = self._pick_line(name, snap, catalog, store, done=False)
        if not picked.get("ok"):
            return picked
        row = picked["row"]
        meta = self._stores_index(snap, catalog).get(row["store_id"], {})
        if normalized and not meta.get("online"):
            return {
                "ok": False,
                "error": f"{row['store']} no es una tienda online. El enlace solo se guarda ahí.",
                "product": row["name"],
                "store": row["store"],
            }
        if normalized:
            row["item"]["url"] = normalized
        else:
            row["item"].pop("url", None)
        row["list"]["updatedAt"] = _now_ms()
        await self._save_share(share, snap)
        return {
            "ok": True,
            "share_id": share["id"],
            "product": row["name"],
            "store": row["store"],
            "url": normalized,
        }
