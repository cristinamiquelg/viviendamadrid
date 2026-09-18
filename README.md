# Precio de la vivienda en Madrid, barrio a barrio

Portal para visualizar la tendencia del precio de la vivienda en Madrid: mapa
coroplético por barrio, comparación de varios barrios en un gráfico de
evolución, y un panel de alquiler por distrito. Construido con Next.js 16 +
Supabase (Postgres) + Recharts + d3-geo, desplegado en Vercel.

## Datos: qué hay realmente disponible

**No existe una fuente pública gratuita con precio de vivienda mes a mes por
barrio.** Se investigó a fondo antes de construir esto:

- El Ayuntamiento de Madrid publica el **precio medio declarado de segunda
  mano (€/m²) por barrio, con periodicidad anual**. Es la fuente que usa
  este proyecto (2001–2016, 1.882 observaciones sobre 131 barrios).
- El alquiler solo está disponible de forma agregada **por distrito**, no por
  barrio, también anual (2007–2016, 210 observaciones sobre 21 distritos).
- Idealista publica evolución mensual, pero solo a nivel de distrito y no
  como dataset abierto descargable (son informes HTML, sin API pública
  gratuita).

Por eso el portal soporta un selector **Año / Mes (estimado)**: el modo
"Año" muestra los datos anuales reales tal cual se publican; el modo "Mes"
interpola linealmente entre esos mismos puntos anuales para poder leer la
tendencia con más resolución temporal — está marcado visualmente (línea
discontinua) y con un aviso en pantalla, porque no son cifras oficiales
mes a mes.

Los datos de 2001–2016 provienen del dataset ya procesado de
[hvillanua/madrid-house-prices](https://github.com/hvillanua/madrid-house-prices)
(a su vez construido a mano desde el Banco de Datos del Ayuntamiento de
Madrid). Las geometrías de los 131 barrios (formato GeoJSON, en
`public/data/barrios.geojson`) provienen del paquete
[`madrid-atlas`](https://github.com/martgnz/madrid-atlas) (TopoJSON oficial
del Ayuntamiento, convertido y simplificado). 128 de los 131 barrios tienen
geometría; los 3 restantes (Ensanche de Vallecas, Valderrivas y El
Cañaveral) se crearon en 2017, después de la fuente cartográfica usada, y
aparecen en las listas/gráficos pero no en el mapa.

### Cómo traer datos más recientes (2017–hoy)

1. Descarga el Excel/CSV oficial actualizado desde el Ayuntamiento de
   Madrid: "Precio medio declarado de la vivienda (€/m²) por Distrito y
   Barrio según Tipo" — sección Estadística > Edificación y vivienda >
   Mercado de la vivienda > Compra-venta de viviendas
   (`www.madrid.es`, portal de Estadística municipal).
2. Normaliza cada fila a `(codigo_barrio, anio, precio_eur_m2)` — el
   `codigo_barrio` son 3 dígitos: 2 de distrito + 1-2 de barrio (p.ej. `011`
   = distrito 01, barrio 1 = Palacio). Esos códigos ya están en la tabla
   `neighborhoods.code`.
3. Inserta con una consulta como la de
   `data/processed/precios_venta_barrio_anual.csv` (ver el patrón SQL usado
   para la carga inicial: `insert into price_observations (...) select
   n.id, ... from (values (...)) as v(...) join neighborhoods n on n.code =
   v.barrio_codigo`).
4. Si en algún momento consigues una fuente con granularidad mensual real
   (por ejemplo un feed de pago de idealista/data o Tinsa), inserta esas
   filas con `granularity = 'month'` en vez de `'year'` — el esquema ya lo
   soporta, y bastaría con adaptar `src/lib/data.ts` y `TrendChart` para
   preferir los puntos mensuales reales sobre la interpolación cuando
   existan.

## Arquitectura

- **Base de datos**: Supabase (Postgres). Esquema en 3 tablas:
  `districts` (21), `neighborhoods` (131, con `district_id` y `code`
  oficial), `price_observations` (precio + fecha + granularidad + métrica +
  fuente, referenciando barrio O distrito). Lectura pública vía RLS
  (`select` abierto), sin escritura desde el cliente.
- **Frontend**: Next.js 16 (App Router), todo cliente-interactivo: el
  `Dashboard` carga distritos/barrios/precios una vez con `@supabase/supabase-js`
  usando la publishable key (segura para exponer, RLS solo permite lectura),
  y filtra/agrega en memoria (el dataset completo son ~2.200 filas).
- **Mapa**: SVG renderizado a mano con `d3-geo` (proyección Mercator ajustada
  al bounding box de Madrid) sobre el GeoJSON estático en `public/data/`. Sin
  dependencia de tiles ni API keys de mapas.
- **Gráfico de tendencia**: Recharts, con paleta categórica validada para
  daltonismo (ver skill de dataviz interno) y modo mensual interpolado
  claramente diferenciado (línea discontinua + aviso).

## Desarrollo local

```bash
npm install
cp .env.local.example .env.local   # rellena con tus credenciales de Supabase
npm run dev
```

Variables de entorno necesarias (`.env.local`):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

## Despliegue

Desplegado en Vercel. Las mismas dos variables de entorno deben configurarse
en el proyecto de Vercel (Settings → Environment Variables).
