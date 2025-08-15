/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tokyo Night palette
        'tokyo-bg': '#1a1b26',
        'tokyo-bg-dark': '#16161e',
        'tokyo-bg-highlight': '#292e42',
        'tokyo-fg': '#c0caf5',
        'tokyo-fg-dark': '#a9b1d6',
        'tokyo-fg-gutter': '#3b4261',
        'tokyo-dark3': '#545c7e',
        'tokyo-comment': '#565f89',
        'tokyo-dark5': '#737aa2',
        'tokyo-blue0': '#3d59a1',
        'tokyo-blue': '#7aa2f7',
        'tokyo-cyan': '#7dcfff',
        'tokyo-blue1': '#2ac3de',
        'tokyo-blue2': '#0db9d7',
        'tokyo-blue5': '#89ddff',
        'tokyo-blue6': '#b4f9f8',
        'tokyo-blue7': '#394b70',
        'tokyo-magenta': '#bb9af7',
        'tokyo-magenta2': '#ff007c',
        'tokyo-purple': '#9d7cd8',
        'tokyo-orange': '#ff9e64',
        'tokyo-yellow': '#e0af68',
        'tokyo-green': '#9ece6a',
        'tokyo-green1': '#73daca',
        'tokyo-green2': '#41a6b5',
        'tokyo-teal': '#1abc9c',
        'tokyo-red': '#f7768e',
        'tokyo-red1': '#db4b4b',
      },
      backgroundColor: {
        'board-dark': '#292e42',
        'board-light': '#7aa2f7',
        'board-dark-hover': '#3d59a1',
        'board-light-hover': '#89ddff',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}