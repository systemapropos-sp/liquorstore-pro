import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileSignature, Download } from "lucide-react";

export default function ContractSettings() {
  const [showContract, setShowContract] = useState(false);

  const contractText = `CONTRATO DE PRESTACION DE SERVICIOS

Entre los suscritos a saber: MASCONTROL, a quien en adelante se denominara EL CONTRATISTA Y SMART LIQUOR STORE, a quien en adelante se denominara EL CONTRATANTE, hemos convenido celebrar el presente CONTRATO DE PRESTACION DE SERVICIOS.

PRIMERA. OBJETO: El contratista se obliga para con el contratante a prestarle los servicios de software de gestion empresarial.

SEGUNDA. PLAZO: El presente contrato tendra una vigencia de 1 anio.

TERCERA. VALOR Y FORMA DE PAGO: El valor del presente contrato es de acuerdo al plan contratado.

CUARTA. OBLIGACIONES DEL CONTRATISTA: Prestar el servicio de manera continua y efectiva.

QUINTA. OBLIGACIONES DEL CONTRATANTE: Pagar oportunamente el valor del contrato.

En constancia de lo anterior, firman las partes.`;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/ajustes" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-800">CONTRATO Y VIGENCIA</h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white border rounded-lg p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[#1ABC9C] flex items-center justify-center mx-auto mb-3">
            <FileSignature className="w-8 h-8 text-white" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-1">Contrato de Prestacion de Servicios</h3>
          <p className="text-sm text-gray-500 mb-4">Plan contratado: <span className="font-medium text-[#1ABC9C]">Empresarial</span></p>
          <div className="grid grid-cols-3 gap-4 text-sm mb-4">
            <div className="bg-gray-50 p-3 rounded"><p className="text-gray-500">Fecha de inicio</p><p className="font-medium">2024-01-01</p></div>
            <div className="bg-gray-50 p-3 rounded"><p className="text-gray-500">Fecha de vencimiento</p><p className="font-medium">2026-01-01</p></div>
            <div className="bg-gray-50 p-3 rounded"><p className="text-gray-500">Dias restantes</p><p className="font-medium text-emerald-600">245</p></div>
          </div>
          <div className="flex gap-3 justify-center">
            <Button className="btn-emerald" onClick={() => setShowContract(true)}><FileSignature className="w-4 h-4 mr-2" /> Ver Contrato</Button>
            <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Descargar</Button>
          </div>
        </div>
      </div>

      {showContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowContract(false)}>
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4 text-center">CONTRATO DE PRESTACION DE SERVICIOS</h3>
            <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded font-sans">{contractText}</pre>
            <div className="flex gap-3 justify-center mt-4">
              <Button variant="outline" onClick={() => setShowContract(false)}>Cerrar</Button>
              <Button className="btn-emerald"><Download className="w-4 h-4 mr-2" /> Descargar PDF</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
