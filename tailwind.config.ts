import type { Config } from 'tailwindcss'
import primeui from 'tailwindcss-primeui'

export default <Partial<Config>>{
  corePlugins: {
    preflight: false,
  },
  content: [
    "./components/**/*.{vue,js,jsx,mjs,ts,tsx}",
    "./layouts/**/*.{vue,js,jsx,mjs,ts,tsx}",
    "./pages/**/*.{vue,js,jsx,mjs,ts,tsx}",
    "./plugins/**/*.{js,ts,mjs}",
    "./composables/**/*.{js,ts,mjs}",
    "./utils/**/*.{js,ts,mjs}",
    "./{A,a}pp.{vue,js,jsx,mjs,ts,tsx}",
    "./{E,e}rror.{vue,js,jsx,mjs,ts,tsx}",
    "./app.config.{js,ts,mjs}",
    "./app/spa-loading-template.html"
  ],
  darkMode: ['class', '.dark-mode'],
  theme: {
    screens: {
      // Custom breakpoints: 
      // Make sure these are matching the values in the scss vars in the assets/scss/breakpoints.scss file
      'xs': '320px',
      'sm': '375px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1440px',
      'xxl': '1920px',
    },
  },
  plugins: [primeui],
}
