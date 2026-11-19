# Nativa Joyería — Landing page

Landing page de una sola página para **Nativa Joyería**, una joyería artesanal en oro 18k y plata 925. Estética editorial, orgánica y de lujo silencioso, en verdes profundos con detalles dorados.

## Cómo abrirla

Puede abrirse directamente el archivo `index.html` en el navegador. Para servirla en local (recomendado para que las rutas y las fuentes carguen igual que en producción):

```bash
cd nativa-joyeria
python3 -m http.server 8123
```

Luego visita <http://127.0.0.1:8123/>.

## Estructura

```
nativa-joyeria/
├── index.html
├── README.md
├── Imagenes Joyeria/      # Fotografías originales del taller (fuente)
└── assets/
    ├── catalogo/          # 15 piezas del catálogo, recortadas a 4:5
    ├── *.jpg              # Hero, colecciones, productos, historia, editorial y galería
    ├── css/estilos.css    # Estilos, layout responsive y animaciones
    └── js/main.js         # Interacciones
```

## Funcionalidad

- Menú de navegación fijo con estado activo por sección y menú móvil.
- Filtros de la colección por material (Todas / Oro / Plata / Edición Nativa).
- Búsqueda por nombre o material con panel superpuesto; los resultados se muestran en «Piezas destacadas».
- Catálogo de 15 piezas con precio: al hacer clic (o Enter/Espacio) en una pieza se añade a la bolsa. En precios con rango se usa el valor menor y la bolsa lo marca como «desde».
- Preguntas frecuentes en acordeón nativo, entre el catálogo y la historia.
- Galería de cinco fotografías del taller, también enlazada al perfil de Instagram.
- Lista de deseos (favoritos) con estado visual.
- Iconos de Instagram y TikTok en la barra superior, junto a la búsqueda, y botón flotante de WhatsApp abajo a la derecha (usa el número de `data-whatsapp`).
- Bolsa de compra funcional: panel lateral con cantidades, quitar piezas, total y pedido por WhatsApp. Se guarda en el `localStorage` del navegador.
- Al pulsar «Finalizar por WhatsApp» se abre una ventana que pide nombre, apellido y correo (todos obligatorios). El mensaje de WhatsApp lleva nombre, apellido y las piezas; el correo no se incluye.
- Formulario de contacto con validación de nombre, apellido y correo; abre WhatsApp con el mensaje preparado.
- Animaciones de aparición al hacer scroll, respetando `prefers-reduced-motion`.

> Es una maqueta funcional: no hay pasarela de pago ni backend; el pedido se envía por WhatsApp. Los precios se muestran en USD.

## Instagram

Todos los enlaces de Instagram apuntan al perfil de la joyería: <https://www.instagram.com/joyeria.nativa/>.

## WhatsApp

El formulario de contacto y los enlaces de WhatsApp usan el número definido en el atributo `data-whatsapp` del formulario `#contact-form` en `index.html`. Debe incluir solo dígitos y el código de país. Al cambiarlo, también se actualizan los enlaces del pie de página y del menú móvil. El formulario no envía datos a ningún servidor: solo compone el mensaje y abre WhatsApp.

## Créditos fotográficos

Las quince imágenes de `assets/catalogo/`, las cinco fotografías de la galería (`galeria-1.jpg` a `galeria-5.jpg`) y las cuatro imágenes de piezas destacadas (`producto-anillo.jpg`, `producto-aretes.jpg`, `producto-collar.jpg` y `producto-pulsera.jpg`) son fotografías del taller, tomadas de la carpeta `Imagenes Joyeria/`. Se recortaron y optimizaron para la web; algunas conservan las anotaciones de peso de las piezas originales.

El resto de imágenes de referencia provienen de <https://www.pexels.com/> y pueden sustituirse por fotografía propia o generada con IA.

| Archivo | Foto en Pexels |
| --- | --- |
| `hero.jpg` | <https://www.pexels.com/photo/11476489/> |
| `coleccion-oro.jpg` | <https://www.pexels.com/photo/15967464/> |
| `coleccion-plata.jpg` | <https://www.pexels.com/photo/16304561/> |
| `coleccion-nativa.jpg` | <https://www.pexels.com/photo/35598284/> |
| `historia.jpg` | <https://www.pexels.com/photo/31128289/> |
| `editorial.jpg` | <https://www.pexels.com/photo/9509026/> |

Tipografías: Cormorant Garamond y Jost, vía Google Fonts.
