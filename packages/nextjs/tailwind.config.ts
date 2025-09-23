/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],

  darkTheme: "dark",

  themes: [
    {
      light: {
        primary: "#93BBFB",
        "primary-content": "#2A3655",
        secondary: "#8B45FD",
        "secondary-content": "#7800FF",
        accent: "#93BBFB",
        "accent-content": "#212638",
        neutral: "#212638",
        "neutral-content": "#ffffff",
        "base-100": "#ffffff",
        "base-200": "#f4f8ff",
        "base-300": "#ffffff",
        "base-content": "#212638",
        info: "#93BBFB",
        success: "#34EEB6",
        warning: "#FFCF72",
        error: "#FF8863",
        ".bg-gradient-modal": {
          "background-image":
            "linear-gradient(270deg, #A7ECFF -17.42%, #E8B6FF 109.05%)",
        },
        ".bg-modal": {
          background:
            "linear-gradient(270deg, #ece9fb -17.42%, #e3f4fd 109.05%)",
        },
        ".modal-border": {
          border: "1px solid #5c4fe5",
        },
        ".bg-gradient-nav": {
          background: "#000000",
        },
        ".bg-main": {
          background: "#FFFFFF",
        },
        ".bg-underline": {
          background:
            "linear-gradient(270deg, #A7ECFF -17.42%, #E8B6FF 109.05%)",
        },
        ".bg-container": {
          background: "transparent",
        },
        ".bg-btn-wallet": {
          "background-image":
            "linear-gradient(270deg, #A7ECFF -17.42%, #E8B6FF 109.05%)",
        },
        ".bg-input": {
          background: "rgba(0, 0, 0, 0.07)",
        },
        ".bg-component": {
          background: "rgba(255, 255, 255, 0.55)",
        },
        ".bg-function": {
          background:
            "linear-gradient(270deg, #A7ECFF -17.42%, #E8B6FF 109.05%)",
        },
        ".text-function": {
          color: "#3C1DFF",
        },
        ".text-network": {
          color: "#7800FF",
        },
        "--rounded-btn": "9999rem",

        ".tooltip": {
          "--tooltip-tail": "6px",
        },
        ".link": {
          textUnderlineOffset: "2px",
        },
        ".link:hover": {
          opacity: "80%",
        },
        ".contract-content": {
          background: "white",
        },
      },
    },
    {
      dark: {
        primary: "#212638",
        "primary-content": "#DAE8FF",
        secondary: "#8b45fd",
        "secondary-content": "#0FF",
        accent: "#4969A6",
        "accent-content": "#F9FBFF",
        neutral: "#F9FBFF",
        "neutral-content": "#385183",
        "base-100": "#1C223B",
        "base-200": "#2A3655",
        "base-300": "#141a30",
        "base-content": "#F9FBFF",
        info: "#385183",
        success: "#34EEB6",
        warning: "#FFCF72",
        error: "#FF8863",
        ".bg-gradient-modal": {
          background: "#385183",
        },
        ".bg-modal": {
          background: "linear-gradient(90deg, #2B2243 0%, #253751 100%)",
        },
        ".modal-border": {
          border: "1px solid #4f4ab7",
        },
        ".bg-gradient-nav": {
          "background-image":
            "var(--gradient, linear-gradient(90deg, #42D2F1 0%, #B248DD 100%))",
        },
        ".bg-main": {
          background: "#141A31",
        },
        ".bg-underline": {
          background: "#5368B4",
        },
        ".bg-container": {
          background: "#141a30",
        },
        ".bg-btn-wallet": {
          "background-image":
            "linear-gradient(180deg, #3457D1 0%, #8A45FC 100%)",
        },
        ".bg-input": {
          background: "rgba(255, 255, 255, 0.07)",
        },
        ".bg-component": {
          background:
            "linear-gradient(113deg,rgba(43, 34, 67, 0.6) 20.48%,rgba(37, 55, 81, 0.6) 99.67%)",
        },
        ".bg-function": {
          background: "rgba(139, 69, 253, 0.37)",
        },
        ".text-function": {
          color: "#1DD6FF",
        },
        ".text-network": {
          color: "#D0A6FF",
        },

        "--rounded-btn": "9999rem",

        ".tooltip": {
          "--tooltip-tail": "6px",
          "--tooltip-color": "oklch(var(--p))",
        },
        ".link": {
          textUnderlineOffset: "2px",
        },
        ".link:hover": {
          opacity: "80%",
        },
        ".contract-content": {
          background:
            "linear-gradient(113.34deg, rgba(43, 34, 67, 0.6) 20.48%, rgba(37, 55, 81, 0.6) 99.67%)",
        },
      },
    },
  ],

  theme: {
    extend: {
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'monospace'],
        'orbitron': ['Orbitron', 'sans-serif'],
      },
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
        'pixel': '4px 4px 0px rgba(0, 0, 0, 0.3)',
        'pixel-lg': '8px 8px 0px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        'pixel-float': 'pixelFloat 3s ease-in-out infinite',
        'retro-blink': 'retroBlink 1s infinite',
      },
      backgroundImage: {
        "gradient-light":
          "linear-gradient(270deg, #A7ECFF -17.42%, #E8B6FF 109.05%)",
        "gradient-dark":
          "var(--gradient, linear-gradient(90deg, #42D2F1 0%, #B248DD 100%))",
        "gradient-vertical":
          "linear-gradient(180deg, #3457D1 0%, #8A45FC 100%)",
        "gradient-icon":
          "var(--gradient, linear-gradient(90deg, #42D2F1 0%, #B248DD 100%))",
      },
    },
  },

  plugins: [
    function({ addUtilities }: { addUtilities: any }) {
      const newUtilities = {
        '.pixel-font': {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '8px',
          lineHeight: '1.5',
        },
        '.pixel-font-lg': {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '12px',
          lineHeight: '1.5',
        },
        '.pixel-font-xl': {
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '16px',
          lineHeight: '1.5',
        },
        '.orbitron-font': {
          fontFamily: 'Orbitron, sans-serif',
        },
        '.bg-main': {
          backgroundColor: '#FFFFFF',
        },
        '.dark .bg-main': {
          backgroundColor: '#141A31',
        },
        '.text-content': {
          color: '#212638',
        },
        '.dark .text-content': {
          color: '#F9FBFF',
        },
        '.pixel-text-shadow': {
          textShadow: '2px 2px 0px rgba(0, 0, 0, 0.8)',
        },
        '.retro-shadow': {
          boxShadow: '4px 4px 0px rgba(0, 0, 0, 0.3)',
        },
        '.retro-shadow-accent': {
          boxShadow: '6px 6px 0px rgba(147, 187, 251, 0.4)',
        },
      }
      addUtilities(newUtilities)
    },
  ],
};
