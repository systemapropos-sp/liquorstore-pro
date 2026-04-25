import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  TrendingUp,
  Users,
  FileText,
  ClipboardList,
  CreditCard,
  Package,
  Bike,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
  }).format(value);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();
  const { data: recent } = trpc.dashboard.recentActivity.useQuery();

  if (isLoading || !stats) {
    return (
      <Layout>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-80" />
        </div>
      </Layout>
    );
  }

  const kpiCards = [
    {
      title: "Ventas Hoy",
      value: formatCurrency(stats.salesToday),
      icon: DollarSign,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: "Ventas Semana",
      value: formatCurrency(stats.salesWeek),
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: "Ventas Mes",
      value: formatCurrency(stats.salesMonth),
      icon: ShoppingBag,
      color: "text-[#E30A17]",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
    {
      title: "Créditos Pendientes",
      value: formatCurrency(stats.pendingCreditsAmount),
      subtitle: `${stats.pendingCreditsCount} créditos`,
      icon: CreditCard,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
    },
    {
      title: "Deliveries Pendientes",
      value: stats.pendingDeliveries,
      icon: Bike,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: "Stock Bajo",
      value: stats.lowStockCount,
      icon: AlertTriangle,
      color: "text-red-600",
      bg: "bg-red-50 dark:bg-red-900/20",
    },
    {
      title: "Nuevos Clientes",
      value: stats.newCustomers,
      icon: Users,
      color: "text-cyan-600",
      bg: "bg-cyan-50 dark:bg-cyan-900/20",
    },
    {
      title: "Por Vencer (7d)",
      value: stats.nearExpiry,
      icon: Calendar,
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  const dailySalesData = stats.dailySales.map((d) => ({
    date: d.date.slice(5),
    total: parseFloat(d.total || "0"),
  }));

  const salesByCategoryData = stats.salesByCategory.map((c) => ({
    name: c.category || "Sin categoría",
    value: parseFloat(c.total || "0"),
  }));

  const COLORS = ["#E30A17", "#1AB2B3", "#FF4C5B", "#F59E0B", "#8B5CF6", "#10B981", "#3B82F6"];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Resumen de tu licorería hoy</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={() => navigate("/facturacion")} className="bg-[#E30A17] hover:bg-[#c00914] text-white">
              <FileText className="w-4 h-4 mr-2" />
              Nueva Venta
            </Button>
            <Button variant="outline" onClick={() => navigate("/ordenes")}>
              <ClipboardList className="w-4 h-4 mr-2" />
              Cotización
            </Button>
            <Button variant="outline" onClick={() => navigate("/compras")}>
              <Package className="w-4 h-4 mr-2" />
              Compra
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpiCards.map((card) => (
            <Card key={card.title} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${card.bg}`}>
                    <card.icon className={`w-4 h-4 ${card.color}`} />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-xs text-muted-foreground">{card.title}</p>
                  {card.subtitle && (
                    <p className="text-xs text-muted-foreground mt-0.5">{card.subtitle}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Ventas últimos 30 días</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={dailySalesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `RD$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    labelFormatter={(label) => `Fecha: ${label}`}
                  />
                  <Bar dataKey="total" fill="#E30A17" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Ventas por categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={salesByCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {salesByCategoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-3 justify-center mt-2">
                {salesByCategoryData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Productos más vendidos (mes)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topProducts.map((p) => (
                <div key={p.productId} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p.productName}</p>
                    <div className="mt-1 h-2 rounded-full bg-accent overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#E30A17]"
                        style={{
                          width: `${Math.min(
                            (p.totalQty / (stats.topProducts[0]?.totalQty || 1)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-right min-w-[80px]">
                    <p className="text-sm font-medium">{p.totalQty} uds</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(parseFloat(p.totalSales || "0"))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Actividad reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border">
              {(recent || []).map((inv) => (
                <div key={inv.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E30A17]/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-[#E30A17]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Factura {inv.number}</p>
                      <p className="text-xs text-muted-foreground">
                        {inv.customer?.name || "Cliente de contado"} — {inv.user?.name || "Vendedor"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatCurrency(parseFloat(inv.total || "0"))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {inv.date ? new Date(inv.date).toLocaleDateString("es-DO") : ""}
                    </p>
                  </div>
                </div>
              ))}
              {(!recent || recent.length === 0) && (
                <p className="text-sm text-muted-foreground py-4 text-center">Sin actividad reciente</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
