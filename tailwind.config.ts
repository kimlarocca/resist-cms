import type { Config } from 'tailwindcss'
// import primeui from 'tailwindcss-primeui'

export default <Partial<Config>>{
  darkMode: ['class', '.dark-mode'], // This is the key change
  theme: {
    screens: {
      // Custom breakpoints: 
      // Make sure these are matching the values in the scss vars in the assets/scss/breakpoints.scss file
      'xs': '320px',
      'sm': '375px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1366px',
      'xxl': '1920px',
    },
  },
  // plugins: [primeui],
}
