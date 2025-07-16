import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        titleProp: true,
      },
    }),
  ],
  server: {
    cors: true,
    port: 3000,
  },
});
