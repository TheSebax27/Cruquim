import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import ImageUpload from '../../components/shared/ImageUpload'
import type { Categoria } from '../../types'

interface FormData {
  nombre: string
  descripcion: string
  imagen_url: string
  activa: boolean
}

const FORM_VACIO: FormData = { nombre: '', descripcion: '', imagen_url: '', activa: true }

export default function Categorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [form, setForm] = useState<FormData>(FORM_VACIO)
  const [guardando, setGuardando] = useState(false)
  const [eliminando, setEliminando] = useState<string | null>(null)
  const [errorImg, setErrorImg] = useState('')

  async function cargar() {
    const { data } = await supabase.from('categorias').select('*').order('nombre')
    setCategorias(data ?? [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  function abrirCrear() {
    setEditando(null)
    setForm(FORM_VACIO)
    setErrorImg('')
    setModalAbierto(true)
  }

  function abrirEditar(c: Categoria) {
    setEditando(c)
    setForm({ nombre: c.nombre, descripcion: c.descripcion ?? '', imagen_url: c.icono ?? '', activa: c.activa })
    setErrorImg('')
    setModalAbierto(true)
  }

  function cerrar() { setModalAbierto(false); setEditando(null) }

  async function guardar() {
    if (!form.nombre.trim()) return
    setGuardando(true)
    const payload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      icono: form.imagen_url || null,
      activa: form.activa,
    }
    if (editando) {
      await supabase.from('categorias').update(payload).eq('id', editando.id)
    } else {
      await supabase.from('categorias').insert(payload)
    }
    setGuardando(false)
    cerrar()
    cargar()
  }

  async function toggleActiva(c: Categoria) {
    await supabase.from('categorias').update({ activa: !c.activa }).eq('id', c.id)
    cargar()
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar esta categoría? Los productos quedarán sin categoría.')) return
    setEliminando(id)
    await supabase.from('categorias').delete().eq('id', id)
    setEliminando(null)
    cargar()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Categorías</h1>
          <p className="text-slate-500 text-sm mt-0.5">{categorias.length} categorías registradas</p>
        </div>
        <button onClick={abrirCrear}
          className="px-4 py-2 rounded-lg text-white text-sm font-medium transition hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #1a56a0, #2ea84b)' }}>
          + Nueva categoría
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 h-24 animate-pulse shadow-sm" />
          ))}
        </div>
      ) : categorias.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-5xl mb-3">🗂️</p>
          <p className="font-medium">Sin categorías aún</p>
          <button onClick={abrirCrear} className="mt-4 text-[#1a56a0] text-sm underline">Crear la primera</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categorias.map(c => (
            <div key={c.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                {c.icono
                  ? <img src={c.icono} alt={c.nombre} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-slate-300 text-xl">🗂️</div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800 truncate">{c.nombre}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${c.activa ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {c.activa ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                {c.descripcion && <p className="text-xs text-slate-400 truncate mt-0.5">{c.descripcion}</p>}
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                <button onClick={() => abrirEditar(c)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#1a56a0] hover:bg-blue-50 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button onClick={() => toggleActiva(c)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 transition">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button onClick={() => eliminar(c.id)} disabled={eliminando === c.id}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-5">
              {editando ? 'Editar categoría' : 'Nueva categoría'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nombre *</label>
                <input value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56a0]/30"
                  placeholder="Ej: Desengrasantes" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Descripción</label>
                <input value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56a0]/30"
                  placeholder="Descripción breve" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2">Imagen de la categoría</label>
                <ImageUpload
                  urlActual={form.imagen_url || null}
                  carpeta="categorias"
                  maxPx={400}
                  onSubida={url => setForm(f => ({ ...f, imagen_url: url }))}
                  onError={setErrorImg}
                />
                {errorImg && <p className="text-xs text-red-500 mt-1">{errorImg}</p>}
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={form.activa} onChange={e => setForm(f => ({ ...f, activa: e.target.checked }))}
                  className="w-4 h-4 rounded" />
                <span className="text-sm font-medium text-slate-700">Categoría activa (visible en el catálogo)</span>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={cerrar}
                className="flex-1 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition">
                Cancelar
              </button>
              <button onClick={guardar} disabled={guardando || !form.nombre.trim()}
                className="flex-1 py-2 rounded-lg text-white text-sm font-medium transition disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #1a56a0, #2ea84b)' }}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
