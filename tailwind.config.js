/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'theme-bg': 'var(--bg-color)',
        'theme-main': 'var(--bg-main)',
        'theme-card': 'var(--bg-card)',
        'theme-card-secondary': 'var(--bg-card-secondary)',
        'theme-text': 'var(--text-color)',
        'theme-primary': 'var(--text-primary)',
        'theme-secondary': 'var(--text-secondary)',
        'theme-muted': 'var(--text-muted)',
        'theme-btn': 'var(--btn-primary)',
        'theme-btn-text': 'var(--btn-primary-text)',
        'theme-btn-hover': 'var(--btn-primary-hover)',
        'theme-success': 'var(--color-success)',
        'theme-accent': 'var(--color-accent)',
        'theme-border': 'var(--border-color)',
        'theme-border-subtle': 'var(--border-subtle)',
      },
      backgroundColor: {
        'theme-bg': 'var(--bg-color)',
        'theme-main': 'var(--bg-main)',
        'theme-card': 'var(--bg-card)',
        'theme-btn': 'var(--btn-primary)',
      },
      textColor: {
        'theme-text': 'var(--text-color)',
        'theme-primary': 'var(--text-primary)',
        'theme-secondary': 'var(--text-secondary)',
      },
      borderColor: {
        'theme': 'var(--border-color)',
      },
    },
  },
  plugins: [],
};
