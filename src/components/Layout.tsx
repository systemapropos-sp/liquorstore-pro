import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/providers/theme";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Wine,
  Users,
  Truck,
  FileText,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Settings,
  Menu,
  Sun,
  Moon,
  LogOut,
  ChevronLeft,
  Building2,
  ClipboardList,
  Bike,
} from "lucide-react";

const menuItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/inventario", label: "Inventario", icon: Wine },
  { path: "/facturacion", label: "Facturación", icon: FileText },
  { path: "/ordenes", label: "Órdenes", icon: ClipboardList },
  { path: "/creditos", label: "Créditos", icon: CreditCard },
  { path: "/compras", label: "Compras", icon: ShoppingCart },
  { path: "/delivery", label: "Delivery", icon: Bike },
  { path: "/clientes", label: "Clientes", icon: Users },
  { path: "/proveedores", label: "Proveedores", icon: Truck },
  { path: "/sucursales", label: "Sucursales", icon: Building2 },
  { path: "/reportes", label: "Reportes", icon: BarChart3 },
  { path: "/ajustes", label: "Ajustes", icon: Settings },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#E30A17] flex items-center justify-center">
            <Wine className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-foreground">
            LiquorStore
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onNavigate}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${
                  isActive
                    ? "bg-[#E30A17]/10 text-[#E30A17] dark:bg-[#1AB2B3]/10 dark:text-[#1AB2B3]"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }
              `}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-2">
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              <Users className="w-4 h-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || user?.email || "Usuario"}</p>
            <p className="text-xs text-muted-foreground truncate capitalize">{user?.role || "user"}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="sm" className="flex-1" onClick={logout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col border-r border-border bg-card transition-all duration-300 ${
          collapsed ? "w-[70px]" : "w-[260px]"
        }`}
      >
        {!collapsed ? (
          <SidebarContent />
        ) : (
          <div className="flex flex-col h-full items-center py-4">
            <div className="w-8 h-8 rounded-lg bg-[#E30A17] flex items-center justify-center mb-6">
              <Wine className="w-5 h-5 text-white" />
            </div>
            <nav className="flex-1 space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-center w-10 h-10 rounded-lg transition-colors ${
                      isActive
                        ? "bg-[#E30A17]/10 text-[#E30A17] dark:bg-[#1AB2B3]/10 dark:text-[#1AB2B3]"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                    title={item.label}
                  >
                    <Icon className="w-4 h-4" />
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center w-full py-2 border-t border-border hover:bg-accent transition-colors"
        >
          <ChevronLeft
            className={`w-4 h-4 transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-[#E30A17] flex items-center justify-center">
            <Wine className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base">LiquorStore</span>
        </div>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="md:hidden h-14" />
        <div className="p-4 md:p-6 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
