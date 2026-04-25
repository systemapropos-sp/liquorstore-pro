import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Building2, MapPin, Phone, Warehouse } from "lucide-react";

export default function Branches() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", phone: "", city: "", isWarehouse: false });

  const { data: branches, isLoading } = trpc.branch.list.useQuery();
  const utils = trpc.useUtils();
  const createMutation = trpc.branch.create.useMutation({
    onSuccess: () => {
      utils.branch.list.invalidate();
      setOpen(false);
      setForm({ name: "", address: "", phone: "", city: "", isWarehouse: false });
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
            <h1 className="text-2xl font-bold tracking-tight">Sucursales / Bodegas</h1>
            <p className="text-muted-foreground">Gestión de puntos de venta y almacén</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1ABC9C] hover:bg-[#16a085] text-white shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Sucursal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Nueva Sucursal</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2"><Label>Nombre</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="space-y-2"><Label>Dirección</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Teléfono</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Ciudad</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="warehouse" checked={form.isWarehouse} onChange={(e) => setForm({ ...form, isWarehouse: e.target.checked })} />
                  <Label htmlFor="warehouse">Es bodega/almacén</Label>
                </div>
                <Button onClick={() => createMutation.mutate(form)} disabled={createMutation.isPending || !form.name} className="bg-[#1ABC9C] hover:bg-[#16a085] text-white">
                  {createMutation.isPending ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {branches?.map((branch) => (
            <Card key={branch.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                    {branch.isWarehouse ? <Warehouse className="w-5 h-5 text-muted-foreground" /> : <Building2 className="w-5 h-5 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{branch.name}</p>
                      {branch.isWarehouse && <Badge variant="secondary" className="text-xs">Bodega</Badge>}
                    </div>
                    <div className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                      {branch.address && <div className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {branch.address}</div>}
                      {branch.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> {branch.phone}</div>}
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
