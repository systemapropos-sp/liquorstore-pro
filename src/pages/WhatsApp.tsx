import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/providers/trpc";
import {
  MessageCircle, Send, Phone, Check, CheckCheck, Clock, AlertCircle,
  QrCode, Wifi, WifiOff, Search, User, FileText, Plus, Trash2
} from "lucide-react";

export default function WhatsAppPage() {
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [search, setSearch] = useState("");
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateContent, setNewTemplateContent] = useState("");
  const [newTemplateVars, setNewTemplateVars] = useState("");

  const { data: sessions = [] } = trpc.whatsapp.sessionList.useQuery();
  const { data: messages = [] } = trpc.whatsapp.messageList.useQuery(
    selectedPhone ? { phone: selectedPhone } : undefined
  );
  const { data: templates = [] } = trpc.whatsapp.templateList.useQuery();
  const { data: customers = [] } = trpc.customer.list.useQuery({});

  const connect = trpc.whatsapp.connect.useMutation();
  const disconnect = trpc.whatsapp.disconnect.useMutation();
  const sendMessage = trpc.whatsapp.sendMessage.useMutation({
    onSuccess: () => setMessageText("")
  });
  const markRead = trpc.whatsapp.markRead.useMutation();
  const createTemplate = trpc.whatsapp.templateCreate.useMutation({
    onSuccess: () => {
      setTemplateDialogOpen(false);
      setNewTemplateName("");
      setNewTemplateContent("");
      setNewTemplateVars("");
    }
  });
  const deleteTemplate = trpc.whatsapp.templateDelete.useMutation();

  const session = sessions[0];

  // Group messages by phone for the sidebar
  const conversations = messages.reduce((acc: any, msg: any) => {
    const phone = msg.phone;
    if (!acc[phone]) {
      acc[phone] = { phone, contactName: msg.contactName, lastMessage: msg, unread: 0 };
    }
    if (msg.status === 'unread' && msg.type === 'received') acc[phone].unread++;
    if (new Date(msg.createdAt) > new Date(acc[phone].lastMessage.createdAt)) {
      acc[phone].lastMessage = msg;
    }
    return acc;
  }, {} as Record<string, any>);

  const conversationList = Object.values(conversations).sort(
    (a: any, b: any) => new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime()
  );

  const filteredConversations = search
    ? conversationList.filter((c: any) =>
        c.contactName?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
      )
    : conversationList;

  function handleSend() {
    if (!messageText.trim() || !selectedPhone) return;
    sendMessage.mutate({
      phone: selectedPhone,
      content: messageText,
      sessionId: session?.id || 1
    });
  }

  function handleSendBalance(customer: any) {
    const balance = customer.type === 'credit' ? `RD$${parseFloat(customer.totalPurchased).toLocaleString()}` : 'RD$0.00';
    const template = templates.find((t: any) => t.name === 'Balance de Cuenta');
    const content = template
      ? template.content
          .replace('{{nombre}}', customer.name)
          .replace('{{balance}}', balance)
          .replace('{{fecha_corte}}', new Date().toLocaleDateString())
      : `Hola ${customer.name}, su balance actual es ${balance}. Fecha: ${new Date().toLocaleDateString()}`;
    sendMessage.mutate({
      phone: customer.phone,
      content,
      sessionId: session?.id || 1,
      templateName: template?.name
    });
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">WhatsApp Business</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona pedidos y envia balances a clientes</p>
        </div>
        <div className="flex items-center gap-3">
          {session?.status === 'connected' ? (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-sm">
              <Wifi className="w-4 h-4" /> Conectado
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1.5 rounded-full text-sm">
              <WifiOff className="w-4 h-4" /> Desconectado
            </div>
          )}
          {session?.status === 'disconnected' && (
            <Button size="sm" className="btn-emerald" onClick={() => connect.mutate(session.id)}>
              <QrCode className="w-4 h-4 mr-1" /> Conectar
            </Button>
          )}
          {session?.status === 'connected' && (
            <Button size="sm" variant="outline" onClick={() => disconnect.mutate(session.id)}>
              Desconectar
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="chat">Conversaciones</TabsTrigger>
          <TabsTrigger value="clientes">Enviar a Clientes</TabsTrigger>
          <TabsTrigger value="plantillas">Plantillas</TabsTrigger>
        </TabsList>

        <TabsContent value="chat">
          <div className="bg-white rounded-lg border flex h-[600px]">
            {/* Sidebar */}
            <div className="w-80 border-r flex flex-col">
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar conversacion..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.map((conv: any) => (
                  <div
                    key={conv.phone}
                    onClick={() => { setSelectedPhone(conv.phone); }}
                    className={`p-3 cursor-pointer border-b hover:bg-gray-50 ${
                      selectedPhone === conv.phone ? 'bg-emerald-50' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-800">{conv.contactName || conv.phone}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[180px]">{conv.lastMessage.content}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">{new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        {conv.unread > 0 && (
                          <span className="inline-flex items-center justify-center w-5 h-5 bg-[#1ABC9C] text-white text-xs rounded-full mt-1">{conv.unread}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredConversations.length === 0 && (
                  <div className="p-4 text-center text-gray-400 text-sm">Sin conversaciones</div>
                )}
              </div>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col">
              {selectedPhone ? (
                <>
                  <div className="p-3 border-b flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-500" />
                    </div>
                    <span className="font-medium text-gray-800">
                      {messages.find((m: any) => m.phone === selectedPhone)?.contactName || selectedPhone}
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages
                      .filter((m: any) => m.phone === selectedPhone)
                      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                      .map((msg: any) => (
                        <div key={msg.id} className={`flex ${msg.type === 'sent' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                            msg.type === 'sent'
                              ? 'bg-[#1ABC9C] text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <p>{msg.content}</p>
                            <div className={`flex items-center gap-1 mt-1 text-xs ${msg.type === 'sent' ? 'text-emerald-100' : 'text-gray-400'}`}>
                              <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {msg.type === 'sent' && (
                                msg.status === 'delivered' ? <CheckCheck className="w-3 h-3" /> :
                                msg.status === 'sent' ? <Check className="w-3 h-3" /> :
                                <Clock className="w-3 h-3" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                  <div className="p-3 border-t flex gap-2">
                    <Input
                      placeholder="Escribe un mensaje..."
                      value={messageText}
                      onChange={e => setMessageText(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSend()}
                      className="flex-1"
                    />
                    <Button className="btn-emerald" onClick={handleSend} disabled={sendMessage.isPending}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Selecciona una conversacion</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="clientes">
          <div className="bg-white rounded-lg border">
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Buscar cliente..." className="pl-10" />
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#1ABC9C] text-white">
                    <th className="px-3 py-2 text-left">Cliente</th>
                    <th className="px-3 py-2 text-left">Telefono</th>
                    <th className="px-3 py-2 text-left">Tipo</th>
                    <th className="px-3 py-2 text-right">Total Comprado</th>
                    <th className="px-3 py-2 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c: any) => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">{c.name}</td>
                      <td className="px-3 py-2">{c.phone}</td>
                      <td className="px-3 py-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${c.type === 'credit' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {c.type === 'credit' ? 'Credito' : 'Contado'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right">RD${parseFloat(c.totalPurchased).toLocaleString()}</td>
                      <td className="px-3 py-2 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#1ABC9C] text-[#1ABC9C]"
                          onClick={() => handleSendBalance(c)}
                          disabled={!c.phone || sendMessage.isPending}
                        >
                          <FileText className="w-4 h-4 mr-1" /> Enviar Balance
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="plantillas">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Plantillas de Mensajes</h3>
            <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="btn-emerald"><Plus className="w-4 h-4 mr-1" /> Nueva Plantilla</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Nueva Plantilla</DialogTitle></DialogHeader>
                <div className="space-y-3 pt-2">
                  <div><label className="text-sm font-medium">Nombre</label><Input value={newTemplateName} onChange={e => setNewTemplateName(e.target.value)} /></div>
                  <div><label className="text-sm font-medium">Contenido</label><Input value={newTemplateContent} onChange={e => setNewTemplateContent(e.target.value)} /></div>
                  <div><label className="text-sm font-medium">Variables (separadas por coma)</label><Input value={newTemplateVars} onChange={e => setNewTemplateVars(e.target.value)} placeholder="nombre,balance,fecha" /></div>
                  <Button className="w-full btn-emerald" onClick={() => createTemplate.mutate({ name: newTemplateName, content: newTemplateContent, variables: newTemplateVars })} disabled={createTemplate.isPending}>Crear</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((t: any) => (
              <div key={t.id} className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">{t.name}</h4>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => deleteTemplate.mutate(t.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{t.content}</p>
                <p className="text-xs text-gray-400 mt-2">Variables: {t.variables}</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
