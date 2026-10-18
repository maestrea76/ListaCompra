#!/usr/bin/env python3
"""Cliente de Tu Compra para un Bot de la app Grok Bot.

No llama a la API de xAI. El Bot ya es Grok. Este archivo solo habla con
Home Assistant. La URL y el token llegan por el entorno, nunca por argumentos:

  TUCOMPRA_URL    https://tu-casa.ui.nabu.casa
  TUCOMPRA_TOKEN  token de larga duración del usuario de HA

  python3 tucompra.py pending
  python3 tucompra.py find "tomate fresco"
  python3 tucompra.py add leche --qty 2 --unit l --store Amazon --note semi
  python3 tucompra.py done leche --store Amazon
  python3 tucompra.py note leche "que sea semi"
  python3 tucompra.py note leche ""          # borra la nota
  python3 tucompra.py remove leche
  python3 tucompra.py qty leche --set 2 --unit l
  python3 tucompra.py qty leche --delta 1
  python3 tucompra.py undo leche
  python3 tucompra.py move leche --to Eroski
  python3 tucompra.py clear                  # solo lista los comprados
  python3 tucompra.py clear --yes            # los borra, tras confirmación
  python3 tucompra.py link aceite "https://www.amazon.es/dp/B00"
  python3 tucompra.py link aceite ""         # borra el enlace
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
    "find": "find_products",
    "pending": "list_pending",
    "done": "mark_done",
    "note": "set_note",
    "remove": "remove_item",
    "qty": "set_qty",
    "undo": "mark_pending",
    "move": "move_item",
    "clear": "clear_done",
    "link": "set_url",
}

# Estos comandos no llevan nombre de producto.
NAMELESS = {"pending", "clear"}


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

    find = sub.add_parser("find", help="Busca un producto que ya exista.")
    find.add_argument("name")

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

    remove = sub.add_parser("remove", help="Borra una sola línea. No vacía la lista.")
    remove.add_argument("name")
    remove.add_argument("--store", default="")

    qty = sub.add_parser("qty", help="Fija la cantidad o suma un incremento.")
    qty.add_argument("name")
    how = qty.add_mutually_exclusive_group()
    how.add_argument("--set", type=float, default=None)
    how.add_argument("--delta", type=float, default=None)
    qty.add_argument("--unit", default="")
    qty.add_argument("--store", default="")

    undo = sub.add_parser("undo", help="Devuelve un comprado a pendiente.")
    undo.add_argument("name")
    undo.add_argument("--store", default="")

    move = sub.add_parser("move", help="Mueve un pendiente a otra tienda.")
    move.add_argument("name")
    move.add_argument("--to", required=True)
    move.add_argument("--store", default="")

    clear = sub.add_parser("clear", help="Limpia comprados. Sin --yes solo los lista.")
    clear.add_argument("--store", default="")
    clear.add_argument("--yes", action="store_true")

    link = sub.add_parser("link", help="Pone o borra el enlace. URL vacía lo borra.")
    link.add_argument("name")
    link.add_argument("url", nargs="?", default=None)
    link.add_argument("--store", default="")
    return p


def payload(args: argparse.Namespace) -> dict:
    data: dict = {}
    if args.cmd not in NAMELESS:
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
    elif args.cmd == "note":
        data["note"] = args.text
    elif args.cmd == "qty":
        if args.set is not None:
            data["quantity"] = args.set
        if args.delta is not None:
            data["delta"] = args.delta
        if args.unit:
            data["unit"] = args.unit
    elif args.cmd == "move":
        data["to_store"] = args.to
    elif args.cmd == "clear":
        data["confirm"] = bool(args.yes)
    elif args.cmd == "link":
        data["url"] = args.url
    return data


def main() -> None:
    args = parser().parse_args()
    base = os.environ.get("TUCOMPRA_URL", "").strip().rstrip("/")
    token = os.environ.get("TUCOMPRA_TOKEN", "").strip()
    if args.cmd == "qty" and args.set is None and args.delta is None and not args.unit:
        fail("Indica --set, --delta o --unit.")
    if args.cmd == "link" and args.url is None:
        fail('Falta la URL. Una URL vacía ("") borra el enlace.')
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
