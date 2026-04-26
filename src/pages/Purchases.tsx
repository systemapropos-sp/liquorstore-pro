import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { Plus, Search, Trash2, Save } from "lucide-react";

export default function Purchases() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: purchases = [] } = trpc.purchase.list.useQuery({});
  const { data: suppliers = [] } = trpc.supplier.list.useQuery({});
  const { data: products = [] } = trpc.product.list.useQuery({});

  const filtered = purchases.filter((p: any) =>
    p.number?.toLowerCase().includes(search.toLowerCase()) ||
    p.supplierName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">COMPRAS</h1>
          <p className="text-sm text-gray-500 mt-1">Registro de compras a proveedores</p>
        </div>
        <Button className="btn-emerald" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> NUEVA COMPRA
        </Button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Buscar compras..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1ABC9C] text-white">
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">NUMERO</th>
              <th className="px-3 py-2 text-left">PROVEEDOR</th>
              <th className="px-3 py-2 text-right">TOTAL</th>
              <th className="px-3 py-2 text-center">ESTADO</th>
              <th className="px-3 py-2 text-left">FECHA</th>
              <th className="px-3 py-2 text-center">DOC</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p: any, i: number) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2 font-medium">{p.number}</td>
                <td className="px-3 py-2">{p.supplierName}</td>
                <td className="px-3 py-2 text-right">RD${parseFloat(p.total).toLocaleString()}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-2 py-0.5 rounded text-xs ${p.status === "paid" ? "bg-emerald-100 text-emerald-700" : p.status === "received" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                    {p.status === "paid" ? "Pagado" : p.status === "received" ? "Recibido" : "Pendiente"}
                  </span>
                </td>
                <td className="px-3 py-2">{p.date || "N/A"}</td>
                <td className="px-3 py-2 text-center">{p.documentUrl ? <span className="text-blue-500 text-xs">Adjunto</span> : "—"}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="px-3 py-6 text-center text-gray-400">Sin compras registradas</td></tr>}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Nueva Compra</h2>
            <p className="text-sm text-gray-500 mb-4">Selecciona proveedor y productos para registrar la compra.</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Proveedor</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm">
                  <option>Seleccionar proveedor</option>
                  {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.tradeName}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Producto</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm">
                  <option>Seleccionar producto</option>
                  {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Documento de factura (PDF/Imagen)</label>
                <Input type="file" accept=".pdf,.jpg,.jpeg,.png" />
                <p className="text-xs text-gray-400 mt-1">Formatos permitidos: JPG, JPEG, PNG, PDF</p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button className="flex-1 btn-emerald"><Save className="w-4 h-4 mr-2" /> GUARDAR COMPRA</Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
