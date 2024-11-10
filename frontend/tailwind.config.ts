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
        lightPurple3: '#AB95D6',
        lightPurple4: '#F6EBF4',
        lightPurple5: '#D2C2EF',
        lightSky: '#BFECFF',
        lightYellow: '#FFF8C9',
        lightPink: '#D1AFC2',
        darkGrey1: '#27374D',
        darkGrey2: '#526D82',
        lightGrey1: '#9DB2BF',
        lightGrey2: '#DDE6ED',
        darkPurple: '#424874',
        darkPurple2: '#704BAB',
        cream: '#FAF0E2',
        cream2: '#FEF9F2',
        cream3: '#FFF1E7',
        brightPink: '#C869B3',
        brightPink2: '#DD98D6',
        lightOrange1: '#FFBFB6',
        lightOrange2: '#FFD5B6',
        lightOrange3: '#FFE8E2',
      },
      height: {
        '26': '4rem',
        '42': '13rem',
        '60': '16rem',
        '76': '20rem',
        '100': '35rem',
        '120': '45rem',
        '122': '52rem',
      },
      width: {
        '32': '8rem',
        '34': '9rem',
        '100': '40rem',
        '122': '52rem',
        '42': '13rem',
      }
    },
  },
  plugins: [require('daisyui'),],
};
export default config;