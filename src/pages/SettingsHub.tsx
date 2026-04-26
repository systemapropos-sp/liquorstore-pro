import { Link } from "react-router";
import {
  Building2, DollarSign, FileText, Printer, Scale,
  Table, Users, ShoppingBag, Receipt, LayoutGrid,
  CreditCard, Landmark, Mail, QrCode, Award,
  ShieldCheck, Briefcase, FileSignature, ArrowLeft
} from "lucide-react";

const categories = [
  { id: "bancos", label: "BANCOS", icon: Landmark, path: "/ajustes/bancos" },
  { id: "impuestos", label: "IMPUESTOS", icon: DollarSign, path: "/ajustes/impuestos" },
  { id: "contabilidad", label: "CONTABILIDAD", icon: FileText, path: "/ajustes/conceptos-gastos" },
  { id: "resoluciones", label: "RESOLUCIONES", icon: Receipt, path: "/ajustes/resoluciones" },
  { id: "impresiones", label: "IMPRESIONES", icon: Printer, path: "/ajustes/impresiones" },
  { id: "unidades", label: "UNIDADES DE MEDIDA", icon: Scale, path: "/ajustes/general" },
  { id: "mesas", label: "MESAS", icon: Table, path: "/ajustes/general" },
  { id: "cajas", label: "CAJAS", icon: ShoppingBag, path: "/ajustes/cajas" },
  { id: "conceptos", label: "CONCEPTOS DE GASTOS", icon: CreditCard, path: "/ajustes/conceptos-gastos" },
  { id: "empresas", label: "EMPRESAS", icon: Building2, path: "/ajustes/empresas" },
  { id: "usuarios", label: "USUARIOS", icon: Users, path: "/ajustes/usuarios" },
  { id: "permisos", label: "PERMISOS ADICIONALES", icon: ShieldCheck, path: "/ajustes/permisos" },
  { id: "maquinas", label: "MAQUINAS REGISTRADORAS", icon: Printer, path: "/ajustes/general" },
  { id: "actualizaciones", label: "ACTUALIZACIONES", icon: LayoutGrid, path: "/ajustes/general" },
  { id: "puntos", label: "PUNTOS ACUMULADOS", icon: Award, path: "/ajustes/puntos" },
  { id: "codigo-barras", label: "CONFIG. CODIGO DE BARRAS", icon: QrCode, path: "/ajustes/codigo-barras" },
  { id: "correo", label: "CONFIG. CORREO Y NOTIF.", icon: Mail, path: "/ajustes/correo" },
  { id: "sincronizacion", label: "SINCRONIZACION POR QR", icon: QrCode, path: "/ajustes/general" },
  { id: "contrato", label: "CONTRATO Y VIGENCIA", icon: FileSignature, path: "/ajustes/contrato" },
];

export default function SettingsHub() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">AJUSTES</h1>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              to={cat.path}
              className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-gray-100 hover:border-[#1ABC9C] hover:shadow-md transition-all bg-white group"
            >
              <div className="w-14 h-14 rounded-full bg-[#1ABC9C] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs font-bold text-[#1ABC9C] text-center leading-tight">{cat.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
