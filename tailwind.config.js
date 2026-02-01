/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        heading: ['Bricolage Grotesque', 'sans-serif'],
      },
      // Typography scale (Stripe/Linear inspired)
      fontSize: {
        // Display sizes (Hero sections, marketing)
        'display-2xl': ['4.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-lg': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'display-md': ['2.25rem', { lineHeight: '1.25', letterSpacing: '-0.02em', fontWeight: '600' }],
        'display-sm': ['1.875rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],

        // Heading sizes (Page titles, sections)
        'heading-xl': ['1.5rem', { lineHeight: '1.35', fontWeight: '600' }],
        'heading-lg': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'heading-md': ['1.125rem', { lineHeight: '1.45', fontWeight: '600' }],
        'heading-sm': ['1rem', { lineHeight: '1.5', fontWeight: '600' }],

        // Body text
        'body-lg': ['1.125rem', { lineHeight: '1.75' }],
        'body-md': ['1rem', { lineHeight: '1.75' }],
        'body-sm': ['0.875rem', { lineHeight: '1.7' }],
        'body-xs': ['0.75rem', { lineHeight: '1.6' }],

        // Labels and captions
        'label-lg': ['0.875rem', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.01em' }],
        'label-md': ['0.8125rem', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.01em' }],
        'label-sm': ['0.75rem', { lineHeight: '1.4', fontWeight: '500', letterSpacing: '0.02em' }],
      },
      // Spacing system (8px baseline grid)
      spacing: {
        'section-sm': '3rem',
        'section-md': '5rem',
        'section-lg': '7rem',
        'section-xl': '8rem',
        'component-xs': '0.5rem',
        'component-sm': '1rem',
        'component-md': '1.5rem',
        'component-lg': '2rem',
        'component-xl': '2.5rem',
      },
      colors: {
        // Sqordia brand colors (preserved)
        'strategy-blue': '#1A2B47',
        'momentum-orange': '#FF6B00',
        'light-ai-grey': '#F4F7FA',

        // shadcn/ui semantic colors (CSS variables)
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
        // Semantic status colors
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(var(--primary-rgb), 0.3)',
        'glow-md': '0 0 25px -5px rgba(var(--primary-rgb), 0.4)',
        'glow-lg': '0 0 35px -5px rgba(var(--primary-rgb), 0.5)',
        'glow-orange': '0 0 25px -5px rgba(255, 107, 0, 0.4)',
        // Modern layered shadows (Josh W. Comeau style)
        'card': `
          0 1px 1px hsl(0deg 0% 0% / 0.04),
          0 2px 2px hsl(0deg 0% 0% / 0.04),
          0 4px 4px hsl(0deg 0% 0% / 0.04),
          0 8px 8px hsl(0deg 0% 0% / 0.04)
        `,
        'card-hover': `
          0 2px 2px hsl(0deg 0% 0% / 0.05),
          0 4px 4px hsl(0deg 0% 0% / 0.05),
          0 8px 8px hsl(0deg 0% 0% / 0.05),
          0 16px 16px hsl(0deg 0% 0% / 0.05),
          0 32px 32px hsl(0deg 0% 0% / 0.03)
        `,
        'elevated': `
          0 4px 6px -1px hsl(0deg 0% 0% / 0.1),
          0 2px 4px -2px hsl(0deg 0% 0% / 0.1),
          0 10px 15px -3px hsl(0deg 0% 0% / 0.08)
        `,
        'soft': '0 2px 15px -3px hsl(0deg 0% 0% / 0.1), 0 4px 6px -4px hsl(0deg 0% 0% / 0.1)',
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
        // Entrance animations
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-down": {
          "0%": { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-left": {
          "0%": { opacity: "0", transform: "translateX(16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "fade-in-right": {
          "0%": { opacity: "0", transform: "translateX(-16px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        // Background animations
        "blob": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
        },
        "gradient-shift": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        // Loading animations
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(255, 107, 0, 0.4)" },
          "50%": { boxShadow: "0 0 0 12px rgba(255, 107, 0, 0)" },
        },
        // Indeterminate progress
        "indeterminate": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(400%)" },
        },
        // Floating effect
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        // Spin slow
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        // Entrance animations
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "fade-in-down": "fade-in-down 0.6s ease-out",
        "fade-in-left": "fade-in-left 0.6s ease-out",
        "fade-in-right": "fade-in-right 0.6s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        // Background animations
        "blob": "blob 8s ease-in-out infinite",
        "gradient-shift": "gradient-shift 3s ease infinite",
        "gradient-x": "gradient-x 15s ease infinite",
        // Loading
        "shimmer": "shimmer 2s linear infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "indeterminate": "indeterminate 1.5s ease-in-out infinite",
        // Effects
        "float": "float 3s ease-in-out infinite",
        "spin-slow": "spin-slow 8s linear infinite",
      },
      transitionTimingFunction: {
        "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "spring": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      },
      backgroundImage: {
        // Clean background patterns
        'dot-pattern': 'radial-gradient(circle, #1A2B47 1px, transparent 1px)',
        'dot-pattern-light': 'radial-gradient(circle, rgba(26, 43, 71, 0.1) 1px, transparent 1px)',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
  darkMode: 'class',
}
