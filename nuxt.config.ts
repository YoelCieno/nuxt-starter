export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { lang: 'en' },
    },
  },
	compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxt/a11y', '@nuxt/eslint'],
  css: ['~/assets/css/main.css'],
  a11y: {
    axe: {
      options: {},
      runOptions: { runOnly: ['wcag2a', 'wcag2aa'] },
    },
	},
	debug: true
})
