import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base relative → déployable tel quel sur Netlify / GitHub Pages / sous-dossier
export default defineConfig({
  base: './',
  plugins: [react()],
});
