import { Routes, Route, Navigate, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Invoices from "./pages/Invoices";
import Orders from "./pages/Orders";
import Credits from "./pages/Credits";
import Purchases from "./pages/Purchases";
import Deliveries from "./pages/Deliveries";
import Branches from "./pages/Branches";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/Settings";
import SettingsHub from "./pages/SettingsHub";
import BankSettings from "./pages/settings/BankSettings";
import TaxSettings from "./pages/settings/TaxSettings";
import UserSettings from "./pages/settings/UserSettings";
import CashRegisterSettings from "./pages/settings/CashRegisterSettings";
import ExpenseConceptSettings from "./pages/settings/ExpenseConceptSettings";
import ResolutionSettings from "./pages/settings/ResolutionSettings";
import PrintSettings from "./pages/settings/PrintSettings";
import EmailSettings from "./pages/settings/EmailSettings";
import BarcodeSettings from "./pages/settings/BarcodeSettings";
import PointsSettings from "./pages/settings/PointsSettings";
import PermissionSettings from "./pages/settings/PermissionSettings";
import BranchSettings from "./pages/settings/BranchSettings";
import ContractSettings from "./pages/settings/ContractSettings";
import Transfers from "./pages/Transfers";
import TransferHistory from "./pages/TransferHistory";
import StockCount from "./pages/StockCount";
import Adjustments from "./pages/Adjustments";
import Employees from "./pages/Employees";
import Payroll from "./pages/Payroll";
import WhatsAppPage from "./pages/WhatsApp";
import Comandas from "./pages/Comandas";
import TableSales from "./pages/TableSales";
import CategoriesPage from "./pages/Categories";
import Login from "./pages/Login";
import Expenses from "./pages/Expenses";
import FixedExpenses from "./pages/FixedExpenses";
import ExpenseHistory from "./pages/ExpenseHistory";
import InvoiceHistory from "./pages/InvoiceHistory";
import InvoiceResponsibles from "./pages/InvoiceResponsibles";
import Users from "./pages/Users";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1ABC9C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user && location.pathname !== "/login") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <AuthGuard>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventario" element={<Products />} />
              <Route path="/inventario/categorias" element={<CategoriesPage />} />
              <Route path="/inventario/traslados" element={<Transfers />} />
              <Route path="/inventario/traslados-historial" element={<TransferHistory />} />
              <Route path="/inventario/toma" element={<StockCount />} />
              <Route path="/inventario/ajustes" element={<Adjustments />} />
              <Route path="/empleados" element={<Employees />} />
              <Route path="/empleados/nomina" element={<Payroll />} />
              <Route path="/whatsapp" element={<WhatsAppPage />} />
              <Route path="/comandas" element={<Comandas />} />
              <Route path="/facturacion" element={<Invoices />} />
              <Route path="/facturacion/mesas" element={<TableSales />} />
              <Route path="/ordenes" element={<Orders />} />
              <Route path="/creditos" element={<Credits />} />
              <Route path="/compras" element={<Purchases />} />
              <Route path="/gastos" element={<Expenses />} />
              <Route path="/gastos/fijos" element={<FixedExpenses />} />
              <Route path="/gastos/historico" element={<ExpenseHistory />} />
              <Route path="/facturacion/historico" element={<InvoiceHistory />} />
              <Route path="/facturacion/responsables" element={<InvoiceResponsibles />} />
              <Route path="/usuarios" element={<Users />} />
              <Route path="/delivery" element={<Deliveries />} />
              <Route path="/clientes" element={<Customers />} />
              <Route path="/proveedores" element={<Suppliers />} />
              <Route path="/sucursales" element={<Branches />} />
              <Route path="/reportes" element={<Reports />} />
              <Route path="/ajustes" element={<SettingsHub />} />
              <Route path="/ajustes/general" element={<SettingsPage />} />
              <Route path="/ajustes/bancos" element={<BankSettings />} />
              <Route path="/ajustes/impuestos" element={<TaxSettings />} />
              <Route path="/ajustes/usuarios" element={<UserSettings />} />
              <Route path="/ajustes/cajas" element={<CashRegisterSettings />} />
              <Route path="/ajustes/conceptos-gastos" element={<ExpenseConceptSettings />} />
              <Route path="/ajustes/resoluciones" element={<ResolutionSettings />} />
              <Route path="/ajustes/impresiones" element={<PrintSettings />} />
              <Route path="/ajustes/correo" element={<EmailSettings />} />
              <Route path="/ajustes/codigo-barras" element={<BarcodeSettings />} />
              <Route path="/ajustes/puntos" element={<PointsSettings />} />
              <Route path="/ajustes/permisos" element={<PermissionSettings />} />
              <Route path="/ajustes/empresas" element={<BranchSettings />} />
              <Route path="/ajustes/contrato" element={<ContractSettings />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthGuard>
        }
      />
    </Routes>
  );
}
