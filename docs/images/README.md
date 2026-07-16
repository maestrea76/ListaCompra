# Capturas para el README

Deja aquí los PNG con **exactamente** estos nombres (el README principal los
referencia por URL absoluta de raw.githubusercontent.com, porque HACS renderiza
el README fuera del repo y las rutas relativas no le funcionan):

| Fichero | Pantalla |
|---|---|
| `stores.png` | Portada: rejilla de tiendas, con varias mostrando contador de pendientes |
| `list.png` | Dentro de una tienda: lista con productos, alguno tachado, alguno con foto |
| `scan.png` | Escáner de código de barras enfocando un producto |
| `loyalty.png` | Tarjeta de fidelización mostrando el código |
| `sidebar.png` | HA con "Tu Compra" en la barra lateral (esta mejor de escritorio) |

Recomendaciones:

- Móvil, en vertical, desde el panel de HA (no desde la demo web): así salen
  datos reales y el aspecto auténtico.
- No hace falta redimensionar; el README las escala. Si alguna pasa de ~500 KB,
  conviene bajarla — el repo lo agradece.
- Estas imágenes **no** viajan en el zip de la release (hacs.json solo empaqueta
  `custom_components/`), así que no engordan la instalación de nadie.
- Revisa que no se cuele nada personal: nombres de otros usuarios de HA,
  direcciones, o el código de barras real de una tarjeta de fidelización que
  uses de verdad (ese es un dato sensible; para la captura, mejor una de prueba).
