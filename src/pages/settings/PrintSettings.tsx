import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { ArrowLeft, Printer, Save, Info } from "lucide-react";

export default function PrintSettings() {
  const { data: configs = [] } = trpc.printConfig.list.useQuery();
  const updateConfig = trpc.printConfig.update.useMutation();
  const [terms, setTerms] = useState("");
  const [infoText, setInfoText] = useState("");

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/ajustes" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-800">CONFIGURACION DE IMPRESIONES</h1>
      </div>

      <div className="bg-white border rounded-lg p-6 mb-6">
        <h3 className="text-center text-[#1ABC9C] font-semibold mb-4">ENCABEZADO E INFORMACION DE LA FACTURA</h3>
        <p className="text-sm text-gray-500 text-center mb-4">Selecciona las opciones que desea que aparezca en las facturas.</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1ABC9C] text-white">
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">NOMBRE</th>
              <th className="px-3 py-2 text-center">ESTADO</th>
            </tr>
          </thead>
          <tbody>
            {configs.map((c: any) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{c.value}</td>
                <td className="px-3 py-2">{c.name}</td>
                <td className="px-3 py-2 text-center">
                  <input type="checkbox" checked={c.active} readOnly className="accent-[#1ABC9C] w-4 h-4" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-semibold text-[#1ABC9C] mb-2">Terminos y Condiciones</h3>
          <textarea className="w-full border rounded-md p-3 text-sm h-32" placeholder="Ingrese los terminos y condiciones..." value={terms} onChange={e => setTerms(e.target.value)} />
          <div className="flex gap-2 mt-3">
            <Button size="sm" className="btn-emerald"><Save className="w-4 h-4 mr-1" /> Guardar</Button>
            <Button size="sm" variant="outline"><Info className="w-4 h-4 mr-1" /> Ayuda</Button>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-sm font-semibold text-[#1ABC9C] mb-2">Texto Informativo</h3>
          <textarea className="w-full border rounded-md p-3 text-sm h-32" placeholder="Ingrese el texto informativo..." value={infoText} onChange={e => setInfoText(e.target.value)} />
          <div className="flex gap-2 mt-3">
            <Button size="sm" className="btn-emerald"><Save className="w-4 h-4 mr-1" /> Guardar</Button>
            <Button size="sm" variant="outline"><Info className="w-4 h-4 mr-1" /> Ayuda</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
