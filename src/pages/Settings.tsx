import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Save, Building2, Percent, Table, Plus, Trash2, Edit2 } from "lucide-react";

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
            <Building2 className="w-5 h-5 text-[#1ABC9C]" />
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
            <Button onClick={() => updateBiz.mutate(bizForm)} disabled={updateBiz.isPending} className="bg-[#1ABC9C] hover:bg-[#16a085] text-white">
              <Save className="w-4 h-4 mr-2" /> Guardar Negocio
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center gap-2">
            <Percent className="w-5 h-5 text-[#1ABC9C]" />
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
            })} disabled={updateSet.isPending} className="bg-[#1ABC9C] hover:bg-[#16a085] text-white">
              <Save className="w-4 h-4 mr-2" /> Guardar Configuracion
            </Button>
          </CardContent>
        </Card>

        <TableSettingsCard />
      </div>
    </Layout>
  );
}

function TableSettingsCard() {
  const { data: tables = [], refetch } = trpc.table.list.useQuery({});
  const createTable = trpc.table.create.useMutation({ onSuccess: () => refetch() });
  const updateTable = trpc.table.update.useMutation({ onSuccess: () => refetch() });
  const deleteTable = trpc.table.delete.useMutation({ onSuccess: () => refetch() });

  const [newName, setNewName] = useState("");
  const [newCapacity, setNewCapacity] = useState("4");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCapacity, setEditCapacity] = useState("");

  function handleAdd() {
    if (!newName.trim()) return;
    createTable.mutate({
      name: newName,
      capacity: parseInt(newCapacity) || 4,
      branchId: 1
    });
    setNewName("");
    setNewCapacity("4");
  }

  function handleEdit(table: any) {
    setEditingId(table.id);
    setEditName(table.name);
    setEditCapacity(String(table.capacity));
  }

  function handleSaveEdit() {
    if (!editingId) return;
    updateTable.mutate({
      id: editingId,
      name: editName,
      capacity: parseInt(editCapacity) || 4
    });
    setEditingId(null);
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center gap-2">
        <Table className="w-5 h-5 text-[#1ABC9C]" />
        <CardTitle className="text-base">Configuracion de Mesas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3 mb-4">
          <Input
            placeholder="Nombre de la mesa (ej: Mesa 1, Barra 2, Terraza A)"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="flex-1"
          />
          <Input
            type="number"
            placeholder="Capacidad"
            value={newCapacity}
            onChange={e => setNewCapacity(e.target.value)}
            className="w-24"
          />
          <Button onClick={handleAdd} disabled={createTable.isPending} className="bg-[#1ABC9C] hover:bg-[#16a085] text-white">
            <Plus className="w-4 h-4 mr-1" /> Agregar
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {tables.map((t: any) => (
            <div key={t.id} className="border rounded-lg p-3 flex items-center justify-between">
              {editingId === t.id ? (
                <div className="flex-1 space-y-2">
                  <Input value={editName} onChange={e => setEditName(e.target.value)} className="text-sm" />
                  <div className="flex gap-2">
                    <Input type="number" value={editCapacity} onChange={e => setEditCapacity(e.target.value)} className="w-20 text-sm" />
                    <Button size="sm" className="bg-[#1ABC9C] hover:bg-[#16a085] text-white h-8" onClick={handleSaveEdit}><Save className="w-3 h-3" /></Button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-medium text-gray-800">{t.name}</p>
                    <p className="text-xs text-gray-500">Capacidad: {t.capacity} personas</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => handleEdit(t)}>
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => deleteTable.mutate(t.id)}>
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
        {tables.length === 0 && (
          <div className="text-center py-6 text-gray-400">No hay mesas configuradas</div>
        )}
      </CardContent>
    </Card>
  );
}
