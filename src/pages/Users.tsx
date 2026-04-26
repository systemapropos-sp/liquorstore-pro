import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/providers/trpc";
import {
  Plus, Trash2, Edit2, X, Save, UserPlus, Shield, UserCheck,
  Users as UsersIcon, Activity, Eye
} from "lucide-react";

const roleConfig: Record<string, { label: string; color: string; bg: string }> = {
  admin: { label: "Administrador", color: "text-emerald-700", bg: "bg-emerald-100" },
  supervisor: { label: "Supervisor", color: "text-blue-700", bg: "bg-blue-100" },
  manager: { label: "Gerente", color: "text-purple-700", bg: "bg-purple-100" },
  cajera: { label: "Cajera", color: "text-amber-700", bg: "bg-amber-100" },
  vendedor: { label: "Vendedor", color: "text-cyan-700", bg: "bg-cyan-100" },
  almacenista: { label: "Almacenista", color: "text-gray-700", bg: "bg-gray-100" },
};

export default function Users() {
  const [activeTab, setActiveTab] = useState("users");
  const [showDialog, setShowDialog] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [showActivity, setShowActivity] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();

  const [form, setForm] = useState({
    fullName: "", email: "", password: "", type: "user" as const,
    role: "cajera" as const, branchId: ""
  });

  const { data: users = [], refetch } = trpc.user.list.useQuery({});
  const { data: branches = [] } = trpc.branch.list.useQuery();
  const { data: activities = [] } = trpc.userActivity.list.useQuery(
    selectedUserId ? { userId: selectedUserId } : { limit: 100 }
  );

  const createUser = trpc.user.create.useMutation({ onSuccess: () => { refetch(); setShowDialog(false); resetForm(); } });
  const updateUser = trpc.user.update.useMutation({ onSuccess: () => { refetch(); setShowDialog(false); setEditUser(null); resetForm(); } });
  const deleteUser = trpc.user.delete.useMutation({ onSuccess: () => refetch() });

  const resetForm = () => {
    setForm({ fullName: "", email: "", password: "", type: "user", role: "cajera", branchId: "" });
  };

  const startEdit = (user: any) => {
    setEditUser(user);
    setForm({
      fullName: user.fullName || "",
      email: user.email || "",
      password: "",
      type: user.type || "user",
      role: user.role || "cajera",
      branchId: user.branchId ? String(user.branchId) : ""
    });
    setShowDialog(true);
  };

  const startCreate = () => {
    setEditUser(null);
    resetForm();
    setShowDialog(true);
  };

  const handleSave = () => {
    const data = {
      fullName: form.fullName,
      email: form.email,
      type: form.type,
      role: form.role,
      branchId: form.branchId ? parseInt(form.branchId) : undefined
    };
    if (editUser) {
      const updateData = form.password ? { ...data, password: form.password } : data;
      updateUser.mutate({ id: editUser.id, ...updateData });
    } else {
      if (!form.password) { alert("La contrasena es requerida para nuevos usuarios"); return; }
      createUser.mutate({ ...data, password: form.password });
    }
  };

  const viewUserActivity = (userId: number) => {
    setSelectedUserId(userId);
    setShowActivity(true);
  };

  const allActivities = activeTab === "activity" ? activities : [];

  return (
    <Layout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <UsersIcon className="w-6 h-6 text-[#1ABC9C]" />
              USUARIOS DEL SISTEMA
            </h1>
            <p className="text-sm text-gray-500 mt-1">Administre los usuarios, roles y permisos del sistema</p>
          </div>
          <Button className="bg-[#1ABC9C] hover:bg-[#16a085] text-white" onClick={startCreate}>
            <UserPlus className="w-4 h-4 mr-2" /> NUEVO USUARIO
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTab === "users" ? "border-b-2 border-[#1ABC9C] text-[#1ABC9C]" : "text-gray-500 hover:text-gray-700"}`}
          >
            <UsersIcon className="w-4 h-4" /> USUARIOS
          </button>
          <button
            onClick={() => { setActiveTab("activity"); setSelectedUserId(undefined); }}
            className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${activeTab === "activity" ? "border-b-2 border-[#1ABC9C] text-[#1ABC9C]" : "text-gray-500 hover:text-gray-700"}`}
          >
            <Activity className="w-4 h-4" /> REGISTRO DE MOVIMIENTOS
          </button>
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1ABC9C] text-white">
                  <th className="px-3 py-3 text-left">#</th>
                  <th className="px-3 py-3 text-left">NOMBRE COMPLETO</th>
                  <th className="px-3 py-3 text-left">CORREO</th>
                  <th className="px-3 py-3 text-center">ROL</th>
                  <th className="px-3 py-3 text-center">TIPO</th>
                  <th className="px-3 py-3 text-left">SUCURSAL</th>
                  <th className="px-3 py-3 text-center">ESTADO</th>
                  <th className="px-3 py-3 text-center">EDITAR</th>
                  <th className="px-3 py-3 text-center">ACTIVIDAD</th>
                  <th className="px-3 py-3 text-center">ELIMINAR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user: any, idx: number) => {
                  const roleInfo = roleConfig[user.role] || roleConfig.cajera;
                  const branch = branches.find((b: any) => b.id === user.branchId);
                  return (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-3 py-3 text-gray-500">{idx + 1}</td>
                      <td className="px-3 py-3 font-medium text-gray-800">{user.fullName}</td>
                      <td className="px-3 py-3 text-gray-600">{user.email}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${roleInfo.bg} ${roleInfo.color}`}>
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded ${user.type === 'admin' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                          {user.type === 'admin' ? 'Admin' : 'Usuario'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-600">{branch?.name || "Todas"}</td>
                      <td className="px-3 py-3 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded ${user.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                          {user.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button onClick={() => startEdit(user)} className="text-[#1ABC9C] hover:text-[#16a085] transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button onClick={() => viewUserActivity(user.id)} className="text-blue-500 hover:text-blue-700 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <button
                          onClick={() => { if (confirm(`Eliminar usuario ${user.fullName}?`)) deleteUser.mutate(user.id); }}
                          className="text-red-400 hover:text-red-600 transition-colors"
                          disabled={user.id === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <UsersIcon className="w-10 h-10 mx-auto mb-2" />
                <p>No hay usuarios registrados</p>
              </div>
            )}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div className="bg-white border rounded-lg overflow-hidden">
            {/* User filter for activity */}
            <div className="p-3 border-b flex items-center gap-3">
              <span className="text-sm text-gray-500">Filtrar por usuario:</span>
              <select
                className="border rounded-md px-3 py-1.5 text-sm"
                value={selectedUserId || ""}
                onChange={e => setSelectedUserId(e.target.value ? parseInt(e.target.value) : undefined)}
              >
                <option value="">Todos los usuarios</option>
                {users.map((u: any) => (
                  <option key={u.id} value={u.id}>{u.fullName}</option>
                ))}
              </select>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1ABC9C] text-white">
                  <th className="px-3 py-3 text-left">FECHA/HORA</th>
                  <th className="px-3 py-3 text-left">USUARIO</th>
                  <th className="px-3 py-3 text-center">ACCION</th>
                  <th className="px-3 py-3 text-left">ENTIDAD</th>
                  <th className="px-3 py-3 text-left">DETALLES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activities.map((act: any) => (
                  <tr key={act.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(act.createdAt).toLocaleString("es-DO")}
                    </td>
                    <td className="px-3 py-3 font-medium text-gray-800">{act.userName}</td>
                    <td className="px-3 py-3 text-center">
                      <Badge className={`text-[10px] ${
                        act.action === 'create' ? 'bg-emerald-500' :
                        act.action === 'update' ? 'bg-blue-500' :
                        act.action === 'delete' ? 'bg-red-500' :
                        act.action === 'login' ? 'bg-purple-500' : 'bg-gray-500'
                      } text-white border-0`}>
                        {act.action === 'create' ? 'CREO' :
                         act.action === 'update' ? 'ACTUALIZO' :
                         act.action === 'delete' ? 'ELIMINO' :
                         act.action === 'login' ? 'LOGIN' : act.action}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-gray-600 capitalize text-xs">{act.entity}</td>
                    <td className="px-3 py-3 text-gray-700 text-xs">{act.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {activities.length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                <Activity className="w-8 h-8 mx-auto mb-2" />
                <p>No hay movimientos registrados</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialog: Create/Edit User */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center bg-[#1ABC9C] text-white py-2 rounded-md text-sm">
              {editUser ? "EDITAR USUARIO" : "NUEVO USUARIO"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-gray-500 block mb-1">Nombre Completo *</label>
              <Input
                placeholder="Nombre completo..."
                value={form.fullName}
                onChange={e => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Correo Electronico *</label>
              <Input
                type="email"
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">
                Contrasena {editUser ? "(dejar en blanco para mantener)" : "*"}
              </label>
              <Input
                type="password"
                placeholder="Contrasena..."
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-500 block mb-1">Tipo de Usuario</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value as any })}
                >
                  <option value="admin">Administrador</option>
                  <option value="user">Usuario</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">Rol</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value as any })}
                >
                  <option value="admin">Administrador</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="manager">Gerente</option>
                  <option value="cajera">Cajera</option>
                  <option value="vendedor">Vendedor</option>
                  <option value="almacenista">Almacenista</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Sucursal Asignada</label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm"
                value={form.branchId}
                onChange={e => setForm({ ...form, branchId: e.target.value })}
              >
                <option value="">Todas las sucursales</option>
                {branches.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowDialog(false)}>
                <X className="w-4 h-4 mr-1" /> Cancelar
              </Button>
              <Button
                className="flex-1 bg-[#1ABC9C] hover:bg-[#16a085] text-white"
                onClick={handleSave}
                disabled={!form.fullName || !form.email || (!editUser && !form.password)}
              >
                <Save className="w-4 h-4 mr-1" /> {editUser ? "ACTUALIZAR" : "GUARDAR"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: View User Activity */}
      <Dialog open={showActivity} onOpenChange={setShowActivity}>
        <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center bg-[#1ABC9C] text-white py-2 rounded-md text-sm flex items-center justify-center gap-2">
              <Activity className="w-4 h-4" />
              HISTORIAL DE MOVIMIENTOS
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-2 text-left text-xs">FECHA/HORA</th>
                  <th className="px-3 py-2 text-center text-xs">ACCION</th>
                  <th className="px-3 py-2 text-left text-xs">DETALLES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activities.map((act: any) => (
                  <tr key={act.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(act.createdAt).toLocaleString("es-DO")}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Badge className={`text-[10px] ${
                        act.action === 'create' ? 'bg-emerald-500' :
                        act.action === 'update' ? 'bg-blue-500' :
                        act.action === 'delete' ? 'bg-red-500' :
                        act.action === 'login' ? 'bg-purple-500' : 'bg-gray-500'
                      } text-white border-0`}>
                        {act.action === 'create' ? 'CREO' :
                         act.action === 'update' ? 'ACTUALIZO' :
                         act.action === 'delete' ? 'ELIMINO' :
                         act.action === 'login' ? 'LOGIN' : act.action}
                      </Badge>
                    </td>
                    <td className="px-3 py-2 text-gray-700 text-xs">{act.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {activities.length === 0 && (
              <div className="text-center py-6 text-gray-400 text-sm">
                <p>No hay movimientos para este usuario</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
