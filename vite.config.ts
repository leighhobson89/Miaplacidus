import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  define: {
    MIAPLACIDUS_BUILD_MODE: JSON.stringify(mode),
    MIAPLACIDUS_IS_DEMO_BUILD: JSON.stringify(mode === "demo"),
  },
  build: {
    sourcemap: mode === "test",
  },
}));
