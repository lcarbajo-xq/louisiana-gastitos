/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}'
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Colores principales del diseño
        primary: {
          purple: '#8B5CF6',
          blue: '#3B82F6',
          pink: '#EC4899',
          green: '#10B981'
        },
        // Categorías de gastos
        categories: {
          food: '#F59E0B', // Amarillo
          shopping: '#EC4899', // Rosa
          transport: '#8B5CF6', // Morado
          health: '#6366F1', // Púrpura
          education: '#3B82F6', // Azul
          other: '#6B7280' // Gris
        },
        // Gradientes como CSS custom properties
        gradients: {
          'primary-start': '#8B5CF6',
          'primary-end': '#3B82F6',
          'card-start': '#1F2937',
          'card-end': '#111827'
        }
      },
      fontFamily: {
        'sf-pro': ['SF Pro Display', 'system-ui', 'sans-serif']
      },
      fontSize: {
        'display-lg': ['2.5rem', { lineHeight: '3rem', fontWeight: '700' }],
        'display-md': ['2rem', { lineHeight: '2.5rem', fontWeight: '600' }],
        'body-lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '400' }],
        caption: ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }]
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
        'gradient-card': 'linear-gradient(135deg, #1F2937 0%, #111827 100%)'
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        button:
          '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }
    }
  },
  plugins: []
}
