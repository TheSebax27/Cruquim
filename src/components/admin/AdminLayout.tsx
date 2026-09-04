import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import logo from '../../assets/cruquim.png'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/admin/productos', label: 'Productos', icon: '📦' },
  { to: '/admin/categorias', label: 'Categorías', icon: '🗂️' },
  { to: '/admin/inventario', label: 'Inventario', icon: '📋' },
  { to: '/admin/costos', label: 'Costos', icon: '💰' },
  { to: '/admin/facturacion', label: 'Facturación', icon: '🧾' },
]

export default function AdminLayout() {
  const { user, loading, signOut } = useAuth()
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1a56a0] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/admin/" replace />

  async function handleSignOut() {
    await signOut()
    navigate('/admin')
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-slate-100 flex flex-col fixed h-full">
        <div className="p-4 border-b border-slate-100">
          <img src={logo} alt="CRUQUIM" className="h-8 w-auto mb-1" />
          <p className="text-xs text-slate-400">Panel de administración</p>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${isActive
                  ? 'bg-[#1a56a0] text-white font-medium'
                  : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-100">
          <p className="text-xs text-slate-400 px-3 mb-2 truncate">{user.email}</p>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-red-50 hover:text-red-600 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 ml-56 min-h-screen">
        <Outlet />
      </main>
    </div>
  )
}
