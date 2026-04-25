import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Users, Trash2, Edit2, ImageIcon, CreditCard } from "lucide-react";

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(
    typeof value === "string" ? parseFloat(value || "0") : value
  );
}

const idTypeLabels: Record<string, string> = {
  cedula: "Cedula de ciudadania",
  passport: "Pasaporte",
  rnc: "Registro Nacional",
};

export default function Customers() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editCustomer, setEditCustomer] = useState<any>(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [form, setForm] = useState({
    personType: "natural" as "natural" | "juridica",
    idType: "cedula" as "cedula" | "passport" | "rnc",
    idNumber: "",
    firstName: "", middleName: "", lastName: "", secondLastName: "",
    phone: "", phone2: "", email: "",
    country: "Republica Dominicana", department: "", city: "",
    zone: "", neighborhood: "", address: "",
    birthDate: "",
    creditLimit: "", creditOverdueLimit: "",
    type: "cash" as "cash" | "credit",
    photoUrl: ""
  });

  const { data: customers, isLoading } = trpc.customer.list.useQuery({ search: search || undefined });

  const utils = trpc.useUtils();
  const createMutation = trpc.customer.create.useMutation({
    onSuccess: () => { utils.customer.list.invalidate(); setOpen(false); resetForm(); }
  });
  const updateMutation = trpc.customer.update.useMutation({
    onSuccess: () => { utils.customer.list.invalidate(); setOpen(false); setEditCustomer(null); resetForm(); }
  });
  const deleteMutation = trpc.customer.delete.useMutation({
    onSuccess: () => utils.customer.list.invalidate()
  });

  const resetForm = () => {
    setForm({
      personType: "natural", idType: "cedula", idNumber: "",
      firstName: "", middleName: "", lastName: "", secondLastName: "",
      phone: "", phone2: "", email: "",
      country: "Republica Dominicana", department: "", city: "",
      zone: "", neighborhood: "", address: "",
      birthDate: "",
      creditLimit: "", creditOverdueLimit: "",
      type: "cash", photoUrl: ""
    });
    setPhotoPreview("");
  };

  const startEdit = (customer: any) => {
    setEditCustomer(customer);
    setForm({
      personType: customer.personType || "natural",
      idType: customer.idType || "cedula",
      idNumber: customer.idNumber || "",
      firstName: customer.firstName || "", middleName: customer.middleName || "",
      lastName: customer.lastName || "", secondLastName: customer.secondLastName || "",
      phone: customer.phone || "", phone2: customer.phone2 || "", email: customer.email || "",
      country: customer.country || "Republica Dominicana",
      department: customer.department || "", city: customer.city || "",
      zone: customer.zone || "", neighborhood: customer.neighborhood || "", address: customer.address || "",
      birthDate: customer.birthDate || "",
      creditLimit: customer.creditLimit || "", creditOverdueLimit: customer.creditOverdueLimit || "",
      type: customer.type || "cash", photoUrl: customer.photoUrl || ""
    });
    setPhotoPreview(customer.photoUrl || "");
    setOpen(true);
  };

  const handleSave = () => {
    const data = { ...form, creditLimit: form.creditLimit || "0.00", creditOverdueLimit: form.creditOverdueLimit || "0.00", tags: form.type === 'credit' ? 'Credito' : 'Contado' };
    if (editCustomer) {
      updateMutation.mutate({ id: editCustomer.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPhotoPreview(base64);
      setForm(prev => ({ ...prev, photoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  if (isLoading) {
    return <Layout><Skeleton className="h-96" /></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">Fichas de clientes y credito</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1ABC9C] hover:bg-[#16a085] text-white shadow-sm" onClick={() => { setEditCustomer(null); resetForm(); }}>
                <Plus className="w-4 h-4 mr-2" /> Nuevo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-center bg-[#1ABC9C] text-white py-2 rounded-md text-sm">
                  {editCustomer ? "EDITAR CLIENTE" : "NUEVO CLIENTE"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">

                {/* Photo Upload */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer hover:bg-gray-100" onClick={() => document.getElementById('photo-upload')?.click()}>
                      {photoPreview ? (
                        <img src={photoPreview} alt="Foto" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <ImageIcon className="w-8 h-8 text-gray-400 mb-1" />
                          <span className="text-[10px] text-gray-500 text-center">Foto de perfil</span>
                        </div>
                      )}
                    </div>
                    <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                    {photoPreview && (
                      <button className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs" onClick={() => { setPhotoPreview(""); setForm(prev => ({ ...prev, photoUrl: "" })); }}>×</button>
                    )}
                  </div>
                </div>

                {/* Person Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Tipo de Persona</Label>
                    <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-2 text-sm" value={form.personType} onChange={e => setForm({...form, personType: e.target.value as any})}>
                      <option value="natural">Natural</option>
                      <option value="juridica">Juridica</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Tipo identificacion</Label>
                    <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-2 text-sm" value={form.idType} onChange={e => setForm({...form, idType: e.target.value as any})}>
                      <option value="cedula">Cedula de ciudadania</option>
                      <option value="passport">Pasaporte</option>
                      <option value="rnc">Registro Nacional</option>
                    </select>
                  </div>
                </div>

                {/* ID Number */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Numero de identificacion</Label>
                  <Input value={form.idNumber} onChange={e => setForm({...form, idNumber: e.target.value})} placeholder="Ej: 001-1234567-8" />
                </div>

                {/* Names */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label className="text-xs">Primer Nombre</Label><Input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Segundo Nombre</Label><Input value={form.middleName} onChange={e => setForm({...form, middleName: e.target.value})} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Primer Apellido</Label><Input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Segundo Apellido</Label><Input value={form.secondLastName} onChange={e => setForm({...form, secondLastName: e.target.value})} /></div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5"><Label className="text-xs">Pais</Label><Input value={form.country} onChange={e => setForm({...form, country: e.target.value})} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Departamento</Label><Input value={form.department} onChange={e => setForm({...form, department: e.target.value})} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Ciudad</Label><Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
                </div>

                {/* Address */}
                <div className="space-y-1.5"><Label className="text-xs">Direccion</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label className="text-xs">Zona</Label><Input value={form.zone} onChange={e => setForm({...form, zone: e.target.value})} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Barrio</Label><Input value={form.neighborhood} onChange={e => setForm({...form, neighborhood: e.target.value})} /></div>
                </div>

                {/* Contact */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label className="text-xs">Correo Electronico</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Fecha Nacimiento</Label><Input type="date" value={form.birthDate} onChange={e => setForm({...form, birthDate: e.target.value})} /></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><Label className="text-xs">N Celular</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
                  <div className="space-y-1.5"><Label className="text-xs">Telefono</Label><Input value={form.phone2} onChange={e => setForm({...form, phone2: e.target.value})} /></div>
                </div>

                {/* Credit */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Tipo de Cliente</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="type" checked={form.type === "cash"} onChange={() => setForm({...form, type: "cash"})} />
                      <span className="text-sm">Contado</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="type" checked={form.type === "credit"} onChange={() => setForm({...form, type: "credit"})} />
                      <span className="text-sm">Credito</span>
                    </label>
                  </div>
                </div>

                {form.type === "credit" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5"><Label className="text-xs">Limite de Credito</Label><Input type="number" value={form.creditLimit} onChange={e => setForm({...form, creditLimit: e.target.value})} /></div>
                    <div className="space-y-1.5"><Label className="text-xs">Limite Saldo en Mora</Label><Input type="number" value={form.creditOverdueLimit} onChange={e => setForm({...form, creditOverdueLimit: e.target.value})} /></div>
                  </div>
                )}

                <Button
                  onClick={handleSave}
                  disabled={(editCustomer ? updateMutation.isPending : createMutation.isPending) || !form.firstName || !form.lastName || !form.idNumber}
                  className="bg-[#1ABC9C] hover:bg-[#16a085] text-white w-full shadow-sm"
                >
                  {editCustomer ? updateMutation.isPending : createMutation.isPending ? "Procesando..." : (editCustomer ? "Actualizar Cliente" : "Registrar Cliente")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Buscar clientes..." className="pl-9 border-gray-300" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Table */}
        <Card className="border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#1ABC9C] text-white">
                  <th className="px-3 py-3 text-center w-10">Editar</th>
                  <th className="px-3 py-3 text-center w-12">Foto</th>
                  <th className="px-3 py-3 text-left">Identificacion</th>
                  <th className="px-3 py-3 text-left">Nombre</th>
                  <th className="px-3 py-3 text-left">Telefono</th>
                  <th className="px-3 py-3 text-left">Correo</th>
                  <th className="px-3 py-3 text-left">Direccion</th>
                  <th className="px-3 py-3 text-left">Ciudad</th>
                  <th className="px-3 py-3 text-center">Tipo</th>
                  <th className="px-3 py-3 text-right">Limite</th>
                  <th className="px-3 py-3 text-right">Total Comprado</th>
                  <th className="px-3 py-3 text-center w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {customers?.map((c: any, idx: number) => (
                  <tr key={c.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-3 py-3 text-center">
                      <button onClick={() => startEdit(c)} className="text-gray-400 hover:text-[#1ABC9C]"><Edit2 className="w-3.5 h-3.5" /></button>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto overflow-hidden">
                        {c.photoUrl ? <img src={c.photoUrl} className="w-full h-full object-cover" /> : <Users className="w-5 h-5 text-gray-400" />}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs font-mono">{c.idNumber}</td>
                    <td className="px-3 py-3 font-medium text-gray-800">{c.name}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">{c.phone}{c.phone2 ? ` / ${c.phone2}` : ""}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">{c.email || "-"}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">{c.address || "-"}</td>
                    <td className="px-3 py-3 text-xs text-gray-600">{c.city || "-"}</td>
                    <td className="px-3 py-3 text-center">
                      <Badge className={c.type === "credit" ? "bg-amber-500 text-white text-[10px]" : "bg-emerald-500 text-white text-[10px]"}>
                        {c.type === "credit" ? "Credito" : "Contado"}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-right text-xs">{formatCurrency(c.creditLimit || 0)}</td>
                    <td className="px-3 py-3 text-right font-medium">{formatCurrency(c.totalPurchased || 0)}</td>
                    <td className="px-2 py-3 text-center">
                      <button onClick={() => { if (confirm('Eliminar cliente?')) deleteMutation.mutate(c.id); }} className="text-red-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
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
