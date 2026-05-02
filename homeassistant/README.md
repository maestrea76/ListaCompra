# Integración Home Assistant

Tu Compra está pensada para integrarse con HA de tres maneras complementarias:

## 1. Lectura (sensores REST)

Si activas la sincronización en la nube en Tu Compra (Ajustes → Cloud sync),
el AppState completo queda accesible vía un endpoint REST que tú decides
(Gist público, Firebase REST, función serverless, o un pequeño proxy en HA Add-on).

HA puede leerlo con `rest:` y exponer sensores por tienda — ver
[`configuration.example.yaml`](./configuration.example.yaml).

Casos de uso:
- Mostrar el número de items pendientes en una tarjeta del dashboard.
- Notificar al móvil cuando entras en el área geográfica del Eroski.
- Activar una luz roja si hay >5 items pendientes en la farmacia.

## 2. Escritura (REST commands + Assist)

Para que Google Nest / Assist puedan **añadir** productos por voz,
hay que tener la app desplegada en modo SSR (Astro con adapter Node) y
exponer el endpoint `/api/lists/:storeId/items`. La parte estática
de GitHub Pages **no soporta** este caso por sí sola.

Configuraciones recomendadas:
- **Modo completo**: Debian + nginx → Astro Node SSR → SQLite.
- **Modo híbrido**: Pages para la UI + un mini-backend (Cloudflare Workers,
  Vercel Functions, HA Add-on con FastAPI…) que recibe los POST.

## 3. Comandos de voz (Google Nest)

Frases en español que ya funcionan con la `intent_script` del ejemplo:

- "Añade chuleta a la lista de la carnicería"
- "Apunta leche en Eroski"
- "Necesito 2 kilos de patatas en el Mercadona"

Para portugués: duplica el `intent_script` con sentences en `pt.yaml`.

## Tarjeta Lovelace

Inserta este iframe en una vista del dashboard para tener la app embebida:

```yaml
type: iframe
url: https://tucompra.tu-dominio.com
aspect_ratio: 75%
```
