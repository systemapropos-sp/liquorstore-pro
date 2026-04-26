import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { Layout } from "@/components/Layout";
import { ArrowLeft, Plus, Search, Trash2, Edit2, Image, Upload } from "lucide-react";

export default function CategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [name, setName] = useState("");
  const [imagePreview, setImagePreview] = useState("");

  const { data: categories = [], refetch } = trpc.category.list.useQuery({});
  const createCat = trpc.category.create.useMutation({ onSuccess: () => { setShowForm(false); setName(""); setImagePreview(""); refetch(); } });

  const filtered = categories.filter((c: any) =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <Layout>
      <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/inventario" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-800">CREAR CATEGORIAS</h1>
      </div>

      <div className="bg-white border rounded-lg p-6 mb-6">
        <h3 className="text-center text-[#1ABC9C] font-semibold mb-4">AGREGAR CATEGORIA</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium block mb-2">Imagen de la categoria</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#1ABC9C] transition-colors">
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-24 h-24 object-cover rounded mx-auto mb-3" />
              ) : (
                <Image className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              )}
              <p className="text-xs text-gray-500 mb-2">Formatos permitidos: JPG, JPEG, PNG</p>
              <label className="inline-block bg-[#1ABC9C] text-white px-4 py-2 rounded text-sm cursor-pointer hover:bg-[#16a085]">
                <Upload className="w-4 h-4 inline mr-1" /> Elija la imagen
                <input type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>
          </div>
          <div className="flex flex-col justify-end">
            <label className="text-sm font-medium block mb-2">Categoria nueva</label>
            <Input placeholder="Nombre de la categoria" value={name} onChange={e => setName(e.target.value)} className="mb-3" />
            <Button className="btn-emerald w-full" onClick={() => createCat.mutate({ name, type: "other" })} disabled={!name || createCat.isPending}>
              <Plus className="w-4 h-4 mr-2" /> REGISTRAR
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder="Buscar categoria..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
        </div>
        <div className="flex gap-2 ml-auto">
          <button className="px-3 py-1 text-sm bg-emerald-100 text-emerald-700 rounded">Activas</button>
          <button className="px-3 py-1 text-sm bg-gray-100 text-gray-500 rounded">Inactivas</button>
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-[#1ABC9C] text-white">
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">IMAGEN</th>
              <th className="px-3 py-2 text-left">NOMBRE</th>
              <th className="px-3 py-2 text-left">OPCIONES</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c: any, i: number) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2">
                  <div className="w-10 h-10 rounded bg-gray-200 flex items-center justify-center">
                    <Image className="w-5 h-5 text-gray-400" />
                  </div>
                </td>
                <td className="px-3 py-2 font-medium">{c.name}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-2">
                    <button className="text-blue-500"><Edit2 className="w-4 h-4" /></button>
                    <button className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={4} className="px-3 py-6 text-center text-gray-400">Sin categorias</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
    </Layout>
  );
}
