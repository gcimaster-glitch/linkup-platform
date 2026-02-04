import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { 
          50: '#eff6ff', 
          100: '#dbeafe', 
          600: '#2563EB', 
          700: '#1D4ED8' 
        },
        yahoo: '#FF0033',
        line: '#06C755'
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'float': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'modal': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'sans-serif']
      }
    },
  },
  plugins: [],
};
export default config;
