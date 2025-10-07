/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
    "./games/**/*.{js,ts,jsx,tsx}",
  ],

  darkTheme: "pixel-dark",

  themes: [
    {
      "pixel-dark": {
        primary: "#dc2626",
        "primary-content": "#fafafa",
        secondary: "#9333ea",
        "secondary-content": "#fafafa",
        accent: "#eab308",
        "accent-content": "#1a1a1a",
        neutral: "#1a1a1a",
        "neutral-content": "#fafafa",
        "base-100": "#0f172a",
        "base-200": "#1e293b",
        "base-300": "#334155",
        "base-content": "#fafafa",
        info: "#2563eb",
        success: "#16a34a",
        warning: "#ea580c",
        error: "#dc2626",
        ".bg-gradient-modal": {
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
        },
        ".bg-modal": {
          background: "#0f172a",
        },
        ".modal-border": {
          border: "2px solid #eab308",
        },
        ".bg-gradient-nav": {
          background: "#0f172a",
        },
        ".bg-main": {
          background: "#0f172a",
        },
        ".bg-underline": {
          background: "#dc2626",
        },
        ".bg-container": {
          background: "#1e293b",
        },
        ".bg-btn-wallet": {
          background: "linear-gradient(135deg, #dc2626 0%, #9333ea 100%)",
        },
        ".bg-input": {
          background: "rgba(255, 255, 255, 0.05)",
        },
        ".bg-component": {
          background: "#334155",
        },
        ".bg-function": {
          background: "rgba(220, 38, 38, 0.2)",
        },
        ".text-function": {
          color: "#dc2626",
        },
        ".text-network": {
          color: "#eab308",
        },
        "--rounded-btn": "0.25rem",

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
          background: "#334155",
        },
      },
    },
    {
      "pixel-light": {
        primary: "#dc2626",
        "primary-content": "#fafafa",
        secondary: "#9333ea",
        "secondary-content": "#fafafa",
        accent: "#eab308",
        "accent-content": "#1a1a1a",
        neutral: "#737373",
        "neutral-content": "#1a1a1a",
        "base-100": "#fafafa",
        "base-200": "#f3f4f6",
        "base-300": "#e5e7eb",
        "base-content": "#1a1a1a",
        info: "#2563eb",
        success: "#16a34a",
        warning: "#ea580c",
        error: "#dc2626",
        ".bg-gradient-modal": {
          background: "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
        },
        ".bg-modal": {
          background: "#fafafa",
        },
        ".modal-border": {
          border: "2px solid #eab308",
        },
        ".bg-gradient-nav": {
          background: "#fafafa",
        },
        ".bg-main": {
          background: "#fafafa",
        },
        ".bg-underline": {
          background: "#dc2626",
        },
        ".bg-container": {
          background: "#f3f4f6",
        },
        ".bg-btn-wallet": {
          background: "linear-gradient(135deg, #dc2626 0%, #9333ea 100%)",
        },
        ".bg-input": {
          background: "rgba(0, 0, 0, 0.05)",
        },
        ".bg-component": {
          background: "#ffffff",
        },
        ".bg-function": {
          background: "rgba(220, 38, 38, 0.1)",
        },
        ".text-function": {
          color: "#dc2626",
        },
        ".text-network": {
          color: "#9333ea",
        },
        "--rounded-btn": "0.25rem",

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
          background: "#ffffff",
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
        'pixel': '4px 4px 0px rgba(0, 0, 0, 0.8)',
        'pixel-lg': '8px 8px 0px rgba(0, 0, 0, 0.8)',
        'neon-red': '0 0 10px #dc2626, 0 0 20px #dc2626, 0 0 30px #dc2626',
        'neon-purple': '0 0 10px #9333ea, 0 0 20px #9333ea, 0 0 30px #9333ea',
        'neon-yellow': '0 0 10px #eab308, 0 0 20px #eab308',
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        'pixel-float': 'pixelFloat 3s ease-in-out infinite',
        'retro-blink': 'retroBlink 1s infinite',
        'scanline': 'scanline 8s linear infinite',
        'crt-flicker': 'crtFlicker 0.15s infinite',
      },
      keyframes: {
        pixelFloat: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        retroBlink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        crtFlicker: {
          '0%': { opacity: '0.98' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.98' },
        },
      },
      colors: {
        'pixel-black': '#0a0a0a',
        'pixel-dark-gray': '#1a1a1a',
        'pixel-gray': '#404040',
        'pixel-light-gray': '#737373',
        'pixel-white': '#fafafa',
      },
      backgroundColor: {
        'pixel-bg-game': '#0a0f1e',
      },
      borderColor: {
        'pixel-gray': '#404040',
        'pixel-dark-gray': '#1a1a1a',
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
