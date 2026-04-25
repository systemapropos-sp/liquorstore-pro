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
import Login from "./pages/Login";

function AuthRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#E30A17] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/inventario" element={<Products />} />
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
