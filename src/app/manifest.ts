import type { MetadataRoute } from "next";
import { BASE_PATH } from "@/lib/basePath";

// Required for `output: "export"`: this route has no dynamic data.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Planificador de Hogar",
    short_name: "Hogar",
    description: "Calendario, tareas y comidas del hogar en un único planificador.",
    start_url: `${BASE_PATH}/`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#171717",
    orientation: "portrait",
    icons: [
      { src: `${BASE_PATH}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { src: `${BASE_PATH}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
  };
}
