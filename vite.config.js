import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';

// `npm run build` gera a PWA normal em dist/.
// `npm run build:single` gera um único HTML (dist-single/) para prévia/compartilhamento.
export default defineConfig(({ mode }) => ({
  plugins: [react(), ...(mode === 'single' ? [viteSingleFile()] : [])],
  base: './',
  build: { outDir: mode === 'single' ? 'dist-single' : 'dist' },
}));
