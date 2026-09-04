import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Producto, Venta } from '../../types'

interface LineaForm {
  producto_id: string
  cantidad: string
  precio_unitario: string
}

const LINEA_VACIA: LineaForm = { producto_id: '', cantidad: '1', precio_unitario: '0' }

export default function Facturacion() {
  const [ventas, setVentas] = useState<Venta[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [ventaDetalle, setVentaDetalle] = useState<Venta | null>(null)
  const [guardando, setGuardando] = useState(false)

  const [cliente, setCliente] = useState('')
  const [telefono, setTelefono] = useState('')
  const [notas, setNotas] = useState('')
  const [lineas, setLineas] = useState<LineaForm[]>([{ ...LINEA_VACIA }])

  async function cargar() {
    const [{ data: vs }, { data: ps }] = await Promise.all([
      supabase.from('ventas').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('productos').select('*').eq('disponible', true).order('nombre'),
    ])
    setVentas(vs ?? [])
    setProductos(ps ?? [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  async function verDetalle(v: Venta) {
    const { data } = await supabase
      .from('venta_lineas')
      .select('*, producto:productos(nombre)')
      .eq('venta_id', v.id)
    setVentaDetalle({ ...v, lineas: data ?? [] })
  }

  function seleccionarProducto(idx: number, productoId: string) {
    const prod = productos.find(p => p.id === productoId)
    setLineas(ls => ls.map((l, i) => i === idx
      ? { ...l, producto_id: productoId, precio_unitario: String(prod?.precio_sugerido ?? 0) }
      : l
    ))
  }

  function actualizarLinea(idx: number, campo: keyof LineaForm, valor: string) {
    setLineas(ls => ls.map((l, i) => i === idx ? { ...l, [campo]: valor } : l))
  }

  function agregarLinea() { setLineas(ls => [...ls, { ...LINEA_VACIA }]) }
  function quitarLinea(idx: number) { setLineas(ls => ls.filter((_, i) => i !== idx)) }

  const total = lineas.reduce((s, l) => {
    const cant = parseInt(l.cantidad) || 0
    const precio = parseFloat(l.precio_unitario) || 0
    return s + cant * precio
  }, 0)

  function resetForm() {
    setCliente(''); setTelefono(''); setNotas('')
    setLineas([{ ...LINEA_VACIA }])
  }

  async function guardar() {
    if (!cliente.trim()) return
    const lineasValidas = lineas.filter(l => l.producto_id && parseInt(l.cantidad) > 0)
    if (lineasValidas.length === 0) return
    setGuardando(true)

    // Crear la venta
    const { data: venta, error } = await supabase
      .from('ventas')
      .insert({ cliente_nombre: cliente.trim(), cliente_telefono: telefono.trim() || null, total, notas: notas.trim() || null })
      .select()
      .single()

    if (error || !venta) { setGuardando(false); return }

    // Insertar líneas
    await supabase.from('venta_lineas').insert(
      lineasValidas.map(l => ({
        venta_id: venta.id,
        producto_id: l.producto_id,
        cantidad: parseInt(l.cantidad),
        precio_unitario: parseFloat(l.precio_unitario),
      }))
    )

    // Registrar salidas de inventario automáticamente
    await Promise.all(lineasValidas.map(l =>
      supabase.from('movimientos_inventario').insert({
        producto_id: l.producto_id,
        tipo: 'salida',
        cantidad: parseInt(l.cantidad),
        motivo: `Venta a ${cliente.trim()}`,
      })
    ))

    setGuardando(false)
    setModalAbierto(false)
    resetForm()
    cargar()
  }

  const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56a0]/30"

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Facturación interna</h1>
          <p className="text-slate-500 text-sm mt-0.5">{ventas.length} ventas registradas</p>
        </div>
        <button onClick={() => { resetForm(); setModalAbierto(true) }}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium transition hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #1a56a0, #2ea84b)' }}>
          + Nueva venta
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-white rounded-xl h-16 animate-pulse" />)}
        </div>
      ) : ventas.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-5xl mb-3">🧾</p>
          <p className="font-medium">Sin ventas registradas</p>
          <button onClick={() => { resetForm(); setModalAbierto(true) }} className="mt-4 text-[#1a56a0] text-sm underline">Registrar la primera</button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Teléfono</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Total</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Fecha</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ventas.map(v => (
                <tr key={v.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-800">{v.cliente_nombre}</td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{v.cliente_telefono ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-bold text-[#2ea84b]">${v.total.toLocaleString('es-CO')}</td>
                  <td className="px-4 py-3 text-right text-slate-400 text-xs hidden lg:table-cell">
                    {new Date(v.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => verDetalle(v)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition">
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal nueva venta */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Nueva venta</h2>
              <button onClick={() => setModalAbierto(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-6 space-y-5">
              {/* Cliente */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Nombre del cliente *</label>
                  <input value={cliente} onChange={e => setCliente(e.target.value)} className={inputCls} placeholder="Nombre o empresa" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Teléfono</label>
                  <input value={telefono} onChange={e => setTelefono(e.target.value)} className={inputCls} placeholder="300 000 0000" />
                </div>
              </div>

              {/* Productos */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Productos</label>
                <div className="space-y-2">
                  {lineas.map((linea, idx) => {
                    const subtotal = (parseInt(linea.cantidad) || 0) * (parseFloat(linea.precio_unitario) || 0)
                    return (
                      <div key={idx} className="flex gap-2 items-center">
                        <select value={linea.producto_id} onChange={e => seleccionarProducto(idx, e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56a0]/30">
                          <option value="">Seleccionar producto...</option>
                          {productos.map(p => (
                            <option key={p.id} value={p.id}>{p.nombre} (stock: {p.stock_actual})</option>
                          ))}
                        </select>
                        <input type="number" min="1" value={linea.cantidad}
                          onChange={e => actualizarLinea(idx, 'cantidad', e.target.value)}
                          className="w-20 px-3 py-2 rounded-lg border border-slate-200 text-sm text-center focus:outline-none focus:ring-2 focus:ring-[#1a56a0]/30"
                          placeholder="Cant." />
                        <input type="number" min="0" value={linea.precio_unitario}
                          onChange={e => actualizarLinea(idx, 'precio_unitario', e.target.value)}
                          className="w-28 px-3 py-2 rounded-lg border border-slate-200 text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#1a56a0]/30"
                          placeholder="Precio" />
                        <span className="w-24 text-right text-sm font-medium text-slate-600 shrink-0">
                          ${subtotal.toLocaleString('es-CO')}
                        </span>
                        {lineas.length > 1 && (
                          <button onClick={() => quitarLinea(idx)} className="text-slate-300 hover:text-red-500 transition text-lg leading-none">✕</button>
                        )}
                      </div>
                    )
                  })}
                </div>
                <button onClick={agregarLinea} className="mt-2 text-xs text-[#1a56a0] font-medium hover:underline">
                  + Agregar producto
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Notas</label>
                <input value={notas} onChange={e => setNotas(e.target.value)} className={inputCls} placeholder="Observaciones opcionales" />
              </div>

              {/* Total */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="font-semibold text-slate-700">Total</span>
                <span className="text-2xl font-black text-[#2ea84b]">${total.toLocaleString('es-CO')}</span>
              </div>
              <p className="text-xs text-slate-400 -mt-2">Al guardar se descontará automáticamente del inventario.</p>
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-100">
              <button onClick={() => setModalAbierto(false)}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition">
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando || !cliente.trim() || lineas.every(l => !l.producto_id)}
                className="flex-1 py-2 rounded-lg text-white text-sm font-medium transition disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #1a56a0, #2ea84b)' }}>
                {guardando ? 'Guardando...' : 'Guardar venta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal detalle venta */}
      {ventaDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-800">Detalle de venta</h2>
              <button onClick={() => setVentaDetalle(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div className="space-y-1 mb-4">
              <p className="text-sm"><span className="text-slate-400">Cliente:</span> <span className="font-semibold">{ventaDetalle.cliente_nombre}</span></p>
              {ventaDetalle.cliente_telefono && <p className="text-sm"><span className="text-slate-400">Tel:</span> {ventaDetalle.cliente_telefono}</p>}
              <p className="text-sm"><span className="text-slate-400">Fecha:</span> {new Date(ventaDetalle.created_at).toLocaleDateString('es-CO', { dateStyle: 'long', timeStyle: 'short' } as Intl.DateTimeFormatOptions)}</p>
              {ventaDetalle.notas && <p className="text-sm"><span className="text-slate-400">Notas:</span> {ventaDetalle.notas}</p>}
            </div>
            <div className="border-t border-slate-100 pt-3 space-y-2">
              {(ventaDetalle.lineas ?? []).map(l => (
                <div key={l.id} className="flex justify-between text-sm">
                  <span className="text-slate-700">{(l.producto as unknown as { nombre: string })?.nombre} × {l.cantidad}</span>
                  <span className="font-medium">${l.subtotal.toLocaleString('es-CO')}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100">
              <span className="font-bold text-slate-700">Total</span>
              <span className="text-xl font-black text-[#2ea84b]">${ventaDetalle.total.toLocaleString('es-CO')}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
