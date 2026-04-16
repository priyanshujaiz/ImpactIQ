/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 🎯 Core palette (PRD aligned)
        primary: "#2563eb",
        primaryLight: "#dbeafe",

        sidebar: "#0f172a",
        sidebarHover: "#1e293b",

        canvas: "#f8fafc",
        card: "#ffffff",
        cardBg: "#f1f5f9",

        border: "#e2e8f0",

        success: "#16a34a",
        successBg: "#dcfce7",

        danger: "#dc2626",
        dangerBg: "#fee2e2",

        warning: "#d97706",
        warningBg: "#fef3c7",

        info: "#0ea5e9",
        infoBg: "#e0f2fe",

        textPrimary: "#0f172a",
        textSecondary: "#64748b",
      },

      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
      },

      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04)",
      },

      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [],
};