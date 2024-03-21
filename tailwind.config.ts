/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { nextui } from "@nextui-org/react";
import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import svgToDataUri from "mini-svg-data-uri";
 
import { default as flattenColorPalette } from "tailwindcss/lib/util/flattenColorPalette";

export default {
  content: [
    "./src/**/*.tsx",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors:{
        destructive:"#FF0000",
        "destructive-foreground":"#FFFFFF",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
    },
  },
  darkMode: "class",
  plugins: [
    function ({ matchUtilities, theme }: any) {
      matchUtilities(
        {
          "bg-dot": (value: any) => ({
            backgroundImage: `url("${svgToDataUri(
              `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="16" height="16" fill="none"><circle fill="${value}" id="pattern-circle" cx="10" cy="10" r="1.6257413380501518"></circle></svg>`
            )}")`,
          }),
        },
        { values: flattenColorPalette(theme("backgroundColor")), type: "color" }
      );
    },
    require("tailwindcss-animate"),
    require("@tailwindcss/typography"),
    nextui({
      themes: {
        light: {
          colors: {
            background: "#fafafa",
            foreground: "#010203",
            focus: "#0d0d0d",
            secondary: {
              50: "#f2f2f2",
              100: "#d9d9d9",
              200: "#bfbfbf",
              300: "#a6a6a6",
              400: "#8c8c8c",
              500: "#737373",
              600: "#595959",
              700: "#404040",
              800: "#262626",
              900: "#0d0d0d",
              foreground: "#ffffff",
              DEFAULT: "#0d0d0d",
            },
            primary: {
              50: "#dbf1ff",
              100: "#afe0ff",
              200: "#80cafe",
              300: "#4faffa",
              400: "#219ff8",
              500: "#0786de",
              600: "#0068ae",
              700: "#004a7d",
              800: "#002d4e",
              900: "#001020",
              foreground: "#010203",
              DEFAULT: "#219ff8",
            },
            danger: {
              50: "#ffe1e1",
              100: "#ffb1b1",
              200: "#ff7f7f",
              300: "#ff4c4c",
              400: "#ff1a1a",
              500: "#e60000",
              600: "#b40000",
              700: "#810000",
              800: "#500000",
              900: "#210000",
              foreground: "#FFFFFF",
              DEFAULT: "#FF0000",
            },
          },
        },
        dark: {
          colors: {
            background: "#050505",
            foreground: "#FBFCFE",
            focus: "#fafafa",
            secondary: {
              50: "#001b1d",
              100: "#004d4e",
              200: "#007f81",
              300: "#00b1b3",
              400: "#00e4e6",
              500: "#1afdff",
              600: "#47fdff",
              700: "#7affff",
              800: "#aaffff",
              900: "#d6ffff",
              foreground: "#000000",
              DEFAULT: "#00e4e6",
            },
            danger: {
              50: "#210000",
              100: "#500000",
              200: "#810000",
              300: "#b40000",
              400: "#e60000",
              500: "#ff1a1a",
              600: "#ff4c4c",
              700: "#ff7f7f",
              800: "#ffb1b1",
              900: "#ffe1e1",
              foreground: "#FFFFFF",
              DEFAULT: "#FF0000",
            },
          },
        },
      },
    }),
  ],
} satisfies Config;
