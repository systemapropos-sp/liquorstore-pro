import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { ArrowLeft, Search, Trash2, Download } from "lucide-react";

export default function ExpenseHistory() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: expenses = [] } = trpc.expense.list.useQuery({
    type: typeFilter || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  });
  const deleteExpense = trpc.expense.delete.useMutation();

  const filtered = expenses.filter((e: any) =>
    e.description?.toLowerCase().includes(search.toLowerCase()) ||
    e.conceptName?.toLowerCase().includes(search.toLowerCase())
  );

  const totalIncome = filtered.filter((e: any) => e.type === "income").reduce((s: number, e: any) => s + parseFloat(e.amount), 0);
  const totalExpense = filtered.filter((e: any) => e.type === "expense").reduce((s: number, e: any) => s + parseFloat(e.amount), 0);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/gastos" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-800">HISTORICO DE GASTOS</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500">TOTAL INGRESOS</p>
          <p className="text-2xl font-bold text-emerald-600">RD${totalIncome.toLocaleString()}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500">TOTAL EGRESOS</p>
          <p className="text-2xl font-bold text-red-600">RD${totalExpense.toLocaleString()}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-500">BALANCE</p>
          <p className="text-2xl font-bold text-blue-600">RD${(totalIncome - totalExpense).toLocaleString()}</p>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /><Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" /></div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="border rounded-md px-3 text-sm">
          <option value="">Todos</option>
          <option value="income">Ingresos</option>
          <option value="expense">Egresos</option>
        </select>
        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-40" />
        <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-40" />
        <Button variant="outline" className="text-[#1ABC9C] border-[#1ABC9C]"><Download className="w-4 h-4" /></Button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1ABC9C] text-white">
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">FECHA</th>
              <th className="px-3 py-2 text-left">CONCEPTO</th>
              <th className="px-3 py-2 text-left">DESCRIPCION</th>
              <th className="px-3 py-2 text-center">TIPO</th>
              <th className="px-3 py-2 text-right">MONTO</th>
              <th className="px-3 py-2 text-left">USUARIO</th>
              <th className="px-3 py-2 text-center">DOC</th>
              <th className="px-3 py-2 text-center">ELIMINAR</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((e: any, i: number) => (
              <tr key={e.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2">{e.date}</td>
                <td className="px-3 py-2">{e.conceptName}</td>
                <td className="px-3 py-2">{e.description}</td>
                <td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded text-xs ${e.type === "income" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{e.type === "income" ? "Ingreso" : "Egreso"}</span></td>
                <td className="px-3 py-2 text-right font-medium">RD${parseFloat(e.amount).toLocaleString()}</td>
                <td className="px-3 py-2">{e.userName}</td>
                <td className="px-3 py-2 text-center">{e.documentUrl ? <span className="text-blue-500 text-xs">Adjunto</span> : "—"}</td>
                <td className="px-3 py-2 text-center"><button className="text-red-500" onClick={() => deleteExpense.mutate(e.id)}><Trash2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
