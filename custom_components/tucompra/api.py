"""Vistas HTTP autenticadas de Tu Compra.

Todas exigen `requires_auth = True`, así que HA valida el token del usuario
logueado (el mismo que usa tu proxy/dominio) y rellena `request["hass_user"]`.
La identidad es, por tanto, el usuario de HA — sin login ni passphrase propios.

Endpoints:
  GET    /api/tucompra/me                → identidad + person. del usuario
  GET    /api/tucompra/shares            → shares a los que pertenece
  POST   /api/tucompra/shares            → crear share compartida        (admin)
  PUT    /api/tucompra/shares/{id}       → renombrar / cambiar miembros   (admin)
  DELETE /api/tucompra/shares/{id}       → borrar share                   (admin)
  GET    /api/tucompra/state?share=<id>  → snapshot de un share (miembro)
  POST   /api/tucompra/state?share=<id>  → guardar snapshot     (miembro)
  GET    /api/tucompra/users             → usuarios HA + person.          (admin)
"""
from __future__ import annotations

from typing import Any

from homeassistant.components.http import HomeAssistantView
from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN
from .store import TuCompraStore


def _store(hass: HomeAssistant) -> TuCompraStore:
    return hass.data[DOMAIN]


def _person_for_user(hass: HomeAssistant, user_id: str) -> dict[str, Any] | None:
    """Mapea un usuario de HA a su entidad person.* (para nombre y foto)."""
    for state in hass.states.async_all("person"):
        if state.attributes.get("user_id") == user_id:
            return {
                "entity_id": state.entity_id,
                "name": state.attributes.get("friendly_name", state.name),
                "picture": state.attributes.get("entity_picture"),
            }
    return None


@callback
def async_register_views(hass: HomeAssistant) -> None:
    hass.http.register_view(MeView())
    hass.http.register_view(SharesView())
    hass.http.register_view(ShareDetailView())
    hass.http.register_view(StateView())
    hass.http.register_view(UsersView())


class MeView(HomeAssistantView):
    url = "/api/tucompra/me"
    name = "api:tucompra:me"
    requires_auth = True

    async def get(self, request):
        hass = request.app["hass"]
        user = request["hass_user"]
        store = _store(hass)
        await store.async_ensure_personal(user.id)
        return self.json(
            {
                "user_id": user.id,
                "name": user.name,
                "is_admin": user.is_admin,
                "person": _person_for_user(hass, user.id),
            }
        )


class SharesView(HomeAssistantView):
    url = "/api/tucompra/shares"
    name = "api:tucompra:shares"
    requires_auth = True

    async def get(self, request):
        hass = request.app["hass"]
        user = request["hass_user"]
        store = _store(hass)
        await store.async_ensure_personal(user.id)
        shares = [
            {
                "id": s["id"],
                "name": s["name"],
                "owner": s["owner"],
                "members": s["members"],
                "updatedAt": s.get("updatedAt", 0),
            }
            for s in store.shares_for(user.id)
        ]
        return self.json({"shares": shares})

    async def post(self, request):
        hass = request.app["hass"]
        user = request["hass_user"]
        if not user.is_admin:
            return self.json_message("Solo administradores.", status_code=403)
        body = await request.json()
        store = _store(hass)
        share = await store.async_create_share(
            body.get("name"), user.id, body.get("members", [])
        )
        return self.json(share)


class ShareDetailView(HomeAssistantView):
    url = "/api/tucompra/shares/{share_id}"
    name = "api:tucompra:share_detail"
    requires_auth = True

    async def put(self, request, share_id):
        hass = request.app["hass"]
        user = request["hass_user"]
        if not user.is_admin:
            return self.json_message("Solo administradores.", status_code=403)
        body = await request.json()
        store = _store(hass)
        share = await store.async_update_share(
            share_id, name=body.get("name"), members=body.get("members")
        )
        if not share:
            return self.json_message("No existe.", status_code=404)
        return self.json(share)

    async def delete(self, request, share_id):
        hass = request.app["hass"]
        user = request["hass_user"]
        if not user.is_admin:
            return self.json_message("Solo administradores.", status_code=403)
        store = _store(hass)
        ok = await store.async_delete_share(share_id)
        return self.json({"deleted": ok})


class StateView(HomeAssistantView):
    url = "/api/tucompra/state"
    name = "api:tucompra:state"
    requires_auth = True

    async def get(self, request):
        hass = request.app["hass"]
        user = request["hass_user"]
        store = _store(hass)
        share_id = request.query.get("share") or store.personal_id(user.id)
        if not store.is_member(share_id, user.id):
            return self.json_message("No eres miembro de este share.", status_code=403)
        return self.json(
            {
                "share": share_id,
                "snapshot": store.get_snapshot(share_id),
                "updatedAt": store.updated_at(share_id),
            }
        )

    async def post(self, request):
        hass = request.app["hass"]
        user = request["hass_user"]
        store = _store(hass)
        body = await request.json()
        share_id = request.query.get("share") or store.personal_id(user.id)
        if not store.is_member(share_id, user.id):
            return self.json_message("No eres miembro de este share.", status_code=403)
        await store.async_set_snapshot(
            share_id, body.get("snapshot"), body.get("updatedAt")
        )
        return self.json({"ok": True, "updatedAt": store.updated_at(share_id)})


class UsersView(HomeAssistantView):
    url = "/api/tucompra/users"
    name = "api:tucompra:users"
    requires_auth = True

    async def get(self, request):
        hass = request.app["hass"]
        user = request["hass_user"]
        if not user.is_admin:
            return self.json_message("Solo administradores.", status_code=403)
        users = await hass.auth.async_get_users()
        out = []
        for candidate in users:
            if candidate.system_generated or not candidate.is_active:
                continue
            out.append(
                {
                    "user_id": candidate.id,
                    "name": candidate.name,
                    "is_admin": candidate.is_admin,
                    "person": _person_for_user(hass, candidate.id),
                }
            )
        return self.json({"users": out})
