#!/usr/bin/env python3
"""Cliente de Tu Compra para un Bot de la app Grok Bot.

No llama a la API de xAI. El Bot ya es Grok. Este archivo solo habla con
Home Assistant. La URL y el token llegan por el entorno, nunca por argumentos:

  TUCOMPRA_URL    https://tu-casa.ui.nabu.casa
  TUCOMPRA_TOKEN  token de larga duración del usuario de HA

  python3 tucompra.py pending
  python3 tucompra.py add leche --qty 2 --unit l --store Amazon --note semi
  python3 tucompra.py done leche --store Amazon
  python3 tucompra.py note leche "que sea semi"
  python3 tucompra.py note leche ""          # borra la nota
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import urllib.error
import urllib.request

SERVICES = {
    "add": "add_item",
    "pending": "list_pending",
    "done": "mark_done",
    "note": "set_note",
}


def fail(message: str, code: int = 1) -> None:
    print(json.dumps({"ok": False, "error": message}, ensure_ascii=False))
    raise SystemExit(code)


def ha_call(base: str, token: str, service: str, data: dict) -> dict:
    url = f"{base}/api/services/tucompra/{service}?return_response"
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode(),
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            payload = json.loads(resp.read().decode())
    except urllib.error.HTTPError as err:
        detail = err.read().decode(errors="replace")[:500]
        if err.code == 401:
            fail("Home Assistant ha rechazado el token. Crea otro en Perfil → Seguridad.")
        return {"ok": False, "error": f"HTTP {err.code}: {detail}"}
    except urllib.error.URLError as err:
        return {"ok": False, "error": f"No llego a Home Assistant: {err.reason}"}
    if isinstance(payload, dict) and "service_response" in payload:
        inner = payload["service_response"]
        return inner if isinstance(inner, dict) else {"ok": True, "result": inner}
    return payload if isinstance(payload, dict) else {"ok": True, "result": payload}


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description="Lista de Tu Compra en Home Assistant.")
    sub = p.add_subparsers(dest="cmd", required=True)

    add = sub.add_parser("add", help="Añade un producto.")
    add.add_argument("name")
    add.add_argument("--qty", type=float, default=1)
    add.add_argument("--unit", default="")
    add.add_argument("--store", default="")
    add.add_argument("--note", default="")

    pending = sub.add_parser("pending", help="Lista lo que falta.")
    pending.add_argument("--store", default="")

    done = sub.add_parser("done", help="Marca un pendiente como comprado.")
    done.add_argument("name")
    done.add_argument("--store", default="")

    note = sub.add_parser("note", help="Pone o borra la nota. Nota vacía la borra.")
    note.add_argument("name")
    note.add_argument("text", nargs="?", default="")
    note.add_argument("--store", default="")
    return p


def payload(args: argparse.Namespace) -> dict:
    data: dict = {}
    if args.cmd != "pending":
        data["name"] = args.name
    store = getattr(args, "store", "")
    if store:
        data["store"] = store
    if args.cmd == "add":
        data["quantity"] = args.qty
        if args.unit:
            data["unit"] = args.unit
        if args.note:
            data["note"] = args.note
    if args.cmd == "note":
        data["note"] = args.text
    return data


def main() -> None:
    args = parser().parse_args()
    base = os.environ.get("TUCOMPRA_URL", "").strip().rstrip("/")
    token = os.environ.get("TUCOMPRA_TOKEN", "").strip()
    if not base or not token:
        fail(
            "Faltan los secretos TUCOMPRA_URL y TUCOMPRA_TOKEN. "
            "Añádelos en el Bot y lanza el comando referenciándolos por nombre, "
            "sin escribir el valor."
        )
    result = ha_call(base, token, SERVICES[args.cmd], payload(args))
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if isinstance(result, dict) and result.get("ok") is False:
        raise SystemExit(2)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
