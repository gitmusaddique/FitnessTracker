import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          container: "var(--md-sys-color-primary-container)",
          "container-foreground": "var(--md-sys-color-on-primary-container)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
          container: "var(--md-sys-color-secondary-container)",
          "container-foreground": "var(--md-sys-color-on-secondary-container)",
        },
        tertiary: {
          DEFAULT: "var(--md-sys-color-tertiary)",
          foreground: "var(--md-sys-color-on-tertiary)",
          container: "var(--md-sys-color-tertiary-container)",
          "container-foreground": "var(--md-sys-color-on-tertiary-container)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        error: {
          DEFAULT: "var(--md-sys-color-error)",
          foreground: "var(--md-sys-color-on-error)",
          container: "var(--md-sys-color-error-container)",
          "container-foreground": "var(--md-sys-color-on-error-container)",
        },
        surface: {
          DEFAULT: "var(--md-sys-color-surface)",
          foreground: "var(--md-sys-color-on-surface)",
          dim: "var(--md-sys-color-surface-dim)",
          bright: "var(--md-sys-color-surface-bright)",
          variant: "var(--md-sys-color-on-surface-variant)",
          container: {
            DEFAULT: "var(--md-sys-color-surface-container)",
            lowest: "var(--md-sys-color-surface-container-lowest)",
            low: "var(--md-sys-color-surface-container-low)",
            high: "var(--md-sys-color-surface-container-high)",
            highest: "var(--md-sys-color-surface-container-highest)",
          },
        },
        outline: {
          DEFAULT: "var(--md-sys-color-outline)",
          variant: "var(--md-sys-color-outline-variant)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        success: "var(--success)",
        warning: "var(--warning)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
