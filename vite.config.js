import { defineConfig, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "./",
  plugins: [
    {
      name: "treat-jsx-files-as-tsx",
      enforce: "pre",
      async transform(code, id) {
        if (!id.endsWith(".jsx")) {
          return null;
        }

        return transformWithEsbuild(code, id, {
          loader: "tsx",
          jsx: "automatic",
        });
      },
    },
    tailwindcss(),
    react(),
  ],
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
});
