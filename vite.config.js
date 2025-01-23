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
    rollupOptions: {
      input: {
        app: resolve(__dirname, "index.html"),
        appVideoWall: resolve(__dirname, "videowall.html"),
        appTma: resolve(__dirname, "tma.html"),
      },
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("/vue/") || id.includes("/@vue/")) {
              return "vue";
            }

            return id
              .toString()
              .split("node_modules/")[1]
              .split("/")[0]
              .toString()
              .toLowerCase();
          }
        },
      },
    },
  },
});
