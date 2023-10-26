import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import UnoCSS from "unocss/vite";
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
  plugins: [
    UnoCSS({
      // mode: "per-module",
      // transformCSS: 'pre',
    }),
    solidPlugin(),
    cssInjectedByJsPlugin(),
  ],

  envPrefix: ["VITE_", "YAAGL_"],
  build: {
    target: "safari13",
    minify: true,
    sourcemap: false,
    outDir: "dist",
    rollupOptions: {
    },
    cssCodeSplit: false, 
    lib: {
      name: "gpt_auto",
      entry: "./src/index.tsx",
      formats: ["iife"],
    },
  },
});
