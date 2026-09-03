import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import ImageUpload from '../../components/shared/ImageUpload'
import type { Producto, Categoria } from '../../types'

interface FormData {
  nombre: string
  descripcion: string
  referencia: string
  categoria_id: string
  imagen_url: string
  unidad: string
  disponible: boolean
  destacado: boolean
  costo_compra: string
  costo_transporte: string
  costo_envase: string
  iva_porcentaje: string
  margen_porcentaje: string
  stock_actual: string
  stock_minimo: string
}

const FORM_VACIO: FormData = {
  nombre: '', descripcion: '', referencia: '', categoria_id: '',
  imagen_url: '', unidad: '', disponible: true, destacado: false,
  costo_compra: '0', costo_transporte: '0', costo_envase: '0',
  iva_porcentaje: '19', margen_porcentaje: '30',
  stock_actual: '0', stock_minimo: '5',
}

function calcularPrecio(f: FormData): number {
  const compra = parseFloat(f.costo_compra) || 0
  const transp = parseFloat(f.costo_transporte) || 0
  const envase = parseFloat(f.costo_envase) || 0
  const iva = parseFloat(f.iva_porcentaje) || 0
  const margen = parseFloat(f.margen_porcentaje) || 0
  return Math.round((compra + transp + envase) * (1 + iva / 100) * (1 + margen / 100))
}

function normalizarImagenUrl(url: string): string {
  if (!url) return ''
  // Convertir link de compartir Google Drive a URL directa
  const match = url.match(/\/file\/d\/([^/]+)/)
  if (match) return `https://drive.google.com/uc?export=view&id=${match[1]}`
  return url
}

function imagenSrc(p: Producto | null, url: string): string {
  if (url) return normalizarImagenUrl(url)
  if (p?.imagen_url) return p.imagen_url
  if (p?.imagen_drive_id) return `https://drive.google.com/uc?export=view&id=${p.imagen_drive_id}`
  return ''
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56a0]/30"

