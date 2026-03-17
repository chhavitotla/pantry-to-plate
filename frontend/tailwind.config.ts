import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./types/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        chefmate: {
          oat: "#FBF7EF",
          "oat-deep": "#DAD1C4",
          ink: "#24304A",
          muted: "#6E768A",
          terracotta: "#F36C97",
          sage: "#5D8D71",
          saffron: "#F4D978",
          plum: "#24304A",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        display: ["var(--font-nunito)"],
        sans: ["var(--font-dm-sans)"],
      },
      boxShadow: {
        soft: "0 20px 60px -34px rgba(31, 38, 51, 0.18)",
        lifted: "0 28px 80px -34px rgba(31, 38, 51, 0.22)",
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top left, rgba(231, 216, 175, 0.24), transparent 34%), radial-gradient(circle at top right, rgba(93, 141, 113, 0.08), transparent 24%), linear-gradient(180deg, rgba(251, 247, 239, 1) 0%, rgba(249, 245, 236, 0.96) 100%)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
