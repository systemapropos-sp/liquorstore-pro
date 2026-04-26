import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { ArrowLeft, Plus, Edit2 } from "lucide-react";

export default function CashRegisterSettings() {
  const [showAdd, setShowAdd] = useState(false);
  const [newReg, setNewReg] = useState({ name: "", serial: "", location: "", branchId: "1" });
  const { data: registers = [] } = trpc.cashRegister.list.useQuery({});
  const { data: branches = [] } = trpc.branch.list.useQuery();
  const createReg = trpc.cashRegister.create.useMutation({ onSuccess: () => setShowAdd(false) });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/ajustes" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-800">CREAR PUNTO DE VENTA</h1>
      </div>

      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Sucursal</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm" value={newReg.branchId} onChange={e => setNewReg({...newReg, branchId: e.target.value})}>
              {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Nombre caja</label>
            <Input value={newReg.name} onChange={e => setNewReg({...newReg, name: e.target.value})} placeholder="Ej: CAJA 1" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Serial</label>
            <Input value={newReg.serial} onChange={e => setNewReg({...newReg, serial: e.target.value})} placeholder="Numero de serie" />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">Ubicacion</label>
            <Input value={newReg.location} onChange={e => setNewReg({...newReg, location: e.target.value})} placeholder="Ubicacion" />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button className="btn-emerald" onClick={() => createReg.mutate(newReg)} disabled={createReg.isPending}><Plus className="w-4 h-4 mr-1" /> GUARDAR</Button>
        </div>
      </div>

      <h3 className="text-center text-[#1ABC9C] font-semibold mb-4">HISTORIAL DE PUNTOS DE VENTA</h3>
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1ABC9C] text-white">
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">PUNTO DE VENTA</th>
              <th className="px-3 py-2 text-left">SERIE</th>
              <th className="px-3 py-2 text-left">UBICACION</th>
              <th className="px-3 py-2 text-left">EMPRESA</th>
              <th className="px-3 py-2 text-center">EDITAR</th>
            </tr>
          </thead>
          <tbody>
            {registers.map((r: any) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{r.id}</td>
                <td className="px-3 py-2">{r.name}</td>
                <td className="px-3 py-2">{r.serial}</td>
                <td className="px-3 py-2">{r.location}</td>
                <td className="px-3 py-2">SMART LIQUOR STORE</td>
                <td className="px-3 py-2 text-center"><button className="text-[#1ABC9C]"><Edit2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
