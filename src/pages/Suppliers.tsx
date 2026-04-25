import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Plus, Truck, Trash2, Edit2, Download, Tag } from "lucide-react";

export default function Suppliers() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [showOptional, setShowOptional] = useState(false);
  const [editSupplier, setEditSupplier] = useState<any>(null);

  const [form, setForm] = useState({
    personType: "juridica" as "natural" | "juridica",
    documentType: "nit" as "nit" | "cedula" | "passport",
    rnc: "", dv: "",
    tradeName: "", legalName: "",
    firstName: "", middleName: "", lastName: "", secondLastName: "",
    contact: "", phone: "", phone2: "", email: "",
    country: "Republica Dominicana", department: "", city: "", address: "",
    regime: "General", taxResponsibility: "",
    bankName: "", bankAccount: "", accountHolder: "",
    advancePayment: "", creditDays: "0"
  });

  const { data: suppliers, isLoading } = trpc.supplier.list.useQuery({ search: search || undefined });

  const utils = trpc.useUtils();
  const createMutation = trpc.supplier.create.useMutation({
    onSuccess: () => { utils.supplier.list.invalidate(); setOpen(false); resetForm(); }
  });
  const updateMutation = trpc.supplier.update.useMutation({
    onSuccess: () => { utils.supplier.list.invalidate(); setOpen(false); setEditSupplier(null); resetForm(); }
  });
  const deleteMutation = trpc.supplier.delete.useMutation({
    onSuccess: () => utils.supplier.list.invalidate()
  });

  const resetForm = () => {
    setForm({
      personType: "juridica", documentType: "nit", rnc: "", dv: "",
      tradeName: "", legalName: "",
      firstName: "", middleName: "", lastName: "", secondLastName: "",
      contact: "", phone: "", phone2: "", email: "",
      country: "Republica Dominicana", department: "", city: "", address: "",
      regime: "General", taxResponsibility: "",
      bankName: "", bankAccount: "", accountHolder: "",
      advancePayment: "", creditDays: "0"
    });
    setShowOptional(false);
  };

  const startEdit = (s: any) => {
    setEditSupplier(s);
    setForm({
      personType: s.personType || "juridica", documentType: s.documentType || "nit", rnc: s.rnc || "", dv: s.dv || "",
      tradeName: s.tradeName || "", legalName: s.legalName || "",
      firstName: s.firstName || "", middleName: s.middleName || "", lastName: s.lastName || "", secondLastName: s.secondLastName || "",
      contact: s.contact || "", phone: s.phone || "", phone2: s.phone2 || "", email: s.email || "",
      country: s.country || "Republica Dominicana", department: s.department || "", city: s.city || "", address: s.address || "",
      regime: s.regime || "General", taxResponsibility: s.taxResponsibility || "",
      bankName: s.bankName || "", bankAccount: s.bankAccount || "", accountHolder: s.accountHolder || "",
      advancePayment: s.advancePayment || "", creditDays: String(s.creditDays || 0)
    });
    setOpen(true);
  };

  const handleSave = () => {
    const data = { ...form, creditDays: parseInt(form.creditDays) || 0 };
    if (editSupplier) {
      updateMutation.mutate({ id: editSupplier.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return <Layout><Skeleton className="h-96" /></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-4">
        {/* Title */}
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold tracking-tight">LISTA DE PROVEEDORES</h1>
        </div>

        {/* Filters */}
        <Card className="border border-gray-200 shadow-sm p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="space-y-1"><Label className="text-xs text-gray-500">Proveedor</Label><Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="h-8 text-sm" /></div>
            <div className="space-y-1"><Label className="text-xs text-gray-500">Tipo Persona</Label><select className="w-full h-8 rounded-md border border-gray-300 bg-white px-2 text-sm"><option value="">Todos</option><option value="natural">Natural</option><option value="juridica">Juridica</option></select></div>
            <div className="space-y-1"><Label className="text-xs text-gray-500">Regimen</Label><select className="w-full h-8 rounded-md border border-gray-300 bg-white px-2 text-sm"><option value="">Todos</option><option value="General">General</option><option value="Simplificado">Simplificado</option></select></div>
            <div className="space-y-1"><Label className="text-xs text-gray-500">Responsabilidad</Label><select className="w-full h-8 rounded-md border border-gray-300 bg-white px-2 text-sm"><option value="">Todos</option><option value="Gran Contribuyente">Gran Contribuyente</option><option value="Pequeno Contribuyente">Pequeno Contribuyente</option></select></div>
            <div className="flex items-end gap-2">
              <Button className="bg-[#1ABC9C] hover:bg-[#16a085] text-white h-8 text-sm" onClick={() => setSearch(search)}><Search className="w-3.5 h-3.5 mr-1" /> Filtrar</Button>
              <Button variant="outline" className="h-8 text-sm border-gray-300"><Download className="w-3.5 h-3.5 mr-1" /> Descargar</Button>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="BUSCAR..." className="pl-9 border-gray-300" value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1ABC9C] hover:bg-[#16a085] text-white shadow-sm" onClick={() => { setEditSupplier(null); resetForm(); }}>
                <Plus className="w-4 h-4 mr-2" /> Nuevo Proveedor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-center bg-[#1ABC9C] text-white py-2 rounded-md text-sm">
                  {editSupplier ? "EDITAR PROVEEDOR" : "NUEVO PROVEEDOR"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label className="text-xs">Tipo Persona</Label><select className="w-full h-10 rounded-md border border-gray-300 bg-white px-2 text-sm" value={form.personType} onChange={e => setForm({...form, personType: e.target.value as any})}><option value="natural">Natural</option><option value="juridica">Juridica</option></select></div>
                  <div className="space-y-1.5"><Label className="text-xs">Documento</Label><select className="w-full h-10 rounded-md border border-gray-300 bg-white px-2 text-sm" value={form.documentType} onChange={e => setForm({...form, documentType: e.target.value as any})}><option value="nit">NIT</option><option value="cedula">Cedula</option><option value="passport">Pasaporte</option></select></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label className="text-xs">NIT</Label><Input value={form.rnc} onChange={e => setForm({...form, rnc: e.target.value})} placeholder="Ej: 101-00001-1" /></div>
                  <div className="space-y-1.5"><Label className="text-xs">DV</Label><Input value={form.dv} onChange={e => setForm({...form, dv: e.target.value})} placeholder="Digito verificador" /></div>
                </div>
                <div className="space-y-1.5"><Label className="text-xs">Nombre Comercial</Label><Input value={form.tradeName} onChange={e => setForm({...form, tradeName: e.target.value})} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Razon social</Label><Input value={form.legalName} onChange={e => setForm({...form, legalName: e.target.value})} /></div>

                {form.personType === "natural" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label className="text-xs">Primer Nombre</Label><Input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} /></div>
                    <div className="space-y-1.5"><Label className="text-xs">Segundo Nombre</Label><Input value={form.middleName} onChange={e => setForm({...form, middleName: e.target.value})} /></div>
                    <div className="space-y-1.5"><Label className="text-xs">Primer Apellido</Label><Input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} /></div>
                    <div className="space-y-1.5"><Label className="text-xs">Segundo Apellido</Label><Input value={form.secondLastName} onChange={e => setForm({...form, secondLastName: e.target.value})} /></div>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5"><Label className="text-xs">Pais</Label><Input value={form.country} onChange={e => setForm({...form, country: e.target.value})} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Departamento</Label><Input value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Ciudad</Label><Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
                </div>
                <div className="space-y-1.5"><Label className="text-xs">Direccion</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label className="text-xs">Celular</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Correo Electronico</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                </div>

                {/* Optional fields */}
                <button className="flex items-center gap-2 text-sm text-[#1ABC9C] font-medium" onClick={() => setShowOptional(!showOptional)}>
                  <Tag className="w-4 h-4" /> Campos Opcionales {showOptional ? "▲" : "▼"}
                </button>

                {showOptional && (
                  <div className="space-y-4 border border-gray-200 rounded-md p-4 bg-gray-50">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5"><Label className="text-xs">Regimen</Label><select className="w-full h-10 rounded-md border border-gray-300 bg-white px-2 text-sm" value={form.regime} onChange={e => setForm({...form, regime: e.target.value})}><option value="General">General</option><option value="Simplificado">Simplificado</option></select></div>
                      <div className="space-y-1.5"><Label className="text-xs">Responsabilidad Tributaria</Label><Input value={form.taxResponsibility} onChange={e => setForm({...form, taxResponsibility: e.target.value})} placeholder="Ej: Gran Contribuyente" /></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1.5"><Label className="text-xs">Banco</Label><Input value={form.bankName} onChange={e => setForm({...form, bankName: e.target.value})} /></div>
                      <div className="space-y-1.5"><Label className="text-xs">N Cuenta</Label><Input value={form.bankAccount} onChange={e => setForm({...form, bankAccount: e.target.value})} /></div>
                      <div className="space-y-1.5"><Label className="text-xs">Titular</Label><Input value={form.accountHolder} onChange={e => setForm({...form, accountHolder: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5"><Label className="text-xs">Anticipo</Label><Input type="number" value={form.advancePayment} onChange={e => setForm({...form, advancePayment: e.target.value})} /></div>
                      <div className="space-y-1.5"><Label className="text-xs">Dias de Credito</Label><Input type="number" value={form.creditDays} onChange={e => setForm({...form, creditDays: e.target.value})} /></div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleSave}
                  disabled={(editSupplier ? updateMutation.isPending : createMutation.isPending) || !form.rnc || !form.name}
                  className="bg-[#1ABC9C] hover:bg-[#16a085] text-white w-full shadow-sm"
                >
                  {editSupplier ? updateMutation.isPending : createMutation.isPending ? "Procesando..." : (editSupplier ? "Actualizar" : "Guardar")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <Card className="border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1ABC9C] text-white">
                  <th className="px-3 py-3 text-center w-10">Opciones</th>
                  <th className="px-3 py-3 text-left">Proveedor</th>
                  <th className="px-3 py-3 text-left">Identificacion</th>
                  <th className="px-3 py-3 text-left">Telefono</th>
                  <th className="px-3 py-3 text-left">Direccion</th>
                  <th className="px-3 py-3 text-left">Correo</th>
                  <th className="px-3 py-3 text-left">Departamento</th>
                  <th className="px-3 py-3 text-left">Ciudad</th>
                  <th className="px-3 py-3 text-right">Anticipos</th>
                  <th className="px-3 py-3 text-center">Tipo Persona</th>
                  <th className="px-3 py-3 text-left">Regimen</th>
                  <th className="px-3 py-3 text-left">Bancos</th>
                  <th className="px-3 py-3 text-left">N Cuenta</th>
                  <th className="px-3 py-3 text-left">Titular</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {suppliers?.map((s: any, idx: number) => (
                  <tr key={s.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => startEdit(s)} className="text-gray-400 hover:text-[#1ABC9C]"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => { if (confirm('Eliminar proveedor?')) deleteMutation.mutate(s.id); }} className="text-red-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-medium text-gray-800">{s.name}</td>
                    <td className="px-3 py-3 text-xs font-mono">{s.rnc}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">{s.phone}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">{s.address || "-"}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">{s.email || "-"}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">{s.department || "-"}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">{s.city || "-"}</td>
                    <td className="px-3 py-3 text-right text-xs">{s.advancePayment ? `$${s.advancePayment}` : "-"}</td>
                    <td className="px-3 py-3 text-center"><span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{s.personType === "natural" ? "Natural" : "Juridica"}</span></td>
                    <td className="px-3 py-3 text-xs text-gray-600">{s.regime || "-"}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">{s.bankName || "-"}</td>
                    <td className="px-3 py-3 text-xs font-mono">{s.bankAccount || "-"}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">{s.accountHolder || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
