import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/providers/trpc";
import {
  BarChart3, Search, ChevronRight, ChevronLeft, TrendingUp,
  ShoppingCart, Users, Package, DollarSign, CreditCard,
  Wallet, ClipboardList, FileText, Calendar
} from "lucide-react";

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(
    typeof value === "string" ? parseFloat(value || "0") : value
  );
}

const reportGroups = [
  {
    title: "VENTAS",
    icon: TrendingUp,
    color: "bg-[#1ABC9C]",
    reports: [
      { key: "salesByCustomer", name: "Ventas por cliente", icon: Users },
      { key: "salesByProduct", name: "Ventas por productos", icon: Package },
      { key: "salesByPaymentMethod", name: "Ventas por forma de pago", icon: CreditCard },
      { key: "topCustomers", name: "Clientes mas frecuentes", icon: Users },
    ]
  },
  {
    title: "PRODUCTOS Y EXISTENCIAS",
    icon: Package,
    color: "bg-blue-500",
    reports: [
      { key: "inventoryValue", name: "Valor de inventario", icon: DollarSign },
      { key: "lowStock", name: "Productos con bajo stock", icon: Package },
      { key: "outOfStock", name: "Productos sin stock", icon: Package },
    ]
  },
  {
    title: "GASTOS Y COMPRAS",
    icon: Wallet,
    color: "bg-amber-500",
    reports: [
      { key: "purchasesBySupplier", name: "Compras por proveedor", icon: ShoppingCart },
      { key: "expensesByDate", name: "Gastos por fecha", icon: Calendar },
      { key: "incomeVsExpenses", name: "Ingresos vs Egresos", icon: BarChart3 },
    ]
  }
];

