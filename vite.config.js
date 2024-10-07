import vue2 from '@vitejs/plugin-vue2';

export default {
  base: '/waveform/',
  plugins: [vue2()],
  server: {
    host: '0.0.0.0',
    port: 8080,
  },
  build: {
    outDir: 'docs',
  },
};
