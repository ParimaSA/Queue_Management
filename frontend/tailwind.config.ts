import type { Config } from "tailwindcss";
import Business from "./app/business/page";

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