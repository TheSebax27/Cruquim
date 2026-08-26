import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

interface Stats {
  totalProductos: number
  productosDisponibles: number
  totalCategorias: number
  stockBajo: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ totalProductos: 0, productosDisponibles: 0, totalCategorias: 0, stockBajo: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      const [
        { count: total },
        { count: disponibles },
        { count: cats },
        { count: bajo },
      ] = await Promise.all([
        supabase.from('productos').select('*', { count: 'exact', head: true }),
        supabase.from('productos').select('*', { count: 'exact', head: true }).eq('disponible', true),
        supabase.from('categorias').select('*', { count: 'exact', head: true }),
        supabase.from('productos').select('*', { count: 'exact', head: true })
          .filter('stock_actual', 'lte', 'stock_minimo'),
      ])
      setStats({
        totalProductos: total ?? 0,
        productosDisponibles: disponibles ?? 0,
        totalCategorias: cats ?? 0,
        stockBajo: bajo ?? 0,
      })
      setLoading(false)
    }
    cargar()
  }, [])

  const tarjetas = [
    { label: 'Total productos', valor: stats.totalProductos, icono: '📦', color: '#1a56a0' },
    { label: 'Disponibles', valor: stats.productosDisponibles, icono: '✅', color: '#2ea84b' },
    { label: 'Categorías', valor: stats.totalCategorias, icono: '🗂️', color: '#6366f1' },
    { label: 'Stock bajo', valor: stats.stockBajo, icono: '⚠️', color: '#f59e0b' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Resumen general del inventario</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse h-28 shadow-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {tarjetas.map(t => (
            <div key={t.label} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{t.icono}</span>
                <span className="text-3xl font-bold" style={{ color: t.color }}>{t.valor}</span>
              </div>
              <p className="text-sm text-slate-500 font-medium">{t.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h2 className="font-semibold text-slate-800 mb-2">Acceso rápido</h2>
        <p className="text-sm text-slate-400">Use el menú lateral para gestionar productos, categorías, inventario y costos.</p>
      </div>
    </div>
  )
}
