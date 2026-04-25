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
  DialogTrigger,
} from "@/components/ui/dialog";
import { ListChecks, Plus, Search, TrendingUp, TrendingDown, FileText } from "lucide-react";

const sourceMap: Record<string, string> = {
  manual: "Manual",
  invoice: "Factura POS",
  purchase: "Compra",
  transfer: "Traslado",
};

const typeColors: Record<string, string> = {
  increase: "bg-emerald-500",
  decrease: "bg-red-500",
};

export default function Adjustments() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"movements" | "adjustments">("movements");
  const [search, setSearch] = useState("");

  // Form state
  const [productId, setProductId] = useState("");
  const [branchId, setBranchId] = useState("");
  const [adjustedQty, setAdjustedQty] = useState("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const { data: adjustments, isLoading } = trpc.adjustment.list.useQuery({ search: search || undefined });
  const { data: products } = trpc.product.list.useQuery({ page: 1, limit: 100 });
  const { data: branches } = trpc.branch.list.useQuery();

  const utils = trpc.useUtils();
  const createMutation = trpc.adjustment.create.useMutation({
    onSuccess: () => {
      utils.adjustment.list.invalidate();
      setOpen(false);
      setProductId("");
      setBranchId("");
      setAdjustedQty("");
      setReason("");
      setNotes("");
    },
  });

  const handleCreate = () => {
    if (!productId || !branchId || !adjustedQty || !reason) return;
    createMutation.mutate({
      productId: parseInt(productId),
      branchId: parseInt(branchId),
      adjustedQty: parseInt(adjustedQty),
      reason,
      notes,
      source: "manual",
    });
  };

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
            <h1 className="text-2xl font-bold tracking-tight">Ajustes de Inventario</h1>
            <p className="text-muted-foreground">Historial de movimientos y ajustes</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#1ABC9C] hover:bg-[#16a085] text-white shadow-sm">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Ajuste
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Nuevo Ajuste de Inventario</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Producto</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select className="w-full h-10 rounded-md border border-input bg-background pl-8 pr-3" value={productId} onChange={e => setProductId(e.target.value)}>
                      <option value="">Seleccionar producto</option>
                      {products?.map(p => <option key={p.id} value={p.id}>{p.name} ({p.code})</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Sucursal</Label>
                  <select className="w-full h-10 rounded-md border border-input bg-background px-3" value={branchId} onChange={e => setBranchId(e.target.value)}>
                    <option value="">Seleccionar</option>
                    {branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Cantidad a Ajustar (+ aumenta, - disminuye)</Label>
                  <Input type="number" value={adjustedQty} onChange={e => setAdjustedQty(e.target.value)} placeholder="Ej: -5 o 10" />
                </div>
                <div className="space-y-2">
                  <Label>Motivo</Label>
                  <Input value={reason} onChange={e => setReason(e.target.value)} placeholder="Razon del ajuste..." />
                </div>
                <div className="space-y-2">
                  <Label>Observaciones</Label>
                  <Input value={notes} onChange={e => setNotes(e.target.value)} />
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending || !productId || !branchId || !adjustedQty || !reason}
                  className="bg-[#1ABC9C] hover:bg-[#16a085] text-white w-full shadow-sm"
                >
                  {createMutation.isPending ? "Procesando..." : "Guardar Ajuste"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={tab === "movements" ? "default" : "outline"}
            onClick={() => setTab("movements")}
            className={tab === "movements" ? "bg-[#1ABC9C] hover:bg-[#16a085] text-white shadow-sm" : "border-gray-300 text-gray-600 hover:border-[#1ABC9C] hover:text-[#1ABC9C]"}
            size="sm"
          >
            <FileText className="w-3.5 h-3.5 mr-1" /> Historial de Movimientos
          </Button>
          <Button
            variant={tab === "adjustments" ? "default" : "outline"}
            onClick={() => setTab("adjustments")}
            className={tab === "adjustments" ? "bg-[#1ABC9C] hover:bg-[#16a085] text-white shadow-sm" : "border-gray-300 text-gray-600 hover:border-[#1ABC9C] hover:text-[#1ABC9C]"}
            size="sm"
          >
            <ListChecks className="w-3.5 h-3.5 mr-1" /> Ajustes Manuales
          </Button>
        </div>

        <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1ABC9C] text-white">
                <th className="px-4 py-3 text-center font-semibold">#</th>
                <th className="px-4 py-3 text-left font-semibold">Codigo</th>
                <th className="px-4 py-3 text-left font-semibold">Producto</th>
                <th className="px-4 py-3 text-center font-semibold">Cant. Anterior</th>
                <th className="px-4 py-3 text-center font-semibold">Tipo</th>
                <th className="px-4 py-3 text-center font-semibold">Cant. Ajuste</th>
                <th className="px-4 py-3 text-center font-semibold">Cant. Ahora</th>
                <th className="px-4 py-3 text-left font-semibold">Motivo</th>
                <th className="px-4 py-3 text-left font-semibold">Fuente</th>
                <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                <th className="px-4 py-3 text-left font-semibold">Usuario</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {adjustments?.map((adj, idx) => (
                <tr key={adj.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                  <td className="px-4 py-3 text-center">{adj.id}</td>
                  <td className="px-4 py-3 font-mono text-xs">{adj.productCode}</td>
                  <td className="px-4 py-3">{adj.productName}</td>
                  <td className="px-4 py-3 text-center">{adj.previousQty}</td>
                  <td className="px-4 py-3 text-center">
                    <Badge className={`${typeColors[adj.type]} text-white text-[10px]`}>
                      {adj.type === "increase" ? (
                        <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-0.5 inline" />
                      )}
                      {adj.type === "increase" ? "Aumento" : "Disminuye"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    <span className={adj.adjustedQty >= 0 ? "text-emerald-600" : "text-red-600"}>
                      {adj.adjustedQty > 0 ? `+${adj.adjustedQty}` : adj.adjustedQty}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-semibold">{adj.currentQty}</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{adj.reason}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{sourceMap[adj.source] || adj.source}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{adj.createdAt ? new Date(adj.createdAt).toLocaleDateString("es-DO") : ""}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{adj.userName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!adjustments || adjustments.length === 0) && (
          <div className="text-center py-12">
            <ListChecks className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-muted-foreground">No hay ajustes registrados</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
