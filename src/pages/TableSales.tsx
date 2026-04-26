import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import {
  Table, Plus, Minus, Trash2, Receipt, RotateCcw, ChefHat
} from "lucide-react";

export default function TableSales() {
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState("");

  const { data: tables = [], refetch: refetchTables } = trpc.table.list.useQuery({});
  const { data: products = [] } = trpc.product.list.useQuery({});
  const { data: orderItems = [], refetch: refetchItems } = trpc.table.orderItems.useQuery(
    selectedTableId ? { tableId: selectedTableId } : undefined
  );

  const addItem = trpc.table.addItem.useMutation({
    onSuccess: () => { refetchItems(); refetchTables(); }
  });
  const removeItem = trpc.table.removeItem.useMutation({
    onSuccess: () => { refetchItems(); refetchTables(); }
  });
  const clearTable = trpc.table.clear.useMutation({
    onSuccess: () => { setSelectedTableId(null); refetchTables(); }
  });

  const selectedTable = tables.find((t: any) => t.id === selectedTableId);

  function handleAddProduct() {
    if (!selectedProduct || !selectedTableId) return;
    const product = products.find((p: any) => p.id === parseInt(selectedProduct));
    if (!product) return;
    addItem.mutate({ tableId: selectedTableId, productId: product.id, quantity: 1, price: product.price });
    setSelectedProduct("");
  }

  function updateQty(itemId: number, newQty: number) {
    if (newQty <= 0) {
      removeItem.mutate(itemId);
      return;
    }
    const item = orderItems.find((i: any) => i.id === itemId);
    if (item) {
      removeItem.mutate(itemId, {
        onSuccess: () => {
          addItem.mutate({ tableId: selectedTableId, productId: item.productId, quantity: newQty, price: item.price, notes: item.notes });
        }
      });
    }
  }

  const total = orderItems.reduce((s: number, i: any) => s + parseFloat(i.total), 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Ventas por Mesas</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona pedidos en mesas y barra</p>
        </div>
        <Link to="/facturacion">
          <Button variant="outline">Ir a Facturacion</Button>
        </Link>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Libre
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <div className="w-3 h-3 rounded-full bg-red-500"></div> Ocupada
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div> Reservada
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        {tables.map((t: any) => (
          <div
            key={t.id}
            onClick={() => setSelectedTableId(t.id)}
            className={`rounded-xl border-2 p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedTableId === t.id
                ? 'border-[#1ABC9C] shadow-lg'
                : t.status === 'occupied'
                ? 'border-red-300 bg-red-50'
                : t.status === 'reserved'
                ? 'border-amber-300 bg-amber-50'
                : 'border-gray-200 hover:border-[#1ABC9C]'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <Table className={`w-6 h-6 ${
                t.status === 'occupied' ? 'text-red-500' :
                t.status === 'reserved' ? 'text-amber-500' :
                'text-[#1ABC9C]'
              }`} />
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                t.status === 'occupied' ? 'bg-red-100 text-red-700' :
                t.status === 'reserved' ? 'bg-amber-100 text-amber-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                {t.status === 'occupied' ? 'Ocupada' : t.status === 'reserved' ? 'Reservada' : 'Libre'}
              </span>
            </div>
            <h3 className="font-bold text-gray-800">{t.name}</h3>
            <p className="text-xs text-gray-500">Capacidad: {t.capacity} personas</p>
            {t.status === 'occupied' && (
              <p className="text-sm font-semibold text-red-600 mt-1">RD${parseFloat(t.orderTotal).toFixed(2)}</p>
            )}
          </div>
        ))}
      </div>

      {/* Table Detail Panel */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedTableId(null)}>
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Table className="w-5 h-5 text-[#1ABC9C]" />
                {selectedTable.name}
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  selectedTable.status === 'occupied' ? 'bg-red-100 text-red-700' :
                  selectedTable.status === 'reserved' ? 'bg-amber-100 text-amber-700' :
                  'bg-emerald-100 text-emerald-700'
                }`}>
                  {selectedTable.status === 'occupied' ? 'Ocupada' : selectedTable.status === 'reserved' ? 'Reservada' : 'Libre'}
                </span>
              </h2>
              <button onClick={() => setSelectedTableId(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <select
                  value={selectedProduct}
                  onChange={e => setSelectedProduct(e.target.value)}
                  className="flex-1 border rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Agregar producto...</option>
                  {products.map((p: any) => (
                    <option key={p.id} value={String(p.id)}>{p.name} - RD${p.price}</option>
                  ))}
                </select>
                <Button className="btn-emerald" onClick={handleAddProduct} disabled={!selectedProduct}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {orderItems.length > 0 ? (
                <>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="px-3 py-2 text-left">Producto</th>
                          <th className="px-3 py-2 text-center">Cant.</th>
                          <th className="px-3 py-2 text-right">Precio</th>
                          <th className="px-3 py-2 text-right">Total</th>
                          <th className="px-3 py-2 text-center"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderItems.map((item: any) => (
                          <tr key={item.id} className="border-b">
                            <td className="px-3 py-2">{item.productName}</td>
                            <td className="px-3 py-2 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button className="w-6 h-6 border rounded flex items-center justify-center" onClick={() => updateQty(item.id, item.quantity - 1)}>
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-6 text-center">{item.quantity}</span>
                                <button className="w-6 h-6 border rounded flex items-center justify-center" onClick={() => updateQty(item.id, item.quantity + 1)}>
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right">RD${parseFloat(item.price).toFixed(2)}</td>
                            <td className="px-3 py-2 text-right font-medium">RD${parseFloat(item.total).toFixed(2)}</td>
                            <td className="px-3 py-2 text-center">
                              <button className="text-red-500" onClick={() => removeItem.mutate(item.id)}>
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Total:</span>
                    <span className="text-xl font-bold text-gray-800">RD${total.toFixed(2)}</span>
                  </div>

                  <div className="flex gap-2">
                    <Link to="/facturacion" className="flex-1">
                      <Button className="w-full btn-emerald" onClick={() => {
                        localStorage.setItem('table_invoice_items', JSON.stringify(orderItems.map((i: any) => ({
                          productId: i.productId,
                          productName: i.productName,
                          quantity: i.quantity,
                          price: i.price,
                          total: i.total
                        }))));
                        localStorage.setItem('table_invoice_total', total.toFixed(2));
                        localStorage.setItem('table_name', selectedTable.name);
                      }}>
                        <Receipt className="w-4 h-4 mr-2" /> Facturar Mesa
                      </Button>
                    </Link>
                    <Button variant="outline" className="text-red-500 border-red-200" onClick={() => clearTable.mutate(selectedTable.id)}>
                      <RotateCcw className="w-4 h-4 mr-1" /> Limpiar
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <ChefHat className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Selecciona productos para esta mesa</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
