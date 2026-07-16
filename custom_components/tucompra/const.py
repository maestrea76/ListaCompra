"""Constantes de la integración Tu Compra."""

DOMAIN = "tucompra"

# Ruta del panel en la barra lateral de HA (https://tu-ha/tucompra).
PANEL_URL_PATH = "tucompra"
PANEL_TITLE = "Tu Compra"
PANEL_ICON = "mdi:cart-outline"

# Prefijo bajo el que servimos los estáticos (wrapper + build de la SPA).
STATIC_PATH = "/tucompra_static"

# Almacenamiento persistente en .storage/tucompra
STORAGE_KEY = "tucompra"
STORAGE_VERSION = 1

# Clave en hass.data: ¿está activada la búsqueda de productos por código de
# barras (Open Food Facts)? Apagada salvo que se ponga en configuration.yaml.
LOOKUP_ENABLED = "tucompra_lookup_enabled"
