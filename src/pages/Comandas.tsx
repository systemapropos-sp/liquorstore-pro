import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import {
  Plus, Search, Clock, ChefHat, CheckCircle, Truck, XCircle,
  User, Trash2
} from "lucide-react";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pendiente", color: "bg-amber-100 text-amber-700", icon: Clock },
  preparing: { label: "En Preparacion", color: "bg-blue-100 text-blue-700", icon: ChefHat },
  ready: { label: "Lista", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle },
  delivered: { label: "Entregada", color: "bg-gray-100 text-gray-600", icon: Truck },
  cancelled: { label: "Cancelada", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function Comandas() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showDialog, setShowDialog] = useState(false);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [newComanda, setNewComanda] = useState({ customerName: "", tableId: "", notes: "" });

  const { data: comandas = [] } = trpc.comanda.list.useQuery(
    statusFilter ? { status: statusFilter } : {}
  );
  const { data: tables = [] } = trpc.table.list.useQuery({});
  const { data: products = [] } = trpc.product.list.useQuery({});

  const updateStatus = trpc.comanda.updateStatus.useMutation();
  const createComanda = trpc.comanda.create.useMutation({
    onSuccess: () => {
      setShowDialog(false);
      setSelectedItems([]);
      setNewComanda({ customerName: "", tableId: "", notes: "" });
    }
  });
  const deleteComanda = trpc.comanda.delete.useMutation();

  const filtered = comandas.filter((c: any) =>
    c.number?.toLowerCase().includes(search.toLowerCase()) ||
    c.customerName?.toLowerCase().includes(search.toLowerCase()) ||
    c.tableName?.toLowerCase().includes(search.toLowerCase())
  );

  function handleAddItem(productId: string) {
    const product = products.find((p: any) => p.id === parseInt(productId));
    if (!product) return;
    setSelectedItems(prev => [...prev, {
      productId: product.id,
      productName: product.name,
      quantity: 1,
      price: product.price,
      notes: ""
    }]);
  }

  function handleCreate() {
    if (selectedItems.length === 0) return;
    const table = tables.find((t: any) => t.id === parseInt(newComanda.tableId));
    createComanda.mutate({
      items: selectedItems,
      tableId: newComanda.tableId ? parseInt(newComanda.tableId) : undefined,
      tableName: table?.name,
      customerName: newComanda.customerName,
      notes: newComanda.notes
    });
  }

  function updateItemQty(index: number, qty: number) {
    if (qty < 1) {
      setSelectedItems(prev => prev.filter((_, i) => i !== index));
      return;
    }
    setSelectedItems(prev => prev.map((item, i) => i === index ? { ...item, quantity: qty } : item));
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Comandas</h1>
          <p className="text-sm text-gray-500 mt-1">Gestion de pedidos de cocina y barra</p>
        </div>
        <Button className="btn-emerald" onClick={() => setShowDialog(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nueva Comanda
        </Button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Buscar comandas..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="w-48 border rounded-md px-3 text-sm bg-white"
        >
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="preparing">En Preparacion</option>
          <option value="ready">Lista</option>
          <option value="delivered">Entregada</option>
          <option value="cancelled">Cancelada</option>
        </select>
        <div className="flex border rounded-md overflow-hidden">
          <button onClick={() => setViewMode("grid")} className={`px-3 py-2 text-sm ${viewMode === "grid" ? "bg-[#1ABC9C] text-white" : "bg-white"}`}>Tarjetas</button>
          <button onClick={() => setViewMode("list")} className={`px-3 py-2 text-sm ${viewMode === "list" ? "bg-[#1ABC9C] text-white" : "bg-white"}`}>Lista</button>
        </div>
      </div>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c: any) => {
            const cfg = statusConfig[c.status] || statusConfig.pending;
            const Icon = cfg.icon;
            return (
              <div key={c.id} className="bg-white rounded-lg border overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-gray-800">{c.number}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${cfg.color}`}>
                      <Icon className="w-3 h-3" /> {cfg.label}
                    </span>
                  </div>
                  {c.tableName && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                      <User className="w-4 h-4" /> Mesa: {c.tableName}
                    </div>
                  )}
                  {c.customerName && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                      <User className="w-4 h-4" /> {c.customerName}
                    </div>
                  )}
                  <div className="space-y-1 mb-3">
                    {c.items.slice(0, 3).map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{item.quantity}x {item.productName}</span>
                        <span className="text-gray-500">RD${parseFloat(item.total).toFixed(2)}</span>
                      </div>
                    ))}
                    {c.items.length > 3 && <p className="text-xs text-gray-400">+{c.items.length - 3} mas...</p>}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="font-bold text-gray-800">RD${parseFloat(c.total).toFixed(2)}</span>
                    <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <div className="px-4 pb-4 flex gap-2">
                  {c.status === 'pending' && (
                    <Button size="sm" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white" onClick={() => updateStatus.mutate({ id: c.id, status: 'preparing' })}>
                      <ChefHat className="w-3 h-3 mr-1" /> Preparar
                    </Button>
                  )}
                  {c.status === 'preparing' && (
                    <Button size="sm" className="flex-1 btn-emerald" onClick={() => updateStatus.mutate({ id: c.id, status: 'ready' })}>
                      <CheckCircle className="w-3 h-3 mr-1" /> Lista
                    </Button>
                  )}
                  {c.status === 'ready' && (
                    <Button size="sm" className="flex-1 bg-gray-600 hover:bg-gray-700 text-white" onClick={() => updateStatus.mutate({ id: c.id, status: 'delivered' })}>
                      <Truck className="w-3 h-3 mr-1" /> Entregar
                    </Button>
                  )}
                  {c.status !== 'delivered' && c.status !== 'cancelled' && (
                    <Button size="sm" variant="outline" className="text-red-500 border-red-200" onClick={() => updateStatus.mutate({ id: c.id, status: 'cancelled' })}>
                      <XCircle className="w-3 h-3" />
                    </Button>
                  )}
                  {(c.status === 'delivered' || c.status === 'cancelled') && (
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteComanda.mutate(c.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-10 text-gray-400">
              <ChefHat className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>Sin comandas</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1ABC9C] text-white">
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Mesa/Cliente</th>
                <th className="px-3 py-2 text-left">Productos</th>
                <th className="px-3 py-2 text-right">Total</th>
                <th className="px-3 py-2 text-center">Estado</th>
                <th className="px-3 py-2 text-center">Hora</th>
                <th className="px-3 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c: any) => {
                const cfg = statusConfig[c.status] || statusConfig.pending;
                return (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium">{c.number}</td>
                    <td className="px-3 py-2">
                      {c.tableName && <div className="text-sm">{c.tableName}</div>}
                      {c.customerName && <div className="text-xs text-gray-500">{c.customerName}</div>}
                    </td>
                    <td className="px-3 py-2">
                      <div className="text-xs text-gray-600">
                        {c.items.map((i: any) => `${i.quantity}x ${i.productName}`).join(', ')}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right font-medium">RD${parseFloat(c.total).toFixed(2)}</td>
                    <td className="px-3 py-2 text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                    </td>
                    <td className="px-3 py-2 text-center text-xs text-gray-500">
                      {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div className="flex gap-1 justify-center">
                        {c.status === 'pending' && (
                          <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white h-7 px-2" onClick={() => updateStatus.mutate({ id: c.id, status: 'preparing' })}>Preparar</Button>
                        )}
                        {c.status === 'preparing' && (
                          <Button size="sm" className="btn-emerald h-7 px-2" onClick={() => updateStatus.mutate({ id: c.id, status: 'ready' })}>Lista</Button>
                        )}
                        {c.status === 'ready' && (
                          <Button size="sm" className="bg-gray-600 hover:bg-gray-700 text-white h-7 px-2" onClick={() => updateStatus.mutate({ id: c.id, status: 'delivered' })}>Entregar</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Simple dialog using conditional rendering */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDialog(false)}>
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Nueva Comanda</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Cliente (opcional)</label>
                  <Input value={newComanda.customerName} onChange={e => setNewComanda({ ...newComanda, customerName: e.target.value })} placeholder="Nombre del cliente" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Mesa</label>
                  <select
                    value={newComanda.tableId}
                    onChange={e => setNewComanda({ ...newComanda, tableId: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  >
                    <option value="">Sin mesa</option>
                    {tables.map((t: any) => (
                      <option key={t.id} value={String(t.id)}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Agregar Producto</label>
                <select onChange={e => { handleAddItem(e.target.value); e.target.value = ""; }} className="w-full border rounded-md px-3 py-2 text-sm">
                  <option value="">Seleccionar producto</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={String(p.id)}>{p.name} - RD${p.price}</option>
                  ))}
                </select>
              </div>
              {selectedItems.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-2 text-left">Producto</th>
                        <th className="px-3 py-2 text-center">Cant.</th>
                        <th className="px-3 py-2 text-right">Precio</th>
                        <th className="px-3 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedItems.map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="px-3 py-2">{item.productName}</td>
                          <td className="px-3 py-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button className="w-6 h-6 border rounded" onClick={() => updateItemQty(idx, item.quantity - 1)}>-</button>
                              <span>{item.quantity}</span>
                              <button className="w-6 h-6 border rounded" onClick={() => updateItemQty(idx, item.quantity + 1)}>+</button>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right">RD${parseFloat(item.price).toFixed(2)}</td>
                          <td className="px-3 py-2 text-right">RD${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-3 text-right font-bold">
                    Total: RD${selectedItems.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0).toFixed(2)}
                  </div>
                </div>
              )}
              <div>
                <label className="text-sm font-medium block mb-1">Notas</label>
                <Input value={newComanda.notes} onChange={e => setNewComanda({ ...newComanda, notes: e.target.value })} placeholder="Notas especiales..." />
              </div>
              <div className="flex gap-3 pt-2">
                <Button className="flex-1 btn-emerald" onClick={handleCreate} disabled={selectedItems.length === 0 || createComanda.isPending}>
                  Crear Comanda
                </Button>
                <Button variant="outline" onClick={() => setShowDialog(false)}>Cancelar</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
