import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import {
  ArrowLeft, Search, Download, Eye, Trash2, FileText,
  Receipt, CreditCard, Ban, History
} from "lucide-react";

const tabs = [
  { id: "all", label: "TODAS LAS FACTURAS", icon: FileText },
  { id: "electronic", label: "FACTURAS ELECTRONICAS", icon: Receipt },
  { id: "pos", label: "FACTURAS POS ELECTRONICAS", icon: CreditCard },
  { id: "equivalent", label: "DOCUMENTO EQUIVALENTE", icon: FileText },
  { id: "cancelled", label: "FACTURAS ANULADAS", icon: Ban },
];

export default function InvoiceHistory() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [filterClient, setFilterClient] = useState("");
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");

  const { data: invoices = [] } = trpc.invoice.list.useQuery({});
  const { data: customers = [] } = trpc.customer.list.useQuery({});

  const filtered = invoices.filter((inv: any) => {
    if (activeTab === "cancelled" && inv.status !== "cancelled") return false;
    if (activeTab === "pos" && !inv.number?.startsWith("A-")) return false;
    if (activeTab === "electronic" && !inv.number?.startsWith("A-")) return false;
    if (search && !inv.number?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterClient && inv.customerId !== parseInt(filterClient)) return false;
    return true;
  });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/facturacion" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-800">HISTORICO DE FACTURAS</h1>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold whitespace-nowrap ${activeTab === t.id ? "bg-[#1ABC9C] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      <div className="bg-white border rounded-lg p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select className="border rounded-md px-3 py-2 text-sm" value={filterClient} onChange={e => setFilterClient(e.target.value)}>
            <option value="">Todos los clientes</option>
            {customers.map((c: any) => <option key={c.id} value={String(c.id)}>{c.name}</option>)}
          </select>
          <Input placeholder="Numero factura" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="border rounded-md px-3 py-2 text-sm"><option>Tipo factura</option></select>
          <Input type="date" value={filterDateStart} onChange={e => setFilterDateStart(e.target.value)} />
          <Input type="date" value={filterDateEnd} onChange={e => setFilterDateEnd(e.target.value)} />
        </div>
        <div className="flex justify-end mt-3 gap-2">
          <Button size="sm" variant="outline"><Download className="w-4 h-4 mr-1" /> Descargar</Button>
          <Button size="sm" className="btn-emerald"><Search className="w-4 h-4 mr-1" /> Buscar</Button>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1ABC9C] text-white">
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-center">ACCIONES</th>
              <th className="px-3 py-2 text-left">NUMERO FACTURA</th>
              <th className="px-3 py-2 text-right">VALOR TOTAL</th>
              <th className="px-3 py-2 text-right">PAGO</th>
              <th className="px-3 py-2 text-left">FECHA ELAB</th>
              <th className="px-3 py-2 text-left">FECHA VENC</th>
              <th className="px-3 py-2 text-left">CLIENTE</th>
              <th className="px-3 py-2 text-left">USUARIO</th>
              <th className="px-3 py-2 text-left">RESPONSABLE</th>
              <th className="px-3 py-2 text-left">FORMA PAGO</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv: any, i: number) => (
              <tr key={inv.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2 text-center">
                  <div className="flex gap-1 justify-center">
                    <button className="text-blue-500"><Eye className="w-4 h-4" /></button>
                    <button className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
                <td className="px-3 py-2 font-medium">{inv.number}</td>
                <td className="px-3 py-2 text-right">RD${parseFloat(inv.total).toLocaleString()}</td>
                <td className="px-3 py-2 text-right">RD${parseFloat(inv.total).toLocaleString()}</td>
                <td className="px-3 py-2">{new Date(inv.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-2">{inv.paymentMethod === "credit" ? new Date(inv.dueDate).toLocaleDateString() : "—"}</td>
                <td className="px-3 py-2">{inv.customerName || "Consumidor Final"}</td>
                <td className="px-3 py-2">Admin Demo</td>
                <td className="px-3 py-2">{inv.userName || "Admin Demo"}</td>
                <td className="px-3 py-2"><span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs">{inv.paymentMethod}</span></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={11} className="px-3 py-6 text-center text-gray-400">Sin facturas registradas</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
