import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          100: "hsl(var(--background-100))",
          200: "hsl(var(--background-200))",
          300: "hsl(var(--background-300))",
          400: "hsl(var(--background-400))",
          500: "hsl(var(--background-500))",
          600: "hsl(var(--background-600))",
          700: "hsl(var(--background-700))",
          800: "hsl(var(--background-800))",
        },
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          600: "hsl(var(--primary-600))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          50: "hsl(var(--muted-50))",
          100: "hsl(var(--muted-100))",
          200: "hsl(var(--muted-200))",
          300: "hsl(var(--muted-300))",
          400: "hsl(var(--muted-400))",
          500: "hsl(var(--muted-500))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        warning: "hsl(var(--warning))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: {
          100: "hsl(var(--border-100))",
          200: "hsl(var(--border-200))",
          300: "hsl(var(--border-300))",
          400: "hsl(var(--border-400))",
          500: "hsl(var(--border-500))",
          600: "hsl(var(--border-600))",
          700: "hsl(var(--border-700))",
        },
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        scroll: {
          to: { transform: "translate(calc(-50% - 0.5rem))" },
        },
      },
      animation: {
        scroll: "scroll 70s linear infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    // @ts-expect-error - addUtilities is not typed
    function ({ addUtilities }) {
      const newUtilities = {
        // Firefox
        ".scrollbar-thin": {
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0, 0, 0, 0.5) transparent",
        },
        // Chrome, Edge, Safari
        ".scrollbar-webkit": {
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            borderRadius: "99px",
          },
        },
      };
      addUtilities(newUtilities, ["responsive", "hover"]);
    },
  ],
};
export default config;
