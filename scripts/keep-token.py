#!/usr/bin/env python3
"""Genera el master_token de Google para el puente con Google Keep.

Se ejecuta UNA vez en tu PC (no en la máquina de HA). El token resultante es
solo una cadena que copias al secrets.yaml de Home Assistant.

──────────────────────────────────────────────────────────────────────────────
PASO PREVIO — conseguir el oauth_token (necesita navegador):
  1. Abre una ventana de incógnito y ve a:
        https://accounts.google.com/EmbeddedSetup
  2. Inicia sesión (usa idealmente una cuenta de Google secundaria/desechable
     y comparte con ella tu lista de la compra).
  3. Cuando la página se quede cargando/en blanco tras el login, abre DevTools
     (F12) → Application → Cookies → https://accounts.google.com y copia el
     valor de la cookie 'oauth_token' (empieza por 'oauth2_4/...').
     Caduca en pocos minutos: ejecuta este script enseguida.

USO:
  pip install gpsoauth
  python scripts/keep-token.py
     (o bien:  python scripts/keep-token.py --email tu@gmail.com )

El master_token resultante (empieza por 'aas_et/...') va a secrets.yaml:
  google_email: tu@gmail.com
  google_keep_token: aas_et/xxxxxxxx
──────────────────────────────────────────────────────────────────────────────
⚠️  El master_token da acceso COMPLETO a esa cuenta de Google. Trátalo como una
    contraseña: nunca lo compartas ni lo subas a git.
"""
from __future__ import annotations

import argparse
import getpass
import secrets
import sys


def main() -> int:
    parser = argparse.ArgumentParser(description="Genera el master_token de Google Keep.")
    parser.add_argument("--email", help="Correo de la cuenta de Google.")
    parser.add_argument(
        "--oauth-token",
        help="Cookie oauth_token (oauth2_4/...). Si se omite, se pide de forma oculta.",
    )
    parser.add_argument(
        "--android-id",
        help="ID de dispositivo (16 hex). Si se omite, se genera uno y se muestra "
        "para que lo guardes y reutilices si regeneras el token.",
    )
    args = parser.parse_args()

    try:
        import gpsoauth
    except ImportError:
        print("Falta la librería. Instálala con:  pip install gpsoauth", file=sys.stderr)
        return 1

    email = args.email or input("Correo de Google: ").strip()
    # El oauth_token es sensible y de un solo uso → lo pedimos oculto.
    oauth_token = args.oauth_token or getpass.getpass("oauth_token (oauth2_4/...): ").strip()
    android_id = args.android_id or secrets.token_hex(8)  # 16 hex

    if not email or not oauth_token:
        print("Necesito correo y oauth_token.", file=sys.stderr)
        return 1

    print("\nIntercambiando token con Google…")
    try:
        res = gpsoauth.exchange_token(email, oauth_token, android_id)
    except Exception as err:  # noqa: BLE001
        print(f"Error llamando a Google: {err}", file=sys.stderr)
        return 1

    token = res.get("Token")
    if not token:
        print("No se obtuvo master_token. Respuesta de Google:", file=sys.stderr)
        print(res, file=sys.stderr)
        print(
            "\nCausas típicas: el oauth_token ya caducó (repite el paso del navegador), "
            "2FA/Advanced Protection, o cuenta bloqueada.",
            file=sys.stderr,
        )
        return 1

    print("\n✅ master_token obtenido.\n")
    print("Añade a tu secrets.yaml de Home Assistant:")
    print("─" * 60)
    print(f"google_email: {email}")
    print(f"google_keep_token: {token}")
    print("─" * 60)
    if not args.android_id:
        print(f"\n(Guarda este android_id por si regeneras el token: {android_id})")
    print("\nNo compartas ni subas este token a git.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
