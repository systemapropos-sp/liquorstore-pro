import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import { ArrowLeft, Mail, Save } from "lucide-react";

export default function EmailSettings() {
  const { data: config } = trpc.emailConfig.get.useQuery();
  const saveConfig = trpc.emailConfig.save.useMutation();
  const [form, setForm] = useState({ emailType: "Gmail", host: "", port: "", email: "", password: "", encryption: "tls" });

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/ajustes" className="text-gray-500 hover:text-gray-700"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-2xl font-bold text-gray-800">CONFIGURACION CORREO NOTIFICACIONES</h1>
      </div>

      <div className="max-w-xl mx-auto bg-white border rounded-lg p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#1ABC9C] flex items-center justify-center mx-auto mb-3">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <p className="text-sm text-gray-500">Configure el servicio de SMTP para enviar las notificaciones via Email.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Tipo de Email</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.emailType} onChange={e => setForm({...form, emailType: e.target.value})}>
              <option value="Gmail">Gmail</option>
              <option value="Outlook">Outlook</option>
              <option value="Yahoo">Yahoo</option>
              <option value="Otro">Otro</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium block mb-1">Host</label><Input value={form.host} onChange={e => setForm({...form, host: e.target.value})} placeholder="smtp.gmail.com" /></div>
            <div><label className="text-sm font-medium block mb-1">Puerto</label><Input value={form.port} onChange={e => setForm({...form, port: e.target.value})} placeholder="587" /></div>
          </div>
          <div><label className="text-sm font-medium block mb-1">Email</label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="ejemplo@gmail.com" /></div>
          <div><label className="text-sm font-medium block mb-1">Contrasena</label><Input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Contraseña" /></div>
          <div>
            <label className="text-sm font-medium block mb-1">Encriptacion</label>
            <select className="w-full border rounded-md px-3 py-2 text-sm" value={form.encryption} onChange={e => setForm({...form, encryption: e.target.value})}>
              <option value="tls">TLS</option>
              <option value="ssl">SSL</option>
              <option value="none">Ninguna</option>
            </select>
          </div>
          <Button className="w-full btn-emerald" onClick={() => saveConfig.mutate(form)} disabled={saveConfig.isPending}><Save className="w-4 h-4 mr-2" /> GUARDAR</Button>
        </div>
      </div>
    </div>
  );
}
