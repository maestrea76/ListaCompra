"""Puente con la lista de la compra de Google (Google Keep) vía gkeepapi.

Flujo: cada N segundos leemos los ítems NO tachados de la lista de Keep,
los damos de alta en Tu Compra con `add_item` (que enruta a su tienda) y luego
los BORRAMOS de Keep. Así "Ok Google, añade papel higiénico a la lista de la
compra" acaba clasificado en la tienda correcta de Tu Compra.

gkeepapi es una librería NO oficial y bloqueante: todas las llamadas a Google
se ejecutan en un executor para no bloquear el event loop de HA. El token
maestro lo aporta el usuario en los secretos de HA; aquí solo se lee.
"""
from __future__ import annotations

import logging
from typing import Any

_LOGGER = logging.getLogger(__name__)

# Títulos habituales de la lista de la compra del Assistant, por si el usuario
# no especifica `list_name`.
_SHOPPING_TITLES = {"shopping list", "lista de la compra", "la compra", "compra"}


class KeepBridge:
    def __init__(self, hass, store, conf: dict[str, Any]) -> None:
        self.hass = hass
        self.store = store
        self._email = conf["email"]
        self._token = conf["master_token"]
        self._list_name = conf.get("list_name")
        self._share_id = conf.get("share_id")
        self._keep = None  # instancia gkeepapi.Keep cacheada (login caro)

    # ── Trabajo bloqueante (se ejecuta en executor) ─────────────────────
    def _ensure_login(self):
        if self._keep is not None:
            return self._keep
        import gkeepapi  # import perezoso: solo si el puente está activo

        keep = gkeepapi.Keep()
        # `resume` es la vía con token maestro; algunas versiones usan otro nombre.
        try:
            keep.resume(self._email, self._token)
        except AttributeError:  # pragma: no cover
            keep.authenticate(self._email, self._token)
        self._keep = keep
        return keep

    def _find_list(self, keep):
        import gkeepapi

        lists = [n for n in keep.all() if isinstance(n, gkeepapi.node.List)]
        if not lists:
            return None
        if self._list_name:
            for n in lists:
                if (n.title or "").strip().lower() == self._list_name.strip().lower():
                    return n
            return None  # nombre explícito no encontrado → nada que importar
        # Sin nombre: buscamos por títulos típicos de "lista de la compra".
        for n in lists:
            if (n.title or "").strip().lower() in _SHOPPING_TITLES:
                return n
        return lists[0]  # último recurso: la primera lista

    def _fetch_unchecked(self) -> list[tuple[str, str]]:
        keep = self._ensure_login()
        keep.sync()
        target = self._find_list(keep)
        if target is None:
            return []
        return [
            (it.id, it.text.strip())
            for it in target.items
            if not it.checked and it.text and it.text.strip()
        ]

    def _delete(self, ids: list[str]) -> None:
        keep = self._ensure_login()
        idset = set(ids)
        target = self._find_list(keep)
        if target is None:
            return
        for it in list(target.items):
            if it.id in idset:
                it.delete()
        keep.sync()

    # ── Orquestación (async) ────────────────────────────────────────────
    async def async_poll(self, _now=None) -> None:
        try:
            items = await self.hass.async_add_executor_job(self._fetch_unchecked)
        except Exception as err:  # noqa: BLE001 — la lib puede lanzar de todo
            _LOGGER.warning("Tu Compra/Keep: fallo al leer la lista (%s)", err)
            self._keep = None  # fuerza re-login en el próximo ciclo
            return

        added_ids: list[str] = []
        for node_id, text in items:
            res = await self.store.async_add_named_item(name=text, share_id=self._share_id)
            if res.get("ok"):
                added_ids.append(node_id)

        if not added_ids:
            return
        try:
            await self.hass.async_add_executor_job(self._delete, added_ids)
        except Exception as err:  # noqa: BLE001
            _LOGGER.warning("Tu Compra/Keep: importados pero no borrados de Keep (%s)", err)
        _LOGGER.info("Tu Compra/Keep: %d producto(s) importado(s) de Google", len(added_ids))
