import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { ArrowLeft, Plus, Trash2, Edit2, Save, Calendar } from "lucide-react";

export default function FixedExpenses() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", amount: "", frequency: "monthly", dayOfPayment: "1", description: "" });

  const { data: items = [] } = trpc.fixedExpense.list.useQuery();
  const createItem = trpc.fixedExpense.create.useMutation({ onSuccess: () => { setShowForm(false); setForm({ name: "", amount: "", frequency: "monthly", dayOfPayment: "1", description: "" }); } });
  const updateItem = trpc.fixedExpense.update.useMutation({ onSuccess: () => setEditingId(null) });
  const deleteItem = trpc.fixedExpense.delete.useMutation();

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/gastos" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-800">GASTOS FIJOS</h1>
      </div>

      <Button className="btn-emerald mb-4" onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" /> NUEVO GASTO FIJO</Button>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1ABC9C] text-white">
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">NOMBRE</th>
              <th className="px-3 py-2 text-right">MONTO</th>
              <th className="px-3 py-2 text-center">FRECUENCIA</th>
              <th className="px-3 py-2 text-center">DIA PAGO</th>
              <th className="px-3 py-2 text-center">PROXIMO PAGO</th>
              <th className="px-3 py-2 text-center">ESTADO</th>
              <th className="px-3 py-2 text-center">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, i: number) => (
              <tr key={item.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2 font-medium">{item.name}</td>
                <td className="px-3 py-2 text-right">RD${parseFloat(item.amount).toLocaleString()}</td>
                <td className="px-3 py-2 text-center capitalize">{item.frequency}</td>
                <td className="px-3 py-2 text-center">{item.dayOfPayment}</td>
                <td className="px-3 py-2 text-center">{item.nextPaymentDate}</td>
                <td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded text-xs ${item.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{item.active ? 'Activo' : 'Inactivo'}</span></td>
                <td className="px-3 py-2 text-center flex gap-1 justify-center">
                  <button className="text-blue-500" onClick={() => { setEditingId(item.id); setForm({ name: item.name, amount: item.amount, frequency: item.frequency, dayOfPayment: String(item.dayOfPayment), description: item.description }); setShowForm(true); }}><Edit2 className="w-4 h-4" /></button>
                  <button className="text-red-500" onClick={() => deleteItem.mutate(item.id)}><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowForm(false); setEditingId(null); }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">{editingId ? "Editar" : "Nuevo"} Gasto Fijo</h3>
            <div className="space-y-3">
              <Input placeholder="Nombre del gasto" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              <Input type="number" placeholder="Monto mensual" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.frequency} onChange={e => setForm({...form, frequency: e.target.value})}>
                <option value="daily">Diario</option>
                <option value="weekly">Semanal</option>
                <option value="biweekly">Quincenal</option>
                <option value="monthly">Mensual</option>
                <option value="yearly">Anual</option>
              </select>
              <Input type="number" placeholder="Dia de pago (1-31)" value={form.dayOfPayment} onChange={e => setForm({...form, dayOfPayment: e.target.value})} />
              <Input placeholder="Descripcion" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
              <Button className="w-full btn-emerald" onClick={() => {
                if (editingId) updateItem.mutate({ id: editingId, ...form, dayOfPayment: parseInt(form.dayOfPayment) });
                else createItem.mutate({ ...form, dayOfPayment: parseInt(form.dayOfPayment) });
              }} disabled={createItem.isPending || updateItem.isPending}>GUARDAR</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
