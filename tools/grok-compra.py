#!/usr/bin/env python3
"""Bot de Grok para la lista de Tu Compra.

Pide la URL de Home Assistant y el token al arrancar. No escribe el token
en disco. La clave de xAI se lee de XAI_API_KEY. Si no está, también se pide
y no se guarda.

  python3 tools/grok-compra.py

Hace falta Tu Compra 0.3.58 o posterior, con los servicios add_item,
list_pending, mark_done y set_note.
"""
from __future__ import annotations

import json
import os
import sys
import urllib.error
import urllib.request
from getpass import getpass

MODEL = os.environ.get("GROK_MODEL", "grok-4")
XAI_URL = "https://api.x.ai/v1/chat/completions"

SYSTEM = """Eres quien lleva la lista de la compra de la casa, dentro de Tu Compra en Home Assistant.
Hablas en el idioma de la persona, con frases cortas.
Solo cambias la lista con las herramientas. No inventes un producto, una tienda ni una nota que la herramienta no haya devuelto.
Si la respuesta trae alternatives o store_alternatives, pregunta cuál de esos nombres quiere y no des nada por añadido.
Si ok es false, di el error.
Cuando añadas algo, di el product_name que casó y la tienda (store). Si ambiguous es true, di también las alternativas.
Cuando listen pendientes, resume tienda, cantidad, unidad y nota. Si no hay nada, dilo.
Una nota vacía en set_note borra la nota."""

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "add_item",
            "description": "Añade un producto a la lista. La tienda se deduce sola si no se dice.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Nombre del producto, con las palabras de la persona."},
                    "quantity": {"type": "number", "description": "Cantidad. Por defecto 1."},
                    "unit": {"type": "string", "description": "unidad, kg, g, l, ml, paquete, docena o caja."},
                    "store": {"type": "string", "description": "Nombre de la tienda, por ejemplo Amazon."},
                    "note": {"type": "string", "description": "Nota solo de esta compra."},
                },
                "required": ["name"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_pending",
            "description": "Lista lo que falta por comprar.",
            "parameters": {
                "type": "object",
                "properties": {
                    "store": {"type": "string", "description": "Si se indica, solo esa tienda."},
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "mark_done",
            "description": "Marca como comprado un pendiente.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "store": {"type": "string"},
                },
                "required": ["name"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "set_note",
            "description": "Pone o borra la nota de un pendiente. Nota vacía la borra.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "note": {"type": "string"},
                    "store": {"type": "string"},
                },
                "required": ["name", "note"],
            },
        },
    },
]


def ask(label: str, secret: bool = False, default: str = "") -> str:
    prompt = f"{label}"
    if default:
        prompt += f" [{default}]"
    prompt += ": "
    while True:
        value = getpass(prompt) if secret else input(prompt)
        value = value.strip() or default
        if value:
            return value
        print("Hace falta un valor.")


def ha_call(base: str, token: str, service: str, data: dict) -> dict:
    url = f"{base}/api/services/tucompra/{service}?return_response"
    body = json.dumps(data or {}).encode()
    req = urllib.request.Request(
        url,
        data=body,
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
            raise SystemExit("Home Assistant ha rechazado el token. Arranca otra vez con uno nuevo.")
        return {"ok": False, "error": f"HTTP {err.code}: {detail}"}
    except urllib.error.URLError as err:
        return {"ok": False, "error": f"No llego a Home Assistant: {err.reason}"}
    if isinstance(payload, dict) and "service_response" in payload:
        return payload["service_response"]
    return payload


def grok(api_key: str, messages: list[dict]) -> dict:
    body = json.dumps(
        {"model": MODEL, "messages": messages, "tools": TOOLS, "tool_choice": "auto"},
        ensure_ascii=False,
    ).encode()
    req = urllib.request.Request(
        XAI_URL,
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return json.loads(resp.read().decode())
    except urllib.error.HTTPError as err:
        detail = err.read().decode(errors="replace")[:800]
        raise SystemExit(f"xAI ha respondido {err.code}: {detail}") from err


def tool_args(call: dict) -> dict:
    raw = (call.get("function") or {}).get("arguments") or "{}"
    if isinstance(raw, dict):
        return raw
    try:
        parsed = json.loads(raw)
    except json.JSONDecodeError:
        return {}
    return parsed if isinstance(parsed, dict) else {}


def main() -> None:
    print("Tu Compra con Grok. El token no se guarda.")
    base = ask("URL de Home Assistant", default="http://homeassistant.local:8123").rstrip("/")
    token = ask("Token de Home Assistant", secret=True)
    api_key = os.environ.get("XAI_API_KEY", "").strip()
    if not api_key:
        api_key = ask("Clave de xAI (XAI_API_KEY)", secret=True)

    messages: list[dict] = [{"role": "system", "content": SYSTEM}]
    print("Listo. Escribe la compra. salir termina.")
    while True:
        try:
            line = input("\nTú: ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            return
        if not line:
            continue
        if line.lower() in {"salir", "exit", "quit"}:
            return
        messages.append({"role": "user", "content": line})
        for _ in range(6):
            data = grok(api_key, messages)
            choice = (data.get("choices") or [{}])[0]
            message = choice.get("message") or {}
            messages.append(message)
            calls = message.get("tool_calls") or []
            if not calls:
                text = (message.get("content") or "").strip()
                print(f"\nGrok: {text or '(sin respuesta)'}")
                break
            for call in calls:
                name = (call.get("function") or {}).get("name")
                args = tool_args(call)
                if name not in {"add_item", "list_pending", "mark_done", "set_note"}:
                    result = {"ok": False, "error": f"Herramienta desconocida: {name}"}
                else:
                    result = ha_call(base, token, name, args)
                messages.append({
                    "role": "tool",
                    "tool_call_id": call.get("id"),
                    "name": name,
                    "content": json.dumps(result, ensure_ascii=False),
                })
        else:
            print("\nGrok: he parado para no encadenar más llamadas.")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
