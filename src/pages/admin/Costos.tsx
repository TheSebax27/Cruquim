import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Producto } from '../../types'

interface EditandoCosto {
  id: string
  costo_compra: string
  costo_transporte: string
  costo_envase: string
  iva_porcentaje: string
  margen_porcentaje: string
}

function calcularPrecio(p: { costo_compra: number; costo_transporte: number; costo_envase: number; iva_porcentaje: number; margen_porcentaje: number }): number {
  return Math.round(
    (p.costo_compra + p.costo_transporte + p.costo_envase)
    * (1 + p.iva_porcentaje / 100)
    * (1 + p.margen_porcentaje / 100)
  )
}

export default function Costos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [editando, setEditando] = useState<EditandoCosto | null>(null)
  const [guardando, setGuardando] = useState(false)

  async function cargar() {
    const { data } = await supabase.from('productos').select('*').order('nombre')
    setProductos(data ?? [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  function abrirEditar(p: Producto) {
    setEditando({
      id: p.id,
      costo_compra: String(p.costo_compra ?? 0),
      costo_transporte: String(p.costo_transporte ?? 0),
      costo_envase: String(p.costo_envase ?? 0),
      iva_porcentaje: String(p.iva_porcentaje ?? 19),
      margen_porcentaje: String(p.margen_porcentaje ?? 30),
    })
  }

  async function guardar() {
    if (!editando) return
    setGuardando(true)
    await supabase.from('productos').update({
      costo_compra: parseFloat(editando.costo_compra) || 0,
      costo_transporte: parseFloat(editando.costo_transporte) || 0,
      costo_envase: parseFloat(editando.costo_envase) || 0,
      iva_porcentaje: parseFloat(editando.iva_porcentaje) || 19,
      margen_porcentaje: parseFloat(editando.margen_porcentaje) || 30,
    }).eq('id', editando.id)
    setEditando(null)
    setGuardando(false)
    cargar()
  }

  const totalCosto = productos.reduce((s, p) => s + (p.costo_compra ?? 0) * p.stock_actual, 0)
  const totalVenta = productos.reduce((s, p) => s + (p.precio_sugerido ?? 0) * p.stock_actual, 0)
  const margenTotal = totalCosto > 0 ? ((totalVenta - totalCosto) / totalCosto * 100) : 0

  const inputCls = "w-full px-2 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56a0]/30 text-right"

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Costos</h1>
        <p className="text-slate-500 text-sm mt-0.5">Gestión de costos y precios sugeridos</p>
      </div>

      {/* Resumen financiero */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-xs text-slate-400 font-medium mb-1">Valor inventario (costo)</p>
          <p className="text-2xl font-bold text-slate-700">${totalCosto.toLocaleString('es-CO')}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-xs text-slate-400 font-medium mb-1">Valor inventario (venta)</p>
          <p className="text-2xl font-bold text-[#1a56a0]">${totalVenta.toLocaleString('es-CO')}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <p className="text-xs text-slate-400 font-medium mb-1">Utilidad potencial</p>
          <p className="text-2xl font-bold text-[#2ea84b]">
            ${(totalVenta - totalCosto).toLocaleString('es-CO')}
            <span className="text-sm font-normal text-slate-400 ml-1">({margenTotal.toFixed(1)}%)</span>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-white rounded-xl h-14 animate-pulse" />)}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Producto</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Compra</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Transp.</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Envase</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">IVA %</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Margen %</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Precio</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {productos.map(p => {
                const esEditando = editando?.id === p.id
                const previewPrecio = esEditando ? calcularPrecio({
                  costo_compra: parseFloat(editando.costo_compra) || 0,
                  costo_transporte: parseFloat(editando.costo_transporte) || 0,
                  costo_envase: parseFloat(editando.costo_envase) || 0,
                  iva_porcentaje: parseFloat(editando.iva_porcentaje) || 19,
                  margen_porcentaje: parseFloat(editando.margen_porcentaje) || 30,
                }) : (p.precio_sugerido ?? 0)

                return (
                  <tr key={p.id} className={esEditando ? 'bg-blue-50/50' : 'hover:bg-slate-50/50'}>
                    <td className="px-4 py-3 font-medium text-slate-800 max-w-[160px]">
                      <p className="truncate">{p.nombre}</p>
                      <p className="text-xs text-slate-400">Stock: {p.stock_actual}</p>
                    </td>

                    {esEditando ? (
                      <>
                        <td className="px-2 py-2"><input type="number" min="0" value={editando.costo_compra} onChange={e => setEditando(ed => ed && ({ ...ed, costo_compra: e.target.value }))} className={inputCls} /></td>
                        <td className="px-2 py-2"><input type="number" min="0" value={editando.costo_transporte} onChange={e => setEditando(ed => ed && ({ ...ed, costo_transporte: e.target.value }))} className={inputCls} /></td>
                        <td className="px-2 py-2"><input type="number" min="0" value={editando.costo_envase} onChange={e => setEditando(ed => ed && ({ ...ed, costo_envase: e.target.value }))} className={inputCls} /></td>
                        <td className="px-2 py-2"><input type="number" min="0" max="100" value={editando.iva_porcentaje} onChange={e => setEditando(ed => ed && ({ ...ed, iva_porcentaje: e.target.value }))} className={inputCls} /></td>
                        <td className="px-2 py-2"><input type="number" min="0" value={editando.margen_porcentaje} onChange={e => setEditando(ed => ed && ({ ...ed, margen_porcentaje: e.target.value }))} className={inputCls} /></td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-bold text-[#2ea84b]">${previewPrecio.toLocaleString('es-CO')}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={guardar} disabled={guardando}
                              className="px-3 py-1.5 rounded-lg bg-[#1a56a0] text-white text-xs font-medium disabled:opacity-50">
                              {guardando ? '...' : 'Guardar'}
                            </button>
                            <button onClick={() => setEditando(null)}
                              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-500 hover:bg-slate-50">
                              ✕
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-right text-slate-600">${(p.costo_compra ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-slate-600">${(p.costo_transporte ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-slate-600">${(p.costo_envase ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-slate-400">{p.iva_porcentaje ?? 19}%</td>
                        <td className="px-4 py-3 text-right text-slate-400">{p.margen_porcentaje ?? 30}%</td>
                        <td className="px-4 py-3 text-right font-bold text-[#2ea84b]">
                          ${(p.precio_sugerido ?? 0).toLocaleString('es-CO')}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => abrirEditar(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-[#1a56a0] hover:bg-blue-50 transition">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
