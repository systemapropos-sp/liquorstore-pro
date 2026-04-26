import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { ArrowLeft, Plus, Search, ClipboardList, History, ArrowLeftRight, Receipt } from "lucide-react";

export default function Adjustments() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [adjustmentItems, setAdjustmentItems] = useState<any[]>([]);

  const { data: adjustments = [] } = trpc.adjustment.list.useQuery();
  const { data: products = [] } = trpc.product.list.useQuery({});

  const filtered = adjustments.filter((a: any) =>
    a.productName?.toLowerCase().includes(search.toLowerCase()) ||
    a.productCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/inventario" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-800">AJUSTE DE INVENTARIO</h1>
      </div>

      <div className="flex gap-3 mb-4">
        <Button className="btn-emerald" onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" /> NUEVO AJUSTE</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <button className="border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:border-[#1ABC9C] transition-all bg-white">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center"><History className="w-5 h-5 text-blue-600" /></div>
          <div className="text-left"><p className="text-xs font-bold text-gray-700">HISTORIAL DE MOVIMIENTO PRODUCTOS</p></div>
        </button>
        <button className="border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:border-[#1ABC9C] transition-all bg-white">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center"><ClipboardList className="w-5 h-5 text-emerald-600" /></div>
          <div className="text-left"><p className="text-xs font-bold text-gray-700">HISTORIAL DE AJUSTES</p></div>
        </button>
        <button className="border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:border-[#1ABC9C] transition-all bg-white">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center"><ArrowLeftRight className="w-5 h-5 text-amber-600" /></div>
          <div className="text-left"><p className="text-xs font-bold text-gray-700">HISTORIAL DE TRASLADOS ACEPTADOS</p></div>
        </button>
        <button className="border border-gray-200 rounded-lg p-3 flex items-center gap-3 hover:border-[#1ABC9C] transition-all bg-white">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center"><ArrowLeftRight className="w-5 h-5 text-purple-600" /></div>
          <div className="text-left"><p className="text-xs font-bold text-gray-700">HISTORIAL DE TRASLADOS REALIZADOS</p></div>
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /><Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1ABC9C] text-white">
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">CODIGO PRODUCTO</th>
              <th className="px-3 py-2 text-left">PRODUCTO</th>
              <th className="px-3 py-2 text-right">CANT. ANTERIOR</th>
              <th className="px-3 py-2 text-right">CANT.</th>
              <th className="px-3 py-2 text-right">CANT. AHORA</th>
              <th className="px-3 py-2 text-left">INFORMACION</th>
              <th className="px-3 py-2 text-left">DESCRIPCION</th>
              <th className="px-3 py-2 text-left">FECHA</th>
              <th className="px-3 py-2 text-center">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a: any, i: number) => (
              <tr key={a.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2 font-medium">{a.productCode || "N/A"}</td>
                <td className="px-3 py-2">{a.productName || "N/A"}</td>
                <td className="px-3 py-2 text-right">{a.previousStock || 0}</td>
                <td className="px-3 py-2 text-right"><span className={`${a.adjustmentQuantity > 0 ? "text-emerald-600" : "text-red-600"}`}>{a.adjustmentQuantity > 0 ? "+" : ""}{a.adjustmentQuantity}</span></td>
                <td className="px-3 py-2 text-right font-medium">{a.currentStock}</td>
                <td className="px-3 py-2"><span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs">{a.type}</span></td>
                <td className="px-3 py-2 text-xs">{a.reason}</td>
                <td className="px-3 py-2">{new Date(a.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-2 text-center"><Button size="sm" className="btn-emerald h-7 px-2 text-xs"><Receipt className="w-3 h-3 mr-1" /> Factura pos</Button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={10} className="px-3 py-6 text-center text-gray-400">Sin ajustes registrados</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
