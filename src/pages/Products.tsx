import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Search, Plus, Package, Trash2, Edit2, ImageIcon } from "lucide-react";

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(
    typeof value === "string" ? parseFloat(value || "0") : value
  );
}

export default function Products() {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showZeroStock, setShowZeroStock] = useState(true);
  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<any>(null);

  const [form, setForm] = useState({
    code: "", barcode: "", name: "", description: "", categoryId: "", brand: "",
    cost: "", price: "", price2: "", price3: "", minStock: "0", maxStock: "100",
    taxType: "taxed", taxRate: "18.00", supplierId: "", unit: "botella",
    isInventoriable: true, isBillable: true, isFavorite: false
  });

  const { data: categories } = trpc.product.listCategories.useQuery();
  const { data: suppliers } = trpc.supplier.list.useQuery({});
  const { data: products, isLoading } = trpc.product.list.useQuery({
    search: search || undefined,
    categoryId: categoryFilter ? parseInt(categoryFilter) : undefined,
    filters: {
      supplierId: supplierFilter || undefined,
      brand: brandFilter || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      showZeroStock
    }
  });

  const utils = trpc.useUtils();
  const createMutation = trpc.product.create.useMutation({
    onSuccess: () => { utils.product.list.invalidate(); setOpen(false); resetForm(); }
  });
  const updateMutation = trpc.product.update.useMutation({
    onSuccess: () => { utils.product.list.invalidate(); setEditProduct(null); resetForm(); }
  });
  const deleteMutation = trpc.product.delete.useMutation({
    onSuccess: () => utils.product.list.invalidate()
  });

  const resetForm = () => {
    setForm({ code: "", barcode: "", name: "", description: "", categoryId: "", brand: "",
      cost: "", price: "", price2: "", price3: "", minStock: "0", maxStock: "100",
      taxType: "taxed", taxRate: "18.00", supplierId: "", unit: "botella",
      isInventoriable: true, isBillable: true, isFavorite: false
    });
  };

  const startEdit = (product: any) => {
    setEditProduct(product);
    setForm({
      code: product.code || "", barcode: product.barcode || "", name: product.name || "",
      description: product.description || "", categoryId: String(product.categoryId || ""),
      brand: product.brand || "", cost: product.cost || "", price: product.price || "",
      price2: product.price2 || "", price3: product.price3 || "", minStock: String(product.minStock || 0),
      maxStock: String(product.maxStock || 100), taxType: product.taxType || "taxed",
      taxRate: product.taxRate || "18.00", supplierId: String(product.supplierId || ""),
      unit: product.unit || "botella", isInventoriable: product.isInventoriable !== false,
      isBillable: product.isBillable !== false, isFavorite: product.isFavorite || false
    });
    setOpen(true);
  };

  const handleSave = () => {
    const data = {
      code: form.code, barcode: form.barcode, name: form.name,
      description: form.description || undefined,
      categoryId: form.categoryId ? parseInt(form.categoryId) : undefined,
      brand: form.brand, cost: form.cost, price: form.price,
      price2: form.price2 || undefined, price3: form.price3 || undefined,
      minStock: parseInt(form.minStock) || 0, maxStock: parseInt(form.maxStock) || 100,
      taxType: form.taxType, taxRate: form.taxRate,
      supplierId: form.supplierId ? parseInt(form.supplierId) : undefined,
      unit: form.unit, isInventoriable: form.isInventoriable,
      isBillable: form.isBillable, isFavorite: form.isFavorite
    };

    if (editProduct) {
      updateMutation.mutate({ id: editProduct.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const clearFilters = () => {
    setCategoryFilter("");
    setBrandFilter("");
    setSupplierFilter("");
    setMinPrice("");
    setMaxPrice("");
    setShowZeroStock(true);
  };

  const today = new Date();
  const sevenDays = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

  if (isLoading) {
    return <Layout><Skeleton className="h-96" /></Layout>;
  }

  return (
    <Layout>
      {/* Title */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight text-center">INVENTARIO DE PRODUCTOS</h1>
      </div>

      {/* Advanced Filters */}
      <Card className="border border-gray-200 shadow-sm mb-4">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="showZero" checked={showZeroStock} onChange={e => setShowZeroStock(e.target.checked)} className="rounded border-gray-300" />
            <Label htmlFor="showZero" className="text-sm cursor-pointer">No incluir items con unidades en 0 (Esto no aplica para items no inventariables)</Label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Categoria</Label>
              <Input placeholder="Buscar categoria..." value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Marca</Label>
              <Input placeholder="Buscar marca..." value={brandFilter} onChange={e => setBrandFilter(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Proveedor</Label>
              <select className="w-full h-8 rounded-md border border-gray-300 bg-white px-2 text-sm" value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)}>
                <option value="">Todos</option>
                {suppliers?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Subcategoria</Label>
              <select className="w-full h-8 rounded-md border border-gray-300 bg-white px-2 text-sm">
                <option value="">Todos</option>
                <option value="Nacional">Nacional</option>
                <option value="Importado">Importado</option>
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Valor precio venta</Label>
              <div className="flex gap-1">
                <Input placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)} className="h-8 text-sm" />
                <Input placeholder="Max" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} className="h-8 text-sm" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Fecha Vencimiento</Label>
              <Input type="date" className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-500">Semaforizacion</Label>
              <select className="w-full h-8 rounded-md border border-gray-300 bg-white px-2 text-sm">
                <option value="">Todos</option>
                <option value="ok">OK</option>
                <option value="low">Bajo Stock</option>
                <option value="expiry">Por Vencer</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-[#1ABC9C] hover:bg-[#16a085] text-white h-8 text-sm" onClick={clearFilters}>
                <Search className="w-3.5 h-3.5 mr-1" /> BUSCAR
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Search + Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="BUSCAR..." className="pl-9 border-gray-300" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#1ABC9C] hover:bg-[#16a085] text-white shadow-sm" onClick={() => { setEditProduct(null); resetForm(); }}>
              <Plus className="w-4 h-4 mr-2" /> Nuevo producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-center bg-[#1ABC9C] text-white py-2 rounded-md">
                {editProduct ? "EDITAR PRODUCTO" : "INFORMACION DEL NUEVO PRODUCTO"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Photo upload area */}
              <div className="flex justify-center">
                <div className="w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100">
                  <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">FOTOGRAFIA</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Tipo de Producto</Label>
                  <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-2 text-sm" value={form.unit === "six-pack" ? "combo" : "unique"} onChange={e => setForm({...form, unit: e.target.value === "combo" ? "six-pack" : "botella"})}>
                    <option value="unique">Unico</option>
                    <option value="combo">Compuesto</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Cantidad Stock Minima</Label>
                  <Input type="number" value={form.minStock} onChange={e => setForm({...form, minStock: e.target.value})} className="h-10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Cantidad Stock Maxima</Label>
                  <Input type="number" value={form.maxStock} onChange={e => setForm({...form, maxStock: e.target.value})} className="h-10" />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="inv" checked={form.isInventoriable} onChange={e => setForm({...form, isInventoriable: e.target.checked})} />
                  <Label htmlFor="inv" className="text-sm">Inventariable</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="bill" checked={form.isBillable} onChange={e => setForm({...form, isBillable: e.target.checked})} />
                  <Label htmlFor="bill" className="text-sm">Producto facturable</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="fav" checked={form.isFavorite} onChange={e => setForm({...form, isFavorite: e.target.checked})} />
                  <Label htmlFor="fav" className="text-sm">Favorito</Label>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Nombre del Producto</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Descripcion o nombre del producto" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Codigo</Label>
                  <Input value={form.code} onChange={e => setForm({...form, code: e.target.value})} placeholder="Escriba un codigo" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Codigo de Barras</Label>
                  <Input value={form.barcode} onChange={e => setForm({...form, barcode: e.target.value})} placeholder="Barcode" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Precio de compra (sin impuesto)</Label>
                  <Input type="number" value={form.cost} onChange={e => setForm({...form, cost: e.target.value})} placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Precio de venta</Label>
                  <div className="space-y-1">
                    <Input type="number" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="Precio 1" />
                    <Input type="number" value={form.price2} onChange={e => setForm({...form, price2: e.target.value})} placeholder="Precio 2" className="text-xs" />
                    <Input type="number" value={form.price3} onChange={e => setForm({...form, price3: e.target.value})} placeholder="Precio 3" className="text-xs" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Categoria</Label>
                  <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-2" value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}>
                    <option value="">Seleccionar</option>
                    {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Marca</Label>
                  <Input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="Marca" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Clasificacion Tributaria</Label>
                <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-2" value={form.taxType} onChange={e => setForm({...form, taxType: e.target.value})}>
                  <option value="exempt">Exento</option>
                  <option value="taxed">Gravado</option>
                  <option value="included">Incluido</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Descripcion</Label>
                <Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Descripcion del producto" />
              </div>

              <Button
                onClick={handleSave}
                disabled={(editProduct ? updateMutation.isPending : createMutation.isPending) || !form.code || !form.name || !form.cost || !form.price}
                className="bg-[#1ABC9C] hover:bg-[#16a085] text-white shadow-sm"
              >
                {(editProduct ? updateMutation.isPending : createMutation.isPending) ? "Guardando..." : (editProduct ? "Actualizar Producto" : "Guardar Producto")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Products Table */}
      <Card className="border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1ABC9C] text-white">
                <th className="px-2 py-3 text-center font-semibold w-10">Editar</th>
                <th className="px-2 py-3 text-center font-semibold w-10">Foto</th>
                <th className="px-3 py-3 text-left font-semibold">Codigo</th>
                <th className="px-3 py-3 text-left font-semibold">Nombre</th>
                <th className="px-3 py-3 text-right font-semibold">Precio/Cpra</th>
                <th className="px-3 py-3 text-center font-semibold">Cantidad Actual</th>
                <th className="px-3 py-3 text-right font-semibold">Precio/Venta</th>
                <th className="px-3 py-3 text-center font-semibold">Imp/Venta</th>
                <th className="px-3 py-3 text-center font-semibold">Tipo</th>
                <th className="px-3 py-3 text-left font-semibold">Categoria</th>
                <th className="px-3 py-3 text-center font-semibold">Min</th>
                <th className="px-3 py-3 text-center font-semibold">Max</th>
                <th className="px-3 py-3 text-left font-semibold">Proveedor</th>
                <th className="px-3 py-3 text-center font-semibold w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products?.map((product, idx) => {
                const totalStock = product.totalQty || product.inventory?.reduce((sum: number, inv: any) => sum + (inv.quantity || 0), 0) || 0;
                const isLowStock = totalStock <= (product.minStock || 0);
                const nearExpiry = product.batches?.some((b: any) => b.status === 'active' && b.expiryDate && new Date(b.expiryDate) <= sevenDays && new Date(b.expiryDate) > today);
                return (
                  <tr key={product.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                    <td className="px-2 py-3 text-center">
                      <button onClick={() => startEdit(product)} className="text-gray-400 hover:text-[#1ABC9C]"><Edit2 className="w-3.5 h-3.5" /></button>
                    </td>
                    <td className="px-2 py-3 text-center">
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center mx-auto">
                        {product.photoUrl ? <img src={product.photoUrl} className="w-6 h-6 object-cover rounded" /> : <Package className="w-4 h-4 text-gray-400" />}
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">{product.code}</td>
                    <td className="px-3 py-3 font-medium text-gray-800">{product.name}</td>
                    <td className="px-3 py-3 text-right text-gray-600">{formatCurrency(product.cost || 0)}</td>
                    <td className="px-3 py-3 text-center">
                      <div className="space-y-0.5">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded block w-fit mx-auto ${isLowStock ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          Total: {totalStock}
                        </span>
                        {product.batches?.map((b: any, i: number) => (
                          <span key={i} className="text-[10px] text-gray-500 block">{b.quantity}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right font-medium">{formatCurrency(product.price || 0)}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                        {product.taxType === 'exempt' ? 'Exento' : product.taxType === 'taxed' ? `Gravado ${product.taxRate}%` : 'Incluido'}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{product.isCombo ? 'Compuesto' : 'Unico'}</span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600">{product.category?.name || "-"} <span className="text-gray-400">/ {product.subcategory || "-"}</span></td>
                    <td className="px-3 py-3 text-center text-xs">{product.minStock}</td>
                    <td className="px-3 py-3 text-center text-xs">{product.maxStock}</td>
                    <td className="px-3 py-3 text-xs text-gray-500">{product.supplier?.name || "-"}</td>
                    <td className="px-2 py-3 text-center">
                      <button onClick={() => { if (confirm('Eliminar producto?')) deleteMutation.mutate(product.id); }} className="text-red-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {products?.length === 0 && <div className="text-center py-12 text-gray-400"><Package className="w-10 h-10 mx-auto mb-2" /><p>No se encontraron productos</p></div>}
      </Card>
    </Layout>
  );
}
