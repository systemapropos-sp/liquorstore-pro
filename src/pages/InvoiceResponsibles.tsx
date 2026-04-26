import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { ArrowLeft, Plus, Save, ToggleLeft, ToggleRight, UserCheck } from "lucide-react";

export default function InvoiceResponsibles() {
  const [activeTab, setActiveTab] = useState("list");
  const [form, setForm] = useState({ firstName: "", lastName: "", document: "", phone: "", branchId: "1" });

  const { data: employees = [] } = trpc.employee.list.useQuery({});
  const { data: branches = [] } = trpc.branch.list.useQuery();

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/facturacion" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-800">RESPONSABLES DE FACTURACION</h1>
      </div>

      <div className="flex gap-4 mb-4 border-b">
        <button onClick={() => setActiveTab("new")} className={`px-4 py-2 text-sm font-medium ${activeTab === "new" ? "border-b-2 border-[#1ABC9C] text-[#1ABC9C]" : "text-gray-500"}`}>NUEVO</button>
        <button onClick={() => setActiveTab("list")} className={`px-4 py-2 text-sm font-medium ${activeTab === "list" ? "border-b-2 border-[#1ABC9C] text-[#1ABC9C]" : "text-gray-500"}`}>RESPONSABLES</button>
      </div>

      {activeTab === "new" && (
        <div className="bg-white border rounded-lg p-6 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-gray-500 block mb-1">Nombres</label>
              <Input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} placeholder="Nombres" />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Apellidos</label>
              <Input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} placeholder="Apellidos" />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Cedula</label>
              <Input value={form.document} onChange={e => setForm({...form, document: e.target.value})} placeholder="Cedula" />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Telefono</label>
              <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Telefono" />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Sucursal</label>
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.branchId} onChange={e => setForm({...form, branchId: e.target.value})}>
                {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <Button className="btn-emerald"><Save className="w-4 h-4 mr-2" /> GUARDAR RESPONSABLE</Button>
        </div>
      )}

      {activeTab === "list" && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="p-3 border-b flex gap-3">
            <select className="border rounded-md px-3 py-2 text-sm">
              <option>Sucursal</option>
              {branches.map((b: any) => <option key={b.id}>{b.name}</option>)}
            </select>
            <Button size="sm" className="btn-emerald"><Plus className="w-4 h-4 mr-1" /> NUEVO</Button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1ABC9C] text-white">
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">DETALLES</th>
                <th className="px-3 py-2 text-left">NOMBRES</th>
                <th className="px-3 py-2 text-left">APELLIDOS</th>
                <th className="px-3 py-2 text-left">CEDULA</th>
                <th className="px-3 py-2 text-left">TELEFONO</th>
                <th className="px-3 py-2 text-center">ESTADO</th>
                <th className="px-3 py-2 text-left">SUCURSAL</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp: any, i: number) => (
                <tr key={emp.id} className="border-b hover:bg-gray-50">
                  <td className="px-3 py-2">{i + 1}</td>
                  <td className="px-3 py-2"><button className="text-[#1ABC9C]"><UserCheck className="w-4 h-4" /></button></td>
                  <td className="px-3 py-2">{emp.firstName}</td>
                  <td className="px-3 py-2">{emp.lastName}</td>
                  <td className="px-3 py-2">{emp.document || "N/A"}</td>
                  <td className="px-3 py-2">{emp.phone}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs ${emp.active !== false ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                      {emp.active !== false ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-3 py-2">SMART LIQUOR STORE</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
