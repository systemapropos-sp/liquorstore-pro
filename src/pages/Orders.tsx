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
} from "@/components/ui/dialog";
import { ClipboardList, FileCheck, Send, XCircle } from "lucide-react";

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(
    typeof value === "string" ? parseFloat(value || "0") : value
  );
}

const statusMap: Record<string, { label: string; color: string }> = {
  draft: { label: "Borrador", color: "bg-slate-500" },
  sent: { label: "Enviada", color: "bg-blue-500" },
  approved: { label: "Aprobada", color: "bg-emerald-500" },
  rejected: { label: "Rechazada", color: "bg-red-500" },
  converted: { label: "Convertida", color: "bg-purple-500" },
};

export default function Orders() {
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data: orders, isLoading } = trpc.order.list.useQuery({ page: 1, limit: 50 });
  const utils = trpc.useUtils();
  const updateStatus = trpc.order.updateStatus.useMutation({
    onSuccess: () => utils.order.list.invalidate(),
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
            <h1 className="text-2xl font-bold tracking-tight">Órdenes / Cotizaciones</h1>
            <p className="text-muted-foreground">Presupuestos y cotizaciones de venta</p>
          </div>
          <Button className="bg-[#1ABC9C] hover:bg-[#16a085] text-white shadow-sm" onClick={() => { }}>
            <ClipboardList className="w-4 h-4 mr-2" />
            Nueva Cotización
          </Button>
        </div>

        <div className="space-y-3">
          {orders?.map((order) => (
            <Card key={order.id} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setSelectedOrder(order); setDetailOpen(true); }}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                      <ClipboardList className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{order.number}</p>
                      <p className="text-xs text-muted-foreground">{order.customer?.name || "Sin cliente"} • {order.branch?.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(order.total || 0)}</p>
                    <Badge className={`text-xs text-white mt-1 ${statusMap[order.status]?.color || "bg-slate-500"}`}>
                      {statusMap[order.status]?.label || order.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {orders?.length === 0 && (
          <div className="text-center py-12">
            <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay cotizaciones</p>
          </div>
        )}

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Cotización {selectedOrder?.number}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Cliente:</span>
                <span className="font-medium">{selectedOrder?.customer?.name || "Sin cliente"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-bold text-[#1ABC9C]">{formatCurrency(selectedOrder?.total || 0)}</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Productos:</p>
                {selectedOrder?.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm bg-accent/50 rounded px-2 py-1">
                    <span>{item.product?.name} x{item.quantity}</span>
                    <span>{formatCurrency(item.total || 0)}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                {selectedOrder?.status === "draft" && (
                  <Button variant="outline" size="sm" onClick={() => { updateStatus.mutate({ id: selectedOrder.id, status: "sent" }); setDetailOpen(false); }}>
                    <Send className="w-4 h-4 mr-1" /> Enviar
                  </Button>
                )}
                {selectedOrder?.status === "approved" && (
                  <Button variant="outline" size="sm" onClick={() => { updateStatus.mutate({ id: selectedOrder.id, status: "converted" }); setDetailOpen(false); }}>
                    <FileCheck className="w-4 h-4 mr-1" /> Convertir
                  </Button>
                )}
                {selectedOrder?.status !== "converted" && (
                  <Button variant="outline" size="sm" onClick={() => { updateStatus.mutate({ id: selectedOrder.id, status: "rejected" }); setDetailOpen(false); }}>
                    <XCircle className="w-4 h-4 mr-1" /> Rechazar
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
