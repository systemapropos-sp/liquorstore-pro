import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, UserCircle, Trash2, Edit2, ImageIcon, DollarSign, Calendar, Briefcase } from "lucide-react";

function formatCurrency(value: number | string) {
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP" }).format(
    typeof value === "string" ? parseFloat(value || "0") : value
  );
}

export default function Employees() {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [loanOpen, setLoanOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  const [editEmployee, setEditEmployee] = useState<any>(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const [form, setForm] = useState({
    firstName: "", middleName: "", lastName: "", secondLastName: "",
    idNumber: "", phone: "", email: "", address: "", city: "",
    position: "", branchId: "", hireDate: "", salary: "", photoUrl: ""
  });

  const [loanForm, setLoanForm] = useState({ employeeId: "", amount: "", installments: "", notes: "" });
  const [paymentForm, setPaymentForm] = useState({ loanId: "", amount: "", notes: "" });

  const { data: employees, isLoading } = trpc.employee.list.useQuery({ search: search || undefined });
  const { data: branches } = trpc.branch.list.useQuery();
  const { data: loans } = trpc.employeeLoan.list.useQuery();

  const utils = trpc.useUtils();
  const createMutation = trpc.employee.create.useMutation({
    onSuccess: () => { utils.employee.list.invalidate(); setOpen(false); resetForm(); }
  });
  const updateMutation = trpc.employee.update.useMutation({
    onSuccess: () => { utils.employee.list.invalidate(); setOpen(false); setEditEmployee(null); resetForm(); }
  });
  const deleteMutation = trpc.employee.delete.useMutation({
    onSuccess: () => utils.employee.list.invalidate()
  });
  const loanCreate = trpc.employeeLoan.create.useMutation({
    onSuccess: () => { utils.employeeLoan.list.invalidate(); setLoanOpen(false); setLoanForm({ employeeId: "", amount: "", installments: "", notes: "" }); }
  });
  const paymentCreate = trpc.loanPayment.create.useMutation({
    onSuccess: () => { utils.employeeLoan.list.invalidate(); setPaymentOpen(false); setPaymentForm({ loanId: "", amount: "", notes: "" }); }
  });

  const resetForm = () => {
    setForm({ firstName: "", middleName: "", lastName: "", secondLastName: "", idNumber: "", phone: "", email: "", address: "", city: "", position: "", branchId: "", hireDate: "", salary: "", photoUrl: "" });
    setPhotoPreview("");
  };

  const startEdit = (emp: any) => {
    setEditEmployee(emp);
    setForm({
      firstName: emp.firstName || "", middleName: emp.middleName || "", lastName: emp.lastName || "", secondLastName: emp.secondLastName || "",
      idNumber: emp.idNumber || "", phone: emp.phone || "", email: emp.email || "", address: emp.address || "", city: emp.city || "",
      position: emp.position || "", branchId: String(emp.branchId || ""), hireDate: emp.hireDate || "", salary: emp.salary || "", photoUrl: emp.photoUrl || ""
    });
    setPhotoPreview(emp.photoUrl || "");
    setOpen(true);
  };

  const handleSave = () => {
    const data = { ...form, salary: form.salary || "0.00", branchId: form.branchId ? parseInt(form.branchId) : undefined };
    if (editEmployee) {
      updateMutation.mutate({ id: editEmployee.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPhotoPreview(base64);
      setForm(prev => ({ ...prev, photoUrl: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const openLoan = (emp: any) => {
    setSelectedEmployee(emp);
    setLoanForm({ employeeId: String(emp.id), amount: "", installments: "", notes: "" });
    setLoanOpen(true);
  };

  const openPayment = (loan: any) => {
    setSelectedLoan(loan);
    setPaymentForm({ loanId: String(loan.id), amount: "", notes: "" });
    setPaymentOpen(true);
  };

  if (isLoading) {
    return <Layout><Skeleton className="h-96" /></Layout>;
  }

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Empleados</h1>
            <p className="text-muted-foreground">Gestion de personal y prestamos</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-gray-300 text-gray-600" onClick={() => setLoanOpen(true)}>
              <DollarSign className="w-4 h-4 mr-1" /> Prestamos
            </Button>
            <Button className="bg-[#1ABC9C] hover:bg-[#16a085] text-white shadow-sm" onClick={() => { setEditEmployee(null); resetForm(); setOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Nuevo Empleado
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Buscar empleados..." className="pl-9 border-gray-300" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Employees Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees?.map((emp: any) => {
            const empLoans = loans?.filter((l: any) => l.employeeId === emp.id && l.status === "active") || [];
            return (
              <Card key={emp.id} className="border border-gray-200 shadow-sm p-4">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {emp.photoUrl ? <img src={emp.photoUrl} className="w-full h-full object-cover" /> : <UserCircle className="w-8 h-8 text-gray-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-gray-800 truncate">{emp.firstName} {emp.lastName}</p>
                    <p className="text-xs text-[#1ABC9C]">{emp.position}</p>
                    <p className="text-xs text-gray-500">{emp.idNumber}</p>
                    <p className="text-xs text-gray-500">{emp.phone}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {emp.hireDate ? new Date(emp.hireDate).toLocaleDateString("es-DO") : ""}</span>
                  <span className="font-medium">{formatCurrency(emp.salary || 0)}</span>
                </div>
                {empLoans.length > 0 && (
                  <div className="mt-2">
                    <Badge className="bg-amber-500 text-white text-[10px]">{empLoans.length} prestamo(s) activo(s)</Badge>
                  </div>
                )}
                <div className="mt-3 flex gap-1">
                  <button onClick={() => startEdit(emp)} className="flex-1 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600 flex items-center justify-center gap-1"><Edit2 className="w-3 h-3" /> Editar</button>
                  <button onClick={() => openLoan(emp)} className="flex-1 py-1.5 text-xs bg-[#1ABC9C]/10 hover:bg-[#1ABC9C]/20 rounded text-[#1ABC9C] flex items-center justify-center gap-1"><DollarSign className="w-3 h-3" /> Prestamo</button>
                  <button onClick={() => { if (confirm('Eliminar empleado?')) deleteMutation.mutate(emp.id); }} className="py-1.5 px-2 text-xs bg-red-50 hover:bg-red-100 rounded text-red-500"><Trash2 className="w-3 h-3" /></button>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Loans Table */}
        {loans && loans.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Prestamos de Empleados</h3>
            <Card className="border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="bg-[#1ABC9C] text-white"><th className="px-3 py-2 text-left">Empleado</th><th className="px-3 py-2 text-right">Monto</th><th className="px-3 py-2 text-right">Saldo</th><th className="px-3 py-2 text-center">Cuotas</th><th className="px-3 py-2 text-right">Cuota Mensual</th><th className="px-3 py-2 text-left">Estado</th><th className="px-3 py-2 text-left">Fecha</th><th className="px-3 py-2 text-center">Accion</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {loans?.map((loan: any, idx: number) => (
                      <tr key={loan.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                        <td className="px-3 py-2 font-medium">{loan.employeeFullName || loan.employeeName}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(loan.amount)}</td>
                        <td className="px-3 py-2 text-right font-medium text-amber-600">{formatCurrency(loan.balance)}</td>
                        <td className="px-3 py-2 text-center">{loan.payments?.length || 0}/{loan.installments}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(loan.installmentAmount)}</td>
                        <td className="px-3 py-2"><Badge className={loan.status === "active" ? "bg-amber-500 text-white text-[10px]" : loan.status === "paid" ? "bg-emerald-500 text-white text-[10px]" : "bg-red-500 text-white text-[10px]"}>{loan.status === "active" ? "Activo" : loan.status === "paid" ? "Pagado" : "Default"}</Badge></td>
                        <td className="px-3 py-2 text-xs text-gray-500">{loan.startDate ? new Date(loan.startDate).toLocaleDateString("es-DO") : ""}</td>
                        <td className="px-3 py-2 text-center">
                          {loan.status === "active" && (
                            <Button size="sm" className="h-6 text-[10px] bg-[#1ABC9C] hover:bg-[#16a085] text-white" onClick={() => openPayment(loan)}>Abonar</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Employee Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="text-center bg-[#1ABC9C] text-white py-2 rounded-md text-sm">{editEmployee ? "EDITAR EMPLEADO" : "NUEVO EMPLEADO"}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer hover:bg-gray-100" onClick={() => document.getElementById('emp-photo-upload')?.click()}>
                    {photoPreview ? <img src={photoPreview} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center"><ImageIcon className="w-8 h-8 text-gray-400 mb-1" /><span className="text-[10px] text-gray-500">Foto de perfil</span></div>}
                  </div>
                  <input id="emp-photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  {photoPreview && <button className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs" onClick={() => { setPhotoPreview(""); setForm(prev => ({ ...prev, photoUrl: "" })); }}>×</button>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-xs">Primer Nombre</Label><Input value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Segundo Nombre</Label><Input value={form.middleName} onChange={e => setForm({...form, middleName: e.target.value})} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Primer Apellido</Label><Input value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Segundo Apellido</Label><Input value={form.secondLastName} onChange={e => setForm({...form, secondLastName: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-xs">Cedula</Label><Input value={form.idNumber} onChange={e => setForm({...form, idNumber: e.target.value})} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Telefono</Label><Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Correo Electronico</Label><Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Direccion</Label><Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-xs">Ciudad</Label><Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} /></div>
                <div className="space-y-1.5"><Label className="text-xs">Cargo / Posicion</Label><Input value={form.position} onChange={e => setForm({...form, position: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label className="text-xs">Sucursal</Label>
                  <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-2 text-sm" value={form.branchId} onChange={e => setForm({...form, branchId: e.target.value})}>
                    <option value="">Seleccionar</option>
                    {branches?.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5"><Label className="text-xs">Fecha Contratacion</Label><Input type="date" value={form.hireDate} onChange={e => setForm({...form, hireDate: e.target.value})} /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Salario Mensual</Label><Input type="number" value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} /></div>
              <Button onClick={handleSave} disabled={(editEmployee ? updateMutation.isPending : createMutation.isPending) || !form.firstName || !form.lastName || !form.idNumber} className="bg-[#1ABC9C] hover:bg-[#16a085] text-white w-full shadow-sm">
                {editEmployee ? updateMutation.isPending : createMutation.isPending ? "Procesando..." : (editEmployee ? "Actualizar" : "Guardar")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Loan Dialog */}
        <Dialog open={loanOpen} onOpenChange={setLoanOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="text-center bg-[#1ABC9C] text-white py-2 rounded-md text-sm">NUEVO PRESTAMO</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-1.5"><Label className="text-xs">Empleado</Label>
                <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-2 text-sm" value={loanForm.employeeId} onChange={e => setLoanForm({...loanForm, employeeId: e.target.value})}>
                  <option value="">Seleccionar</option>
                  {employees?.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><Label className="text-xs">Monto del Prestamo</Label><Input type="number" value={loanForm.amount} onChange={e => setLoanForm({...loanForm, amount: e.target.value})} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Numero de Cuotas</Label><Input type="number" value={loanForm.installments} onChange={e => setLoanForm({...loanForm, installments: e.target.value})} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Observaciones</Label><Input value={loanForm.notes} onChange={e => setLoanForm({...loanForm, notes: e.target.value})} /></div>
              <Button onClick={() => {
                if (!loanForm.employeeId || !loanForm.amount || !loanForm.installments) return;
                loanCreate.mutate({ employeeId: parseInt(loanForm.employeeId), amount: loanForm.amount, installments: parseInt(loanForm.installments), notes: loanForm.notes });
              }} disabled={loanCreate.isPending} className="bg-[#1ABC9C] hover:bg-[#16a085] text-white w-full shadow-sm">
                {loanCreate.isPending ? "Procesando..." : "Guardar Prestamo"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Payment Dialog */}
        <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle className="text-center bg-[#1ABC9C] text-white py-2 rounded-md text-sm">ABONO A PRESTAMO</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-gray-600">Empleado: <span className="font-medium">{selectedLoan?.employeeName || selectedLoan?.employeeFullName}</span></p>
              <p className="text-sm text-gray-600">Saldo actual: <span className="font-medium text-amber-600">{formatCurrency(selectedLoan?.balance || 0)}</span></p>
              <div className="space-y-1.5"><Label className="text-xs">Monto del Abono</Label><Input type="number" value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})} /></div>
              <div className="space-y-1.5"><Label className="text-xs">Observaciones</Label><Input value={paymentForm.notes} onChange={e => setPaymentForm({...paymentForm, notes: e.target.value})} /></div>
              <Button onClick={() => {
                if (!paymentForm.amount) return;
                paymentCreate.mutate({ loanId: parseInt(paymentForm.loanId), amount: paymentForm.amount, notes: paymentForm.notes });
              }} disabled={paymentCreate.isPending} className="bg-[#1ABC9C] hover:bg-[#16a085] text-white w-full shadow-sm">
                {paymentCreate.isPending ? "Procesando..." : "Registrar Abono"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}
