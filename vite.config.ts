import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'; // Make sure you have the react plugin

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    return {
      plugins: [react()], // Add the react plugin
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
          '@shared': path.resolve(__dirname, './shared'), // <-- This is the crucial alias
          // Force React to resolve to a single instance
          'react': path.resolve(__dirname, './node_modules/react'),
          'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
        },
        dedupe: ['react', 'react-dom'], // Ensure only one React instance is used
      },
      optimizeDeps: {
        include: ['react', 'react-dom', '@acutrack-bookprint/acutrack-ds'], // Pre-bundle React and design system together
        esbuildOptions: {
          // Ensure React is externalized properly
          resolveExtensions: ['.jsx', '.tsx', '.js', '.ts'],
        },
      },
    };
});