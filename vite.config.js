import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { splitVendorChunkPlugin } from "vite";
import mkcert from "vite-plugin-mkcert";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/snowcam/",
  server: { https: true },
  plugins: [vue(), splitVendorChunkPlugin(), mkcert()],
});
