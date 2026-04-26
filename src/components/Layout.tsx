import { useState } from "react";
import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import {
  Sheet, SheetContent, SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Wine, Users, Truck, FileText, ShoppingCart,
  CreditCard, Package, Bike, BarChart3, Settings, Menu,
  LogOut, Building2, ClipboardList, ChevronDown, ChevronUp,
  Plus, Search, Bell, RefreshCw, HelpCircle, X,
  ArrowLeftRight, ClipboardCheck, ListChecks, History,
  UserCircle, MessageCircle, ChefHat, Table, DollarSign, TrendingDown, FolderOpen, UserCheck,
  AlertTriangle, Clock, Shield
} from "lucide-react";

interface MenuGroup {
  label: string;
  icon: React.ElementType;
  items: { path: string; label: string; icon: React.ElementType }[];
}

const menuGroups: MenuGroup[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    items: [{ path: "/", label: "Inicio", icon: LayoutDashboard }]
  },
  {
    label: "Facturacion",
    icon: FileText,
    items: [
      { path: "/facturacion", label: "Facturacion", icon: FileText },
      { path: "/facturacion/mesas", label: "Ventas por Mesas", icon: Table },
      { path: "/facturacion/historico", label: "Historico Facturas", icon: History },
      { path: "/facturacion/responsables", label: "Responsables", icon: UserCheck },
      { path: "/ordenes", label: "Ordenes de Venta", icon: ClipboardList },
    ]
  },
  {
    label: "Inventario",
    icon: Package,
    items: [
      { path: "/inventario", label: "Productos", icon: Package },
      { path: "/inventario/categorias", label: "Categorias", icon: ClipboardList },
      { path: "/inventario/traslados", label: "Traslados", icon: ArrowLeftRight },
      { path: "/inventario/traslados-historial", label: "Historico Traslados", icon: History },
      { path: "/inventario/toma", label: "Toma de Inventario", icon: ClipboardCheck },
      { path: "/inventario/ajustes", label: "Ajustes", icon: ListChecks },
    ]
  },
  {
    label: "Compras",
    icon: ShoppingCart,
    items: [
      { path: "/compras", label: "Ingresar Compras", icon: ShoppingCart },
      { path: "/proveedores", label: "Proveedores", icon: Truck },
    ]
  },
  {
    label: "Gastos",
    icon: TrendingDown,
    items: [
      { path: "/gastos", label: "Nuevo Gasto", icon: DollarSign },
      { path: "/gastos/historico", label: "Historico Gastos", icon: History },
      { path: "/gastos/fijos", label: "Gastos Fijos", icon: FolderOpen },
    ]
  },
  {
    label: "Creditos",
    icon: CreditCard,
    items: [
      { path: "/creditos", label: "Ventas a Credito", icon: CreditCard },
    ]
  },
  {
    label: "Delivery",
    icon: Bike,
    items: [
      { path: "/delivery", label: "Envios a Domicilio", icon: Bike },
    ]
  },
  {
    label: "Clientes",
    icon: Users,
    items: [
      { path: "/clientes", label: "Fichas de Clientes", icon: Users },
    ]
  },
  {
    label: "Empleados",
    icon: UserCircle,
    items: [
      { path: "/empleados", label: "Listado de Empleados", icon: UserCircle },
      { path: "/empleados/nomina", label: "Nomina", icon: ClipboardList },
    ]
  },
  {
    label: "Usuarios",
    icon: Shield,
    items: [
      { path: "/usuarios", label: "Usuarios y Roles", icon: Shield },
    ]
  },
  {
    label: "WhatsApp",
    icon: MessageCircle,
    items: [
      { path: "/whatsapp", label: "Mensajes y Pedidos", icon: MessageCircle },
    ]
  },
  {
    label: "Comandas",
    icon: ChefHat,
    items: [
      { path: "/comandas", label: "Pedidos de Cocina", icon: ChefHat },
    ]
  },
  {
    label: "Sucursales",
    icon: Building2,
    items: [
      { path: "/sucursales", label: "Sucursales", icon: Building2 },
    ]
  },
  {
    label: "Reportes",
    icon: BarChart3,
    items: [
      { path: "/reportes", label: "Reportes y Graficos", icon: BarChart3 },
    ]
  },
  {
    label: "Ajustes",
    icon: Settings,
    items: [
      { path: "/ajustes", label: "Configuracion", icon: Settings },
    ]
  },
];

