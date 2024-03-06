/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{vue,js,ts}"],
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["light", "emerald", "retro", "garden", "dim"],
  },
};
