"""Capa de almacenamiento de Tu Compra.

Los datos viven en `.storage/tucompra` (helper Store de HA → JSON en disco,
sobrevive reinicios y entra en los backups de HA). Sin dependencias externas.

Modelo: un diccionario de "shares" (espacios de lista). Cada share contiene el
snapshot completo de la app (listas, productos y tiendas personalizados) y la
lista de usuarios de HA que son miembros. La compartición es a nivel de cuenta
entera: entrar en un share da acceso a todo su contenido.
"""
from __future__ import annotations

import time
import uuid
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import STORAGE_KEY, STORAGE_VERSION


def _now_ms() -> int:
    return int(time.time() * 1000)


class TuCompraStore:
    """Envuelve el helper Store de HA con la lógica de shares y membresías."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._data: dict[str, Any] = {"shares": {}}

    async def async_load(self) -> dict[str, Any]:
        data = await self._store.async_load()
        if isinstance(data, dict):
            self._data = data
        self._data.setdefault("shares", {})
        return self._data

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
