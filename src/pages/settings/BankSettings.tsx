import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { ArrowLeft, Landmark, Plus, Trash2, DollarSign, ArrowRightLeft, History } from "lucide-react";

export default function BankSettings() {
  const [showAdd, setShowAdd] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [newBank, setNewBank] = useState({ name: "", accountHolder: "", accountNumber: "", accountType: "Ahorros" });
  const [transferData, setTransferData] = useState({ fromBankId: "", toBankId: "", amount: "", description: "" });

  const { data: banks = [] } = trpc.bank.list.useQuery();
  const { data: transactions = [] } = trpc.bank.transactions.useQuery({});
  const { data: mainCash } = trpc.bank.mainCash.useQuery();
  const createBank = trpc.bank.create.useMutation({ onSuccess: () => setShowAdd(false) });
  const createTx = trpc.bank.transactionCreate.useMutation({ onSuccess: () => setShowTransfer(false) });
  const deleteBank = trpc.bank.delete.useMutation();

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/ajustes" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-800">CAJA MAYOR / BANCOS</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button className="border-2 border-[#1ABC9C] rounded-lg p-4 flex items-center justify-center gap-2 text-[#1ABC9C] font-semibold hover:bg-emerald-50">
          <Landmark className="w-5 h-5" /> CAJA MAYOR
        </button>
        <button onClick={() => setShowAdd(true)} className="bg-[#1ABC9C] text-white rounded-lg p-4 flex items-center justify-center gap-2 font-semibold hover:bg-[#16a085]">
          <Plus className="w-5 h-5" /> GESTIONAR BANCOS
        </button>
        <button onClick={() => setShowTransfer(true)} className="bg-[#1ABC9C] text-white rounded-lg p-4 flex items-center justify-center gap-2 font-semibold hover:bg-[#16a085]">
          <History className="w-5 h-5" /> HISTORIAL DE BANCOS
        </button>
      </div>

      {mainCash && (
        <div className="bg-white border rounded-lg p-6 mb-6 max-w-xl mx-auto text-center">
          <h3 className="bg-[#1ABC9C] text-white px-4 py-1 rounded text-sm font-medium inline-block mb-4">{mainCash.name}</h3>
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <Landmark className="w-8 h-8 text-[#1ABC9C]" />
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between bg-gray-50 px-4 py-2 rounded"><span className="text-[#1ABC9C] font-medium">NOMBRE:</span><span>{mainCash.name}</span></div>
            <div className="flex justify-between bg-gray-50 px-4 py-2 rounded"><span className="text-[#1ABC9C] font-medium">TITULAR:</span><span>{mainCash.holder}</span></div>
            <div className="flex justify-between bg-gray-50 px-4 py-2 rounded"><span className="text-[#1ABC9C] font-medium">SALDO:</span><span className="font-bold">${parseFloat(mainCash.balance).toLocaleString()}</span></div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button className="flex-1 btn-emerald"><DollarSign className="w-4 h-4 mr-1" /> ACTUALIZAR DINERO</Button>
            <Button className="flex-1 btn-emerald" onClick={() => setShowTransfer(true)}><ArrowRightLeft className="w-4 h-4 mr-1" /> TRANSFERIR DINERO</Button>
          </div>
        </div>
      )}

      <div className="bg-white border rounded-lg overflow-hidden mb-6">
        <h3 className="text-center text-[#1ABC9C] font-semibold text-lg py-3">HISTORICO DE TRANSACCIONES EN CAJA MAYOR</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1ABC9C] text-white">
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">FECHA</th>
              <th className="px-3 py-2 text-left">OPERACION</th>
              <th className="px-3 py-2 text-left">PERSONA</th>
              <th className="px-3 py-2 text-left">MOVIMIENTO</th>
              <th className="px-3 py-2 text-right">TOTAL ANTES</th>
              <th className="px-3 py-2 text-right">VALOR AFECTADO</th>
              <th className="px-3 py-2 text-right">TOTAL DESPUES</th>
              <th className="px-3 py-2 text-left">DESCRIPCION</th>
              <th className="px-3 py-2 text-left">USUARIO</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx: any, i: number) => (
              <tr key={tx.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2">{new Date(tx.createdAt).toLocaleDateString()}<br/><span className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleTimeString()}</span></td>
                <td className="px-3 py-2"><span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-xs">{tx.operation}</span></td>
                <td className="px-3 py-2">{tx.personName}</td>
                <td className="px-3 py-2"><span className={`px-2 py-0.5 rounded text-xs ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{tx.type === 'income' ? 'Ingreso' : 'Egreso'}</span></td>
                <td className="px-3 py-2 text-right">${parseFloat(tx.balanceBefore).toLocaleString()}</td>
                <td className="px-3 py-2 text-right">${parseFloat(tx.amount).toLocaleString()}</td>
                <td className="px-3 py-2 text-right">${parseFloat(tx.balanceAfter).toLocaleString()}</td>
                <td className="px-3 py-2 text-xs">{tx.description}</td>
                <td className="px-3 py-2">{tx.userName}</td>
              </tr>
            ))}
            {transactions.length === 0 && <tr><td colSpan={10} className="px-3 py-4 text-center text-gray-400">Sin transacciones</td></tr>}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAdd(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Nuevo Banco</h3>
            <div className="space-y-3">
              <Input placeholder="Nombre del banco" value={newBank.name} onChange={e => setNewBank({...newBank, name: e.target.value})} />
              <Input placeholder="Titular de la cuenta" value={newBank.accountHolder} onChange={e => setNewBank({...newBank, accountHolder: e.target.value})} />
              <Input placeholder="Numero de cuenta" value={newBank.accountNumber} onChange={e => setNewBank({...newBank, accountNumber: e.target.value})} />
              <select className="w-full border rounded-md px-3 py-2 text-sm" value={newBank.accountType} onChange={e => setNewBank({...newBank, accountType: e.target.value})}>
                <option value="Ahorros">Ahorros</option>
                <option value="Corriente">Corriente</option>
              </select>
              <Button className="w-full btn-emerald" onClick={() => createBank.mutate(newBank)} disabled={createBank.isPending}>Guardar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
