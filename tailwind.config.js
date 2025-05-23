const {} = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: {
          light: "#ffffff",
          dark: "#1a1a1a",
        },
        text: {
          light: "#1a1a1a",
          dark: "#ffffff",
        },
      },
    },
  },
  variants: {
    extend: {},
  },
};
