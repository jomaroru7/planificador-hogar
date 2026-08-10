# Empaquetado móvil con Apache Cordova

La app está pensada para funcionar como sitio 100% estático (`next build`
genera una carpeta `out/` con HTML/CSS/JS, sin servidor Node), así que se
puede envolver con Cordova y generar un APK/IPA que abre esos ficheros locales
y habla con Supabase por HTTPS igual que en el navegador.

> Esta parte es opcional/secundaria: la web funciona perfectamente sin Cordova
> (instálala como PWA o ábrela en el navegador del móvil). Sigue esta guía solo
> si quieres generar una app nativa instalable.

## Requisitos

- Node.js y npm (ya los necesitas para Next.js).
- Cordova CLI: `npm install -g cordova`.
- Para Android: Android Studio + SDK, y JDK 17.
- Para iOS: Xcode (solo en macOS) + CocoaPods.

## 1. Generar el build estático

```bash
npm run build
```

Esto crea la carpeta `out/` con la app lista para servir sin backend Node
(gracias a `output: "export"` en [`next.config.ts`](../next.config.ts)).

## 2. Crear el proyecto Cordova (una sola vez)

```bash
cordova create cordova-app com.tuhogar.planificador "Planificador de Hogar"
cd cordova-app
cordova platform add android
# cordova platform add ios   # solo en macOS, si lo necesitas
```

Sustituye el contenido de `cordova-app/config.xml` por el de
[`cordova/config.xml`](../cordova/config.xml) de este repo (ajusta el `id` y
la ruta de los iconos/splash si añades los tuyos), y añade los plugins
recomendados:

```bash
cordova plugin add cordova-plugin-whitelist
cordova plugin add cordova-plugin-statusbar
cordova plugin add cordova-plugin-splashscreen
cordova plugin add cordova-plugin-network-information
```

## 3. Copiar el build de Next.js dentro de Cordova

Cada vez que cambies el código, repite:

```bash
npm run build
rm -rf cordova-app/www
cp -r out cordova-app/www
```

## 4. Ejecutar / compilar

```bash
cd cordova-app
cordova run android            # emulador o dispositivo conectado
cordova build android --release # APK de release (necesita firma)
```

## Notas importantes

- **Rutas y `trailingSlash`**: `next.config.ts` ya tiene `trailingSlash: true`
  e `images.unoptimized: true`, necesarios para que los enlaces y las imágenes
  funcionen al servirse como ficheros locales (`file://`) dentro de Cordova/WebView.
- **Red**: Supabase se sigue llamando por HTTPS normal desde el WebView; añade
  tu dominio de Supabase (`*.supabase.co`) a la whitelist de Cordova si
  restringes el `<access>`/`<allow-navigation>` en `config.xml`.
- **Iconos y splash**: coloca tus imágenes en `cordova-app/res/icon/` y
  `cordova-app/res/screen/` y añade `cordova-res` (`npx cordova-res`) para
  generarlos en todos los tamaños automáticamente.
- **Actualizaciones**: como es una web empaquetada, si prefieres no publicar
  una nueva versión en las tiendas por cada cambio, puedes seguir usando la
  versión instalada como PWA (ver `public/manifest.json`) para los cambios
  frecuentes y reservar Cordova para publicar en Google Play / App Store.
