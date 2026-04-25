import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ClipboardCheck, Save, CheckCircle2 } from "lucide-react";

export default function StockCount() {
  const [open, setOpen] = useState(false);
  const [branchId, setBranchId] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [countItems, setCountItems] = useState<Record<number, { actualQty: number }>>({});

  const { data: products, isLoading: pLoading } = trpc.product.list.useQuery({ page: 1, limit: 100 });
  const { data: branches } = trpc.branch.list.useQuery();
  const { data: stockCounts } = trpc.stockCount.list.useQuery();

  const utils = trpc.useUtils();
  const createMutation = trpc.stockCount.create.useMutation({
    onSuccess: (data) => {
      utils.stockCount.list.invalidate();
      setOpen(false);
      setSelectedProducts([]);
      setCountItems({});
      setBranchId("");
      setNotes("");
    },
  });

  const completeMutation = trpc.stockCount.complete.useMutation({
    onSuccess: () => {
      utils.stockCount.list.invalidate();
      setCountItems({});
    },
  });

  const toggleProduct = (id: number) => {
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const filteredProducts = products?.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.code?.includes(search)
  );

  const handleCreate = () => {
    if (!branchId || selectedProducts.length === 0) return;
    createMutation.mutate({ branchId: parseInt(branchId), productIds: selectedProducts, notes });
  };

  const handleComplete = (countId: number, items: any[]) => {
    const updates = items.map((item: any) => ({
      productId: item.productId,
      actualQty: countItems[item.productId]?.actualQty ?? item.systemQty
    }));
    completeMutation.mutate({ id: countId, items: updates });
  };

  if (pLoading) {
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
            <h1 className="text-2xl font-bold tracking-tight">Toma de Inventario</h1>
            <p className="text-muted-foreground">Conteo fisico de productos</p>
          </div>
          <Button className="bg-[#1ABC9C] hover:bg-[#16a085] text-white shadow-sm" onClick={() => setOpen(true)}>
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Nueva Toma
          </Button>
        </div>

        {/* Create Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Nueva Toma de Inventario</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sucursal</Label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3" value={branchId} onChange={e => setBranchId(e.target.value)}>
                    <option value="">Seleccionar</option>
                    {branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Observaciones</Label>
                  <Input value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Buscar Productos</Label>
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filtrar productos..." />
              </div>

              <div className="border rounded-md overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left w-10"><input type="checkbox" checked={selectedProducts.length === filteredProducts?.length && filteredProducts?.length > 0} onChange={() => {
                        if (selectedProducts.length === filteredProducts?.length) {
                          setSelectedProducts([]);
                        } else {
                          setSelectedProducts(filteredProducts?.map(p => p.id) || []);
                        }
                      }} /></th>
                      <th className="px-3 py-2 text-left">Codigo</th>
                      <th className="px-3 py-2 text-left">Producto</th>
                      <th className="px-3 py-2 text-left">Categoria</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredProducts?.map(p => (
                      <tr key={p.id} className={selectedProducts.includes(p.id) ? "bg-emerald-50" : ""}>
                        <td className="px-3 py-2"><input type="checkbox" checked={selectedProducts.includes(p.id)} onChange={() => toggleProduct(p.id)} /></td>
                        <td className="px-3 py-2 font-mono text-xs">{p.code}</td>
                        <td className="px-3 py-2">{p.name}</td>
                        <td className="px-3 py-2 text-xs text-gray-500">{p.category?.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">{selectedProducts.length} productos seleccionados</span>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending || !branchId || selectedProducts.length === 0}
                  className="bg-[#1ABC9C] hover:bg-[#16a085] text-white shadow-sm"
                >
                  <Save className="w-4 h-4 mr-2" /> Generar Toma
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Previous counts */}
        <div className="space-y-3">
          {stockCounts?.map((count: any) => (
            <div key={count.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-[#1ABC9C]" />
                  <span className="font-semibold">Toma #{count.id}</span>
                  <Badge className={count.status === "completed" ? "bg-emerald-500 text-white text-[10px]" : "bg-amber-500 text-white text-[10px]"}>
                    {count.status === "completed" ? "Completada" : "En proceso"}
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  {count.createdAt ? new Date(count.createdAt).toLocaleDateString("es-DO") : ""} | {count.branchName}
                </div>
              </div>

              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left">Producto</th><th className="px-3 py-2 text-center">Sistema</th><th className="px-3 py-2 text-center">Fisico</th><th className="px-3 py-2 text-center">Diferencia</th></tr></thead>
                  <tbody className="divide-y">
                    {count.items?.map((item: any, i: number) => {
                      const actual = countItems[item.productId]?.actualQty ?? item.actualQty;
                      const diff = actual - item.systemQty;
                      return (
                        <tr key={i}>
                          <td className="px-3 py-2">{item.productName} <span className="text-xs text-gray-500">({item.productCode})</span></td>
                          <td className="px-3 py-2 text-center">{item.systemQty}</td>
                          <td className="px-3 py-2 text-center">
                            {count.status === "draft" ? (
                              <Input
                                type="number"
                                className="h-7 w-20 text-center mx-auto"
                                value={actual}
                                onChange={e => setCountItems(prev => ({ ...prev, [item.productId]: { actualQty: parseInt(e.target.value) || 0 } }))}
                              />
                            ) : (
                              <span>{item.actualQty}</span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span className={diff === 0 ? "text-gray-500" : diff > 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                              {diff > 0 ? `+${diff}` : diff}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {count.status === "draft" && (
                <div className="mt-3 flex justify-end">
                  <Button
                    size="sm"
                    className="bg-[#1ABC9C] hover:bg-[#16a085] text-white"
                    onClick={() => handleComplete(count.id, count.items)}
                    disabled={completeMutation.isPending}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" /> Guardar Toma
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {(!stockCounts || stockCounts.length === 0) && (
          <div className="text-center py-12">
            <ClipboardCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-muted-foreground">No hay tomas de inventario registradas</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
