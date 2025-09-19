/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Keeping 브랜드 색상
        'keeping-beige': '#faf8f6',
        'keeping-blue': '#4c97d6',
        'keeping-yellow': '#ffda69',
        'keeping-charcoal': '#333333',
        
        // 의미 기반 색상
        primary: '#000000',
        'primary-fg': '#ffffff',
        accent: '#ffda69',
        bg: '#ffffff',
        surface: '#ffffff',
        border: '#000000',
        text: '#000000',
        'text-muted': '#cccccc',
        
        // 상태 색상
        success: '#22c55e',
        warning: '#ffda69',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['var(--font-nanum-square-neo)', 'Arial', 'Helvetica', 'sans-serif'],
        display: ['var(--font-tenada)', 'Arial', 'Helvetica', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
