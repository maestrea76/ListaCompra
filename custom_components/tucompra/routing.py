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
from typing import Any, NamedTuple

INBOX_STORE_ID = "inbox"

# Idioma de catálogo por defecto. DEBE coincidir con DEFAULT_LOCALE del frontend
# (src/lib/i18n/locale.ts).
DEFAULT_LOCALE = "en"


def load_catalog(path: Path) -> dict[str, Any]:
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return {"categories": [], "locales": {}}


def resolve_locale(language: str | None, country: str | None) -> str:
    """Idioma/país de HA → locale de catálogo.

    Es un calco de resolveLocale() en src/lib/i18n/locale.ts y tiene que seguir
    siéndolo: el frontend siembra las tiendas de UN locale y la voz añade
    productos de OTRO si ambos no coinciden — el resultado sería un item cuyo
    producto la app no conoce. Ambos leen el mismo hass.config, así que mientras
    la regla sea la misma, coinciden.
    """
    lang = (language or "").lower().split("-")[0]
    cc = (country or "").upper()
    if lang == "de":
        return "de"
    if lang == "fr":
        return "fr"
    if lang == "pt":
        return "br"
    if lang == "tr":
        return "tr"
    if lang == "en":
        return "us" if cc == "US" else "en"
    # Cooficiales de España: el catálogo español es el que les sirve.
    if lang in ("es", "eu", "ca", "gl"):
        return "es"
    return DEFAULT_LOCALE


def catalog_for(
    catalog: dict[str, Any],
    language: str | None = None,
    country: str | None = None,
) -> dict[str, Any]:
    """Aplana el catálogo multi-idioma al locale de HA.

    Devuelve la forma plana que espera resolve(): {products, categories, stores}.
    """
    locales = catalog.get("locales")
    if not locales:
        # Formato antiguo (plano, solo español). No debería darse: el JSON viaja
        # en el mismo zip que este código.
        return catalog
    loc = resolve_locale(language, country)
    data = locales.get(loc) or locales.get(DEFAULT_LOCALE) or {}
    return {
        "products": data.get("products", []),
        "stores": data.get("stores", []),
        "categories": catalog.get("categories", []),
    }


def _norm(s: str) -> str:
    """minúsculas + sin acentos/diacríticos."""
    s = (s or "").lower().replace("ı", "i")
    s = unicodedata.normalize("NFD", s)
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def _is_subsequence(needle: str, hay: str) -> bool:
    it = iter(hay)
    return all(ch in it for ch in needle)


class MatchScore(NamedTuple):
    """Banda mayor gana. En la banda 1, más palabras de prefijo ganan.

    La especificidad solo es distinta de 0 en el prefijo por palabras.
    """

    band: int
    specificity: int = 0


def _word_prefix_len(name_n: str, q: str) -> int:
    """Palabras iniciales del nombre guardado que coinciden con lo dicho.

    "tomate" es prefijo de "tomate fresco". "pan" no lo es de "panceta":
    haría falta un espacio, no basta con que los caracteres empiecen igual.
    "tomate" tampoco lo es de "zumo de tomate".
    """
    stored = name_n.split()
    spoken = q.split()
    if not stored or len(stored) >= len(spoken):
        return 0
    if spoken[: len(stored)] != stored:
        return 0
    return len(stored)


def _score(name_n: str, q: str) -> MatchScore:
    """5 exacto · 4 empieza · 3 contiene · 2 todas las palabras ·
    1 prefijo por palabras · 0 subsecuencia · -1 no casa.

    El 5 existe porque sin él "pan" empataba a 4 con "panceta". El 1 existe
    para reutilizar "Tomate" cuando dicen "tomate fresco", y queda por debajo
    del 2 para no ganarle a un nombre que ya contiene todas las palabras.
    La subsecuencia pasa a 0 para no empatar con ese prefijo.
    """
    if name_n == q:
        return MatchScore(5, 0)
    if name_n.startswith(q):
        return MatchScore(4, 0)
    if q in name_n:
        return MatchScore(3, 0)
    words = [w for w in q.split() if w]
    if len(words) > 1 and all(w in name_n for w in words):
        return MatchScore(2, 0)
    prefix = _word_prefix_len(name_n, q)
    if prefix:
        return MatchScore(1, prefix)
    if _is_subsequence(q.replace(" ", ""), name_n):
        return MatchScore(0, 0)
    return MatchScore(-1, 0)


def match_product(name: str, products: list[dict]) -> dict | None:
    return (match_candidates(name, products) or [None])[0]


def match_scored(name: str, products: list[dict]) -> list[tuple[MatchScore, dict]]:
    """(puntuación, producto) de los que casan, del mejor al peor.

    A igual banda y especificidad gana el nombre MÁS CORTO. Dentro del prefijo
    por palabras gana el que cubre más palabras, así "Tomate rosa" le gana a
    "Tomate" cuando dicen "tomate rosa maduro".
    """
    q = _norm(name).strip()
    if not q:
        return []
    puntuados = [
        (sc, p)
        for p in products
        if (sc := _score(_norm(p.get("name", "")), q)).band >= 0
    ]
    puntuados.sort(
        key=lambda x: (
            -x[0].band,
            -x[0].specificity,
            len(_norm(x[1].get("name", ""))),
        )
    )
    return puntuados


