import { resolve } from 'path';
import { defineConfig, UserConfigExport } from 'vite';

export default defineConfig(() => {
  const config: UserConfigExport = {
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'test',
        fileName: () => `index.js`,
        formats: ['iife'],
      },
    },
    // resolve: {
    //   alias: {
    //     '@mxssfd': resolve(__dirname, '../../packages'),
    //   },
    // },
  };

  return config;
});
