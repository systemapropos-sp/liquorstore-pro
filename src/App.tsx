import { Routes, Route, Navigate } from "react-router";
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
import Transfers from "./pages/Transfers";
import TransferHistory from "./pages/TransferHistory";
import StockCount from "./pages/StockCount";
import Adjustments from "./pages/Adjustments";
import Employees from "./pages/Employees";
import Login from "./pages/Login";

function AuthRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/inventario" element={<Products />} />
      <Route path="/inventario/traslados" element={<Transfers />} />
      <Route path="/inventario/traslados-historial" element={<TransferHistory />} />
      <Route path="/inventario/toma" element={<StockCount />} />
      <Route path="/inventario/ajustes" element={<Adjustments />} />
      <Route path="/empleados" element={<Employees />} />
      <Route path="/facturacion" element={<Invoices />} />
      <Route path="/ordenes" element={<Orders />} />
      <Route path="/creditos" element={<Credits />} />
      <Route path="/compras" element={<Purchases />} />
      <Route path="/delivery" element={<Deliveries />} />
      <Route path="/clientes" element={<Customers />} />
      <Route path="/proveedores" element={<Suppliers />} />
      <Route path="/sucursales" element={<Branches />} />
      <Route path="/reportes" element={<Reports />} />
      <Route path="/ajustes" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={<AuthRoutes />} />
    </Routes>
  );
}

export default App;
