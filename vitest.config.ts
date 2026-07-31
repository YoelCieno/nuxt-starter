import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'jsdom', // MUST stay jsdom — axe-core isConnected breaks on happy-dom
        url: 'http://localhost:3000',
      },
    },
    setupFiles: ['./vitest.setup.ts'],
    include: ['app/**/*.spec.ts', 'generator/**/*.spec.ts'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['app/**', 'generator/**'],
      exclude: ['**/*.spec.ts'],
    },
  },
})
