import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte(), tailwindcss(), viteSingleFile()],
  build: {
    // Inline all assets for single-file output
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
  },
});
