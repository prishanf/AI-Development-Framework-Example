import type { Config } from 'tailwindcss'

export default {
  content: [
    './app/components/**/*.{vue,js,ts}',
    './app/layouts/**/*.vue',
    './app/pages/**/*.vue',
    './app/app.vue',
    './app/plugins/**/*.{js,ts}'
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#242424',
          deep: '#111111'
        },
        muted: {
          DEFAULT: '#898989',
          soft: '#b0b0b0'
        },
        paper: {
          DEFAULT: '#ffffff',
          tint: '#f5f5f5'
        },
        income: '#0f7a4a',
        expense: '#c0392b',
        link: '#0099ff',
        focus: '#3b82f6'
      },
      fontFamily: {
        display: ['"Cal Sans"', 'Inter', 'sans-serif'],
        sans: ['Inter', 'Segoe UI', 'sans-serif']
      },
      borderRadius: {
        control: '8px',
        surface: '12px'
      },
      spacing: {
        control: '2.25rem'
      },
      minHeight: {
        control: '2.25rem'
      },
      height: {
        control: '2.25rem'
      },
      width: {
        control: '2.25rem'
      },
      boxShadow: {
        ring:
          'rgba(19, 19, 22, 0.55) 0px 1px 3px -2px, rgba(34, 42, 53, 0.08) 0px 0px 0px 1px',
        inset: 'rgba(0, 0, 0, 0.06) 0px 1px 2px 0px inset'
      }
    }
  },
  plugins: []
} satisfies Config
