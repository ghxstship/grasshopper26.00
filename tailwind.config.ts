import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // GHXSTSHIP Monochromatic Color System
        black: '#000000',
        white: '#FFFFFF',
        grey: {
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        
        // Shadcn/UI compatibility layer (mapped to monochromatic)
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        
        // Design System Token Bridge (monochromatic)
        brand: {
          DEFAULT: '#000000',
          hover: '#262626',
          active: '#404040',
          subtle: '#737373',
          disabled: '#A3A3A3',
        },
        'brand-accent': {
          DEFAULT: '#FFFFFF',
          hover: '#F5F5F5',
          active: '#E5E5E5',
          subtle: '#D4D4D4',
        },
        success: {
          DEFAULT: '#404040',
          bg: '#F5F5F5',
          border: '#525252',
          text: '#171717',
        },
        error: {
          DEFAULT: '#262626',
          bg: '#E5E5E5',
          border: '#404040',
          text: '#000000',
        },
        warning: {
          DEFAULT: '#525252',
          bg: '#F5F5F5',
          border: '#737373',
          text: '#171717',
        },
        info: {
          DEFAULT: '#737373',
          bg: '#F5F5F5',
          border: '#A3A3A3',
          text: '#262626',
        },
      },
      fontFamily: {
        anton: ['var(--font-anton)', 'Impact', 'Arial Black', 'sans-serif'],
        bebas: ['var(--font-bebas)', 'Arial Narrow', 'Arial', 'sans-serif'],
        share: ['var(--font-share)', 'Monaco', 'Consolas', 'monospace'],
        'share-mono': ['var(--font-share-mono)', 'Courier New', 'monospace'],
      },
      fontSize: {
        'hero': 'clamp(48px, 10vw, 120px)',
        'h1': 'clamp(36px, 8vw, 80px)',
        'h2': 'clamp(28px, 5vw, 56px)',
        'h3': 'clamp(24px, 4vw, 40px)',
        'h4': 'clamp(20px, 3vw, 32px)',
        'h5': 'clamp(18px, 2.5vw, 24px)',
        'h6': 'clamp(16px, 2vw, 20px)',
        'body': 'clamp(15px, 1.5vw, 18px)',
        'meta': 'clamp(11px, 1.2vw, 14px)',
      },
      spacing: {
        // Map to design token spacing
        // Tailwind's default spacing already works with our 4px grid
      },
      borderRadius: {
        lg: "var(--radius-lg)",
        md: "var(--radius-md)",
        sm: "var(--radius-sm)",
        xl: "var(--radius-xl)",
        '2xl': "var(--radius-2xl)",
        full: "var(--radius-full)",
      },
      borderWidth: {
        '3': '3px',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        DEFAULT: 'var(--shadow-base)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
        '2xl': 'var(--shadow-2xl)',
        glow: 'var(--shadow-glow)',
        'geometric': '8px 8px 0 0 rgba(0, 0, 0, 1)',
        'geometric-white': '8px 8px 0 0 rgba(255, 255, 255, 1)',
      },
      backgroundImage: {
        'halftone-pattern': 'radial-gradient(circle, black 20%, transparent 20%), radial-gradient(circle, black 20%, transparent 20%)',
        'stripe-pattern': 'repeating-linear-gradient(45deg, black, black 2px, transparent 2px, transparent 10px)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        geometricReveal: {
          '0%': { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)' },
          '100%': { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'geometric-reveal': 'geometricReveal 0.5s ease-out',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
