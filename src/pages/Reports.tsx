import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download } from "lucide-react";

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(
    typeof value === "string" ? parseFloat(value || "0") : value
  );
}

const COLORS = ["#E30A17", "#1AB2B3", "#FF4C5B", "#F59E0B", "#8B5CF6", "#10B981", "#3B82F6"];

export default function Reports() {
  const [reportType, setReportType] = useState<"sales" | "inventory" | "delivery" | "financial">("sales");
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [toDate, setToDate] = useState(() => new Date().toISOString().split("T")[0]);

  const salesQuery = trpc.report.salesReport.useQuery({ fromDate, toDate, groupBy: "day" }, { enabled: reportType === "sales" });
  const inventoryQuery = trpc.report.inventoryReport.useQuery({}, { enabled: reportType === "inventory" });
  const deliveryQuery = trpc.report.deliveryReport.useQuery({ fromDate, toDate, groupBy: "day" }, { enabled: reportType === "delivery" });
  const financialQuery = trpc.report.financialReport.useQuery({ fromDate, toDate }, { enabled: reportType === "financial" });

  const isLoading = salesQuery.isLoading || inventoryQuery.isLoading || deliveryQuery.isLoading || financialQuery.isLoading;

  const tabs = [
    { key: "sales" as const, label: "Ventas" },
    { key: "inventory" as const, label: "Inventario" },
    { key: "delivery" as const, label: "Delivery" },
    { key: "financial" as const, label: "Financiero" },
  ];

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reportes</h1>
            <p className="text-muted-foreground">Análisis y estadísticas del negocio</p>
          </div>
          <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Exportar</Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <Button key={t.key} variant={reportType === t.key ? "default" : "outline"} onClick={() => setReportType(t.key)} className={reportType === t.key ? "bg-[#E30A17] hover:bg-[#c00914] text-white" : ""}>
              {t.label}
            </Button>
          ))}
        </div>

        {reportType !== "inventory" && (
          <div className="flex flex-wrap gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Desde</label>
              <input type="date" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Hasta</label>
              <input type="date" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>
        )}

        {isLoading && <Skeleton className="h-80" />}

        {reportType === "sales" && salesQuery.data && (
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Ventas por día</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesQuery.data.map((d: any) => ({ label: d.label, total: parseFloat(d.total || "0") }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `RD$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="total" fill="#E30A17" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {reportType === "inventory" && inventoryQuery.data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-base">Valor del inventario por categoría</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={(() => {
                      const byCat: Record<string, number> = {};
                      inventoryQuery.data.forEach((i: any) => {
                        byCat[i.category || "Sin categoría"] = (byCat[i.category || "Sin categoría"] || 0) + parseFloat(i.totalValue || "0");
                      });
                      return Object.entries(byCat).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
                    })()} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {(() => {
                        const byCat: Record<string, number> = {};
                        inventoryQuery.data.forEach((i: any) => {
                          byCat[i.category || "Sin categoría"] = (byCat[i.category || "Sin categoría"] || 0) + parseFloat(i.totalValue || "0");
                        });
                        return Object.entries(byCat).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
                      })().map((_: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle className="text-base">Productos con mayor valor</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {inventoryQuery.data.sort((a: any, b: any) => parseFloat(b.totalValue || "0") - parseFloat(a.totalValue || "0")).slice(0, 10).map((i: any) => (
                    <div key={i.productId} className="flex justify-between text-sm">
                      <span className="truncate flex-1">{i.name}</span>
                      <span className="font-medium">{formatCurrency(i.totalValue || 0)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {reportType === "delivery" && deliveryQuery.data && (
          <Card className="border-0 shadow-sm">
            <CardHeader><CardTitle className="text-base">Deliveries por día</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deliveryQuery.data.map((d: any) => ({ label: d.label, total: Number(d.total || 0), delivered: Number(d.delivered || 0) }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="delivered" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {reportType === "financial" && financialQuery.data && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Ingresos</p>
                <p className="text-2xl font-bold text-emerald-600">{formatCurrency(financialQuery.data.sales)}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Egresos (Compras)</p>
                <p className="text-2xl font-bold text-[#E30A17]">{formatCurrency(financialQuery.data.purchases)}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Utilidad Bruta</p>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(financialQuery.data.grossProfit)}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
