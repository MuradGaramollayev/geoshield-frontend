import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // MapLibre's worker is an ES module; see HexRiskMap's setWorkerUrl.
  worker: { format: "es" },
})
