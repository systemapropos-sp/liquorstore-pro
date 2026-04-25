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
import { Search, Plus, Users, Phone, Mail, MapPin, CreditCard } from "lucide-react";

export default function Customers() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", idNumber: "", phone: "", email: "", address: "", city: "", creditLimit: "", type: "cash" as "cash" | "credit", tags: "" });

  const { data: customers, isLoading } = trpc.customer.list.useQuery({
    search: search || undefined,
    page: 1,
    limit: 100,
  });

  const utils = trpc.useUtils();
  const createMutation = trpc.customer.create.useMutation({
    onSuccess: () => {
      utils.customer.list.invalidate();
      setOpen(false);
      setForm({ name: "", idNumber: "", phone: "", email: "", address: "", city: "", creditLimit: "", type: "cash", tags: "" });
    },
  });

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
            <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
            <p className="text-muted-foreground">Fichas de clientes y direcciones</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#E30A17] hover:bg-[#c00914] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Agregar Cliente</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cédula/RNC</Label>
                    <Input value={form.idNumber} onChange={(e) => setForm({ ...form, idNumber: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Ciudad</Label>
                    <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Dirección</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3"
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value as "cash" | "credit" })}
                    >
                      <option value="cash">Contado</option>
                      <option value="credit">Crédito</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Límite de Crédito</Label>
                    <Input type="number" value={form.creditLimit} onChange={(e) => setForm({ ...form, creditLimit: e.target.value })} disabled={form.type === "cash"} />
                  </div>
                </div>
                <Button
                  onClick={() => createMutation.mutate({
                    name: form.name,
                    idNumber: form.idNumber || undefined,
                    phone: form.phone || undefined,
                    email: form.email || undefined,
                    address: form.address || undefined,
                    city: form.city || undefined,
                    creditLimit: form.creditLimit || undefined,
                    type: form.type,
                    tags: form.tags || undefined,
                  })}
                  disabled={createMutation.isPending || !form.name}
                  className="bg-[#E30A17] hover:bg-[#c00914] text-white"
                >
                  {createMutation.isPending ? "Guardando..." : "Guardar Cliente"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, teléfono o cédula..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers?.map((customer) => (
            <Card key={customer.id} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                    <Users className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{customer.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant={customer.type === "credit" ? "default" : "secondary"} className="text-xs">
                        {customer.type === "credit" ? <CreditCard className="w-3 h-3 mr-1" /> : null}
                        {customer.type === "credit" ? "Crédito" : "Contado"}
                      </Badge>
                      {customer.tags && customer.tags.split(",").map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">{tag.trim()}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-sm">
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-3.5 h-3.5" />
                      <span className="text-xs">{customer.phone}</span>
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="text-xs">{customer.email}</span>
                    </div>
                  )}
                  {customer.address && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="text-xs">{customer.address}</span>
                    </div>
                  )}
                </div>

                {customer.type === "credit" && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Límite:</span>
                      <span className="font-medium">RD$ {customer.creditLimit || "0"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total comprado:</span>
                      <span className="font-medium">RD$ {customer.totalPurchased || "0"}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {customers?.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No se encontraron clientes</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
