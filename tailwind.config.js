/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",             // Include il tuo file HTML principale
    "./index.tsx",              // Include il tuo file React/TSX principale (se è nella root)
    "./src/**/*.{js,ts,jsx,tsx}", // Include tutti i file JS/TS/JSX/TSX nella cartella src/
    "./components/**/*.{js,ts,jsx,tsx}", // Include i file nelle sottocartelle di components (se hai messo componenti direttamente lì)
    // Aggiungi qui qualsiasi altra cartella dove potresti avere classi Tailwind, es. "./pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}