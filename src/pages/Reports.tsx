import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart3, Search, ChevronRight, TrendingUp, ShoppingCart, Users, Package,
  DollarSign, CreditCard, Truck, ClipboardList, FileText, Wallet
} from "lucide-react";

const reportGroups = [
  {
    title: "VENTAS",
    icon: TrendingUp,
    color: "bg-[#1ABC9C]",
    reports: [
      { name: "Ventas por cliente", new: true },
      { name: "Ventas por productos" },
      { name: "Ventas por categoria" },
      { name: "Ventas por marca" },
      { name: "Ventas por vendedor", new: true },
      { name: "Ventas por forma de pago" },
      { name: "Ventas por sucursal" },
      { name: "Ventas por fecha" },
      { name: "Ventas por hora" },
      { name: "Ventas por mesa" },
      { name: "Ventas por tipo de precio" },
      { name: "Ventas por departamento" },
      { name: "Ventas por ciudad" },
      { name: "Ventas por punto de venta" },
      { name: "Productos mas vendidos" },
      { name: "Clientes mas frecuentes" },
      { name: "Ranking de vendedores" },
      { name: "Comparativo de ventas" },
      { name: "Ventas vs Presupuesto" },
      { name: "Tendencias de ventas" },
    ]
  },
  {
    title: "PRODUCTOS Y EXISTENCIAS",
    icon: Package,
    color: "bg-blue-500",
    reports: [
      { name: "Inventario actual" },
      { name: "Productos con bajo stock" },
      { name: "Productos sin stock" },
      { name: "Productos por vencer" },
      { name: "Rotacion de inventario" },
      { name: "Costo de inventario" },
      { name: "Valor de inventario" },
      { name: "Movimientos de inventario" },
      { name: "Historial de precios" },
      { name: "Productos por categoria" },
      { name: "Productos por marca" },
      { name: "Productos por proveedor" },
      { name: "Kardex de producto" },
      { name: "Ajustes de inventario" },
      { name: "Traslados entre bodegas" },
      { name: "Toma de inventario" },
      { name: "Diferencias de inventario" },
    ]
  },
  {
    title: "GASTOS Y COMPRAS",
    icon: Wallet,
    color: "bg-amber-500",
    reports: [
      { name: "Compras por proveedor" },
      { name: "Compras por fecha" },
      { name: "Historial de compras" },
      { name: "Gastos por categoria" },
      { name: "Gastos por fecha" },
      { name: "Gastos fijos" },
      { name: "Gastos variables" },
      { name: "Comparativo gastos" },
      { name: "Ingresos vs Egresos" },
      { name: "Rentabilidad" },
      { name: "Margen por producto" },
      { name: "Costos operativos" },
      { name: "Nomina y prestamos" },
      { name: "Creditos de clientes" },
      { name: "Deudas con proveedores" },
      { name: "Cuentas por pagar" },
      { name: "Flujo de caja" },
    ]
  }
];

export default function Reports() {
  const [search, setSearch] = useState("");

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">REPORTES</h1>
          <p className="text-sm text-gray-500 mt-1">Genera reportes detallados de tu negocio</p>
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
                {filteredReports.map((report, idx) => (
                  <button key={idx} className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border-b border-gray-100 last:border-0 text-left group">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${group.color.replace('bg-', 'bg-')}`}></div>
                      <span className="text-sm text-gray-700 group-hover:text-[#1ABC9C]">{report.name}</span>
                      {report.new && <span className="text-[10px] bg-red-500 text-white px-1.5 rounded ml-2">N</span>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#1ABC9C]" />
                  </button>
                ))}
                {filteredReports.length === 0 && (
                  <div className="text-center py-4 text-gray-400 text-sm">Sin coincidencias</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
