import { useState, useMemo } from "react";
import { trpc } from "@/providers/trpc";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import {
  Search, Trash2, Minus, Plus, ShoppingCart, FileText, CreditCard, User,
  DollarSign, Tag, Star, ChevronLeft, ChevronRight, X, Printer
} from "lucide-react";

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(
    typeof value === "string" ? parseFloat(value || "0") : value
  );
}

interface CartItem {
  productId: number;
  name: string;
  price: number;
  cost: number;
  quantity: number;
  discount: number;
}

export default function Invoices() {
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<number | null>(null);
  const [favOnly, setFavOnly] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash" as const);
  const [notes, setNotes] = useState("");
  const [globalDiscount, setGlobalDiscount] = useState(0);

  // Dialog/view state
  const [showInvoiceList, setShowInvoiceList] = useState(false);
  const [invoiceDetail, setInvoiceDetail] = useState<any>(null);

  const { data: products, isLoading: pLoading } = trpc.product.list.useQuery({ page: 1, limit: 100 });
  const { data: categories } = trpc.product.listCategories.useQuery();
  const { data: customers } = trpc.customer.list.useQuery({ page: 1, limit: 100 });
  const { data: branches } = trpc.branch.list.useQuery();
  const { data: invoices } = trpc.invoice.list.useQuery({ page: 1, limit: 50 });

  const utils = trpc.useUtils();
  const createMutation = trpc.invoice.create.useMutation({
    onSuccess: () => {
      utils.invoice.list.invalidate();
      setCart([]);
      setCustomerId("");
      setNotes("");
      setGlobalDiscount(0);
      alert("Factura guardada exitosamente!");
    },
  });

  // Filtered products
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const list = products.filter(p => {
      const matchesSearch = !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.code?.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.toLowerCase().includes(search.toLowerCase());
      const matchesCat = !catFilter || p.categoryId === catFilter;
      const matchesFav = !favOnly || p.isFavorite;
      return matchesSearch && matchesCat && matchesFav;
    });
    // Sort: favorites first, then by name
    list.sort((a: any, b: any) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [products, search, catFilter, favOnly]);

  // Cart calculations
  const addToCart = (productId: number, name: string, price: number, cost: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === productId);
      if (existing) {
        return prev.map(i => i.productId === productId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { productId, name, price, cost, quantity: 1, discount: 0 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  };

  const updateQty = (productId: number, qty: number) => {
    if (qty <= 0) return removeFromCart(productId);
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, quantity: qty } : i));
  };

  const updateItemDiscount = (productId: number, discount: number) => {
    setCart(prev => prev.map(i => i.productId === productId ? { ...i, discount } : i));
  };

  const cartTotals = useMemo(() => {
    const gross = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const itemDiscounts = cart.reduce((sum, i) => sum + i.discount * i.quantity, 0);
    const subtotal = gross - itemDiscounts;
    const discount = itemDiscounts + globalDiscount;
    const taxable = Math.max(subtotal - globalDiscount, 0);
    const tax = taxable * 0.18;
    const total = taxable + tax;
    return { gross, discount, subtotal, tax, total, count: cart.length, units: cart.reduce((s, i) => s + i.quantity, 0) };
  }, [cart, globalDiscount]);

  // Barcode scanner simulation
  const handleBarcode = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && barcodeInput.trim()) {
      const found = products?.find(p => p.barcode === barcodeInput.trim() || p.code === barcodeInput.trim());
      if (found) {
        addToCart(found.id, found.name, parseFloat(found.price || "0"), parseFloat(found.cost || "0"));
        setBarcodeInput("");
      } else {
        alert("Producto no encontrado");
      }
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const branchId = branches?.[0]?.id ?? 1;
    createMutation.mutate({
      customerId: customerId ? parseInt(customerId) : undefined,
      branchId,
      paymentMethod,
      notes: notes || undefined,
      items: cart.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price, discount: i.discount })),
    });
  };

  const clearCart = () => {
    if (confirm("Limpiar carrito?")) {
      setCart([]);
      setGlobalDiscount(0);
    }
  };

  if (pLoading) {
    return (
      <Layout>
        <div className="flex h-[calc(100vh-120px)] gap-4">
          <Skeleton className="flex-1 h-full" />
          <Skeleton className="w-[400px] h-full" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* ========== INVOICE LIST VIEW ========== */}
      {showInvoiceList ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setShowInvoiceList(false)} className="border-gray-300 text-gray-600">
              <ChevronLeft className="w-4 h-4 mr-1" /> Volver al POS
            </Button>
            <h2 className="text-lg font-semibold text-gray-800">Historial de Facturas</h2>
          </div>

          <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden bg-white">
            <table className="w-full text-sm">
              <thead><tr className="bg-[#1ABC9C] text-white"><th className="px-4 py-3 text-left font-semibold">Factura</th><th className="px-4 py-3 text-left font-semibold">Cliente</th><th className="px-4 py-3 text-left font-semibold">Fecha</th><th className="px-4 py-3 text-left font-semibold">Pago</th><th className="px-4 py-3 text-right font-semibold">Total</th><th className="px-4 py-3 text-center font-semibold">Estado</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {invoices?.map((inv, idx) => (
                  <tr key={inv.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded bg-emerald-50 flex items-center justify-center"><FileText className="w-4 h-4 text-[#1ABC9C]" /></div><span className="font-medium text-gray-800">{inv.number}</span></div></td>
                    <td className="px-4 py-3 text-gray-600">{inv.customerName || "Contado"}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{inv.date ? new Date(inv.date).toLocaleDateString("es-DO") : ""}</td>
                    <td className="px-4 py-3"><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{paymentMethodLabel(inv.paymentMethod)}</span></td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatCurrency(inv.total || 0)}</td>
                    <td className="px-4 py-3 text-center"><Badge className={`text-[10px] ${inv.status === "paid" ? "bg-emerald-500" : inv.status === "pending" ? "bg-amber-500" : "bg-red-500"} text-white`}>{inv.status === "paid" ? "Pagada" : inv.status === "pending" ? "Pendiente" : "Anulada"}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ========== POS VIEW ========== */
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-140px)] min-h-[500px]">

          {/* ===== LEFT: Products Grid ===== */}
          <div className="flex-1 flex flex-col min-w-0 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Top bar */}
            <div className="p-3 border-b border-gray-200 bg-gray-50 flex flex-wrap gap-3 items-center">
              {/* Category tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                <button
                  onClick={() => { setCatFilter(null); setFavOnly(false); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${catFilter === null && !favOnly ? "bg-[#1ABC9C] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#1ABC9C] hover:text-[#1ABC9C]"}`}
                >TODOS</button>
                <button
                  onClick={() => { setCatFilter(null); setFavOnly(true); }}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1 ${favOnly ? "bg-amber-400 text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-amber-400 hover:text-amber-500"}`}
                ><Star className="w-3 h-3" />FAVORITOS</button>
                {categories?.map(c => (
                  <button
                    key={c.id}
                    onClick={() => { setCatFilter(c.id); setFavOnly(false); }}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${catFilter === c.id ? "bg-[#1ABC9C] text-white" : "bg-white text-gray-600 border border-gray-200 hover:border-[#1ABC9C] hover:text-[#1ABC9C]"}`}
                  >{c.name}</button>
                ))}
              </div>
              <div className="flex-1" />
              <div className="relative w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input
                  placeholder="Buscar productos..."
                  className="pl-8 h-8 text-sm border-gray-300"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Products grid */}
            <div className="flex-1 overflow-y-auto p-3">
              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Search className="w-10 h-10 mb-2" />
                  <p className="text-sm">No se encontraron productos</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map(p => {
                    const price = parseFloat(p.price || "0");
                    const stock = (p.inventory?.reduce((sum: number, inv: any) => sum + (inv.quantity || 0), 0) || 0);
                    const inCart = cart.find(i => i.productId === p.id);
                    return (
                      <button
                        key={p.id}
                        onClick={() => addToCart(p.id, p.name, price, parseFloat(p.cost || "0"))}
                        className={`relative flex flex-col rounded-lg border transition-all hover:shadow-md text-left overflow-hidden ${inCart ? "border-[#1ABC9C] bg-emerald-50 ring-1 ring-[#1ABC9C]" : "border-gray-200 bg-white hover:border-[#1ABC9C]"}`}
                      >
                        {/* Full-width image area */}
                        <div className="relative w-full h-28 bg-gray-100 flex items-center justify-center overflow-hidden">
                          {p.photoUrl ? (
                            <img src={p.photoUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-gray-400">
                              <Tag className="w-10 h-10" />
                            </div>
                          )}
                          {/* Gradient overlay at bottom */}
                          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/30 to-transparent" />
                          {/* Favorite badge */}
                          {p.isFavorite && (
                            <Badge className="absolute top-1.5 left-1.5 bg-amber-400 text-white text-[10px] h-5 px-1.5 border-0">
                              <Star className="w-2.5 h-2.5 mr-0.5 fill-white" />
                            </Badge>
                          )}
                          {/* Cart quantity badge */}
                          {inCart && (
                            <Badge className="absolute top-1.5 right-1.5 bg-[#1ABC9C] text-white text-[10px] h-5 px-1.5 border-0">{inCart.quantity}</Badge>
                          )}
                          {/* Stock badge at bottom of image */}
                          <span className={`absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${stock <= 5 ? "bg-red-500 text-white" : "bg-emerald-500 text-white"}`}>
                            {stock} und
                          </span>
                        </div>
                        {/* Product info */}
                        <div className="p-2.5 flex flex-col flex-1">
                          <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2">{p.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{p.code}</p>
                          <div className="mt-auto pt-1.5 flex items-baseline justify-center gap-1">
                            <span className="text-sm font-bold text-[#1ABC9C]">{formatCurrency(price)}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bottom actions */}
            <div className="p-2 border-t border-gray-200 bg-gray-50 flex gap-2">
              <Button variant="outline" size="sm" className="text-xs border-gray-300 text-gray-600" onClick={() => setShowInvoiceList(true)}>
                <FileText className="w-3.5 h-3.5 mr-1" /> Historico
              </Button>
              <Button variant="outline" size="sm" className="text-xs border-gray-300 text-gray-600">
                <Printer className="w-3.5 h-3.5 mr-1" /> Ticket
              </Button>
              <div className="flex-1" />
              <span className="text-xs text-gray-500 self-center">{filteredProducts.length} productos</span>
            </div>
          </div>

          {/* ===== RIGHT: Cart Panel ===== */}
          <div className="w-full lg:w-[420px] flex flex-col bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-3 border-b border-gray-200 bg-[#1ABC9C] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                <span className="font-semibold text-sm">Venta en Proceso</span>
              </div>
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded">{cartTotals.units} und / {cartTotals.count} items</span>
            </div>

            {/* Customer + Barcode */}
            <div className="p-3 border-b border-gray-200 space-y-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label className="text-[10px] text-gray-500 uppercase tracking-wider">Cliente</Label>
                  <select
                    className="w-full h-8 rounded-md border border-gray-300 bg-white px-2 text-xs mt-0.5"
                    value={customerId}
                    onChange={e => setCustomerId(e.target.value)}
                  >
                    <option value="">Cliente de Contado</option>
                    {customers?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <Label className="text-[10px] text-gray-500 uppercase tracking-wider">Pago</Label>
                  <select
                    className="w-full h-8 rounded-md border border-gray-300 bg-white px-2 text-xs mt-0.5"
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                  >
                    <option value="cash">Efectivo</option>
                    <option value="card">Tarjeta</option>
                    <option value="transfer">Transferencia</option>
                    <option value="credit">Credito</option>
                  </select>
                </div>
              </div>
              <div>
                <Label className="text-[10px] text-gray-500 uppercase tracking-wider">Codigo / Barcode (F4)</Label>
                <div className="relative mt-0.5">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <Input
                    placeholder="Escanear codigo..."
                    className="pl-7 h-8 text-xs border-gray-300"
                    value={barcodeInput}
                    onChange={e => setBarcodeInput(e.target.value)}
                    onKeyDown={handleBarcode}
                  />
                </div>
              </div>
            </div>

            {/* Cart items */}
            <div className="flex-1 overflow-y-auto p-2">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8">
                  <ShoppingCart className="w-10 h-10 mb-2" />
                  <p className="text-sm">Carrito vacio</p>
                  <p className="text-xs mt-1">Selecciona productos del grid</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {cart.map(item => (
                    <div key={item.productId} className="flex items-center gap-2 p-2 rounded-md bg-gray-50 border border-gray-100">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-800 truncate">{item.name}</p>
                        <p className="text-[10px] text-gray-500">{formatCurrency(item.price)} c/u</p>
                      </div>
                      {/* Qty controls */}
                      <div className="flex items-center gap-1">
                        <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-6 h-6 rounded bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"><Minus className="w-3 h-3" /></button>
                        <span className="w-7 text-center text-xs font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQty(item.productId, item.quantity + 1)} className="w-6 h-6 rounded bg-white border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"><Plus className="w-3 h-3" /></button>
                      </div>
                      {/* Total for this item */}
                      <div className="w-[70px] text-right">
                        <p className="text-xs font-semibold text-gray-800">{formatCurrency(item.price * item.quantity - item.discount * item.quantity)}</p>
                      </div>
                      {/* Remove */}
                      <button onClick={() => removeFromCart(item.productId)} className="w-6 h-6 rounded flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span className="text-xs">Total Bruto:</span>
                  <span>{formatCurrency(cartTotals.gross)}</span>
                </div>
                <div className="flex justify-between text-gray-600 items-center">
                  <span className="text-xs">Descuento:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-red-500">-{formatCurrency(cartTotals.discount)}</span>
                  </div>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="text-xs">Subtotal:</span>
                  <span>{formatCurrency(cartTotals.subtotal - globalDiscount)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="text-xs">ITBIS (18%):</span>
                  <span>{formatCurrency(cartTotals.tax)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-1.5 border-t border-gray-300">
                  <span>Total a Pagar:</span>
                  <span className="text-[#1ABC9C]">{formatCurrency(cartTotals.total)}</span>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-2">
                <Input
                  placeholder="Observaciones del documento..."
                  className="h-8 text-xs border-gray-300"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>

              {/* Action buttons */}
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-10 text-xs border-red-300 text-red-600 hover:bg-red-50"
                  onClick={clearCart}
                  disabled={cart.length === 0}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Limpiar
                </Button>
                <Button
                  className="flex-[2] h-10 bg-[#1ABC9C] hover:bg-[#16a085] text-white text-sm font-semibold shadow-sm"
                  onClick={handleCheckout}
                  disabled={createMutation.isPending || cart.length === 0}
                >
                  {createMutation.isPending ? "Procesando..." : "FACTURAR (F9)"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

function paymentMethodLabel(method: string) {
  const map: Record<string, string> = { cash: "Efectivo", card: "Tarjeta", transfer: "Transferencia", credit: "Credito", mixed: "Mixto" };
  return map[method] || method;
}
