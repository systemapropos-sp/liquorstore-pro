import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Plus, Bike, MapPin, Phone, PackageCheck } from "lucide-react";

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(
    typeof value === "string" ? parseFloat(value || "0") : value
  );
}

const statusMap: Record<string, { label: string; color: string }> = {
  received: { label: "Recibido", color: "bg-slate-500" },
  preparing: { label: "En preparación", color: "bg-blue-500" },
  ready: { label: "Listo", color: "bg-amber-500" },
  shipping: { label: "En camino", color: "bg-purple-500" },
  delivered: { label: "Entregado", color: "bg-emerald-500" },
  cancelled: { label: "Cancelado", color: "bg-red-500" },
};

export default function Deliveries() {
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [form, setForm] = useState({ customerName: "", customerPhone: "", address: "", references: "", zoneId: "", deliveryCost: "", paymentMethod: "cash" as const, branchId: "" });

  const { data: deliveries, isLoading } = trpc.delivery.list.useQuery({ page: 1, limit: 50 });
  const { data: zones } = trpc.delivery.listZones.useQuery();
  const { data: branches } = trpc.branch.list.useQuery();

  const utils = trpc.useUtils();
  const createMutation = trpc.delivery.create.useMutation({
    onSuccess: () => {
      utils.delivery.list.invalidate();
      setOpen(false);
      setForm({ customerName: "", customerPhone: "", address: "", references: "", zoneId: "", deliveryCost: "", paymentMethod: "cash", branchId: "" });
    },
  });
  const updateStatus = trpc.delivery.updateStatus.useMutation({
    onSuccess: () => utils.delivery.list.invalidate(),
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
            <h1 className="text-2xl font-bold tracking-tight">Delivery / Envíos</h1>
            <p className="text-muted-foreground">Gestión de pedidos a domicilio</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#E30A17] hover:bg-[#c00914] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Pedido
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Nuevo Pedido Delivery</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2"><Label>Cliente</Label><Input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} /></div>
                <div className="space-y-2"><Label>Teléfono</Label><Input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} /></div>
                <div className="space-y-2"><Label>Dirección</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
                <div className="space-y-2"><Label>Referencias</Label><Input value={form.references} onChange={(e) => setForm({ ...form, references: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Zona</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3" value={form.zoneId} onChange={(e) => setForm({ ...form, zoneId: e.target.value })}>
                      <option value="">Seleccionar</option>
                      {zones?.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2"><Label>Costo Envío</Label><Input type="number" value={form.deliveryCost} onChange={(e) => setForm({ ...form, deliveryCost: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Sucursal</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3" value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
                      {branches?.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2"><Label>Pago</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as any })}>
                      <option value="cash">Efectivo</option>
                      <option value="card">Tarjeta</option>
                      <option value="online">Online</option>
                    </select>
                  </div>
                </div>
                <Button onClick={() => createMutation.mutate({
                  customerName: form.customerName,
                  customerPhone: form.customerPhone || undefined,
                  address: form.address,
                  references: form.references || undefined,
                  zoneId: form.zoneId ? parseInt(form.zoneId) : undefined,
                  deliveryCost: form.deliveryCost || "0",
                  paymentMethod: form.paymentMethod,
                  branchId: parseInt(form.branchId) || (branches?.[0]?.id ?? 1),
                })} disabled={createMutation.isPending || !form.customerName || !form.address} className="bg-[#E30A17] hover:bg-[#c00914] text-white">
                  {createMutation.isPending ? "Guardando..." : "Crear Pedido"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {deliveries?.map((d) => (
            <Card key={d.id} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setSelected(d); setDetailOpen(true); }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                      <Bike className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{d.customerName}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" /> {d.address}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(d.deliveryCost || 0)}</p>
                    <Badge className={`text-xs text-white mt-1 ${statusMap[d.status]?.color || "bg-slate-500"}`}>
                      {statusMap[d.status]?.label || d.status}
                    </Badge>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {d.customerPhone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {d.customerPhone}</span>}
                  <span>{d.zone?.name}</span>
                  <span>{d.createdAt ? new Date(d.createdAt).toLocaleDateString("es-DO") : ""}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {deliveries?.length === 0 && (
          <div className="text-center py-12">
            <Bike className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay pedidos de delivery</p>
          </div>
        )}

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader><DialogTitle>Pedido #{selected?.id}</DialogTitle></DialogHeader>
            <div className="space-y-3 py-4">
              <p className="text-sm"><strong>Cliente:</strong> {selected?.customerName}</p>
              <p className="text-sm"><strong>Dirección:</strong> {selected?.address}</p>
              <p className="text-sm"><strong>Estado:</strong> {statusMap[selected?.status]?.label || selected?.status}</p>
              <p className="text-sm"><strong>Costo envío:</strong> {formatCurrency(selected?.deliveryCost || 0)}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {selected?.status === "received" && <Button size="sm" variant="outline" onClick={() => { updateStatus.mutate({ id: selected.id, status: "preparing" }); setDetailOpen(false); }}>En preparación</Button>}
                {selected?.status === "preparing" && <Button size="sm" variant="outline" onClick={() => { updateStatus.mutate({ id: selected.id, status: "ready" }); setDetailOpen(false); }}>Listo</Button>}
                {selected?.status === "ready" && <Button size="sm" variant="outline" onClick={() => { updateStatus.mutate({ id: selected.id, status: "shipping" }); setDetailOpen(false); }}>En camino</Button>}
                {selected?.status === "shipping" && <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { updateStatus.mutate({ id: selected.id, status: "delivered" }); setDetailOpen(false); }}><PackageCheck className="w-4 h-4 mr-1" /> Entregado</Button>}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
