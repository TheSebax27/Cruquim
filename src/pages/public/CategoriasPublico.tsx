import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Categoria } from '../../types'

export default function CategoriasPublico() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('categorias').select('*').eq('activa', true).order('nombre')
      .then(({ data }) => { setCategorias(data ?? []); setLoading(false) })
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 py-14">
      <div className="text-center mb-12">
        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#2ea84b' }}>
          CATEGORÍAS
        </p>
        <h1 className="text-4xl font-black text-slate-800 mb-2">
          Encuentra el producto <span style={{ color: '#2ea84b' }}>ideal</span>
        </h1>
        <div className="w-10 h-1 mx-auto mt-3 rounded-full" style={{ backgroundColor: '#2ea84b' }} />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-44 animate-pulse shadow-sm" />
          ))}
        </div>
      ) : categorias.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-5xl mb-3">🗂️</p>
          <p className="font-medium">Próximamente</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
          {categorias.map(c => (
            <Link key={c.id} to={`/catalogo?cat=${c.id}`}
              className="group flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-green-100 transition">
              <div className="w-28 h-28 rounded-xl overflow-hidden bg-slate-50">
                {c.icono
                  ? <img src={c.icono} alt={c.nombre} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                  : <div className="w-full h-full flex items-center justify-center text-5xl">🧴</div>
                }
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-800">{c.nombre}</p>
                {c.descripcion && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{c.descripcion}</p>}
              </div>
              <span className="text-xs font-semibold mt-auto flex items-center gap-1" style={{ color: '#1a56a0' }}>
                Ver productos
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
