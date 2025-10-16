// https://nuxt.com/docs/api/configuration/nuxt-config

import MyPreset from './assets/theme.js'

export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  app: {
    head: {
      title: `CantFixJack.com | Jack Ciattarelli: Opioids, Taxes, Ambition`,
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { name: 'description', content: 'CantFixJack.com exposes Jack Ciattarelli\'s shady opioid-pushing businesses, political flip-flops, and relentless self-serving bids for NJ power.' },
        { name: 'keywords', content: 'Jack Ciattarelli, NJ politics, MAGA, Stop the Steal, Super PAC, Trump ties, authoritarianism' },
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
      // script: [
      //   { src: 'https://www.googletagmanager.com/gtag/js?id=G-7GDC05EZKE' }
      // ]
    }
  },

  css: ['primeicons/primeicons.css', '~/assets/scss/main.scss'],

  modules: ['@primevue/nuxt-module', '@nuxtjs/tailwindcss'],

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
    }
  }
})