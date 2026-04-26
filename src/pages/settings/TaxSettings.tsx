import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { ArrowLeft, Plus, Trash2, Edit2, Save } from "lucide-react";

export default function TaxSettings() {
  const [showAdd, setShowAdd] = useState(false);
  const [newTax, setNewTax] = useState({ name: "", rate: "", type: "ITBIS" });
  const [bagValue, setBagValue] = useState("0");

  const { data: taxes = [] } = trpc.taxConfig.list.useQuery();
  const createTax = trpc.taxConfig.create.useMutation({ onSuccess: () => setShowAdd(false) });
  const updateTax = trpc.taxConfig.update.useMutation();
  const deleteTax = trpc.taxConfig.delete.useMutation();

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/ajustes" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-800">CONFIGURACION DE IMPUESTOS</h1>
      </div>

      <div className="bg-white border rounded-lg p-6 mb-6">
        <h3 className="text-center text-[#1ABC9C] font-semibold mb-4">AGREGAR IMPUESTOS</h3>
        <div className="flex gap-3 items-end mb-4">
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">Tipo de impuesto</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm" value={newTax.type} onChange={e => setNewTax({...newTax, type: e.target.value})}>
              <option value="ITBIS">ITBIS</option>
              <option value="IVA">IVA</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">Nombre</label>
            <Input value={newTax.name} onChange={e => setNewTax({...newTax, name: e.target.value})} placeholder="Nombre" />
          </div>
          <div className="w-24">
            <label className="text-xs text-gray-500 block mb-1">Tarifa %</label>
            <Input type="number" value={newTax.rate} onChange={e => setNewTax({...newTax, rate: e.target.value})} placeholder="0" />
          </div>
          <Button className="btn-emerald" onClick={() => createTax.mutate({ name: newTax.name || newTax.type, rate: parseFloat(newTax.rate) || 0, type: newTax.type })} disabled={createTax.isPending}><Save className="w-4 h-4" /></Button>
        </div>

        <div className="bg-gray-50 p-3 rounded mb-4">
          <p className="font-medium text-sm">Impuesto por defecto:</p>
          <p className="text-xs text-gray-500">Esta configuracion es para todas las sucursales</p>
          <p className="text-sm mt-1">Impuesto predeterminado: <span className="text-[#1ABC9C] font-medium">Exento</span></p>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1ABC9C] text-white">
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-center">ESTADO</th>
              <th className="px-3 py-2 text-left">NOMBRE</th>
              <th className="px-3 py-2 text-right">TARIFA (%)</th>
              <th className="px-3 py-2 text-left">TIPO</th>
              <th className="px-3 py-2 text-center">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {taxes.map((t: any) => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{t.id}</td>
                <td className="px-3 py-2 text-center"><input type="checkbox" checked={t.active} readOnly className="accent-[#1ABC9C]" /></td>
                <td className="px-3 py-2">{t.name}</td>
                <td className="px-3 py-2 text-right">{t.rate}%</td>
                <td className="px-3 py-2">{t.type}</td>
                <td className="px-3 py-2 text-center">
                  <button className="text-red-500 mr-2" onClick={() => deleteTax.mutate(t.id)}><Trash2 className="w-4 h-4" /></button>
                  <button className="text-blue-500"><Edit2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white border rounded-lg p-6 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">CONFIGURACION IMPUESTO AL CONSUMO DE BOLSAS</h3>
        <div className="flex gap-3 items-center">
          <Input type="number" value={bagValue} onChange={e => setBagValue(e.target.value)} className="w-24" />
          <Button size="sm" className="btn-emerald">ACTUALIZAR</Button>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">CONFIGURACION VENTAS DIA SIN IVA</h3>
        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2"><input type="radio" name="iva" className="accent-[#1ABC9C]" /> APLICAR DIA SIN IVA (Vender productos sin iva, Decreto 1314 de 2021)</label>
          <label className="flex items-center gap-2"><input type="radio" name="iva" className="accent-[#1ABC9C]" /> APLICAR EL DIA SIN IVA EN LA FACTURACION POS</label>
          <label className="flex items-center gap-2"><input type="radio" name="iva" defaultChecked className="accent-[#1ABC9C]" /> Venta normal (Venta del producto segun su configuracion)</label>
        </div>
      </div>
    </div>
  );
}
