// https://nuxt.com/docs/api/configuration/nuxt-config

import MyPreset from './assets/theme.js'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  app: {
    head: {
      title: `Resist CMS`,
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { name: 'description', content: 'Content management for the resistance!' },
        { name: 'msapplication-TileColor', content: '#0a84ff' },
        { name: 'theme-color', content: '#0a84ff' }
      ],
      link: [
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png'
        },
        { rel: 'manifest', href: '/site.webmanifest' },
        { rel: 'mask-icon', href: '/safari-pinned-tab.svg', color: '#ff3904' },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        }
      ],
      script: [
        { src: 'https://elfsightcdn.com/platform.js' }
      ]
    }
  },

  css: ['primeicons/primeicons.css', '~/assets/scss/main.scss'],

  modules: ['@primevue/nuxt-module', '@nuxtjs/tailwindcss', '@nuxtjs/supabase'],

  supabase: {
    key: 'sb_publishable_hfb4cBZp-dppxuSEFkidtw_XdBFGbK2',
    url: 'https://udsyxtnbyejnwwvbifjr.supabase.co',
    redirect: false,
  },

  tailwindcss: {
    exposeConfig: true,
  },

  primevue: {
    options: {
      ripple: true,
      theme: {
        preset: MyPreset,
        options: {
          darkModeSelector: ".dark-mode",
        }
      }
    }
  },

  runtimeConfig: {
    public: {
      environment: process.env.environment ?? 'local',
      gtagId: 'G-K6YTWGEB2Q',
      supabaseKey: 'sb_publishable_hfb4cBZp-dppxuSEFkidtw_XdBFGbK2',
      supabaseUrl: 'https://udsyxtnbyejnwwvbifjr.supabase.co',
      supabaseAuthTokenName: 'sb-udsyxtnbyejnwwvbifjr-auth-token',
      supabaseAuthSignInRedirectTo: process.env.environment === 'local' ? 'http://localhost:3000' : 'https://resistcms.com',
    }
  },

  vite: {
    optimizeDeps: {
      include: ['quill']
    }
  }
})