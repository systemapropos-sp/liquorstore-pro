import { useState } from "react";
import { Link } from "react-router";
import { trpc } from "@/providers/trpc";
import { ArrowLeft, ShieldCheck, ToggleLeft, ToggleRight } from "lucide-react";

export default function PermissionSettings() {
  const { data: categories = [] } = trpc.permissionCategory.list.useQuery();
  const updateCat = trpc.permissionCategory.update.useMutation();

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/ajustes" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-800">PERMISOS ADICIONALES</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat: any) => (
          <div key={cat.id} className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <ShieldCheck className="w-5 h-5 text-[#1ABC9C]" />
              <button onClick={() => updateCat.mutate({ id: cat.id, active: !cat.active })}>
                {cat.active ? <ToggleRight className="w-8 h-8 text-[#1ABC9C]" /> : <ToggleLeft className="w-8 h-8 text-gray-400" />}
              </button>
            </div>
            <p className="font-medium text-sm">{cat.name}</p>
            <p className="text-xs text-gray-500">{cat.description}</p>
            <p className={`text-xs mt-1 ${cat.active ? 'text-emerald-600' : 'text-red-500'}`}>{cat.active ? 'Activo' : 'Inactivo'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
