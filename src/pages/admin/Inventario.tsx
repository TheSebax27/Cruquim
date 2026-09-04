import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Producto, MovimientoInventario } from '../../types'

interface FormMov {
  producto_id: string
  tipo: 'entrada' | 'salida'
  cantidad: string
  motivo: string
}

const FORM_VACIO: FormMov = { producto_id: '', tipo: 'entrada', cantidad: '', motivo: '' }

export default function Inventario() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<FormMov>(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)
  const [tab, setTab] = useState<'stock' | 'historial'>('stock')

  async function cargar() {
    const [{ data: prods }, { data: movs }] = await Promise.all([
      supabase.from('productos').select('*, categoria:categorias(nombre)').order('nombre'),
      supabase.from('movimientos_inventario')
        .select('*, producto:productos(nombre)')
        .order('created_at', { ascending: false })
        .limit(100),
    ])
    setProductos(prods ?? [])
    setMovimientos(movs ?? [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  async function registrar() {
    if (!form.producto_id || !form.cantidad || parseInt(form.cantidad) <= 0) return
    setGuardando(true)
    await supabase.from('movimientos_inventario').insert({
      producto_id: form.producto_id,
      tipo: form.tipo,
      cantidad: parseInt(form.cantidad),
      motivo: form.motivo.trim() || null,
    })
    setForm(FORM_VACIO)
    setGuardando(false)
    cargar()
  }

  const bajoStock = productos.filter(p => p.stock_actual <= p.stock_minimo)
  const totalUnidades = productos.reduce((s, p) => s + p.stock_actual, 0)

  const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56a0]/30"

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Inventario</h1>
        <p className="text-slate-500 text-sm mt-0.5">Control de entradas y salidas de stock</p>
      </div>

      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-xs text-slate-400 font-medium mb-1">Total productos</p>
          <p className="text-3xl font-bold text-[#1a56a0]">{productos.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-xs text-slate-400 font-medium mb-1">Total unidades</p>
          <p className="text-3xl font-bold text-[#2ea84b]">{totalUnidades.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-xs text-slate-400 font-medium mb-1">Stock bajo</p>
          <p className={`text-3xl font-bold ${bajoStock.length > 0 ? 'text-amber-500' : 'text-slate-300'}`}>
            {bajoStock.length}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-xs text-slate-400 font-medium mb-1">Movimientos hoy</p>
          <p className="text-3xl font-bold text-slate-700">
            {movimientos.filter(m => new Date(m.created_at).toDateString() === new Date().toDateString()).length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario registro */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-fit">
          <h2 className="font-bold text-slate-800 mb-4">Registrar movimiento</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Producto *</label>
              <select value={form.producto_id} onChange={e => setForm(f => ({ ...f, producto_id: e.target.value }))} className={inputCls}>
                <option value="">Seleccionar...</option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>{p.nombre} (stock: {p.stock_actual})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tipo</label>
              <div className="flex gap-2">
                {(['entrada', 'salida'] as const).map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, tipo: t }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition border ${form.tipo === t
                      ? t === 'entrada' ? 'bg-green-500 text-white border-green-500' : 'bg-red-500 text-white border-red-500'
                      : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                    {t === 'entrada' ? '↑ Entrada' : '↓ Salida'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Cantidad *</label>
              <input type="number" min="1" value={form.cantidad} onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))}
                className={inputCls} placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Motivo</label>
              <input value={form.motivo} onChange={e => setForm(f => ({ ...f, motivo: e.target.value }))}
                className={inputCls} placeholder="Ej: Compra proveedor, Venta, Merma..." />
            </div>
            <button onClick={registrar} disabled={guardando || !form.producto_id || !form.cantidad}
              className="w-full py-2.5 rounded-lg text-white text-sm font-medium transition disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #1a56a0, #2ea84b)' }}>
              {guardando ? 'Registrando...' : 'Registrar movimiento'}
            </button>
          </div>
        </div>

        {/* Panel derecho */}
        <div className="lg:col-span-2">
          <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-xl w-fit">
            {(['stock', 'historial'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${tab === t ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}>
                {t === 'stock' ? '📦 Stock actual' : '📋 Historial'}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="bg-white rounded-xl h-12 animate-pulse" />)}
            </div>
          ) : tab === 'stock' ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Producto</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Stock</th>
                    <th className="text-right px-4 py-3 font-medium text-slate-600">Mínimo</th>
                    <th className="text-center px-4 py-3 font-medium text-slate-600">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {productos.map(p => {
                    const bajo = p.stock_actual <= p.stock_minimo
                    return (
                      <tr key={p.id} className={bajo ? 'bg-amber-50/50' : ''}>
                        <td className="px-4 py-3 font-medium text-slate-800">{p.nombre}</td>
                        <td className={`px-4 py-3 text-right font-bold ${bajo ? 'text-amber-600' : 'text-slate-700'}`}>
                          {p.stock_actual}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-400">{p.stock_minimo}</td>
                        <td className="px-4 py-3 text-center">
                          {bajo
                            ? <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">⚠️ Bajo</span>
                            : <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">OK</span>
                          }
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {movimientos.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">Sin movimientos registrados</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 border-b border-slate-100">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-slate-600">Producto</th>
                      <th className="text-center px-4 py-3 font-medium text-slate-600">Tipo</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-600">Cantidad</th>
                      <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Motivo</th>
                      <th className="text-right px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {movimientos.map(m => (
                      <tr key={m.id}>
                        <td className="px-4 py-3 text-slate-700">{(m.producto as unknown as Producto)?.nombre ?? '—'}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.tipo === 'entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {m.tipo === 'entrada' ? '↑ Entrada' : '↓ Salida'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-slate-700">{m.cantidad}</td>
                        <td className="px-4 py-3 text-slate-400 text-xs hidden md:table-cell">{m.motivo ?? '—'}</td>
                        <td className="px-4 py-3 text-right text-slate-400 text-xs hidden lg:table-cell">
                          {new Date(m.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
