# Desplegar en GitHub Pages

El proyecto ya está preparado para publicarse en
`https://jomaroru7.github.io/planificador-hogar/` usando el workflow de
[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml).

## Cómo funciona

- `next.config.ts` añade un `basePath`/`assetPrefix` de `/planificador-hogar`
  **solo** cuando la variable de entorno `GITHUB_PAGES=true` está presente
  (el workflow la define). En local (`npm run dev` / `npm run build` sin esa
  variable) la app se sigue sirviendo en la raíz, sin cambios.
- [`src/lib/basePath.ts`](../src/lib/basePath.ts) centraliza ese mismo valor
  para los sitios donde Next.js no añade el prefijo automáticamente (el
  manifest de la PWA, en [`src/app/manifest.ts`](../src/app/manifest.ts)).
- `public/.nojekyll` evita que GitHub Pages ignore la carpeta `_next/` (Pages
  usa Jekyll por defecto, que descarta rutas que empiezan por `_`).

## Pasos únicos (una sola vez)

1. Crea el repositorio en GitHub con el nombre **`planificador-hogar`** bajo
   tu usuario `jomaroru7` (si usas otro nombre de repo, actualiza
   `repoBasePath`/`BASE_PATH` en `next.config.ts` y `src/lib/basePath.ts`, y
   la URL de este documento).
2. Sube el código:

   ```bash
   git remote add origin https://github.com/jomaroru7/planificador-hogar.git
   git push -u origin main
   ```

3. En GitHub, ve a **Settings → Pages** y en "Build and deployment → Source"
   elige **GitHub Actions** (no "Deploy from a branch").
4. En **Settings → Secrets and variables → Actions → New repository secret**
   añade:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

   (los mismos valores que tienes en tu `.env.local`, ver
   [`docs/SUPABASE.md`](SUPABASE.md)).

## Despliegues siguientes

Cada `git push` a `main` dispara el workflow: compila (`next build`, export
estático a `out/`) y publica el resultado en Pages automáticamente. También
puedes lanzarlo a mano desde **Actions → Deploy a GitHub Pages → Run workflow**.

## Limitaciones a tener en cuenta

- GitHub Pages es 100% estático: no hay problema porque esta app ya habla
  directamente con Supabase desde el navegador, sin backend propio.
- Si más adelante cambias el nombre del repositorio o lo mueves a una
  organización, recuerda actualizar el `basePath` en los dos sitios
  mencionados arriba.
- Los iconos de `src/app/manifest.ts` (`/icons/icon-192.png` y `-512.png`)
  todavía no existen — añádelos en `public/icons/` cuando tengas el logo
  definitivo; hasta entonces el manifest los referenciará sin error (solo
  faltará el icono al instalar la PWA).
