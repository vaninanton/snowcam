import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import mkcert from "vite-plugin-mkcert";

// https://vitejs.dev/config/
export default defineConfig({
  server: { https: true },
  plugins: [vue(), mkcert()],
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
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
