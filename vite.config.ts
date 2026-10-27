import { fileURLToPath, URL } from "node:url";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mkcert from "vite-plugin-mkcert";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  // HTTPS включает vite-plugin-mkcert: он выдаёт сертификат и для dev, и для
  // preview, если server.https явно не выставлен в false
  plugins: [tailwindcss(), react(), mkcert()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      input: {
        app: resolve(import.meta.dirname, "index.html"),
        appVideoWall: resolve(import.meta.dirname, "videowall.html"),
      },
      output: {
        codeSplitting: {
          groups: [
            {
              name: "hls",
              test: /node_modules[\\/]hls\.js[\\/]/,
              priority: 20,
            },
            {
              name: "vendor",
              test: /node_modules[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
});
