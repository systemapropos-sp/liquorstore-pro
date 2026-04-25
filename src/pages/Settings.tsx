import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Save, Building2, Percent } from "lucide-react";

export default function SettingsPage() {
  const { data: business, isLoading: bLoading } = trpc.settings.getBusiness.useQuery();
  const { data: settings, isLoading: sLoading } = trpc.settings.getSettings.useQuery();
  const utils = trpc.useUtils();

  const [bizForm, setBizForm] = useState({ name: "", address: "", phone: "", email: "", rnc: "", slogan: "", taxRate: "", taxIncluded: true });
  const [setForm, setSetForm] = useState({ invoicePrefix: "", creditInterestRate: "", creditGraceDays: "", expiryAlertDays: "", minDeliveryAmount: "", prepTimeMinutes: "" });

  const updateBiz = trpc.settings.updateBusiness.useMutation({
    onSuccess: () => utils.settings.getBusiness.invalidate(),
  });
  const updateSet = trpc.settings.updateSettings.useMutation({
    onSuccess: () => utils.settings.getSettings.invalidate(),
  });

  if (bLoading || sLoading) {
    return (
      <Layout>
        <Skeleton className="h-96" />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Ajustes / Configuración</h1>
          <p className="text-muted-foreground">Configuración del negocio y preferencias</p>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <Building2 className="w-5 h-5 text-[#E30A17]" />
            <CardTitle className="text-base">Datos del Negocio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input defaultValue={business?.name || ""} onChange={(e) => setBizForm({ ...bizForm, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>RNC</Label>
                <Input defaultValue={business?.rnc || ""} onChange={(e) => setBizForm({ ...bizForm, rnc: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input defaultValue={business?.phone || ""} onChange={(e) => setBizForm({ ...bizForm, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={business?.email || ""} onChange={(e) => setBizForm({ ...bizForm, email: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Dirección</Label>
                <Input defaultValue={business?.address || ""} onChange={(e) => setBizForm({ ...bizForm, address: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Eslogan</Label>
                <Input defaultValue={business?.slogan || ""} onChange={(e) => setBizForm({ ...bizForm, slogan: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tasa ITBIS (%)</Label>
                <Input type="number" defaultValue={business?.taxRate || "18"} onChange={(e) => setBizForm({ ...bizForm, taxRate: e.target.value })} />
              </div>
            </div>
            <Button onClick={() => updateBiz.mutate(bizForm)} disabled={updateBiz.isPending} className="bg-[#E30A17] hover:bg-[#c00914] text-white">
              <Save className="w-4 h-4 mr-2" /> Guardar Negocio
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <Percent className="w-5 h-5 text-[#E30A17]" />
            <CardTitle className="text-base">Configuración de Operaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Prefijo Factura</Label>
                <Input defaultValue={settings?.invoicePrefix || "A-"} onChange={(e) => setSetForm({ ...setForm, invoicePrefix: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Interés Mora (%)</Label>
                <Input type="number" defaultValue={settings?.creditInterestRate || "2"} onChange={(e) => setSetForm({ ...setForm, creditInterestRate: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Días de Gracia</Label>
                <Input type="number" defaultValue={settings?.creditGraceDays || "3"} onChange={(e) => setSetForm({ ...setForm, creditGraceDays: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Alerta Vencimiento (días)</Label>
                <Input type="number" defaultValue={settings?.expiryAlertDays || "7"} onChange={(e) => setSetForm({ ...setForm, expiryAlertDays: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Monto mínimo delivery</Label>
                <Input type="number" defaultValue={settings?.minDeliveryAmount || "500"} onChange={(e) => setSetForm({ ...setForm, minDeliveryAmount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Tiempo prep (min)</Label>
                <Input type="number" defaultValue={settings?.prepTimeMinutes || "30"} onChange={(e) => setSetForm({ ...setForm, prepTimeMinutes: e.target.value })} />
              </div>
            </div>
            <Button onClick={() => updateSet.mutate({
              invoicePrefix: setForm.invoicePrefix || undefined,
              creditInterestRate: setForm.creditInterestRate || undefined,
              creditGraceDays: setForm.creditGraceDays ? parseInt(setForm.creditGraceDays) : undefined,
              expiryAlertDays: setForm.expiryAlertDays ? parseInt(setForm.expiryAlertDays) : undefined,
              minDeliveryAmount: setForm.minDeliveryAmount || undefined,
              prepTimeMinutes: setForm.prepTimeMinutes ? parseInt(setForm.prepTimeMinutes) : undefined,
            })} disabled={updateSet.isPending} className="bg-[#E30A17] hover:bg-[#c00914] text-white">
              <Save className="w-4 h-4 mr-2" /> Guardar Configuración
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
