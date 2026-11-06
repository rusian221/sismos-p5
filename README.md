# Sismos del mundo — p5.js

Proyecto final del tutorial **Datos, Animación y Sonido**. La aplicación consulta el feed GeoJSON del último mes del **U.S. Geological Survey (USGS)** y crea una visualización animada con sonido.

## Funcionalidades

- Lectura y limpieza de datos GeoJSON mediante `preload()` y `loadJSON()`.
- Conversión de longitud/latitud a coordenadas del lienzo.
- Tamaño de los círculos según la magnitud.
- Color desde amarillo (sismo superficial) hasta morado (sismo profundo).
- Animación cíclica de un mes de sismos en 60 segundos.
- Sonido con frecuencia, paneo y envolvente dependientes del sismo.
- Reto 1: control deslizante para elegir la magnitud mínima.
- Reto 2: consulta del lugar, magnitud, profundidad y fecha al pasar el cursor.
- Reto 3: selección de oscilador seno, triangular, cuadrado o diente de sierra.
- Botones para activar/silenciar, pausar/continuar y reiniciar el ciclo.

## Ejecución

1. Abre esta carpeta en GitHub Codespaces, VS Code o cualquier servidor local.
2. Ejecuta `python3 -m http.server 8000` desde la carpeta del proyecto.
3. Abre `http://localhost:8000` en el navegador.
4. Pulsa **Activar sonido** para permitir el audio del navegador.

También puede publicarse directamente con GitHub Pages usando la rama `main` y la carpeta `/ (root)`.

## Archivos

- `index.html`: estructura, controles, estilos e importación de p5.js y p5.sound.
- `sketch.js`: carga de datos, animación, interacción y sonido.

## Fuente

U.S. Geological Survey, Earthquake Hazards Program, *Earthquake Catalog / Real-time Data Feeds*. Feed utilizado: https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_month.geojson. Consultado el 6 de noviembre de 2026.

Trabajo educativo realizado con p5.js 1.11.13.
