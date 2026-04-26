import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

export default function ExpenseConceptSettings() {
  const [showAdd, setShowAdd] = useState(false);
  const [newConcept, setNewConcept] = useState({ type: "income", code: "", concept: "" });
  const { data: concepts = [] } = trpc.expenseConcept.list.useQuery({});
  const createConcept = trpc.expenseConcept.create.useMutation({ onSuccess: () => setShowAdd(false) });
  const deleteConcept = trpc.expenseConcept.delete.useMutation();

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/ajustes" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-800">CONCEPTOS DE GASTOS</h1>
      </div>

      <div className="flex gap-4 mb-4">
        <button className="px-4 py-2 text-sm font-medium border-b-2 border-[#1ABC9C] text-[#1ABC9C]">CONCEPTOS DE GASTOS</button>
        <button onClick={() => setShowAdd(true)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-[#1ABC9C]">+ AGREGAR NUEVO</button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1ABC9C] text-white">
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">TIPO</th>
              <th className="px-3 py-2 text-left">CODIGO</th>
              <th className="px-3 py-2 text-left">CONCEPTO</th>
              <th className="px-3 py-2 text-left">OPCIONES</th>
            </tr>
          </thead>
          <tbody>
            {concepts.map((c: any, i: number) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-xs ${c.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{c.type === 'income' ? 'Ingresos' : 'Egresos'}</span></td>
                <td className="px-3 py-2">{c.code}</td>
                <td className="px-3 py-2">{c.concept}</td>
                <td className="px-3 py-2 text-[#1ABC9C] text-xs">No es permitido realizar acciones</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Nuevo Concepto</h3>
            <div className="space-y-3">
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={newConcept.type} onChange={e => setNewConcept({...newConcept, type: e.target.value})}>
                <option value="income">Ingresos</option>
                <option value="expense">Egresos</option>
              </select>
              <Input placeholder="Codigo (ej: 0001)" value={newConcept.code} onChange={e => setNewConcept({...newConcept, code: e.target.value})} />
              <Input placeholder="Concepto" value={newConcept.concept} onChange={e => setNewConcept({...newConcept, concept: e.target.value})} />
              <Button className="w-full btn-emerald" onClick={() => createConcept.mutate(newConcept)} disabled={createConcept.isPending}>Guardar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
