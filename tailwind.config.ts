import type { Config } from 'tailwindcss';
import { addDynamicIconSelectors } from '@iconify/tailwind';

export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "./entrypoints/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pinterest: {
          red: '#e60023',
          darkRed: '#ad081b',
        }
      }
    },
  },
  plugins: [
    addDynamicIconSelectors(),
  ],
  future: {
    hoverOnlyWhenSupported: true,
  },
} satisfies Config; 
