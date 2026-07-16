"""Enrutado de productos por nombre → tienda (para el servicio add_item).

Replica la búsqueda difusa del frontend (sin acentos, por subsecuencia) y usa
el catálogo exportado (catalog.json) + los datos personalizados del snapshot
(customProducts, customStores, defaultStores) para decidir a qué tienda va un
producto dictado por voz. Si no se puede clasificar, va a la bandeja "inbox".
"""
from __future__ import annotations

import json
import unicodedata
from pathlib import Path
from typing import Any

INBOX_STORE_ID = "inbox"


def load_catalog(path: Path) -> dict[str, Any]:
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"products": [], "categories": [], "storeTypes": [], "stores": []}


def _norm(s: str) -> str:
    """minúsculas + sin acentos/diacríticos."""
    s = unicodedata.normalize("NFD", (s or "").lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def _is_subsequence(needle: str, hay: str) -> bool:
    it = iter(hay)
    return all(ch in it for ch in needle)


def _score(name_n: str, q: str) -> int:
    """Igual que scoreMatch del frontend: 4 empieza · 3 contiene · 2 todas las
    palabras · 1 subsecuencia · -1 no casa."""
    if name_n.startswith(q):
        return 4
    if q in name_n:
        return 3
    words = [w for w in q.split() if w]
    if len(words) > 1 and all(w in name_n for w in words):
        return 2
    if _is_subsequence(q.replace(" ", ""), name_n):
        return 1
    return -1


def match_product(name: str, products: list[dict]) -> dict | None:
    q = _norm(name).strip()
    if not q:
        return None
    best: dict | None = None
    best_score = 0
    for p in products:
        sc = _score(_norm(p.get("name", "")), q)
        if sc > best_score:
            best_score, best = sc, p
    return best


def resolve(name: str, snapshot: dict | None, catalog: dict) -> dict[str, Any]:
    """Devuelve {product, type_id, store_id}. store_id None → va a inbox."""
    snapshot = snapshot or {}
    products = list(catalog.get("products", [])) + list(snapshot.get("customProducts", []))
    product = match_product(name, products)

    cat_type = {c["id"]: c["typeId"] for c in catalog.get("categories", [])}
    stores = {s["id"]: s for s in catalog.get("stores", [])}
    for s in snapshot.get("customStores", []):
        stores[s["id"]] = s  # los custom (incl. seed editadas) mandan
    default_stores = snapshot.get("defaultStores", {}) or {}

    type_id = cat_type.get(product.get("categoryId")) if product else None

    store_id: str | None = None

    # Producto exclusivo de una tienda (marca propia): manda sobre el tipo.
    exclusive = product.get("storeId") if product else None
    if exclusive and exclusive in stores and stores[exclusive].get("enabled", True) is not False:
        return {"product": product, "type_id": type_id, "store_id": exclusive}

    if type_id:
        explicit = default_stores.get(type_id)
        if explicit and explicit in stores and stores[explicit].get("enabled", True) is not False:
            store_id = explicit
        else:
            of_type = [
                s for s in stores.values()
                if s.get("typeId") == type_id and s.get("enabled", True) is not False
            ]
            if len(of_type) == 1:
                store_id = of_type[0]["id"]

    return {"product": product, "type_id": type_id, "store_id": store_id}
