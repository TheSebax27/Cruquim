import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import PublicLayout from './components/public/PublicLayout'
import AdminLayout from './components/admin/AdminLayout'
import Inicio from './pages/public/Inicio'
import Catalogo from './pages/public/Catalogo'
import Nosotros from './pages/public/Nosotros'
import Contacto from './pages/public/Contacto'
import Login from './pages/admin/Login'
import Dashboard from './pages/admin/Dashboard'
import Productos from './pages/admin/Productos'
import Categorias from './pages/admin/Categorias'
import Inventario from './pages/admin/Inventario'
import Costos from './pages/admin/Costos'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        {/* Sitio público */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/contacto" element={<Contacto />} />
        </Route>

        {/* Panel admin */}
        <Route path="/admin">
          <Route index element={<Login />} />
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="productos" element={<Productos />} />
            <Route path="categorias" element={<Categorias />} />
            <Route path="inventario" element={<Inventario />} />
            <Route path="costos" element={<Costos />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