def match_candidates(name: str, products: list[dict], limit: int = 5) -> list[dict]:
    return [p for _, p in match_scored(name, products)[:limit]]


def reuse_name(scored: list[tuple[MatchScore, dict]]) -> str | None:
    """Nombre que hay que reutilizar, o None si no hay uno solo.

    Un empate no elige: el bot pregunta. Sin aciertos, tampoco hay nombre.
    """
    if not scored or tied_alternatives(scored):
        return None
    return scored[0][1].get("name") or None


def tied_alternatives(scored: list[tuple[MatchScore, dict]], limit: int = 3) -> list[str]:
    """Nombres que EMPATAN con el ganador, sin él y sin repetidos.

    Solo el empate es ambigüedad de verdad. Si se devolviera cualquier otra
    coincidencia, "leche" (exacta, 5) saldría como ambigua por "Chocolate con
    leche" (3), y Assist recitaría alternativas en cada frase.
    """
    if not scored:
        return []
    mejor = scored[0][0]
    fuera = {_norm(scored[0][1].get("name", ""))}
    out: list[str] = []
    for sc, p in scored[1:]:
        if sc != mejor:
            break                       # ya vienen ordenados: el resto puntúa menos
        n = p.get("name", "")
        if _norm(n) in fuera:
            continue                    # mismo nombre en otra sección (p.ej. súper y panadería)
        fuera.add(_norm(n))
        out.append(n)
        if len(out) >= limit:
            break
    return out


def match_store(name: str, stores: dict[str, dict]) -> dict[str, Any]:
    """{store_id, alternatives}. store_id es None si no hay una sola tienda."""
    q = _norm(name).strip()
    enabled = [s for s in stores.values() if s.get("enabled", True) is not False]
    if not q:
        return {"store_id": None, "alternatives": []}
    scored: list[tuple[int, dict]] = []
    for store in enabled:
        n = _norm(store.get("name", ""))
        if n == q:
            sc = 5
        elif n.startswith(q):
            sc = 4
        elif q in n:
            sc = 3
        else:
            continue
        scored.append((sc, store))
    scored.sort(key=lambda x: (-x[0], len(_norm(x[1].get("name", "")))))
    if not scored:
        return {"store_id": None, "alternatives": []}
    best = scored[0][0]
    tied: list[dict] = []
    seen: set[str] = set()
    for sc, store in scored:
        if sc != best:
            break
        label = store.get("name", "")
        key = _norm(label)
        if key in seen:
            continue
        seen.add(key)
        tied.append(store)
    if len(tied) == 1:
        return {"store_id": tied[0]["id"], "alternatives": []}
    return {"store_id": None, "alternatives": [s.get("name", "") for s in tied[:5]]}


def resolve(
    name: str,
    snapshot: dict | None,
    catalog: dict,
    store_name: str | None = None,
) -> dict[str, Any]:
    """Devuelve {product, type_id, store_id}. store_id None → va a inbox.

    Si store_name viene informado, esa tienda manda sobre el tipo y sobre la
    tienda por defecto. Varias tiendas con el mismo acierto dejan store_id a
    None y rellenan store_alternatives.
    """
    snapshot = snapshot or {}
    products = list(catalog.get("products", [])) + list(snapshot.get("customProducts", []))
    puntuados = match_scored(name, products)
    product = puntuados[0][1] if puntuados else None
    # Solo los que EMPATAN con el ganador: esos sí son duda real. El servicio los
    # devuelve para que Assist los diga y el usuario elija sin ir a la app.
    alternativas = tied_alternatives(puntuados)

    cat_type = {c["id"]: c["typeId"] for c in catalog.get("categories", [])}
    stores = {s["id"]: s for s in catalog.get("stores", [])}
    for s in snapshot.get("customStores", []):
        stores[s["id"]] = s  # los custom (incl. seed editadas) mandan
    default_stores = snapshot.get("defaultStores", {}) or {}

    type_id = cat_type.get(product.get("categoryId")) if product else None

    if store_name:
        hit = match_store(store_name, stores)
        return {
            "product": product,
            "type_id": type_id,
            "store_id": hit["store_id"],
            "alternatives": alternativas,
            "store_alternatives": hit["alternatives"],
        }

    store_id: str | None = None

    # Producto exclusivo de una tienda (marca propia): manda sobre el tipo.
    exclusive = product.get("storeId") if product else None
    if exclusive and exclusive in stores and stores[exclusive].get("enabled", True) is not False:
        return {"product": product, "type_id": type_id, "store_id": exclusive,
                "alternatives": alternativas, "store_alternatives": []}

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

    return {"product": product, "type_id": type_id, "store_id": store_id,
            "alternatives": alternativas, "store_alternatives": []}
