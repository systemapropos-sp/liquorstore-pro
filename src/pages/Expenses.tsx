import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import {
  Plus, DollarSign, ArrowLeft, Receipt, TrendingDown, FolderOpen, History
} from "lucide-react";

export default function Expenses() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: "expense",
    conceptId: "",
    amount: "",
    description: "",
    documentUrl: "",
    date: new Date().toISOString().split("T")[0],
  });

  const { data: concepts = [] } = trpc.expenseConcept.list.useQuery({});
  const createExpense = trpc.expense.create.useMutation({
    onSuccess: () => { setShowForm(false); setForm({ type: "expense", conceptId: "", amount: "", description: "", documentUrl: "", date: new Date().toISOString().split("T")[0] }); }
  });

  function handleSubmit() {
    const concept = concepts.find((c: any) => String(c.id) === form.conceptId);
    createExpense.mutate({
      ...form,
      conceptId: parseInt(form.conceptId),
      conceptName: concept?.concept || "",
      branchId: 1,
    });
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">GASTOS</h1>
          <p className="text-sm text-gray-500 mt-1">Registro de ingresos y egresos</p>
        </div>
        <Button className="btn-emerald" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> NUEVO GASTO
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Link to="/gastos/historico">
          <div className="bg-white border rounded-lg p-5 flex items-center gap-4 hover:border-[#1ABC9C] transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-[#1ABC9C] flex items-center justify-center"><History className="w-6 h-6 text-white" /></div>
            <div><p className="font-bold text-gray-800">HISTORICO GASTOS</p><p className="text-xs text-gray-500">Ver todos los movimientos</p></div>
          </div>
        </Link>
        <Link to="/gastos/fijos">
          <div className="bg-white border rounded-lg p-5 flex items-center gap-4 hover:border-[#1ABC9C] transition-all cursor-pointer">
            <div className="w-12 h-12 rounded-full bg-[#1ABC9C] flex items-center justify-center"><FolderOpen className="w-6 h-6 text-white" /></div>
            <div><p className="font-bold text-gray-800">GASTOS FIJOS</p><p className="text-xs text-gray-500">Administrar gastos recurrentes</p></div>
          </div>
        </Link>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Nuevo Movimiento</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1">Tipo</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                  <option value="expense">Egreso (Gasto)</option>
                  <option value="income">Ingreso</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Concepto</label>
                <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.conceptId} onChange={e => setForm({...form, conceptId: e.target.value})}>
                  <option value="">Seleccionar concepto</option>
                  {concepts.filter((c: any) => c.type === form.type).map((c: any) => (
                    <option key={c.id} value={String(c.id)}>{c.code} - {c.concept}</option>
                  ))}
                </select>
              </div>
              <div><label className="text-sm font-medium block mb-1">Monto (RD$)</label><Input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} /></div>
              <div><label className="text-sm font-medium block mb-1">Descripcion</label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div><label className="text-sm font-medium block mb-1">Fecha</label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
              <div><label className="text-sm font-medium block mb-1">Documento (URL o base64)</label><Input value={form.documentUrl} onChange={e => setForm({...form, documentUrl: e.target.value})} placeholder="Opcional" /></div>
              <Button className="w-full btn-emerald" onClick={handleSubmit} disabled={createExpense.isPending}>GUARDAR</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
