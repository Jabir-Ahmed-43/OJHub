import colors from "tailwindcss/colors";

const withOpacity = (variableName) => {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined) {
      return `rgba(var(${variableName}), ${opacityValue})`;
    }
    return `rgb(var(${variableName}))`;
  };
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    colors: {
      ...colors,
      brand: {
        50: "#eef2ff",
        100: "#e0e7ff",
        200: "#c7d2fe",
        300: "#a5b4fc",
        400: withOpacity("--brand-400"),
        500: withOpacity("--brand-500"),
        600: withOpacity("--brand-600"),
        700: "#4338ca",
        800: "#3730a3",
        900: "#312e81",
      },
      slate: {
        950: withOpacity("--slate-950"),
        900: withOpacity("--slate-900"),
        800: withOpacity("--slate-800"),
        700: withOpacity("--slate-700"),
        600: withOpacity("--slate-600"),
        500: withOpacity("--slate-500"),
        400: withOpacity("--slate-400"),
        300: withOpacity("--slate-300"),
        200: withOpacity("--slate-200"),
        100: withOpacity("--slate-100"),
        50: withOpacity("--slate-50"),
      },
      white: withOpacity("--white"),
    },
    extend: {},
  },
  plugins: [],
};
