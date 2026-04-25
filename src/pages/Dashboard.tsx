import { useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DollarSign, ShoppingBag, Bike, AlertTriangle, TrendingUp, Users, FileText, CreditCard, Package, Calendar
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(value);
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();
  const { data: recent } = trpc.dashboard.recentActivity.useQuery();

  if (isLoading || !stats) {
    return (
      <Layout>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-80 mt-6" />
      </Layout>
    );
  }

  const kpiCards = [
    { title: "Ventas Hoy", value: formatCurrency(stats.salesToday), icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
    { title: "Ventas Semana", value: formatCurrency(stats.salesWeek), icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
    { title: "Ventas Mes", value: formatCurrency(stats.salesMonth), icon: ShoppingBag, color: "text-[#1ABC9C]", bg: "bg-emerald-50" },
    { title: "Creditos Pendientes", value: formatCurrency(stats.pendingCreditsAmount), subtitle: `${stats.pendingCreditsCount} creditos`, icon: CreditCard, color: "text-amber-600", bg: "bg-amber-50" },
    { title: "Deliveries Pendientes", value: stats.pendingDeliveries, icon: Bike, color: "text-purple-600", bg: "bg-purple-50" },
    { title: "Stock Bajo", value: stats.lowStockCount, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
    { title: "Nuevos Clientes", value: stats.newCustomers, icon: Users, color: "text-cyan-600", bg: "bg-cyan-50" },
    { title: "Por Vencer (7d)", value: stats.nearExpiry, icon: Calendar, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  const dailySalesData = stats.dailySales.map(d => ({ date: d.date.slice(5), total: parseFloat(d.total || "0") }));
  const salesByCategoryData = stats.salesByCategory.map(c => ({ name: c.category || "Sin categoria", value: parseFloat(c.total || "0") }));
  const COLORS = ["#1ABC9C", "#16a085", "#2ecc71", "#27ae60", "#48c9b0", "#76d7c4", "#82e0aa"];

  return (
    <Layout>
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button onClick={() => navigate("/facturacion")} className="bg-[#1ABC9C] hover:bg-[#16a085] text-white shadow-sm hover:shadow-md transition-all">
          <FileText className="w-4 h-4 mr-2" />Nueva Venta
        </Button>
        <Button variant="outline" onClick={() => navigate("/ordenes")} className="border-[#1ABC9C] text-[#1ABC9C] hover:bg-emerald-50">
          <FileText className="w-4 h-4 mr-2" />Cotizacion
        </Button>
        <Button variant="outline" onClick={() => navigate("/compras")} className="border-[#1ABC9C] text-[#1ABC9C] hover:bg-emerald-50">
          <Package className="w-4 h-4 mr-2" />Compra
        </Button>
        <Button variant="outline" onClick={() => navigate("/delivery")} className="border-[#1ABC9C] text-[#1ABC9C] hover:bg-emerald-50">
          <Bike className="w-4 h-4 mr-2" />Delivery
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {kpiCards.map(card => (
          <Card key={card.title} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <p className="text-xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{card.title}</p>
                {card.subtitle && <p className="text-xs text-gray-400 mt-0.5">{card.subtitle}</p>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Ventas ultimos 30 dias</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `RD$${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="total" fill="#1ABC9C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Ventas por categoria</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={salesByCategoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {salesByCategoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 justify-center mt-2">
              {salesByCategoryData.map((e, i) => (
                <div key={e.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span>{e.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="border border-gray-200 shadow-sm mb-6">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Productos mas vendidos (mes)</h3>
          <div className="space-y-3">
            {stats.topProducts.map(p => (
              <div key={p.productId} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{p.productName}</p>
                  <div className="mt-1 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className="h-full rounded-full bg-[#1ABC9C]" style={{ width: `${Math.min((p.totalQty/(stats.topProducts[0]?.totalQty||1))*100,100)}%` }} />
                  </div>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="text-sm font-medium text-gray-800">{p.totalQty} uds</p>
                  <p className="text-xs text-gray-500">{formatCurrency(parseFloat(p.totalSales||"0"))}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Actividad reciente</h3>
          <div className="divide-y divide-gray-100">
            {(recent||[]).map(inv => (
              <div key={inv.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-[#1ABC9C]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Factura {inv.number}</p>
                    <p className="text-xs text-gray-500">{inv.customerName || "Cliente de contado"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#1ABC9C]">{formatCurrency(parseFloat(inv.total||"0"))}</p>
                  <p className="text-xs text-gray-400">{inv.date ? new Date(inv.date).toLocaleDateString("es-DO") : ""}</p>
                </div>
              </div>
            ))}
            {(!recent||recent.length===0) && <p className="text-sm text-gray-400 py-4 text-center">Sin actividad reciente</p>}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
