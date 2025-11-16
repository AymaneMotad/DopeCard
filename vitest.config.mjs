import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./test-utils/setup.ts'],
    include: ['**/__tests__/**/*.{ts,tsx}', '**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test-utils/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        '**/__tests__/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/server': path.resolve(__dirname, './server'),
      '@/components': path.resolve(__dirname, './components'),
      '@/modules': path.resolve(__dirname, './modules'),
      '@/app': path.resolve(__dirname, './app'),
      '@/db': path.resolve(__dirname, './db'),
      '@/lib': path.resolve(__dirname, './lib'),
    },
  },
});

