# 🎉 Invitación al cumple de Manu

Página tipo "libro" para invitar a tu cumple, lista para publicar en GitHub Pages.

## Qué incluye

- **Tapa de libro** animada: se toca para "abrir" la invitación.
- **Página de fotos**: grilla con 6 fotos (por ahora son placeholders de colores tierra, hay que reemplazarlas).
- **Página de video**: un video placeholder generado, hay que reemplazarlo por el tuyo.
- **Página final** con toda la info del cumple, el dress code, un botón a tu Gem de Gemini para dudas de outfit, y un botón de confirmación de asistencia (RSVP) que:
  - Pinta la tarjeta de **verde** si confirman que van, o de **rojo/tenue** si no pueden ir.
  - Manda la respuesta a un **Google Form** (vos ves todo en una planilla de Google Sheets) — hay que configurarlo, ver más abajo.

## 0. Ya está armada con tus fotos y tu video

Ya reemplacé los placeholders por las 13 fotos y el video que me pasaste (comprimidos y optimizados para que carguen rápido en el celular — el video pesa ~1.2 MB en vez de los 6.6 MB originales). No necesitás hacer nada en este paso, salvo que quieras agregar/sacar/reordenar fotos (ver punto 2).

## 1. Publicar en GitHub Pages

1. Creá un repositorio nuevo en GitHub (puede ser público o privado, con Pages funciona igual — si es privado necesitás GitHub Pro para Pages).
2. Subí **todos los archivos de esta carpeta** (`index.html`, `style.css`, `script.js`, la carpeta `assets/`) a la raíz del repo.
3. Andá a **Settings → Pages**.
4. En "Source" elegí la rama (por ejemplo `main`) y la carpeta `/root`. Guardá.
5. Esperá 1-2 minutos y tu página va a estar en algo como:
   `https://tu-usuario.github.io/nombre-del-repo/`

## 2. Agregar, sacar o reordenar fotos

Las fotos están en `assets/fotos/foto1.jpg` a `foto13.jpg`, y se muestran como un carrusel horizontal (se desliza con el dedo). Para:
- **Reemplazar una foto**: pisá el archivo manteniendo el mismo nombre.
- **Agregar una foto nueva**: subí `foto14.jpg` a la carpeta y agregá una línea en `index.html`, dentro de `<div class="carousel">`, copiando el formato de las que ya están (y actualizá el número total en `<span id="carouselTotal">13</span>`).
- **Sacar una foto**: borrá el archivo y su línea correspondiente en `index.html`.

Tip: si subís fotos nuevas desde el iPhone (HEIC), convertilas a JPG antes de subirlas — no todos los navegadores muestran HEIC.

## 3. Reemplazar el video

El video está en `assets/video-cumple.mp4` (con su miniatura `assets/video-poster.jpg`). Para cambiarlo, reemplazá ambos archivos manteniendo el mismo nombre, o cambiá el `src`/`poster` dentro de `index.html`, en la sección `<!-- PÁGINA 3: VIDEO -->`. Recomendación: que el video pese menos de 15-20 MB para que cargue rápido en el celular (podés comprimirlo con HandBrake o el mismo comando que usé: `ffmpeg -i tu_video.mov -vf "scale=854:-2" -c:v libx264 -crf 26 -c:a aac -b:a 96k -movflags +faststart salida.mp4`).

## 4. Configurar el Google Form para las confirmaciones (RSVP)

Para que las confirmaciones de "sí voy / no puedo" te lleguen a vos (en una planilla de Google Sheets):

1. Andá a [forms.google.com](https://forms.google.com) y creá un formulario nuevo.
2. Agregá dos preguntas de tipo **"Respuesta corta"**:
   - `Nombre`
   - `Asistencia`
3. Arriba a la derecha, en la pestaña **Respuestas**, tocá el ícono verde de Sheets para vincular una planilla (ahí vas a ver todas las confirmaciones en tiempo real).
4. Volvé a la pestaña **Preguntas**, tocá los **3 puntitos (⋮)** arriba a la derecha → **"Obtener enlace para completar automáticamente"**.
5. Completá los dos campos con cualquier dato de prueba (ej: "Juan" y "Si") y tocá **"Obtener enlace"**.
6. Copiá el link que te da. Va a tener esta pinta:
   ```
   https://docs.google.com/forms/d/e/1FAIpQLSc.../viewform?usp=pp_url&entry.111111111=Juan&entry.222222222=Si
   ```
7. Abrí `script.js` y completá estas tres líneas con lo que sacaste del link:
   ```js
   const GOOGLE_FORM = {
     FORM_ACTION_URL: "https://docs.google.com/forms/d/e/1FAIpQLSc.../formResponse", // ¡ojo! termina en /formResponse, no /viewform
     ENTRY_NOMBRE: "111111111",       // el número después de "entry." antes de "=Juan"
     ENTRY_ASISTENCIA: "222222222",   // el número después de "entry." antes de "=Si"
   };
   ```
8. Guardá, subí el cambio a GitHub y listo — a partir de ahí cada confirmación va a aparecer en tu planilla.

Mientras no hagas este paso, el botón de RSVP sigue funcionando visualmente (pinta la tarjeta en verde o rojo) pero la respuesta no se guarda en ningún lado, así que no te va a llegar el aviso.

## 5. El botón de la IA (Gemini Gem)

Ya está enlazado a tu Gem:
`https://gemini.google.com/gem/1p8u3pGNC5uSavX8rI4oZjvn_P-OAfzL9?usp=sharing`

Se abre en una pestaña nueva al tocar el botón "🤖 ¿Dudas con el outfit? Preguntale a mi asistente". Si en algún momento cambiás de Gem, actualizá el `href` de ese botón en `index.html` (buscá `gem-btn`).

Recordá que para que tus invitados puedan usar la Gem tienen que iniciar sesión con una cuenta de Google (así funcionan las Gems de Gemini).

## 6. Editar textos

Todo el texto de la info final (fecha, lugar, hora, menú, dress code, alcohol) está en `index.html`, dentro de `<section class="page" id="info">`. Es texto plano, se puede editar directamente sin tocar nada más.

## 7. Probarla antes de mandarla

Podés abrir `index.html` directamente en el navegador (doble clic) para ver cómo queda antes de subirla a GitHub, aunque el RSVP con Google Form solo funciona bien una vez publicada (por temas de rutas relativas de las imágenes/video, mejor probarla ya en GitHub Pages o con un servidor local).
