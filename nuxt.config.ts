export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  future: {
    compatibilityVersion: 4
  },
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  imports: {
    dirs: ['stores']
  },
  alias: {
    pinia: '~/utils/pinia'
  },
  // выбор режима рендеринга для публичных и приватных маршрутов приложения
  routeRules: {
    '/': { ssr: true, prerender: true },
    '/faq': { ssr: true, prerender: true },
    '/help': { ssr: true, prerender: true },
    '/articles': { ssr: true, prerender: true },
    '/articles/**': { ssr: true, swr: 3600 },
    '/login': { ssr: true },
    '/register': { ssr: true },
    '/dashboard': { ssr: true },
    '/requests': { ssr: true },
    '/requests/**': { ssr: true },
    '/profile': { ssr: false }
  },
  app: {
    head: {
      title: 'WorkFlow — система управления заявками',
      htmlAttrs: {
        lang: 'ru'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'WorkFlow — от первого обращения до решения: управляйте заявками, назначайте исполнителей и держите сроки под контролем.'
        }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Nunito+Sans:wght@400;600;700&display=swap'
        }
      ]
    }
  },
  typescript: {
    strict: true
  }
})
