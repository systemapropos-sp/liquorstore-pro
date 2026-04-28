/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/App.tsx', './src/main.tsx', './src/index.css', './src/components/Layout.tsx', './src/components/KeyboardShortcuts.tsx', './src/components/NotificationsPanel.tsx', './src/pages/Dashboard.tsx', './src/pages/Products.tsx', './src/pages/Categories.tsx', './src/pages/Invoices.tsx', './src/pages/InvoiceHistory.tsx', './src/pages/InvoiceResponsibles.tsx', './src/pages/Orders.tsx', './src/pages/Credits.tsx', './src/pages/Purchases.tsx', './src/pages/Deliveries.tsx', './src/pages/Customers.tsx', './src/pages/Suppliers.tsx', './src/pages/Employees.tsx', './src/pages/Payroll.tsx', './src/pages/Expenses.tsx', './src/pages/Reports.tsx', './src/pages/Settings.tsx', './src/pages/SettingsHub.tsx', './src/pages/TransferHistory.tsx', './src/pages/Transfers.tsx', './src/pages/StockCount.tsx', './src/pages/Adjustments.tsx', './src/pages/Branches.tsx', './src/pages/TableSales.tsx', './src/pages/Comandas.tsx', './src/pages/WhatsApp.tsx', './src/pages/Login.tsx', './src/pages/Home.tsx', './src/pages/ExpenseHistory.tsx', './src/pages/FixedExpenses.tsx', './src/pages/Users.tsx', './src/pages/settings/UserSettings.tsx', './src/pages/settings/BusinessSettings.tsx', './src/pages/settings/WhatsAppSettings.tsx', './src/pages/settings/GeneralSettings.tsx', './src/pages/settings/PayrollSettings.tsx', './src/lib/mockDb.ts', './src/lib/mockApi.ts', './src/providers/trpc.tsx'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
