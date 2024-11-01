import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        lightBlue: '#D1E9F6',
        lightBlue2: '#D7ECF6',
        lightBlue3: '#D4DBF8',
        lightPurple1: '#F7DBF0',
        lightPurple2: '#F4EEFF',
        lightSky: '#BFECFF',
        lightYellow: '#FFF8C9',
        darkGrey1: '#27374D',
        darkGrey2: '#526D82',
        lightGrey1: '#9DB2BF',
        lightGrey2: '#DDE6ED',
        darkPurple: '#424874',
        cream: '#FAF0E2',
        cream2: '#FEF9F2',
        brightPink: '#C869B3',
        brightPink2: '#DD98D6'
      },
      height: {
        '26': '4rem',
        '60': '16rem',
        '76': '20rem',
        '100': '35rem',
      },
      width: {
        '32': '8rem',
        '100': '40rem'
      }
    },
  },
  plugins: [require('daisyui'),],
};
export default config;