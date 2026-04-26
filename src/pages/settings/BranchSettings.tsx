import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { ArrowLeft, Building2, Eye, Edit2 } from "lucide-react";

export default function BranchSettings() {
  const [showAdd, setShowAdd] = useState(false);
  const [newBranch, setNewBranch] = useState({ name: "", nit: "", address: "", phone: "", city: "", department: "", country: "" });
  const { data: branches = [] } = trpc.branch.list.useQuery();
  const createBranch = trpc.branch.create.useMutation({ onSuccess: () => setShowAdd(false) });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/ajustes" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-800">EMPRESAS</h1>
      </div>

      <p className="text-sm text-gray-500 mb-4">A continuacion podras visualizar la informacion de las sucursales que tienes creadas. Si la tienes activada o desactivada, te aparecera la opcion de habilitar o deshabilitar la sucursal, segun sea el caso.</p>

      <Button className="btn-emerald mb-4" onClick={() => setShowAdd(true)}>AGREGAR NUEVA EMPRESA O SUCURSAL</Button>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1ABC9C] text-white">
              <th className="px-3 py-2 text-left">EMPRESA</th>
              <th className="px-3 py-2 text-left">NIT</th>
              <th className="px-3 py-2 text-left">DIRECCION</th>
              <th className="px-3 py-2 text-left">TELEFONO</th>
              <th className="px-3 py-2 text-left">CIUDAD</th>
              <th className="px-3 py-2 text-left">DEPARTAMENTO</th>
              <th className="px-3 py-2 text-left">VER DETALLE</th>
            </tr>
          </thead>
          <tbody>
            {branches.map((b: any) => (
              <tr key={b.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{b.name}</td>
                <td className="px-3 py-2">{b.nit || 'N/A'}</td>
                <td className="px-3 py-2">{b.address || 'N/A'}</td>
                <td className="px-3 py-2">{b.phone || 'N/A'}</td>
                <td className="px-3 py-2">{b.city || 'N/A'}</td>
                <td className="px-3 py-2">{b.department || 'N/A'}</td>
                <td className="px-3 py-2">
                  <button className="text-[#1ABC9C] mr-2"><Eye className="w-4 h-4" /></button>
                  <button className="text-blue-500"><Edit2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Nueva Sucursal</h3>
            <div className="space-y-3">
              <Input placeholder="Nombre" value={newBranch.name} onChange={e => setNewBranch({...newBranch, name: e.target.value})} />
              <Input placeholder="NIT" value={newBranch.nit} onChange={e => setNewBranch({...newBranch, nit: e.target.value})} />
              <Input placeholder="Direccion" value={newBranch.address} onChange={e => setNewBranch({...newBranch, address: e.target.value})} />
              <Input placeholder="Telefono" value={newBranch.phone} onChange={e => setNewBranch({...newBranch, phone: e.target.value})} />
              <Input placeholder="Ciudad" value={newBranch.city} onChange={e => setNewBranch({...newBranch, city: e.target.value})} />
              <Input placeholder="Departamento" value={newBranch.department} onChange={e => setNewBranch({...newBranch, department: e.target.value})} />
              <Input placeholder="Pais" value={newBranch.country} onChange={e => setNewBranch({...newBranch, country: e.target.value})} />
              <Button className="w-full btn-emerald" onClick={() => createBranch.mutate(newBranch)} disabled={createBranch.isPending}>Guardar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
