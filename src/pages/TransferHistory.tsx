import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeftRight, CheckCircle2, XCircle, PackageCheck, ChevronDown, ChevronUp } from "lucide-react";

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-amber-500" },
  received: { label: "Recibido", color: "bg-emerald-500" },
  cancelled: { label: "Anulado", color: "bg-red-500" },
};

export default function TransferHistory() {
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const { data: transfers, isLoading } = trpc.transfer.list.useQuery({ status: filterStatus || undefined });

  const utils = trpc.useUtils();
  const receiveMutation = trpc.transfer.receive.useMutation({
    onSuccess: () => { utils.transfer.list.invalidate(); setDetailOpen(false); },
  });
  const cancelMutation = trpc.transfer.cancel.useMutation({
    onSuccess: () => { utils.transfer.list.invalidate(); setDetailOpen(false); },
  });

  const tabs = [
    { key: "", label: "Todos" },
    { key: "pending", label: "Pendientes" },
    { key: "received", label: "Recibidos" },
    { key: "cancelled", label: "Anulados" },
  ];

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
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Historico de Traslados</h1>
          <p className="text-muted-foreground">Registro de movimientos entre sucursales</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {tabs.map(t => (
            <Button
              key={t.key}
              variant={filterStatus === t.key ? "default" : "outline"}
              onClick={() => setFilterStatus(t.key)}
              className={filterStatus === t.key ? "bg-[#1ABC9C] hover:bg-[#16a085] text-white shadow-sm" : "border-gray-300 text-gray-600 hover:border-[#1ABC9C] hover:text-[#1ABC9C]"}
              size="sm"
            >
              {t.label}
            </Button>
          ))}
        </div>

        <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1ABC9C] text-white">
                <th className="px-4 py-3 text-left font-semibold">N Traslado</th>
                <th className="px-4 py-3 text-left font-semibold">De</th>
                <th className="px-4 py-3 text-left font-semibold">Para</th>
                <th className="px-4 py-3 text-center font-semibold">Cant. Enviada</th>
                <th className="px-4 py-3 text-center font-semibold">Cant. Recibida</th>
                <th className="px-4 py-3 text-center font-semibold">Pendiente</th>
                <th className="px-4 py-3 text-left font-semibold">Fecha</th>
                <th className="px-4 py-3 text-center font-semibold">Estado</th>
                <th className="px-4 py-3 text-center font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {transfers?.map((t, idx) => {
                const totalSent = t.items?.reduce((s: number, i: any) => s + (i.sentQty || i.quantity), 0) || 0;
                const totalReceived = t.items?.reduce((s: number, i: any) => s + (i.receivedQty || 0), 0) || 0;
                const pending = totalSent - totalReceived;
                return (
                  <tr key={t.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-4 py-3 font-medium">{t.number}</td>
                    <td className="px-4 py-3 text-gray-600">{t.fromBranchName}</td>
                    <td className="px-4 py-3 text-gray-600">{t.toBranchName}</td>
                    <td className="px-4 py-3 text-center">{totalSent}</td>
                    <td className="px-4 py-3 text-center">{totalReceived}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={pending === 0 ? "text-emerald-600 font-medium" : "text-amber-600 font-medium"}>{pending}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{t.createdAt ? new Date(t.createdAt).toLocaleDateString("es-DO") : ""}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge className={`${statusMap[t.status]?.color || "bg-gray-500"} text-white text-[10px]`}>
                        {statusMap[t.status]?.label || t.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Button size="sm" variant="outline" className="h-7 text-xs border-gray-300 text-gray-600" onClick={() => { setSelected(t); setDetailOpen(true); }}>
                        Ver
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {(!transfers || transfers.length === 0) && (
          <div className="text-center py-12">
            <ArrowLeftRight className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-muted-foreground">No hay traslados registrados</p>
          </div>
        )}

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Traslado {selected?.number}</DialogTitle></DialogHeader>
            <div className="space-y-3 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">De:</span> <span className="font-medium">{selected?.fromBranchName}</span></div>
                <div><span className="text-gray-500">Para:</span> <span className="font-medium">{selected?.toBranchName}</span></div>
                <div><span className="text-gray-500">Estado:</span> <Badge className={`${statusMap[selected?.status]?.color} text-white text-[10px]`}>{statusMap[selected?.status]?.label}</Badge></div>
                <div><span className="text-gray-500">Fecha:</span> <span>{selected?.createdAt ? new Date(selected.createdAt).toLocaleDateString("es-DO") : ""}</span></div>
              </div>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50"><tr><th className="px-3 py-2 text-left">Producto</th><th className="px-3 py-2 text-center">Enviado</th><th className="px-3 py-2 text-center">Recibido</th></tr></thead>
                  <tbody className="divide-y">
                    {selected?.items?.map((item: any, i: number) => (
                      <tr key={i}><td className="px-3 py-2">{item.productName}</td><td className="px-3 py-2 text-center">{item.sentQty || item.quantity}</td><td className="px-3 py-2 text-center">{item.receivedQty || 0}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {selected?.notes && <p className="text-sm text-gray-500">Observaciones: {selected.notes}</p>}
              <div className="flex gap-2 pt-2">
                {selected?.status === "pending" && (
                  <>
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => receiveMutation.mutate({ id: selected.id })} disabled={receiveMutation.isPending}>
                      <PackageCheck className="w-4 h-4 mr-1" /> Recibir
                    </Button>
                    <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => cancelMutation.mutate(selected.id)} disabled={cancelMutation.isPending}>
                      <XCircle className="w-4 h-4 mr-1" /> Anular
                    </Button>
                  </>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
