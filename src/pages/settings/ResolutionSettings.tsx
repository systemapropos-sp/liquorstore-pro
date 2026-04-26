import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { ArrowLeft, Save } from "lucide-react";

export default function ResolutionSettings() {
  const [activeTab, setActiveTab] = useState("equivalent");
  const [form, setForm] = useState({ prefix: "", resolution: "", startDate: "", endDate: "", startNumber: "", endNumber: "", currentNumber: "" });
  const { data: resolutions = [] } = trpc.resolution.list.useQuery({ type: activeTab });
  const createRes = trpc.resolution.create.useMutation();
  const { data: branches = [] } = trpc.branch.list.useQuery();

  const tabs = [
    { id: "equivalent", label: "DOCUMENTO EQUIVALENTE" },
    { id: "support", label: "DOC SOPORTE" },
    { id: "electronic", label: "ELECTRONICA" },
    { id: "pos", label: "POS ELECTRONICO" },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/ajustes" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-800">REGISTRO Y CONTROL DE RESOLUCIONES</h1>
      </div>

      <div className="flex gap-2 mb-4">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex-1 py-2 text-xs font-medium rounded ${activeTab === t.id ? 'bg-[#1ABC9C] text-white' : 'bg-gray-100 text-gray-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="mb-4">
          <label className="text-sm text-gray-500 block mb-1">Resolucion para</label>
          <select className="w-full md:w-64 border rounded-md px-3 py-2 text-sm">
            {branches.map((b: any) => <option key={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div><label className="text-sm text-gray-500 block mb-1">Prefijo</label><Input value={form.prefix} onChange={e => setForm({...form, prefix: e.target.value})} /></div>
          <div><label className="text-sm text-gray-500 block mb-1">Resolucion</label><Input value={form.resolution} onChange={e => setForm({...form, resolution: e.target.value})} /></div>
          <div><label className="text-sm text-gray-500 block mb-1">Fecha inicial</label><Input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} /></div>
          <div><label className="text-sm text-gray-500 block mb-1">Fecha final</label><Input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} /></div>
          <div><label className="text-sm text-gray-500 block mb-1">Numero inicial</label><Input value={form.startNumber} onChange={e => setForm({...form, startNumber: e.target.value})} /></div>
          <div><label className="text-sm text-gray-500 block mb-1">Numero final</label><Input value={form.endNumber} onChange={e => setForm({...form, endNumber: e.target.value})} /></div>
          <div><label className="text-sm text-gray-500 block mb-1">Consecutivo actual</label><Input value={form.currentNumber} onChange={e => setForm({...form, currentNumber: e.target.value})} /></div>
        </div>
        <Button className="btn-emerald" onClick={() => createRes.mutate({ ...form, type: activeTab })} disabled={createRes.isPending}><Save className="w-4 h-4 mr-1" /> REGISTRAR RESOLUCION</Button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1ABC9C] text-white">
              <th className="px-3 py-2 text-left">RESOLUCION</th>
              <th className="px-3 py-2 text-left">RG. +CONTROL</th>
              <th className="px-3 py-2 text-left">F. AUTORIZACION</th>
              <th className="px-3 py-2 text-left">RANGO NUMERACION</th>
              <th className="px-3 py-2 text-left">CONSECUTIVO ACTUAL</th>
              <th className="px-3 py-2 text-center">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {resolutions.map((r: any) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{r.resolution}</td>
                <td className="px-3 py-2">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-3 py-2">{r.endDate}</td>
                <td className="px-3 py-2">[{r.prefix} {r.startNumber} - {r.endNumber}]</td>
                <td className="px-3 py-2">{r.currentNumber}</td>
                <td className="px-3 py-2 text-center"><button className="bg-red-500 text-white px-3 py-1 rounded text-xs">Desactivar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
