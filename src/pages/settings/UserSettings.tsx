import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { ArrowLeft, Plus, Trash2, Edit2, Copy } from "lucide-react";

export default function UserSettings() {
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: "", email: "", password: "", type: "user", branchId: "" });

  const { data: users = [] } = trpc.user.list.useQuery({});
  const createUser = trpc.user.create.useMutation({ onSuccess: () => setShowAdd(false) });
  const deleteUser = trpc.user.delete.useMutation();
  const { data: branches = [] } = trpc.branch.list.useQuery();

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/ajustes" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-800">USUARIOS DEL SISTEMA</h1>
      </div>

      <div className="bg-gray-50 border rounded-lg p-3 mb-4 text-sm">
        <p className="font-medium">El usuario principal de sistema no puede ser eliminado.</p>
        <p className="text-gray-500">Ten en cuenta que si el usuario realizo alguna accion en cualquiera de las entidades del sistema, no podra ser eliminado; esto por razones de seguridad.</p>
      </div>

      <Button className="btn-emerald mb-4" onClick={() => setShowAdd(true)}><Plus className="w-4 h-4 mr-2" /> NUEVO USUARIO</Button>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1ABC9C] text-white">
              <th className="px-3 py-2 text-left">NOMBRE COMPLETO</th>
              <th className="px-3 py-2 text-left">CORREO</th>
              <th className="px-3 py-2 text-left">TIPO</th>
              <th className="px-3 py-2 text-left">EMPRESA</th>
              <th className="px-3 py-2 text-center">ACTUALIZAR</th>
              <th className="px-3 py-2 text-center">ELIMINAR</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u: any) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{u.fullName}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-xs ${u.type === 'admin' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>{u.type}</span></td>
                <td className="px-3 py-2">SMART LIQUOR STORE</td>
                <td className="px-3 py-2 text-center">
                  <button className="text-[#1ABC9C]"><Edit2 className="w-4 h-4" /></button>
                  <button className="text-blue-500 ml-2"><Copy className="w-4 h-4" /></button>
                </td>
                <td className="px-3 py-2 text-center">
                  <button className="text-red-500" onClick={() => deleteUser.mutate(u.id)}><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Nuevo Usuario</h3>
            <div className="space-y-3">
              <Input placeholder="Nombre completo" value={newUser.fullName} onChange={e => setNewUser({...newUser, fullName: e.target.value})} />
              <Input placeholder="Correo" type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
              <Input placeholder="Contrasena" type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={newUser.type} onChange={e => setNewUser({...newUser, type: e.target.value})}>
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={newUser.branchId} onChange={e => setNewUser({...newUser, branchId: e.target.value})}>
                <option value="">Todas las sucursales</option>
                {branches.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
              <Button className="w-full btn-emerald" onClick={() => createUser.mutate(newUser)} disabled={createUser.isPending}>Guardar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
