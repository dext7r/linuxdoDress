import { type Config } from "tailwindcss";

export default {
  content: [
    "{routes,islands,components}/**/*.{ts,tsx,js,jsx}",
  ],
  darkMode: "class", // 启用基于class的暗色模式
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "spin-slow": "spin 2s linear infinite",
        "gradient-flow": "gradient-flow 8s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "float-delayed": "float-delayed 8s ease-in-out infinite",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        "bounce-scale": "bounce-scale 0.6s ease-in-out",
        "rotate-glow": "rotate-glow 3s linear infinite",
        "text-gradient": "text-gradient 4s ease infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "gradient-flow": {
          "0%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
          "100%": { "background-position": "0% 50%" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px) scale(1)", opacity: "0.6" },
          "50%": { transform: "translateY(-10px) scale(1.05)", opacity: "0.8" },
        },
        "float-delayed": {
          "0%, 100%": { transform: "translateY(0px) scale(1)", opacity: "0.4" },
          "50%": { transform: "translateY(10px) scale(0.95)", opacity: "0.6" },
        },
        "glow-pulse": {
          "0%, 100%": { "box-shadow": "0 0 5px rgba(59, 130, 246, 0.3)" },
          "50%": {
            "box-shadow":
              "0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4)",
          },
        },
        "bounce-scale": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        "rotate-glow": {
          "0%": { transform: "rotate(0deg)", filter: "brightness(1)" },
          "50%": { transform: "rotate(180deg)", filter: "brightness(1.2)" },
          "100%": { transform: "rotate(360deg)", filter: "brightness(1)" },
        },
        "text-gradient": {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
