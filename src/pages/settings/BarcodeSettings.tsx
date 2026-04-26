import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { ArrowLeft, QrCode, Save } from "lucide-react";

export default function BarcodeSettings() {
  const { data: config } = trpc.barcodeConfig.get.useQuery();
  const saveConfig = trpc.barcodeConfig.save.useMutation();
  const [columns, setColumns] = useState(2);
  const [showPrice, setShowPrice] = useState(true);
  const [showCode, setShowCode] = useState(true);
  const [showName, setShowName] = useState(true);

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/ajustes" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-800">CONFIGURACION DE CODIGO DE BARRAS</h1>
      </div>

      <div className="max-w-xl mx-auto bg-white border rounded-lg p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#1ABC9C] flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm text-gray-500">Configure la presentacion de los codigos de barras en la facturacion.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Columnas de la Factura</label>
            <p className="text-xs text-gray-500 mb-2">Seleccione la cantidad de columnas por fila que va a mostrar en la facturacion.</p>
            <div className="flex gap-4">
              <button onClick={() => setColumns(2)} className={`flex-1 py-3 rounded border-2 ${columns === 2 ? 'border-[#1ABC9C] bg-emerald-50' : 'border-gray-200'}`}>
                <div className="grid grid-cols-2 gap-2 px-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
                <p className="text-xs mt-1">2 Columnas</p>
              </button>
              <button onClick={() => setColumns(3)} className={`flex-1 py-3 rounded border-2 ${columns === 3 ? 'border-[#1ABC9C] bg-emerald-50' : 'border-gray-200'}`}>
                <div className="grid grid-cols-3 gap-2 px-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
                <p className="text-xs mt-1">3 Columnas</p>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2"><input type="checkbox" checked={showPrice} onChange={e => setShowPrice(e.target.checked)} className="accent-[#1ABC9C] w-4 h-4" /> <span className="text-sm">Mostrar precio del producto</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={showCode} onChange={e => setShowCode(e.target.checked)} className="accent-[#1ABC9C] w-4 h-4" /> <span className="text-sm">Mostrar codigo del producto</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={showName} onChange={e => setShowName(e.target.checked)} className="accent-[#1ABC9C] w-4 h-4" /> <span className="text-sm">Mostrar nombre del producto</span></label>
          </div>

          <Button className="w-full btn-emerald" onClick={() => saveConfig.mutate({ columns, showPrice, showCode, showName })} disabled={saveConfig.isPending}><Save className="w-4 h-4 mr-2" /> GUARDAR</Button>
        </div>
      </div>
    </div>
  );
}
