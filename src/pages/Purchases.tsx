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
import { Plus, ShoppingCart } from "lucide-react";

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(
    typeof value === "string" ? parseFloat(value || "0") : value
  );
}

export default function Purchases() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Array<{ productId: number; name: string; cost: number; quantity: number; expiryDate: string }>>([]);
  const [form, setForm] = useState({ supplierId: "", branchId: "", paymentMethod: "cash" as const, invoiceNumber: "" });

  const { data: purchases, isLoading } = trpc.purchase.list.useQuery({ page: 1, limit: 50 });
  const { data: suppliers } = trpc.supplier.list.useQuery({});
  const { data: branches } = trpc.branch.list.useQuery();
  const { data: products } = trpc.product.list.useQuery({ page: 1, limit: 100 });

  const utils = trpc.useUtils();
  const createMutation = trpc.purchase.create.useMutation({
    onSuccess: () => {
      utils.purchase.list.invalidate();
      setOpen(false);
      setItems([]);
      setForm({ supplierId: "", branchId: "", paymentMethod: "cash", invoiceNumber: "" });
    },
  });

  const addItem = (productId: number, name: string, cost: number) => {
    const existing = items.find((i) => i.productId === productId);
    if (existing) {
      setItems(items.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      setItems([...items, { productId, name, cost, quantity: 1, expiryDate: "" }]);
    }
  };

  const total = items.reduce((sum, i) => sum + i.cost * i.quantity, 0);

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
            <h1 className="text-2xl font-bold tracking-tight">Compras</h1>
            <p className="text-muted-foreground">Registro de compras a proveedores</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1ABC9C] hover:bg-[#16a085] text-white shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Compra
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Nueva Compra</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Proveedor</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                      <option value="">Seleccionar</option>
                      {suppliers?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sucursal Destino</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3" value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
                      {branches?.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Método de Pago</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as any })}>
                      <option value="cash">Contado</option>
                      <option value="credit">Crédito</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nº Factura Proveedor</Label>
                  <Input value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} />
                </div>
                <div>
                  <Label>Productos</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-40 overflow-y-auto">
                    {products?.map((p) => (
                      <button key={p.id} onClick={() => addItem(p.id, p.name, parseFloat(p.cost || "0"))} className="text-left p-2 rounded-md border border-input hover:bg-accent text-sm transition-colors">
                        <p className="font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">Costo: {formatCurrency(p.cost || 0)}</p>
                      </button>
                    ))}
                  </div>
                </div>
                {items.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-accent"><tr><th className="px-3 py-2 text-left">Producto</th><th className="px-3 py-2 text-right">Costo</th><th className="px-3 py-2 text-center">Cant</th><th className="px-3 py-2 text-right">Total</th></tr></thead>
                      <tbody className="divide-y divide-border">
                        {items.map((item) => (
                          <tr key={item.productId}>
                            <td className="px-3 py-2">{item.name}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(item.cost)}</td>
                            <td className="px-3 py-2 text-center"><Input type="number" min={1} value={item.quantity} onChange={(e) => setItems(items.map((i) => i.productId === item.productId ? { ...i, quantity: parseInt(e.target.value) || 1 } : i))} className="w-16 h-8 mx-auto text-center" /></td>
                            <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.cost * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="flex justify-end">
                  <div className="w-48 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Total:</span><span className="font-bold text-[#1ABC9C]">{formatCurrency(total)}</span></div>
                  </div>
                </div>
                <Button onClick={() => createMutation.mutate({
                  supplierId: parseInt(form.supplierId),
                  branchId: parseInt(form.branchId) || (branches?.[0]?.id ?? 1),
                  paymentMethod: form.paymentMethod,
                  invoiceNumber: form.invoiceNumber || undefined,
                  items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, cost: i.cost, expiryDate: i.expiryDate || undefined })),
                })} disabled={createMutation.isPending || items.length === 0 || !form.supplierId} className="bg-[#1ABC9C] hover:bg-[#16a085] text-white shadow-sm">
                  {createMutation.isPending ? "Procesando..." : "Guardar Compra"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {purchases?.map((p) => (
            <Card key={p.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                      <ShoppingCart className="w-5 h-5 text-[#1ABC9C]" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{p.invoiceNumber || "Sin factura"}</p>
                      <p className="text-xs text-muted-foreground">{p.supplier?.name} • {p.branch?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(p.total || 0)}</p>
                    <Badge variant={p.status === "paid" ? "default" : "secondary"} className="text-xs mt-1">
                      {p.status === "paid" ? "Pagada" : "Pendiente"}
                    </Badge>
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {p.items?.length || 0} productos • {p.date ? new Date(p.date).toLocaleDateString("es-DO") : ""}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {purchases?.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay compras registradas</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
