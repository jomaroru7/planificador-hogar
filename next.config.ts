import type { NextConfig } from "next";
import { BASE_PATH } from "./src/lib/basePath";

// Static export so the build output (`out/`) can be wrapped with Cordova
// and served as a fully client-side app (no Node server required).
// BASE_PATH is only non-empty for the GitHub Pages workflow (GITHUB_PAGES=true),
// since that project site is served under /planificador-hogar/.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: BASE_PATH,
  assetPrefix: BASE_PATH,
};

export default nextConfig;
