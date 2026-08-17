/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        admin: {
          dark:    '#7B1D1D',
          medium:  '#A32D2D',
          accent:  '#C0392B',
          light:   '#F5C2C2',
          bg:      '#FDF6F6',
        },
        nutri: {
          dark:    '#2D6A4F',
          medium:  '#40916C',
          accent:  '#52B788',
          light:   '#D8F3DC',
          bg:      '#F7F8F3',
        },
      },
    },
  },
  plugins: [],
}