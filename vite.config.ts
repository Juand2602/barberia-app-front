import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig(({ mode }) => {
  // Cargar variables de entorno según el modo (development o production)
  const env = loadEnv(mode, process.cwd(), '');
  
  console.log('🔧 Vite Mode:', mode);
  console.log('🔌 API URL:', env.VITE_API_URL);

  return {
    plugins: [react()],
    
    // CRÍTICO: Rutas relativas para Electron
    base: './',
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@stores': path.resolve(__dirname, './src/stores'),
        '@services': path.resolve(__dirname, './src/services'),
        '@types': path.resolve(__dirname, './src/types'),
        '@utils': path.resolve(__dirname, './src/utils'),
      },
    },
    
    server: {
      port: 5173,
      strictPort: true,
    },
    
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      // Reducir tamaño de chunks
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            charts: ['recharts'],
            calendar: ['react-big-calendar', 'date-fns'],
          },
        },
      },
      // Sin sourcemaps en producción para reducir tamaño
      sourcemap: mode === 'development',
    },
    
    // Variables de entorno - Se inyectan en tiempo de build
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'import.meta.env.VITE_ENV': JSON.stringify(env.VITE_ENV || mode),
    },
  };
});