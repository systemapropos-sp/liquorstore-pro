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
import { Search, Plus, Package, AlertTriangle, Calendar } from "lucide-react";

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(
    typeof value === "string" ? parseFloat(value || "0") : value
  );
}

export default function Products() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    code: "", name: "", description: "", categoryId: "", cost: "", price: "", minStock: "0", barcode: ""
  });

  const { data: categories } = trpc.product.listCategories.useQuery();
  const { data: products, isLoading } = trpc.product.list.useQuery({
    search: search || undefined,
    categoryId: categoryFilter,
    page: 1,
    limit: 100,
  });

  const utils = trpc.useUtils();
  const createMutation = trpc.product.create.useMutation({
    onSuccess: () => {
      utils.product.list.invalidate();
      setOpen(false);
      setForm({ code: "", name: "", description: "", categoryId: "", cost: "", price: "", minStock: "0", barcode: "" });
    },
  });

  const today = new Date();
  const sevenDays = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const thirtyDays = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

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
            <h1 className="text-2xl font-bold tracking-tight">Inventario</h1>
            <p className="text-muted-foreground">Gestión de productos y lotes</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#E30A17] hover:bg-[#c00914] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Agregar Producto</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Código</Label>
                    <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Categoría</Label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3"
                      value={form.categoryId}
                      onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                    >
                      <option value="">Seleccionar</option>
                      {categories?.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Descripción</Label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Costo</Label>
                    <Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Precio Venta</Label>
                    <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Stock Mínimo</Label>
                    <Input type="number" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Código de Barras</Label>
                    <Input value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
                  </div>
                </div>
                <Button
                  onClick={() =>
                    createMutation.mutate({
                      code: form.code,
                      name: form.name,
                      description: form.description || undefined,
                      categoryId: form.categoryId ? parseInt(form.categoryId) : undefined,
                      cost: form.cost,
                      price: form.price,
                      minStock: parseInt(form.minStock) || 0,
                      barcode: form.barcode || undefined,
                    })
                  }
                  disabled={createMutation.isPending || !form.code || !form.name || !form.cost || !form.price}
                  className="bg-[#E30A17] hover:bg-[#c00914] text-white"
                >
                  {createMutation.isPending ? "Guardando..." : "Guardar Producto"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, código o barcode..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="h-10 rounded-md border border-input bg-background px-3"
            value={categoryFilter || ""}
            onChange={(e) => setCategoryFilter(e.target.value ? parseInt(e.target.value) : undefined)}
          >
            <option value="">Todas las categorías</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products?.map((product) => {
            const totalStock = product.inventory?.reduce((sum, inv) => sum + (inv.quantity || 0), 0) || 0;
            const isLowStock = totalStock <= (product.minStock || 0);
            const hasExpired = product.batches?.some((b) => b.status === "expired");
            const nearExpiry = product.batches?.some(
              (b) => b.status === "active" && b.expiryDate && new Date(b.expiryDate) <= sevenDays && new Date(b.expiryDate) > today
            );
            const futureExpiry = product.batches?.some(
              (b) => b.status === "active" && b.expiryDate && new Date(b.expiryDate) <= thirtyDays && new Date(b.expiryDate) > sevenDays
            );

            return (
              <Card key={product.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.code} • {product.category?.name || "Sin categoría"}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge variant={isLowStock ? "destructive" : "secondary"} className="text-xs">
                        {isLowStock ? <AlertTriangle className="w-3 h-3 mr-1" /> : null}
                        Stock: {totalStock}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Costo</p>
                      <p className="font-medium">{formatCurrency(product.cost || 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Precio</p>
                      <p className="font-medium">{formatCurrency(product.price || 0)}</p>
                    </div>
                  </div>

                  {product.batches && product.batches.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">Lotes:</p>
                      {product.batches.map((batch) => (
                        <div key={batch.id} className="flex items-center justify-between text-xs bg-accent/50 rounded px-2 py-1">
                          <span>{batch.batchNumber} — {batch.quantity} uds</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString("es-DO") : "N/A"}
                            {batch.status === "expired" && <span className="text-red-500 font-bold ml-1">VENCIDO</span>}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex gap-2 flex-wrap">
                    {hasExpired && <Badge variant="destructive" className="text-xs">Vencido</Badge>}
                    {nearExpiry && <Badge variant="outline" className="text-xs border-orange-500 text-orange-500">Vence en 7 días</Badge>}
                    {futureExpiry && <Badge variant="outline" className="text-xs border-amber-500 text-amber-500">Vence en 30 días</Badge>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {products?.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No se encontraron productos</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
