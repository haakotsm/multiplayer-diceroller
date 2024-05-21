import { defineConfig } from "vite";
import { ConfigPlugin } from "@dxos/config/vite-plugin";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { ThemePlugin } from "@dxos/react-ui-theme/plugin";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
  },
  build: {
    outDir: "out/app",
  },
  worker: {
    format: "es",
    plugins: () => [topLevelAwait(), wasm()],
  },

  plugins: [
    ConfigPlugin(),
    topLevelAwait(),
    wasm(),
    react({ jsxRuntime: "classic" }),
    ThemePlugin({
      content: [
        resolve(__dirname, "./index.html"),
        resolve(__dirname, "./src/**/*.{js,ts,jsx,tsx}"),
        resolve(__dirname, "node_modules/@dxos/react-ui/dist/**/*.mjs"),
        resolve(__dirname, "node_modules/@dxos/react-ui-theme/dist/**/*.mjs"),
      ],
    }),
  ],
});
