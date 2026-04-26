import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/providers/trpc";
import {
  Plus, Search, CheckCircle, Clock, DollarSign, User,
  ChevronDown, ChevronUp, CreditCard, FileText, ArrowLeft
} from "lucide-react";

export default function Payroll() {
  const [search, setSearch] = useState("");
  const [openPeriod, setOpenPeriod] = useState<number | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [periodType, setPeriodType] = useState("quincena");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState("periodos");

  const { data: periods = [] } = trpc.payroll.list.useQuery({});
  const { data: employees = [] } = trpc.employee.list.useQuery({});
  const { data: items = [] } = trpc.payroll.itemList.useQuery(
    selectedPeriodId ? { payrollId: selectedPeriodId } : undefined
  );
  const { data: employeeHistory } = trpc.payroll.history.useQuery(
    selectedEmployee ? { employeeId: selectedEmployee } : undefined,
    { enabled: !!selectedEmployee }
  );

  const createPeriod = trpc.payroll.create.useMutation({
    onSuccess: () => {
      setShowDialog(false);
      setStartDate("");
      setEndDate("");
    }
  });
  const processPay = trpc.payroll.process.useMutation();
  const payPayroll = trpc.payroll.pay.useMutation();
  const createItem = trpc.payroll.itemCreate.useMutation({
    onSuccess: () => setShowItemDialog(false)
  });

  const filteredPeriods = periods.filter((p: any) =>
    p.notes?.toLowerCase().includes(search.toLowerCase()) ||
    p.startDate?.includes(search)
  );

  function handleCreatePeriod() {
    if (!startDate || !endDate) return;
    createPeriod.mutate({ periodType, startDate, endDate, notes: `Periodo ${periodType} ${startDate} al ${endDate}` });
  }

  function handleAddItem(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    createItem.mutate({
      payrollId: selectedPeriodId,
      employeeId: parseInt(fd.get("employeeId") as string),
      baseSalary: fd.get("baseSalary") as string,
      overtime: fd.get("overtime") as string || "0",
      bonus: fd.get("bonus") as string || "0",
      deductions: fd.get("deductions") as string || "0",
      loanDeduction: fd.get("loanDeduction") as string || "0",
      paymentMethod: fd.get("paymentMethod") as string,
      notes: fd.get("notes") as string || ""
    });
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Nomina y Pagos</h1>
          <p className="text-sm text-gray-500 mt-1">Gestion de salarios, quincenas y prestamos</p>
        </div>
        <Button className="btn-emerald" onClick={() => setShowDialog(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nueva Nomina
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input placeholder="Buscar periodos..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="flex border-b mb-4">
        <button onClick={() => setActiveTab("periodos")} className={`px-4 py-2 text-sm font-medium ${activeTab === "periodos" ? "border-b-2 border-[#1ABC9C] text-[#1ABC9C]" : "text-gray-500"}`}>Periodos de Nomina</button>
        <button onClick={() => setActiveTab("empleados")} className={`px-4 py-2 text-sm font-medium ${activeTab === "empleados" ? "border-b-2 border-[#1ABC9C] text-[#1ABC9C]" : "text-gray-500"}`}>Por Empleado</button>
        <button onClick={() => setActiveTab("prestamos")} className={`px-4 py-2 text-sm font-medium ${activeTab === "prestamos" ? "border-b-2 border-[#1ABC9C] text-[#1ABC9C]" : "text-gray-500"}`}>Prestamos</button>
      </div>

      {activeTab === "periodos" && (
        <div className="space-y-3">
          {filteredPeriods.map((period: any) => (
            <div key={period.id} className="bg-white rounded-lg border overflow-hidden">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => setOpenPeriod(openPeriod === period.id ? null : period.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    period.status === 'paid' ? 'bg-emerald-100 text-emerald-600' :
                    period.status === 'processed' ? 'bg-blue-100 text-blue-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>
                    {period.status === 'paid' ? <CheckCircle className="w-5 h-5" /> :
                     period.status === 'processed' ? <DollarSign className="w-5 h-5" /> :
                     <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 capitalize">{period.periodType} - {period.startDate} al {period.endDate}</p>
                    <p className="text-sm text-gray-500">{period.notes}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-gray-800">RD${parseFloat(period.totalAmount).toLocaleString()}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    period.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                    period.status === 'processed' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {period.status === 'paid' ? 'Pagado' : period.status === 'processed' ? 'Procesado' : 'Borrador'}
                  </span>
                  {openPeriod === period.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </div>

              {openPeriod === period.id && (
                <div className="border-t px-4 pb-4">
                  <div className="flex gap-2 my-3">
                    {period.status === 'draft' && (
                      <Button size="sm" variant="outline" onClick={() => processPay.mutate(period.id)} disabled={processPay.isPending}>
                        <FileText className="w-4 h-4 mr-1" /> Procesar
                      </Button>
                    )}
                    {period.status === 'processed' && (
                      <Button size="sm" className="btn-emerald" onClick={() => payPayroll.mutate(period.id)} disabled={payPayroll.isPending}>
                        <CreditCard className="w-4 h-4 mr-1" /> Marcar Pagado
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => { setSelectedPeriodId(period.id); setShowItemDialog(true); }}>
                      <Plus className="w-4 h-4 mr-1" /> Agregar Empleado
                    </Button>
                  </div>

                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#1ABC9C] text-white">
                        <th className="px-3 py-2 text-left">Empleado</th>
                        <th className="px-3 py-2 text-right">Salario</th>
                        <th className="px-3 py-2 text-right">Extras</th>
                        <th className="px-3 py-2 text-right">Bonif.</th>
                        <th className="px-3 py-2 text-right">Deduc.</th>
                        <th className="px-3 py-2 text-right">Desc. Prest.</th>
                        <th className="px-3 py-2 text-right font-bold">Neto</th>
                        <th className="px-3 py-2 text-center">Metodo</th>
                        <th className="px-3 py-2 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.filter((i: any) => i.payrollId === period.id).map((item: any) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-2">{item.employeeName}</td>
                          <td className="px-3 py-2 text-right">RD${parseFloat(item.baseSalary).toFixed(2)}</td>
                          <td className="px-3 py-2 text-right">RD${parseFloat(item.overtime).toFixed(2)}</td>
                          <td className="px-3 py-2 text-right">RD${parseFloat(item.bonus).toFixed(2)}</td>
                          <td className="px-3 py-2 text-right text-red-600">-RD${parseFloat(item.deductions).toFixed(2)}</td>
                          <td className="px-3 py-2 text-right text-red-600">-RD${parseFloat(item.loanDeduction).toFixed(2)}</td>
                          <td className="px-3 py-2 text-right font-bold">RD${parseFloat(item.netPay).toFixed(2)}</td>
                          <td className="px-3 py-2 text-center capitalize">{item.paymentMethod}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded text-xs ${item.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              {item.status === 'paid' ? 'Pagado' : 'Pendiente'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {items.filter((i: any) => i.payrollId === period.id).length === 0 && (
                        <tr><td colSpan={9} className="px-3 py-4 text-center text-gray-400">Sin items en este periodo</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
          {filteredPeriods.length === 0 && (
            <div className="text-center py-10 text-gray-400">No hay periodos de nomina</div>
          )}
        </div>
      )}

      {activeTab === "empleados" && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {employees.map((emp: any) => (
              <div
                key={emp.id}
                onClick={() => setSelectedEmployee(emp.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedEmployee === emp.id ? 'border-[#1ABC9C] bg-emerald-50' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{emp.firstName} {emp.lastName}</p>
                    <p className="text-sm text-gray-500">{emp.position}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2">Salario: RD${parseFloat(emp.salary).toLocaleString()}</p>
              </div>
            ))}
          </div>

          {employeeHistory && (
            <div className="bg-white rounded-lg border p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Historial de Nomina</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#1ABC9C] text-white">
                    <th className="px-3 py-2 text-left">Periodo</th>
                    <th className="px-3 py-2 text-right">Base</th>
                    <th className="px-3 py-2 text-right">Extras</th>
                    <th className="px-3 py-2 text-right">Bonif.</th>
                    <th className="px-3 py-2 text-right">Deduc.</th>
                    <th className="px-3 py-2 text-right">Desc. Prest.</th>
                    <th className="px-3 py-2 text-right font-bold">Neto</th>
                    <th className="px-3 py-2 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeHistory.items.map((item: any) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="px-3 py-2">
                        {periods.find((p: any) => p.id === item.payrollId)?.periodType} - {periods.find((p: any) => p.id === item.payrollId)?.startDate}
                      </td>
                      <td className="px-3 py-2 text-right">RD${parseFloat(item.baseSalary).toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">RD${parseFloat(item.overtime).toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">RD${parseFloat(item.bonus).toFixed(2)}</td>
                      <td className="px-3 py-2 text-right text-red-600">-RD${parseFloat(item.deductions).toFixed(2)}</td>
                      <td className="px-3 py-2 text-right text-red-600">-RD${parseFloat(item.loanDeduction).toFixed(2)}</td>
                      <td className="px-3 py-2 text-right font-bold">RD${parseFloat(item.netPay).toFixed(2)}</td>
                      <td className="px-3 py-2 text-center">
                        <span className={`px-2 py-0.5 rounded text-xs ${item.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {item.status === 'paid' ? 'Pagado' : 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {employeeHistory.items.length === 0 && (
                    <tr><td colSpan={8} className="px-3 py-4 text-center text-gray-400">Sin historial de nomina</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === "prestamos" && (
        <div className="bg-white rounded-lg border">
          <div className="p-4">
            <h3 className="font-semibold text-gray-800 mb-3">Historial de Prestamos y Abonos</h3>
            <div className="text-center py-6 text-gray-400">
              Los prestamos se gestionan desde la pagina de Empleados
            </div>
            <div className="mt-4 flex justify-center">
              <Link to="/empleados">
                <Button variant="outline" className="border-[#1ABC9C] text-[#1ABC9C]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Ir a Prestamos de Empleados
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* New Period Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDialog(false)}>
          <div className="bg-white rounded-lg w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Nuevo Periodo de Nomina</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Tipo</label>
                <select value={periodType} onChange={e => setPeriodType(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
                  <option value="quincena">Quincena</option>
                  <option value="mensual">Mensual</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium block mb-1">Desde</label>
                  <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Hasta</label>
                  <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>
              <Button className="w-full btn-emerald" onClick={handleCreatePeriod} disabled={createPeriod.isPending}>
                Crear Periodo
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Dialog */}
      {showItemDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowItemDialog(false)}>
          <div className="bg-white rounded-lg w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">Agregar Empleado a Nomina</h2>
            <form onSubmit={handleAddItem} className="space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1">Empleado</label>
                <select name="employeeId" className="w-full border rounded-md px-3 py-2 text-sm" required>
                  <option value="">Seleccionar</option>
                  {employees.map((e: any) => (
                    <option key={e.id} value={String(e.id)}>{e.firstName} {e.lastName} - {e.position}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium block mb-1">Salario Base</label><Input name="baseSalary" type="number" step="0.01" required /></div>
                <div><label className="text-sm font-medium block mb-1">Horas Extra</label><Input name="overtime" type="number" step="0.01" defaultValue="0" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium block mb-1">Bonificacion</label><Input name="bonus" type="number" step="0.01" defaultValue="0" /></div>
                <div><label className="text-sm font-medium block mb-1">Deducciones</label><Input name="deductions" type="number" step="0.01" defaultValue="0" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-sm font-medium block mb-1">Desc. Prestamo</label><Input name="loanDeduction" type="number" step="0.01" defaultValue="0" /></div>
                <div>
                  <label className="text-sm font-medium block mb-1">Metodo</label>
                  <select name="paymentMethod" className="w-full border rounded-md px-3 py-2 text-sm" defaultValue="transfer">
                    <option value="transfer">Transferencia</option>
                    <option value="cash">Efectivo</option>
                    <option value="check">Cheque</option>
                  </select>
                </div>
              </div>
              <Button type="submit" className="w-full btn-emerald" disabled={createItem.isPending}>Agregar</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
