import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/providers/trpc";
import {
  ArrowLeft, Plus, Save, X, DoorOpen, DoorClosed,
  UserCheck, Banknote, ArrowRightLeft, Clock
} from "lucide-react";

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(
    typeof value === "string" ? parseFloat(value || "0") : value
  );
}

export default function InvoiceResponsibles() {
  const [activeTab, setActiveTab] = useState("registers");
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showShiftDialog, setShowShiftDialog] = useState(false);
  const [selectedRegister, setSelectedRegister] = useState<any>(null);

  // Forms
  const [openForm, setOpenForm] = useState({ cashierName: "", baseAmount: "" });
  const [closeForm, setCloseForm] = useState({ finalAmount: "" });
  const [shiftForm, setShiftForm] = useState({ newCashierName: "" });

  const { data: registers = [], refetch } = trpc.cashRegister.list.useQuery({});
  const { data: branches = [] } = trpc.branch.list.useQuery();
  const updateRegister = trpc.cashRegister.update.useMutation({ onSuccess: () => refetch() });

  const handleOpenRegister = (reg: any) => {
    setSelectedRegister(reg);
    setOpenForm({ cashierName: "", baseAmount: "" });
    setShowOpenDialog(true);
  };

  const confirmOpenRegister = () => {
    if (!selectedRegister || !openForm.cashierName || !openForm.baseAmount) return;
    updateRegister.mutate({
      id: selectedRegister.id,
      status: "open",
      cashierName: openForm.cashierName,
      baseAmount: openForm.baseAmount,
      currentAmount: openForm.baseAmount,
      openedAt: new Date().toISOString()
    });
    setShowOpenDialog(false);
  };

  const handleCloseRegister = (reg: any) => {
    setSelectedRegister(reg);
    setCloseForm({ finalAmount: "" });
    setShowCloseDialog(true);
  };

  const confirmCloseRegister = () => {
    if (!selectedRegister) return;
    updateRegister.mutate({
      id: selectedRegister.id,
      status: "closed",
      currentAmount: closeForm.finalAmount || selectedRegister.currentAmount,
      closedAt: new Date().toISOString()
    });
    setShowCloseDialog(false);
  };

  const handleShiftChange = (reg: any) => {
    setSelectedRegister(reg);
    setShiftForm({ newCashierName: "" });
    setShowShiftDialog(true);
  };

  const confirmShiftChange = () => {
    if (!selectedRegister || !shiftForm.newCashierName) return;
    updateRegister.mutate({
      id: selectedRegister.id,
      cashierName: shiftForm.newCashierName,
      shiftChangedAt: new Date().toISOString()
    });
    setShowShiftDialog(false);
  };

  const openRegisters = registers.filter((r: any) => r.status === "open");
  const closedRegisters = registers.filter((r: any) => r.status === "closed");

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link to="/facturacion" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">RESPONSABLES DE CAJA</h1>
          <p className="text-sm text-gray-500">Gestion de cajas, aperturas, cierres y cambios de turno</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <DoorOpen className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{openRegisters.length}</p>
            <p className="text-xs text-gray-500">Cajas Abiertas</p>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <DoorClosed className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{closedRegisters.length}</p>
            <p className="text-xs text-gray-500">Cajas Cerradas</p>
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <Banknote className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {formatCurrency(openRegisters.reduce((sum: number, r: any) => sum + parseFloat(r.currentAmount || "0"), 0))}
            </p>
            <p className="text-xs text-gray-500">Efectivo en cajas abiertas</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-4 border-b">
        <button
          onClick={() => setActiveTab("registers")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "registers" ? "border-b-2 border-[#1ABC9C] text-[#1ABC9C]" : "text-gray-500 hover:text-gray-700"}`}
        >
          CAJAS REGISTRADORAS
        </button>
        <button
          onClick={() => setActiveTab("shifts")}
          className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === "shifts" ? "border-b-2 border-[#1ABC9C] text-[#1ABC9C]" : "text-gray-500 hover:text-gray-700"}`}
        >
          HISTORIAL DE TURNOS
        </button>
      </div>

      {/* Cajas Registradoras Tab */}
      {activeTab === "registers" && (
        <div className="space-y-4">
          {registers.map((reg: any) => {
            const isOpen = reg.status === "open";
            const branch = branches.find((b: any) => b.id === reg.branchId);
            return (
              <div key={reg.id} className={`bg-white border rounded-lg overflow-hidden ${isOpen ? "border-emerald-300" : "border-gray-200"}`}>
                {/* Card Header */}
                <div className={`px-4 py-3 flex items-center justify-between ${isOpen ? "bg-emerald-50" : "bg-gray-50"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isOpen ? "bg-emerald-500" : "bg-gray-400"}`}>
                      {isOpen ? <DoorOpen className="w-4 h-4 text-white" /> : <DoorClosed className="w-4 h-4 text-white" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{reg.name}</h3>
                      <p className="text-xs text-gray-500">{branch?.name || "Sucursal Principal"} - {reg.location || "Recepcion"}</p>
                    </div>
                  </div>
                  <Badge className={`text-xs ${isOpen ? "bg-emerald-500 text-white hover:bg-emerald-500" : "bg-gray-400 text-white hover:bg-gray-400"}`}>
                    {isOpen ? "ABIERTA" : "CERRADA"}
                  </Badge>
                </div>

                {/* Card Body */}
                <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Cajero Responsable</p>
                    <p className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#1ABC9C]" />
                      {reg.cashierName || "Sin asignar"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Monto Base</p>
                    <p className="text-sm font-medium text-gray-800">
                      {formatCurrency(reg.baseAmount || "0")}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Monto Actual</p>
                    <p className="text-sm font-bold text-[#1ABC9C]">
                      {formatCurrency(reg.currentAmount || "0")}
                    </p>
                  </div>
                  {reg.openedAt && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Hora Apertura</p>
                      <p className="text-sm text-gray-700 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(reg.openedAt).toLocaleString("es-DO")}
                      </p>
                    </div>
                  )}
                  {reg.closedAt && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Hora Cierre</p>
                      <p className="text-sm text-gray-700 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        {new Date(reg.closedAt).toLocaleString("es-DO")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-4 py-3 border-t bg-gray-50/50 flex gap-2 flex-wrap">
                  {!isOpen ? (
                    <Button
                      size="sm"
                      className="bg-[#1ABC9C] hover:bg-[#16a085] text-white text-xs"
                      onClick={() => handleOpenRegister(reg)}
                    >
                      <DoorOpen className="w-3.5 h-3.5 mr-1" /> ABRIR CAJA
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-amber-400 text-amber-600 hover:bg-amber-50"
                        onClick={() => handleShiftChange(reg)}
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5 mr-1" /> CAMBIO DE TURNO
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs border-red-400 text-red-600 hover:bg-red-50"
                        onClick={() => handleCloseRegister(reg)}
                      >
                        <DoorClosed className="w-3.5 h-3.5 mr-1" /> CERRAR CAJA
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {registers.length === 0 && (
            <div className="text-center py-12 text-gray-400 bg-white border rounded-lg">
              <Banknote className="w-10 h-10 mx-auto mb-2" />
              <p className="text-sm">No hay cajas registradoras configuradas</p>
              <p className="text-xs mt-1">Configure las cajas en Ajustes {'>'} Cajas</p>
            </div>
          )}
        </div>
      )}

      {/* Historial de Turnos Tab */}
      {activeTab === "shifts" && (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#1ABC9C] text-white">
                <th className="px-3 py-3 text-left">CAJA</th>
                <th className="px-3 py-3 text-left">CAJERO</th>
                <th className="px-3 py-3 text-left">ACCION</th>
                <th className="px-3 py-3 text-right">MONTO BASE</th>
                <th className="px-3 py-3 text-right">MONTO CIERRE</th>
                <th className="px-3 py-3 text-left">FECHA/HORA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {registers
                .filter((r: any) => r.openedAt)
                .map((reg: any) => (
                  <tr key={reg.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 font-medium text-gray-800">{reg.name}</td>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-1.5">
                        <UserCheck className="w-3.5 h-3.5 text-[#1ABC9C]" />
                        {reg.cashierName || "N/A"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <Badge className={`text-[10px] ${reg.status === "open" ? "bg-emerald-500 text-white" : "bg-gray-400 text-white"}`}>
                        {reg.status === "open" ? "ABIERTA" : "CERRADA"}
                      </Badge>
                    </td>
                    <td className="px-3 py-3 text-right">{formatCurrency(reg.baseAmount || "0")}</td>
                    <td className="px-3 py-3 text-right font-medium">
                      {reg.status === "closed" ? formatCurrency(reg.currentAmount || "0") : "-"}
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-500">
                      {reg.openedAt ? new Date(reg.openedAt).toLocaleString("es-DO") : "-"}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {registers.filter((r: any) => r.openedAt).length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              <Clock className="w-8 h-8 mx-auto mb-2" />
              <p>No hay historial de turnos aun</p>
            </div>
          )}
        </div>
      )}

      {/* Dialog: Abrir Caja */}
      <Dialog open={showOpenDialog} onOpenChange={setShowOpenDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center bg-[#1ABC9C] text-white py-2 rounded-md text-sm">
              ABRIR CAJA - {selectedRegister?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm text-gray-500 block mb-1">Nombre del Cajero</label>
              <Input
                placeholder="Nombre completo del cajero..."
                value={openForm.cashierName}
                onChange={e => setOpenForm({ ...openForm, cashierName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Monto Base (Efectivo inicial)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={openForm.baseAmount}
                onChange={e => setOpenForm({ ...openForm, baseAmount: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowOpenDialog(false)}>
                <X className="w-4 h-4 mr-1" /> Cancelar
              </Button>
              <Button
                className="flex-1 bg-[#1ABC9C] hover:bg-[#16a085] text-white"
                onClick={confirmOpenRegister}
                disabled={!openForm.cashierName || !openForm.baseAmount}
              >
                <DoorOpen className="w-4 h-4 mr-1" /> ABRIR CAJA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Cerrar Caja */}
      <Dialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center bg-red-500 text-white py-2 rounded-md text-sm">
              CERRAR CAJA - {selectedRegister?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
              <p><span className="text-gray-500">Cajero:</span> <span className="font-medium">{selectedRegister?.cashierName}</span></p>
              <p><span className="text-gray-500">Monto base:</span> <span className="font-medium">{formatCurrency(selectedRegister?.baseAmount || "0")}</span></p>
              <p><span className="text-gray-500">Monto actual:</span> <span className="font-bold text-[#1ABC9C]">{formatCurrency(selectedRegister?.currentAmount || "0")}</span></p>
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Monto Final de Cierre</label>
              <Input
                type="number"
                placeholder="0.00"
                value={closeForm.finalAmount}
                onChange={e => setCloseForm({ ...closeForm, finalAmount: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowCloseDialog(false)}>
                <X className="w-4 h-4 mr-1" /> Cancelar
              </Button>
              <Button
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                onClick={confirmCloseRegister}
              >
                <DoorClosed className="w-4 h-4 mr-1" /> CERRAR CAJA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Cambio de Turno */}
      <Dialog open={showShiftDialog} onOpenChange={setShowShiftDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center bg-amber-500 text-white py-2 rounded-md text-sm">
              CAMBIO DE TURNO - {selectedRegister?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p><span className="text-gray-500">Cajero actual:</span> <span className="font-medium">{selectedRegister?.cashierName}</span></p>
              <p><span className="text-gray-500">Monto en caja:</span> <span className="font-bold text-[#1ABC9C]">{formatCurrency(selectedRegister?.currentAmount || "0")}</span></p>
            </div>
            <div>
              <label className="text-sm text-gray-500 block mb-1">Nuevo Cajero</label>
              <Input
                placeholder="Nombre completo del nuevo cajero..."
                value={shiftForm.newCashierName}
                onChange={e => setShiftForm({ ...shiftForm, newCashierName: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowShiftDialog(false)}>
                <X className="w-4 h-4 mr-1" /> Cancelar
              </Button>
              <Button
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                onClick={confirmShiftChange}
                disabled={!shiftForm.newCashierName}
              >
                <ArrowRightLeft className="w-4 h-4 mr-1" /> CAMBIAR TURNO
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
