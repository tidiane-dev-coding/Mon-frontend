/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#b9d6ff',
          300: '#8bb9ff',
          400: '#5b95ff',
          500: '#2d6bff',
          600: '#1953db',
          700: '#153fa9',
          800: '#163883',
          900: '#172f66'
        }
      }
    }
  },
  plugins: []
}


