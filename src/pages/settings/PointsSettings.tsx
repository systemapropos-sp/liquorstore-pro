import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { ArrowLeft, Award, Save } from "lucide-react";

export default function PointsSettings() {
  const { data: config } = trpc.pointsConfig.get.useQuery();
  const saveConfig = trpc.pointsConfig.save.useMutation();
  const [form, setForm] = useState({ pointValue: "10", pointsPerAmount: "1000", minRedeem: 100, active: true });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/ajustes" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-800">PUNTOS ACUMULADOS</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white border rounded-lg p-5 text-center">
          <p className="text-sm text-gray-500">VALOR DEL PUNTO</p>
          <p className="text-2xl font-bold text-[#1ABC9C]">RD${form.pointValue}.00</p>
        </div>
        <div className="bg-white border rounded-lg p-5 text-center">
          <p className="text-sm text-gray-500">PUNTOS POR CLIENTES</p>
          <p className="text-2xl font-bold text-[#1ABC9C]">1</p>
        </div>
        <div className="bg-white border rounded-lg p-5 text-center">
          <p className="text-sm text-gray-500">CANJE DE PUNTOS</p>
          <p className="text-2xl font-bold text-[#1ABC9C]">CADA {form.minRedeem} PUNTOS</p>
        </div>
      </div>

      <div className="max-w-xl mx-auto bg-white border rounded-lg p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#1ABC9C] flex items-center justify-center mx-auto mb-3">
            <Award className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm text-gray-500">Configure el sistema de puntos para fidelizar a sus clientes.</p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium block mb-1">Valor del punto (RD$)</label>
              <Input type="number" value={form.pointValue} onChange={e => setForm({...form, pointValue: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Puntos por cada RD$</label>
              <Input type="number" value={form.pointsPerAmount} onChange={e => setForm({...form, pointsPerAmount: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Minimo para canjear</label>
            <Input type="number" value={form.minRedeem} onChange={e => setForm({...form, minRedeem: parseInt(e.target.value)})} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} className="accent-[#1ABC9C] w-4 h-4" />
            <span className="text-sm">Sistema de puntos activo</span>
          </div>
          <Button className="w-full btn-emerald" onClick={() => saveConfig.mutate(form)} disabled={saveConfig.isPending}><Save className="w-4 h-4 mr-2" /> GUARDAR</Button>
        </div>
      </div>
    </div>
  );
}
