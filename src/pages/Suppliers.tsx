import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Truck, Phone, Mail, MapPin } from "lucide-react";

export default function Suppliers() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", rnc: "", contact: "", phone: "", email: "", address: "", city: "", creditDays: "" });

  const { data: suppliers, isLoading } = trpc.supplier.list.useQuery({});
  const utils = trpc.useUtils();
  const createMutation = trpc.supplier.create.useMutation({
    onSuccess: () => {
      utils.supplier.list.invalidate();
      setOpen(false);
      setForm({ name: "", rnc: "", contact: "", phone: "", email: "", address: "", city: "", creditDays: "" });
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <Skeleton className="h-96" />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Proveedores</h1>
            <p className="text-muted-foreground">Gestión de proveedores y compras</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#E30A17] hover:bg-[#c00914] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Proveedor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Nuevo Proveedor</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2"><Label>Nombre</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>RNC</Label><Input value={form.rnc} onChange={(e) => setForm({ ...form, rnc: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Contacto</Label><Input value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Teléfono</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Dirección</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Ciudad</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Días de Crédito</Label><Input type="number" value={form.creditDays} onChange={(e) => setForm({ ...form, creditDays: e.target.value })} /></div>
                </div>
                <Button onClick={() => createMutation.mutate({ ...form, creditDays: form.creditDays ? parseInt(form.creditDays) : undefined })} disabled={createMutation.isPending || !form.name} className="bg-[#E30A17] hover:bg-[#c00914] text-white">
                  {createMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers?.map((s) => (
            <Card key={s.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                    <Truck className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{s.name}</p>
                    <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                      {s.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {s.phone}</div>}
                      {s.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" /> {s.email}</div>}
                      {s.address && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.address}</div>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
}
