/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        'deep-sea': '#0A1628',
        'ocean-dark': '#0D1F38',
        'ocean-mid': '#1A2D4A',
        'ocean-light': '#2A4A7A',
        'tech-cyan': '#00D4FF',
        'tech-cyan-soft': '#4DE8FF',
        'eco-green': '#00FF88',
        'eco-green-soft': '#66FFB2',
        'warn-orange': '#FF8800',
        'warn-orange-soft': '#FFAA44',
        'danger-red': '#FF3355',
        'danger-red-soft': '#FF6680',
        'approval-gold': '#FFD700',
        'approval-gold-soft': '#FFE44D',
        'text-primary': '#E8F4FF',
        'text-secondary': '#8AB4D8',
        'text-muted': '#5A7A9A',
        'glass-bg': 'rgba(26, 45, 74, 0.75)',
        'glass-border': 'rgba(0, 212, 255, 0.2)',
      },
      fontFamily: {
        'tech': ['Orbitron', 'JetBrains Mono', 'Consolas', 'monospace'],
        'sans': ['PingFang SC', 'Microsoft YaHei', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 212, 255, 0.5), 0 0 30px rgba(0, 212, 255, 0.25)',
        'neon-green': '0 0 15px rgba(0, 255, 136, 0.5), 0 0 30px rgba(0, 255, 136, 0.25)',
        'neon-gold': '0 0 15px rgba(255, 215, 0, 0.5), 0 0 30px rgba(255, 215, 0, 0.25)',
        'neon-red': '0 0 15px rgba(255, 51, 85, 0.5), 0 0 30px rgba(255, 51, 85, 0.25)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scan': 'scan 2s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
        'ripple': 'ripple 2s ease-out infinite',
        'flow': 'flow 1.5s linear infinite',
      },
      keyframes: {
        scan: {
          '0%, 100%': { transform: 'translateY(-100%)' },
          '50%': { transform: 'translateY(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
        flow: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'grid-pattern': 'linear-gradient(rgba(0,212,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.05) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
