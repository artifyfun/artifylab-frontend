export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'tech-dark': '#0f172a',
        'tech-darker': '#0a0f1f',
        'tech-blue': '#40e0d0',
        'tech-purple': '#6a11cb',
        'tech-pink': '#ec4899',
        'tech-cyan': '#06b6d4',
        'tech-green': '#10b981',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
        glow: 'glow 3s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { 'box-shadow': '0 0 5px #40e0d0, 0 0 10px #40e0d0' },
          '100%': { 'box-shadow': '0 0 15px #40e0d0, 0 0 30px #40e0d0' },
        },
      },
    },
  },
}
