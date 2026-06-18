/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// base "/" because the site is served from a custom domain root (daniel.metzner.uk)
export default defineConfig({
  plugins: [react()],
  base: "/",
  // transformers.js ships its own prebuilt wasm/ort — let Vite leave it alone
  optimizeDeps: { exclude: ["@huggingface/transformers"] },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
