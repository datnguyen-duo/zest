/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
  prefix: '',

  theme: {
    container: {
      center: true,
      padding: {
        '2xl': '2rem',
        DEFAULT: '1rem',
        lg: '2rem',
        md: '2rem',
        sm: '1rem',
        xl: '2rem',
      },
      screens: {
        '2xl': '86rem',
        lg: '64rem',
        md: '48rem',
        sm: '40rem',
        xl: '80rem',
      },
    },
    extend: {
      fontSize: {
        h1: [
          'clamp(2.5rem, 9vw, 174px)',
          {
            lineHeight: '.95',
            letterSpacing: '-0.02em',
            fontWeight: '800',
          },
        ],
        h2: [
          'clamp(2rem, 4.8vw, 92px)',
          {
            lineHeight: '1.1',
            letterSpacing: '-0.02em',
            fontWeight: '700',
          },
        ],
        h3: [
          'clamp(1.75rem, 3.125vw, 60px)',
          {
            lineHeight: '1.1',
            letterSpacing: '-0.02em',
            fontWeight: '700',
          },
        ],
        h4: [
          'clamp(1.5rem, 2vw, 40px)',
          {
            lineHeight: '1.15',
            letterSpacing: '-0.01em',
            fontWeight: '700',
          },
        ],
        h5: [
          'clamp(1.25rem, 1.35vw, 26px)',
          {
            lineHeight: '1.2',
            fontWeight: '600',
          },
        ],
        h6: [
          '18px',
          {
            lineHeight: '1',
            fontWeight: '400',
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
          },
        ],
      },
      fontFamily: {
        switzer: ['Switzer', 'sans-serif'],
      },
      colors: {
        midnightGreen: '#0D474B',
        cornSilk: '#FFF8E1',
        schoolBusYellow: '#FADD24',
        khaki: '#E4D291',
        teaGreen: '#C8E8CE',
        dustyPink: '#E4CCC8',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        fadeIn: 'fadeIn 0.3s ease-in-out forwards',
        fadeOut: 'fadeOut 0.3s ease-in-out forwards',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeOut: {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
      },
    },
  },
}
