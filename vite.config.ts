import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// La démo est servie sous https://code4sud.github.io/2026-equipe-10/
export default defineConfig({
  plugins: [react()],
  base: '/2026-equipe-10/',
  build: { target: 'es2022' },
});
