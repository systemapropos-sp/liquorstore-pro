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
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { CreditCard, DollarSign, AlertTriangle, Calendar } from "lucide-react";

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(
    typeof value === "string" ? parseFloat(value || "0") : value
  );
}

const statusMap: Record<string, { label: string; variant: any }> = {
  current: { label: "Al día", variant: "default" },
  overdue: { label: "Vencido", variant: "destructive" },
  paid: { label: "Pagado", variant: "secondary" },
  written_off: { label: "Castigado", variant: "outline" },
};

export default function Credits() {
  const [payOpen, setPayOpen] = useState(false);
  const [selectedCredit, setSelectedCredit] = useState<any>(null);
  const [payAmount, setPayAmount] = useState("");

  const { data: credits, isLoading } = trpc.credit.list.useQuery({ page: 1, limit: 50 });
  const utils = trpc.useUtils();
  const addPayment = trpc.credit.addPayment.useMutation({
    onSuccess: () => {
      utils.credit.list.invalidate();
      setPayOpen(false);
      setPayAmount("");
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
            <h1 className="text-2xl font-bold tracking-tight">Créditos / Cuentas por Cobrar</h1>
            <p className="text-muted-foreground">Gestión de ventas a crédito y abonos</p>
          </div>
        </div>

        <div className="space-y-3">
          {credits?.map((credit) => (
            <Card key={credit.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{credit.customer?.name}</p>
                      <p className="text-xs text-muted-foreground">Factura: {credit.invoice?.number || "N/A"} • {credit.installments} cuotas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(credit.balance || 0)}</p>
                    <Badge variant={statusMap[credit.status]?.variant || "secondary"} className="text-xs mt-1">
                      {statusMap[credit.status]?.label || credit.status}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" /> Total: {formatCurrency(credit.totalAmount || 0)}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Inicio: {credit.startDate ? new Date(credit.startDate).toLocaleDateString("es-DO") : ""}</span>
                  {credit.dueDate && (
                    <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Vence: {new Date(credit.dueDate).toLocaleDateString("es-DO")}</span>
                  )}
                </div>
                {credit.status !== "paid" && (
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setSelectedCredit(credit); setPayOpen(true); }}
                    >
                      Registrar Abono
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {credits?.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay créditos registrados</p>
          </div>
        )}

        <Dialog open={payOpen} onOpenChange={setPayOpen}>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Registrar Abono</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm">Cliente: <strong>{selectedCredit?.customer?.name}</strong></p>
              <p className="text-sm">Saldo pendiente: <strong>{formatCurrency(selectedCredit?.balance || 0)}</strong></p>
              <div className="space-y-2">
                <Label>Monto a abonar</Label>
                <Input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
              </div>
              <Button
                onClick={() => addPayment.mutate({ creditId: selectedCredit.id, amount: payAmount })}
                disabled={addPayment.isPending || !payAmount}
                className="bg-[#1ABC9C] hover:bg-[#16a085] text-white w-full shadow-sm"
              >
                {addPayment.isPending ? "Procesando..." : "Registrar Pago"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
