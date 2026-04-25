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
import { Search, Plus, FileText, Trash2 } from "lucide-react";

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(
    typeof value === "string" ? parseFloat(value || "0") : value
  );
}

export default function Invoices() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Array<{ productId: number; name: string; price: number; quantity: number; discount: number }>>([]);
  const [form, setForm] = useState({ customerId: "", branchId: "", paymentMethod: "cash" as const, notes: "" });

  const { data: invoices, isLoading } = trpc.invoice.list.useQuery({
    search: search || undefined,
    page: 1,
    limit: 50,
  });
  const { data: customers } = trpc.customer.list.useQuery({ page: 1, limit: 100 });
  const { data: branches } = trpc.branch.list.useQuery();
  const { data: products } = trpc.product.list.useQuery({ page: 1, limit: 100 });

  const utils = trpc.useUtils();
  const createMutation = trpc.invoice.create.useMutation({
    onSuccess: () => {
      utils.invoice.list.invalidate();
      setOpen(false);
      setItems([]);
      setForm({ customerId: "", branchId: "", paymentMethod: "cash", notes: "" });
    },
  });

  const addItem = (productId: number, name: string, price: number) => {
    const existing = items.find((i) => i.productId === productId);
    if (existing) {
      setItems(items.map((i) => (i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i)));
    } else {
      setItems([...items, { productId, name, price, quantity: 1, discount: 0 }]);
    }
  };

  const removeItem = (productId: number) => {
    setItems(items.filter((i) => i.productId !== productId));
  };

  const updateQty = (productId: number, qty: number) => {
    if (qty <= 0) return removeItem(productId);
    setItems(items.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)));
  };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountTotal = items.reduce((sum, i) => sum + i.price * i.quantity * (i.discount / 100), 0);
  const tax = (subtotal - discountTotal) * 0.18;
  const total = subtotal - discountTotal + tax;

  if (isLoading) {
    return (
      <Layout>
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Facturación</h1>
            <p className="text-muted-foreground">Crear y gestionar facturas de venta</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#E30A17] hover:bg-[#c00914] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Factura
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nueva Factura</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Cliente</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3" value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                      <option value="">Contado</option>
                      {customers?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sucursal</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3" value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}>
                      {branches?.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Método de Pago</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as any })}>
                      <option value="cash">Efectivo</option>
                      <option value="card">Tarjeta</option>
                      <option value="transfer">Transferencia</option>
                      <option value="credit">Crédito</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Buscar Producto</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-40 overflow-y-auto">
                    {products?.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => addItem(p.id, p.name, parseFloat(p.price || "0"))}
                        className="text-left p-2 rounded-md border border-input hover:bg-accent text-sm transition-colors"
                      >
                        <p className="font-medium truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(p.price || 0)}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {items.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-accent">
                        <tr>
                          <th className="px-3 py-2 text-left">Producto</th>
                          <th className="px-3 py-2 text-right">Precio</th>
                          <th className="px-3 py-2 text-center">Cant</th>
                          <th className="px-3 py-2 text-right">Total</th>
                          <th className="px-3 py-2"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {items.map((item) => (
                          <tr key={item.productId}>
                            <td className="px-3 py-2">{item.name}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(item.price)}</td>
                            <td className="px-3 py-2 text-center">
                              <Input type="number" min={1} value={item.quantity} onChange={(e) => updateQty(item.productId, parseInt(e.target.value) || 1)} className="w-16 h-8 mx-auto text-center" />
                            </td>
                            <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.price * item.quantity)}</td>
                            <td className="px-3 py-2">
                              <Button variant="ghost" size="icon" className="w-6 h-6" onClick={() => removeItem(item.productId)}>
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex justify-end">
                  <div className="w-64 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Descuento:</span><span>{formatCurrency(discountTotal)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">ITBIS (18%):</span><span>{formatCurrency(tax)}</span></div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t"><span>Total:</span><span className="text-[#E30A17]">{formatCurrency(total)}</span></div>
                  </div>
                </div>

                <Button
                  onClick={() => createMutation.mutate({
                    customerId: form.customerId ? parseInt(form.customerId) : undefined,
                    branchId: parseInt(form.branchId) || (branches?.[0]?.id ?? 1),
                    paymentMethod: form.paymentMethod,
                    notes: form.notes || undefined,
                    items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, price: i.price, discount: i.discount })),
                  })}
                  disabled={createMutation.isPending || items.length === 0}
                  className="bg-[#E30A17] hover:bg-[#c00914] text-white"
                >
                  {createMutation.isPending ? "Procesando..." : "Guardar Factura"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Buscar facturas..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="space-y-3">
          {invoices?.map((inv) => (
            <Card key={inv.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#E30A17]/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#E30A17]" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Factura {inv.number}</p>
                      <p className="text-xs text-muted-foreground">{inv.customer?.name || "Cliente de contado"} • {inv.branch?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#E30A17]">{formatCurrency(inv.total || 0)}</p>
                    <Badge variant={inv.status === "paid" ? "default" : inv.status === "cancelled" ? "destructive" : "secondary"} className="text-xs mt-1">
                      {inv.status === "paid" ? "Pagada" : inv.status === "pending" ? "Pendiente" : "Anulada"}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>Método: {inv.paymentMethod === "cash" ? "Efectivo" : inv.paymentMethod === "card" ? "Tarjeta" : inv.paymentMethod === "transfer" ? "Transferencia" : "Crédito"}</span>
                  <span>•</span>
                  <span>{inv.items?.length || 0} productos</span>
                  <span>•</span>
                  <span>{inv.date ? new Date(inv.date).toLocaleDateString("es-DO") : ""}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {invoices?.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No se encontraron facturas</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
