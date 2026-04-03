import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['Dashboard/Tunet/Cards/v3/tests/**/*.test.js'],
    environment: 'jsdom',
  },
});