export default function Reports() {
  const [search, setSearch] = useState("");
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Date range helpers
  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const setRange = (range: string) => {
    if (range === "today") { setFromDate(today); setToDate(today); }
    else if (range === "week") { setFromDate(weekAgo); setToDate(today); }
    else if (range === "month") { setFromDate(monthAgo); setToDate(today); }
  };

  // All report queries
  const { data: salesByProduct, isLoading: l1 } = trpc.report.salesByProduct.useQuery({ fromDate, toDate }, { enabled: activeReport === "salesByProduct" && !!fromDate && !!toDate });
  const { data: salesByCustomer, isLoading: l2 } = trpc.report.salesByCustomer.useQuery({ fromDate, toDate }, { enabled: activeReport === "salesByCustomer" && !!fromDate && !!toDate });
  const { data: salesByPayment, isLoading: l3 } = trpc.report.salesByPaymentMethod.useQuery({ fromDate, toDate }, { enabled: activeReport === "salesByPaymentMethod" && !!fromDate && !!toDate });
  const { data: lowStock, isLoading: l4 } = trpc.report.lowStock.useQuery({}, { enabled: activeReport === "lowStock" });
  const { data: outOfStock, isLoading: l5 } = trpc.report.outOfStock.useQuery({}, { enabled: activeReport === "outOfStock" });
  const { data: purchasesBySupplier, isLoading: l6 } = trpc.report.purchasesBySupplier.useQuery({ fromDate, toDate }, { enabled: activeReport === "purchasesBySupplier" && !!fromDate && !!toDate });
  const { data: expensesByDate, isLoading: l7 } = trpc.report.expensesByDate.useQuery({ fromDate, toDate }, { enabled: activeReport === "expensesByDate" && !!fromDate && !!toDate });
  const { data: incomeVsExpenses, isLoading: l8 } = trpc.report.incomeVsExpenses.useQuery({ fromDate, toDate }, { enabled: activeReport === "incomeVsExpenses" && !!fromDate && !!toDate });
  const { data: topCustomers, isLoading: l9 } = trpc.report.topCustomers.useQuery({}, { enabled: activeReport === "topCustomers" });
  const { data: inventoryValue, isLoading: l10 } = trpc.report.inventoryValue.useQuery({}, { enabled: activeReport === "inventoryValue" });

  const isLoading = l1 || l2 || l3 || l4 || l5 || l6 || l7 || l8 || l9 || l10;

  const needsDateRange = activeReport && !["lowStock", "outOfStock", "topCustomers", "inventoryValue"].includes(activeReport);

  const renderReport = () => {
    if (isLoading) return <Skeleton className="h-96" />;

    switch (activeReport) {
      case "salesByProduct":
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ventas por Producto ({fromDate} al {toDate})</h3>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-[#1ABC9C] text-white"><th className="px-3 py-3 text-left">Producto</th><th className="px-3 py-3 text-right">Cantidad</th><th className="px-3 py-3 text-right">Total Ventas</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {salesByProduct?.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50"><td className="px-3 py-3 font-medium text-gray-800">{item.productName}</td><td className="px-3 py-3 text-right">{item.qty}</td><td className="px-3 py-3 text-right font-semibold text-[#1ABC9C]">{formatCurrency(item.total)}</td></tr>
                  ))}
                </tbody>
              </table>
              {salesByProduct?.length === 0 && <div className="text-center py-8 text-gray-400">No hay datos para el periodo seleccionado</div>}
            </div>
          </div>
        );
      case "salesByCustomer":
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ventas por Cliente ({fromDate} al {toDate})</h3>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-[#1ABC9C] text-white"><th className="px-3 py-3 text-left">Cliente</th><th className="px-3 py-3 text-right">Facturas</th><th className="px-3 py-3 text-right">Total Comprado</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {salesByCustomer?.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50"><td className="px-3 py-3 font-medium text-gray-800">{item.customerName}</td><td className="px-3 py-3 text-right">{item.invoices}</td><td className="px-3 py-3 text-right font-semibold text-[#1ABC9C]">{formatCurrency(item.total)}</td></tr>
                  ))}
                </tbody>
              </table>
              {salesByCustomer?.length === 0 && <div className="text-center py-8 text-gray-400">No hay datos para el periodo seleccionado</div>}
            </div>
          </div>
        );
      case "salesByPaymentMethod":
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ventas por Forma de Pago ({fromDate} al {toDate})</h3>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-[#1ABC9C] text-white"><th className="px-3 py-3 text-left">Metodo</th><th className="px-3 py-3 text-right">Transacciones</th><th className="px-3 py-3 text-right">Total</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {salesByPayment?.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-3 font-medium text-gray-800 capitalize">{item.method === 'cash' ? 'Efectivo' : item.method === 'card' ? 'Tarjeta' : item.method === 'transfer' ? 'Transferencia' : item.method === 'credit' ? 'Credito' : item.method}</td>
                      <td className="px-3 py-3 text-right">{item.count}</td>
                      <td className="px-3 py-3 text-right font-semibold text-[#1ABC9C]">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {salesByPayment?.length === 0 && <div className="text-center py-8 text-gray-400">No hay datos para el periodo seleccionado</div>}
            </div>
          </div>
        );
      case "topCustomers":
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Clientes Mas Frecuentes</h3>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-[#1ABC9C] text-white"><th className="px-3 py-3 text-left">Cliente</th><th className="px-3 py-3 text-right">Visitas</th><th className="px-3 py-3 text-right">Total Comprado</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {topCustomers?.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50"><td className="px-3 py-3 font-medium text-gray-800">{item.customerName}</td><td className="px-3 py-3 text-right">{item.visits}</td><td className="px-3 py-3 text-right font-semibold text-[#1ABC9C]">{formatCurrency(item.totalPurchased)}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "inventoryValue":
        const totalInvCost = inventoryValue?.reduce((s: number, i: any) => s + i.totalCost, 0) || 0;
        const totalInvValue = inventoryValue?.reduce((s: number, i: any) => s + i.totalValue, 0) || 0;
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Valor de Inventario</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-white border rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500">Costo Total</p>
                <p className="text-xl font-bold text-gray-800">{formatCurrency(totalInvCost)}</p>
              </div>
              <div className="bg-white border rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500">Valor de Venta</p>
                <p className="text-xl font-bold text-[#1ABC9C]">{formatCurrency(totalInvValue)}</p>
              </div>
              <div className="bg-white border rounded-lg p-4 text-center">
                <p className="text-xs text-gray-500">Ganancia Potencial</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(totalInvValue - totalInvCost)}</p>
              </div>
            </div>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-blue-500 text-white"><th className="px-3 py-3 text-left">Producto</th><th className="px-3 py-3 text-right">Cantidad</th><th className="px-3 py-3 text-right">Costo Total</th><th className="px-3 py-3 text-right">Valor Venta</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {inventoryValue?.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-3 font-medium text-gray-800">{item.name}</td>
                      <td className="px-3 py-3 text-right">{item.totalQty}</td>
                      <td className="px-3 py-3 text-right">{formatCurrency(item.totalCost)}</td>
                      <td className="px-3 py-3 text-right font-semibold text-[#1ABC9C]">{formatCurrency(item.totalValue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case "lowStock":
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Productos con Bajo Stock</h3>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-blue-500 text-white"><th className="px-3 py-3 text-left">Producto</th><th className="px-3 py-3 text-center">Stock Actual</th><th className="px-3 py-3 text-center">Stock Minimo</th><th className="px-3 py-3 text-center">Estado</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {lowStock?.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-3 font-medium text-gray-800">{item.name} <span className="text-gray-400 text-xs">({item.code})</span></td>
                      <td className="px-3 py-3 text-center font-bold text-red-600">{item.totalQty}</td>
                      <td className="px-3 py-3 text-center">{item.minStock}</td>
                      <td className="px-3 py-3 text-center"><Badge className="bg-red-500 text-white text-[10px] border-0">BAJO</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {lowStock?.length === 0 && <div className="text-center py-8 text-gray-400">No hay productos con bajo stock</div>}
            </div>
          </div>
        );
      case "outOfStock":
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Productos Sin Stock</h3>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-blue-500 text-white"><th className="px-3 py-3 text-left">Producto</th><th className="px-3 py-3 text-left">Codigo</th><th className="px-3 py-3 text-left">Categoria</th><th className="px-3 py-3 text-center">Estado</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {outOfStock?.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-3 font-medium text-gray-800">{item.name}</td>
                      <td className="px-3 py-3 text-gray-500 text-xs">{item.code}</td>
                      <td className="px-3 py-3 text-gray-600 text-xs">{item.category || "-"}</td>
                      <td className="px-3 py-3 text-center"><Badge className="bg-gray-500 text-white text-[10px] border-0">SIN STOCK</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {outOfStock?.length === 0 && <div className="text-center py-8 text-gray-400">No hay productos sin stock</div>}
            </div>
          </div>
        );
      case "purchasesBySupplier":
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Compras por Proveedor ({fromDate} al {toDate})</h3>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-amber-500 text-white"><th className="px-3 py-3 text-left">Proveedor</th><th className="px-3 py-3 text-right">Compras</th><th className="px-3 py-3 text-right">Total</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {purchasesBySupplier?.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50"><td className="px-3 py-3 font-medium text-gray-800">{item.supplierName}</td><td className="px-3 py-3 text-right">{item.purchases}</td><td className="px-3 py-3 text-right font-semibold text-[#1ABC9C]">{formatCurrency(item.total)}</td></tr>
                  ))}
                </tbody>
              </table>
              {purchasesBySupplier?.length === 0 && <div className="text-center py-8 text-gray-400">No hay datos para el periodo seleccionado</div>}
            </div>
          </div>
        );
      case "expensesByDate":
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Gastos por Fecha ({fromDate} al {toDate})</h3>
            <div className="bg-white border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="bg-amber-500 text-white"><th className="px-3 py-3 text-left">Fecha</th><th className="px-3 py-3 text-right">Ingresos</th><th className="px-3 py-3 text-right">Gastos</th><th className="px-3 py-3 text-right">Neto</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {expensesByDate?.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-3 py-3 font-medium text-gray-800">{item.date}</td>
                      <td className="px-3 py-3 text-right text-emerald-600">{formatCurrency(item.income)}</td>
                      <td className="px-3 py-3 text-right text-red-600">{formatCurrency(item.expense)}</td>
                      <td className="px-3 py-3 text-right font-semibold">{formatCurrency(item.income - item.expense)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {expensesByDate?.length === 0 && <div className="text-center py-8 text-gray-400">No hay datos para el periodo seleccionado</div>}
            </div>
          </div>
        );
      case "incomeVsExpenses":
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ingresos vs Egresos ({fromDate} al {toDate})</h3>
            {incomeVsExpenses && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border rounded-lg p-4 text-center border-emerald-300">
                  <p className="text-xs text-gray-500">Total Ingresos</p>
                  <p className="text-xl font-bold text-emerald-600">{formatCurrency(incomeVsExpenses.totalIncome)}</p>
                  <p className="text-[10px] text-gray-400">Ventas: {formatCurrency(incomeVsExpenses.sales)}</p>
                </div>
                <div className="bg-white border rounded-lg p-4 text-center border-red-300">
                  <p className="text-xs text-gray-500">Total Egresos</p>
                  <p className="text-xl font-bold text-red-600">{formatCurrency(incomeVsExpenses.totalExpenses)}</p>
                  <p className="text-[10px] text-gray-400">Compras: {formatCurrency(incomeVsExpenses.purchases)} | Gastos: {formatCurrency(incomeVsExpenses.expenses)}</p>
                </div>
                <div className={`border rounded-lg p-4 text-center ${incomeVsExpenses.net >= 0 ? 'border-emerald-300' : 'border-red-300'}`}>
                  <p className="text-xs text-gray-500">Ganancia Neta</p>
                  <p className={`text-xl font-bold ${incomeVsExpenses.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(incomeVsExpenses.net)}</p>
                </div>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Find active report info
  const activeReportInfo = reportGroups.flatMap(g => g.reports).find(r => r.key === activeReport);
  const activeGroup = reportGroups.find(g => g.reports.some(r => r.key === activeReport));

  return (
    <Layout>
      {activeReport ? (
        /* Report Detail View */
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={() => setActiveReport(null)}>
              <ChevronLeft className="w-4 h-4 mr-1" /> Volver
            </Button>
            <div className="flex items-center gap-2">
              {activeGroup && <div className={`w-3 h-3 rounded-full ${activeGroup.color}`} />}
              <h2 className="text-lg font-semibold text-gray-800">{activeReportInfo?.name}</h2>
            </div>
          </div>

          {/* Date range picker (if needed) */}
          {needsDateRange && (
            <div className="bg-white border rounded-lg p-4 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Rango de Fechas:
                </span>
                <Input type="date" className="w-40 h-8 text-sm" value={fromDate} onChange={e => setFromDate(e.target.value)} />
                <span className="text-gray-400">hasta</span>
                <Input type="date" className="w-40 h-8 text-sm" value={toDate} onChange={e => setToDate(e.target.value)} />
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => setRange("today")}>Hoy</Button>
                  <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => setRange("week")}>Ultima Semana</Button>
                  <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => setRange("month")}>Ultimo Mes</Button>
                </div>
              </div>
            </div>
          )}

          {/* Report content */}
          {renderReport()}
        </div>
      ) : (
        /* Reports List */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">REPORTES</h1>
              <p className="text-sm text-gray-500 mt-1">Genera reportes detallados basados en los movimientos reales del sistema</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input placeholder="Buscar reporte..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 w-64" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {reportGroups.map((group) => {
              const Icon = group.icon;
              const filteredReports = group.reports.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
              return (
                <div key={group.title} className="bg-white border rounded-lg overflow-hidden">
                  <div className={`${group.color} text-white p-4 flex items-center gap-3`}>
                    <Icon className="w-6 h-6" />
                    <h3 className="font-bold text-lg">{group.title}</h3>
                    <span className="ml-auto text-xs bg-white/20 px-2 py-0.5 rounded-full">{filteredReports.length}</span>
                  </div>
                  <div className="p-3 max-h-[600px] overflow-y-auto">
                    {filteredReports.map((report, idx) => {
                      const ReportIcon = report.icon;
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveReport(report.key);
                            // Auto-set date range for date-based reports
                            if (!["lowStock", "outOfStock", "topCustomers", "inventoryValue"].includes(report.key)) {
                              setFromDate(monthAgo);
                              setToDate(today);
                            }
                          }}
                          className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border-b border-gray-100 last:border-0 text-left group transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <ReportIcon className="w-4 h-4 text-gray-400 group-hover:text-[#1ABC9C]" />
                            <span className="text-sm text-gray-700 group-hover:text-[#1ABC9C]">{report.name}</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#1ABC9C]" />
                        </button>
                      );
                    })}
                    {filteredReports.length === 0 && (
                      <div className="text-center py-4 text-gray-400 text-sm">Sin coincidencias</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Layout>
  );
}
