import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { guidePlugin } from './server/vite-guide.ts';
export default defineConfig({plugins:[react(),guidePlugin()],build:{target:'es2022',chunkSizeWarningLimit:1200},server:{strictPort:true},preview:{strictPort:true}});