function SidebarMenu({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const [expanded, setExpanded] = useState<string[]>(["Dashboard"]);

  const toggleGroup = (label: string) => {
    setExpanded(prev => prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]);
  };

  return (
    <nav className="flex-1 overflow-y-auto py-2">
      {menuGroups.map((group) => {
        const isExpanded = expanded.includes(group.label);
        const isActive = group.items.some(i => i.path === location.pathname);
        const GroupIcon = group.icon;

        return (
          <div key={group.label} className="mb-1">
            <button
              onClick={() => group.items.length === 1 ? undefined : toggleGroup(group.label)}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium transition-all ${
                isActive ? "text-[#1ABC9C] bg-emerald-50 border-l-[3px] border-[#1ABC9C]" : "text-gray-700 hover:text-[#1ABC9C] hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <GroupIcon className="w-4 h-4" />
                {group.items.length === 1 ? (
                  <Link to={group.items[0].path} onClick={onNavigate} className="flex items-center gap-3">
                    <span>{group.label}</span>
                  </Link>
                ) : (
                  <span>{group.label}</span>
                )}
              </div>
              {group.items.length > 1 && (
                isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
            {isExpanded && group.items.length > 1 && (
              <div className="bg-gray-50 border-l-2 border-gray-200 ml-6">
                {group.items.map((item) => {
                  const ItemIcon = item.icon;
                  const itemActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onNavigate}
                      className={`flex items-center gap-3 px-4 py-2 text-sm transition-all ${
                        itemActive
                          ? "text-[#1ABC9C] font-medium bg-emerald-50"
                          : "text-gray-600 hover:text-[#1ABC9C] hover:bg-gray-100"
                      }`}
                    >
                      <ItemIcon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { user, logout } = useAuth();

  // Demo notifications
  const notifications = [
    { type: 'low', message: 'Presidente Regular - bajo stock (3 unidades)', icon: AlertTriangle },
    { type: 'expiry', message: 'Brugal Extra Viejo - por vencer en 3 dias', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-[#f5f6fa] text-gray-800 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-[260px] bg-white border-r border-gray-200 fixed h-full z-40">
        <div className="p-4 border-b border-gray-200">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#1ABC9C] flex items-center justify-center">
              <Wine className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-gray-900">LiquorStore</span>
              <span className="block text-[10px] text-[#1ABC9C] font-semibold tracking-wider uppercase">Pro</span>
            </div>
          </Link>
        </div>
        <SidebarMenu />
        <div className="p-3 border-t border-gray-200">
          <button onClick={logout} className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-all w-full">
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesion</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 flex items-center justify-between px-4 h-14">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-[#1ABC9C] flex items-center justify-center">
            <Wine className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm">LiquorStore Pro</span>
        </Link>
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[260px] p-0 bg-white">
            <div className="p-4 border-b border-gray-200">
              <Link to="/" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
                <div className="w-9 h-9 rounded-lg bg-[#1ABC9C] flex items-center justify-center">
                  <Wine className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-base">LiquorStore Pro</span>
              </Link>
            </div>
            <SidebarMenu onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 md:ml-[260px]">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {menuGroups.find(g => g.items.some(i => i.path === location.pathname))?.label || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-gray-500 hover:text-[#1ABC9C] hover:bg-emerald-50 rounded-full transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              className="p-2 text-gray-500 hover:text-[#1ABC9C] hover:bg-emerald-50 rounded-full transition-all relative"
              onClick={() => setNotifOpen(!notifOpen)}
            >
              <Bell className="w-4 h-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">{notifications.length}</span>
              )}
            </button>
            {/* Notification Dropdown */}
            {notifOpen && (
              <div className="absolute right-4 top-14 w-80 bg-white border rounded-lg shadow-lg z-50 overflow-hidden">
                <div className="bg-[#1ABC9C] text-white px-4 py-2 text-sm font-semibold flex items-center justify-between">
                  <span>NOTIFICACIONES</span>
                  <button onClick={() => setNotifOpen(false)}><X className="w-4 h-4" /></button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-400 text-sm">Sin notificaciones</div>
                  ) : (
                    notifications.map((n: any, i: number) => {
                      const Icon = n.icon;
                      return (
                        <div key={i} className={`px-4 py-2.5 border-b flex items-center gap-2 ${n.type === 'low' ? 'bg-red-50' : 'bg-amber-50'}`}>
                          <Icon className={`w-4 h-4 flex-shrink-0 ${n.type === 'low' ? 'text-red-500' : 'text-amber-500'}`} />
                          <span className="text-xs text-gray-700">{n.message}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
            <button className="p-2 text-gray-500 hover:text-[#1ABC9C] hover:bg-emerald-50 rounded-full transition-all">
              <HelpCircle className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
              <div className="w-8 h-8 rounded-full bg-[#1ABC9C] flex items-center justify-center text-white font-semibold text-xs">
                {(user?.name || "A").charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-700">{user?.name || "Admin"}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role || "admin"}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="md:hidden h-14" />
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Floating Action Button with Menu */}
      <div className="fixed bottom-6 right-6 z-50">
        {fabOpen && (
          <div className="absolute bottom-16 right-0 mb-2 w-56 bg-white border rounded-lg shadow-lg overflow-hidden">
            <div className="px-3 py-2 bg-[#1ABC9C] text-white text-xs font-semibold">ACCESOS RAPIDOS</div>
            <Link to="/facturacion" onClick={() => setFabOpen(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-emerald-50 text-sm text-gray-700">
              <FileText className="w-4 h-4 text-[#1ABC9C]" /> Facturacion
            </Link>
            <Link to="/inventario" onClick={() => setFabOpen(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-emerald-50 text-sm text-gray-700">
              <Package className="w-4 h-4 text-[#1ABC9C]" /> Nuevo Producto
            </Link>
            <Link to="/clientes" onClick={() => setFabOpen(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-emerald-50 text-sm text-gray-700">
              <Users className="w-4 h-4 text-[#1ABC9C]" /> Nuevo Cliente
            </Link>
            <Link to="/compras" onClick={() => setFabOpen(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-emerald-50 text-sm text-gray-700">
              <ShoppingCart className="w-4 h-4 text-[#1ABC9C]" /> Nueva Compra
            </Link>
            <Link to="/gastos" onClick={() => setFabOpen(false)} className="flex items-center gap-2 px-3 py-2 hover:bg-emerald-50 text-sm text-gray-700">
              <TrendingDown className="w-4 h-4 text-[#1ABC9C]" /> Nuevo Gasto
            </Link>
          </div>
        )}
        <button
          onClick={() => setFabOpen(!fabOpen)}
          className="w-14 h-14 rounded-full bg-[#1ABC9C] hover:bg-[#16a085] text-white shadow-lg flex items-center justify-center transition-all hover:scale-105"
        >
          <Plus className="w-7 h-7" />
        </button>
      </div>
    </div>
  );
}
