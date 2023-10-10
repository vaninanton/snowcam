import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { splitVendorChunkPlugin } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/snowcam/",
  plugins: [vue(), splitVendorChunkPlugin()],
});