export default function Productos() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Producto | null>(null)
  const [form, setForm] = useState<FormData>(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)
  const [tab, setTab] = useState<'info' | 'costos'>('info')

  async function cargar() {
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from('productos').select('*, categoria:categorias(id,nombre)').order('nombre'),
      supabase.from('categorias').select('*').eq('activa', true).order('nombre'),
    ])
    setProductos(prods ?? [])
    setCategorias(cats ?? [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  function abrirCrear() {
    setEditando(null)
    setForm(FORM_VACIO)
    setTab('info')
    setModalAbierto(true)
  }

  function abrirEditar(p: Producto) {
    setEditando(p)
    setForm({
      nombre: p.nombre, descripcion: p.descripcion ?? '', referencia: p.referencia ?? '',
      categoria_id: p.categoria_id ?? '', imagen_url: p.imagen_url ?? '',
      unidad: p.unidad ?? '', disponible: p.disponible, destacado: p.destacado,
      costo_compra: String(p.costo_compra ?? 0), costo_transporte: String(p.costo_transporte ?? 0),
      costo_envase: String(p.costo_envase ?? 0), iva_porcentaje: String(p.iva_porcentaje ?? 19),
      margen_porcentaje: String(p.margen_porcentaje ?? 30),
      stock_actual: String(p.stock_actual), stock_minimo: String(p.stock_minimo),
    })
    setTab('info')
    setModalAbierto(true)
  }

  function cerrar() { setModalAbierto(false); setEditando(null) }

  function set(key: keyof FormData, value: string | boolean) {
    setForm(f => ({ ...f, [key]: value }))
  }

  async function guardar() {
    if (!form.nombre.trim()) return
    setGuardando(true)
    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      referencia: form.referencia.trim() || null,
      categoria_id: form.categoria_id || null,
      imagen_url: normalizarImagenUrl(form.imagen_url) || null,
      imagen_drive_id: null,
      unidad: form.unidad.trim() || null,
      disponible: form.disponible,
      destacado: form.destacado,
      costo_compra: parseFloat(form.costo_compra) || 0,
      costo_transporte: parseFloat(form.costo_transporte) || 0,
      costo_envase: parseFloat(form.costo_envase) || 0,
      iva_porcentaje: parseFloat(form.iva_porcentaje) || 19,
      margen_porcentaje: parseFloat(form.margen_porcentaje) || 30,
      stock_actual: parseInt(form.stock_actual) || 0,
      stock_minimo: parseInt(form.stock_minimo) || 5,
    }
    if (editando) {
      await supabase.from('productos').update(payload).eq('id', editando.id)
    } else {
      await supabase.from('productos').insert(payload)
    }
    setGuardando(false)
    cerrar()
    cargar()
  }

  async function toggleDisponible(p: Producto) {
    await supabase.from('productos').update({ disponible: !p.disponible }).eq('id', p.id)
    cargar()
  }

  async function eliminar(p: Producto) {
    if (!confirm(`¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`)) return
    await supabase.from('productos').delete().eq('id', p.id)
    cargar()
  }

  const filtrados = productos.filter(p =>
    !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.referencia ?? '').toLowerCase().includes(busqueda.toLowerCase())
  )

  const precioPreview = calcularPrecio(form)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Productos</h1>
          <p className="text-slate-500 text-sm mt-0.5">{productos.length} productos registrados</p>
        </div>
        <button onClick={abrirCrear}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium transition hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #1a56a0, #2ea84b)' }}>
          + Nuevo producto
        </button>
      </div>

      <div className="mb-5">
        <input type="text" placeholder="Buscar por nombre o referencia..." value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full max-w-sm px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56a0]/30" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-white rounded-xl h-16 animate-pulse" />)}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-5xl mb-3">📦</p>
          <p className="font-medium">{busqueda ? 'Sin resultados' : 'Sin productos aún'}</p>
          {!busqueda && <button onClick={abrirCrear} className="mt-4 text-[#1a56a0] text-sm underline">Crear el primero</button>}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Producto</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden md:table-cell">Categoría</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Ref.</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Stock</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600 hidden lg:table-cell">Precio</th>
                <th className="text-center px-4 py-3 font-medium text-slate-600">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtrados.map(p => {
                const imgSrc = p.imagen_url || (p.imagen_drive_id ? `https://drive.google.com/uc?export=view&id=${p.imagen_drive_id}` : '')
                const stockBajo = p.stock_actual <= p.stock_minimo
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                          {imgSrc
                            ? <img src={imgSrc} alt={p.nombre} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                            : <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs">📦</div>
                          }
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 line-clamp-1">{p.nombre}</p>
                          {p.unidad && <p className="text-xs text-slate-400">{p.unidad}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-500">
                      {(p.categoria as unknown as Categoria)?.nombre ?? <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-slate-400 font-mono text-xs">
                      {p.referencia ?? '—'}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-right">
                      <span className={`font-medium ${stockBajo ? 'text-amber-500' : 'text-slate-700'}`}>
                        {p.stock_actual}
                      </span>
                      {stockBajo && <span className="ml-1 text-xs text-amber-400">⚠️</span>}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-right text-slate-700 font-medium">
                      {p.precio_sugerido ? `$${p.precio_sugerido.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleDisponible(p)}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition ${p.disponible ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                        {p.disponible ? 'Visible' : 'Oculto'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end">
                        <button onClick={() => abrirEditar(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#1a56a0] hover:bg-blue-50 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button onClick={() => eliminar(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/40 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl my-8">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {editando ? 'Editar producto' : 'Nuevo producto'}
              </h2>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-100">
              {(['info', 'costos'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-3 text-sm font-medium transition ${tab === t ? 'text-[#1a56a0] border-b-2 border-[#1a56a0]' : 'text-slate-500 hover:text-slate-700'}`}>
                  {t === 'info' ? '📦 Información' : '💰 Costos y stock'}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-4">
              {tab === 'info' ? (
                <>
                  <Campo label="Nombre *">
                    <input value={form.nombre} onChange={e => set('nombre', e.target.value)}
                      className={inputCls} placeholder="Nombre del producto" />
                  </Campo>
                  <Campo label="Descripción">
                    <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
                      className={inputCls + ' resize-none'} rows={3} placeholder="Descripción breve del producto" />
                  </Campo>
                  <div className="grid grid-cols-2 gap-4">
                    <Campo label="Referencia">
                      <input value={form.referencia} onChange={e => set('referencia', e.target.value)}
                        className={inputCls} placeholder="Ej: CRQ-001" />
                    </Campo>
                    <Campo label="Unidad / Presentación">
                      <input value={form.unidad} onChange={e => set('unidad', e.target.value)}
                        className={inputCls} placeholder="Ej: 1 litro" />
                    </Campo>
                  </div>
                  <Campo label="Categoría">
                    <select value={form.categoria_id} onChange={e => set('categoria_id', e.target.value)}
                      className={inputCls}>
                      <option value="">Sin categoría</option>
                      {categorias.map(c => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
                    </select>
                  </Campo>
                  <Campo label="Imagen del producto">
                    <ImageUpload
                      urlActual={form.imagen_url || (editando ? imagenSrc(editando, '') : null)}
                      carpeta="productos"
                      maxPx={800}
                      onSubida={url => set('imagen_url', url)}
                    />
                  </Campo>
                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.disponible} onChange={e => set('disponible', e.target.checked)} className="w-4 h-4 rounded" />
                      <span className="text-sm text-slate-700">Visible en catálogo</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.destacado} onChange={e => set('destacado', e.target.checked)} className="w-4 h-4 rounded" />
                      <span className="text-sm text-slate-700">Destacado</span>
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <Campo label="Costo de compra ($)">
                      <input type="number" min="0" value={form.costo_compra} onChange={e => set('costo_compra', e.target.value)} className={inputCls} />
                    </Campo>
                    <Campo label="Costo de transporte ($)">
                      <input type="number" min="0" value={form.costo_transporte} onChange={e => set('costo_transporte', e.target.value)} className={inputCls} />
                    </Campo>
                    <Campo label="Costo de envase ($)">
                      <input type="number" min="0" value={form.costo_envase} onChange={e => set('costo_envase', e.target.value)} className={inputCls} />
                    </Campo>
                    <Campo label="IVA (%)">
                      <input type="number" min="0" max="100" value={form.iva_porcentaje} onChange={e => set('iva_porcentaje', e.target.value)} className={inputCls} />
                    </Campo>
                    <Campo label="Margen de utilidad (%)">
                      <input type="number" min="0" value={form.margen_porcentaje} onChange={e => set('margen_porcentaje', e.target.value)} className={inputCls} />
                    </Campo>
                    <div className="flex items-end">
                      <div className="w-full p-3 rounded-lg bg-green-50 border border-green-100">
                        <p className="text-xs text-green-600 font-medium mb-0.5">Precio sugerido</p>
                        <p className="text-xl font-bold text-green-700">${precioPreview.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                    <Campo label="Stock actual (unidades)">
                      <input type="number" min="0" value={form.stock_actual} onChange={e => set('stock_actual', e.target.value)} className={inputCls} />
                    </Campo>
                    <Campo label="Stock mínimo (alerta)">
                      <input type="number" min="0" value={form.stock_minimo} onChange={e => set('stock_minimo', e.target.value)} className={inputCls} />
                    </Campo>
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-slate-100">
              <button onClick={cerrar}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition">
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando || !form.nombre.trim()}
                className="flex-1 py-2 rounded-lg text-white text-sm font-medium transition disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #1a56a0, #2ea84b)' }}>
                {guardando ? 'Guardando...' : 'Guardar producto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
