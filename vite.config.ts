import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // Rolldown : regroupement explicite des dépendances lourdes (cache navigateur long terme)
        advancedChunks: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler|zustand|use-sync-external-store)[\\/]/, priority: 10 },
            { name: 'three', test: /node_modules[\\/]three[\\/]/, priority: 3 },
            { name: 'r3f', test: /node_modules[\\/](@react-three|postprocessing|camera-controls|three-stdlib|maath|troika)/, priority: 2 },
            { name: 'gsap', test: /node_modules[\\/]gsap/, priority: 1 },
          ],
        },
      },
    },
  },
})
