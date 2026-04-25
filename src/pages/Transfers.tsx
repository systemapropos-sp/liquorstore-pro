import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeftRight, Plus, Trash2, Search, PackageCheck } from "lucide-react";

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(
    typeof value === "string" ? parseFloat(value || "0") : value
  );
}

export default function Transfers() {
  const [open, setOpen] = useState(false);
  const [fromBranchId, setFromBranchId] = useState("");
  const [toBranchId, setToBranchId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<{ productId: number; name: string; code: string; qty: number }[]>([]);
  const [search, setSearch] = useState("");

  const { data: products, isLoading: pLoading } = trpc.product.list.useQuery({ page: 1, limit: 100 });
  const { data: branches } = trpc.branch.list.useQuery();

  const utils = trpc.useUtils();
  const createMutation = trpc.transfer.create.useMutation({
    onSuccess: () => {
      utils.transfer.list.invalidate();
      setOpen(false);
      setItems([]);
      setFromBranchId("");
      setToBranchId("");
      setNotes("");
    },
  });

  const addItem = (product: any) => {
    if (items.some(i => i.productId === product.id)) return;
    setItems(prev => [...prev, { productId: product.id, name: product.name, code: product.code, qty: 1 }]);
  };

  const removeItem = (productId: number) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  };

  const updateQty = (productId: number, qty: number) => {
    if (qty < 1) return removeItem(productId);
    setItems(prev => prev.map(i => i.productId === productId ? { ...i, qty } : i));
  };

  const filteredProducts = products?.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.code?.includes(search)
  );

  const handleSubmit = () => {
    if (!fromBranchId || !toBranchId || items.length === 0 || fromBranchId === toBranchId) return;
    createMutation.mutate({
      fromBranchId: parseInt(fromBranchId),
      toBranchId: parseInt(toBranchId),
      notes,
      items: items.map(i => ({ productId: i.productId, quantity: i.qty })),
    });
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
            <h1 className="text-2xl font-bold tracking-tight">Traslados</h1>
            <p className="text-muted-foreground">Mover productos entre sucursales</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1ABC9C] hover:bg-[#16a085] text-white shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Traslado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Nuevo Traslado de Productos</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Sucursal Origen</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3" value={fromBranchId} onChange={e => setFromBranchId(e.target.value)}>
                      <option value="">Seleccionar</option>
                      {branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Sucursal Destino</Label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3" value={toBranchId} onChange={e => setToBranchId(e.target.value)}>
                      <option value="">Seleccionar</option>
                      {branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Buscar Productos</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input className="pl-8" placeholder="Buscar por nombre o codigo..." value={search} onChange={e => setSearch(e.target.value)} />
                  </div>
                </div>

                {search && (
                  <div className="max-h-40 overflow-y-auto border rounded-md divide-y">
                    {filteredProducts?.map(p => (
                      <button key={p.id} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between" onClick={() => { addItem(p); setSearch(""); }}>
                        <span>{p.name} <span className="text-xs text-gray-500">({p.code})</span></span>
                        <Plus className="w-3.5 h-3.5 text-[#1ABC9C]" />
                      </button>
                    ))}
                  </div>
                )}

                {items.length > 0 && (
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-[#1ABC9C] text-white"><tr><th className="px-3 py-2 text-left">Producto</th><th className="px-3 py-2 text-center w-24">Cant</th><th className="px-3 py-2 w-10"></th></tr></thead>
                      <tbody className="divide-y">
                        {items.map(item => (
                          <tr key={item.productId}>
                            <td className="px-3 py-2">{item.name} <span className="text-xs text-gray-500">({item.code})</span></td>
                            <td className="px-3 py-2"><Input type="number" min={1} className="h-7 text-center" value={item.qty} onChange={e => updateQty(item.productId, parseInt(e.target.value) || 0)} /></td>
                            <td className="px-3 py-2"><button onClick={() => removeItem(item.productId)} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Observaciones</Label>
                  <Input value={notes} onChange={e => setNotes(e.target.value)} />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || !fromBranchId || !toBranchId || items.length === 0 || fromBranchId === toBranchId}
                  className="bg-[#1ABC9C] hover:bg-[#16a085] text-white shadow-sm"
                >
                  {createMutation.isPending ? "Procesando..." : "Guardar Traslado"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches?.filter(b => !b.isWarehouse).map(branch => {
            const branchProducts = products?.filter(p => {
              const inv = p.inventory?.filter((i: any) => i.branchId === branch.id);
              return inv && inv.length > 0;
            });
            return (
              <Card key={branch.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center">
                      <ArrowLeftRight className="w-4 h-4 text-[#1ABC9C]" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{branch.name}</p>
                      <p className="text-xs text-gray-500">{branch.city}</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-[#1ABC9C]">{branchProducts?.length || 0}</p>
                  <p className="text-xs text-gray-500">productos en stock</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
