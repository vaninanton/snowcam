import { resolve } from "path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import mkcert from "vite-plugin-mkcert";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  server: { https: true },
  plugins: [tailwindcss(), vue(), mkcert()],
  build: {
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      input: {
        app: resolve(__dirname, "index.html"),
        appVideoWall: resolve(__dirname, "videowall.html"),
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
