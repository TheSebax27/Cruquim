import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Categoria } from '../../types'
import fondoInicio from '../../assets/fondoinicio.png'

const WA = import.meta.env.VITE_WHATSAPP_NUMBER ?? '573217630395'
const WA_MSG = encodeURIComponent('Hola, me gustaría información sobre los productos de CRUQUIM. ¿Me pueden ayudar?')

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    titulo: 'Calidad garantizada',
    desc: 'Productos efectivos',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    titulo: 'Cuidado del hogar y del planeta',
    desc: 'Fórmulas responsables',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    titulo: 'Confianza y respaldo',
    desc: 'Marcas en las que puedes confiar',
  },
]

export default function Inicio() {
  const [categorias, setCategorias] = useState<Categoria[]>([])

  useEffect(() => {
    supabase.from('categorias').select('*').eq('activa', true).order('nombre').limit(6)
      .then(({ data }) => setCategorias(data ?? []))
  }, [])

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-0 flex flex-col md:flex-row items-center min-h-[calc(100vh-80px)]">
          {/* Texto */}
          <div className="flex-1 py-12 md:pr-12 z-10">
            <p className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: '#2ea84b' }}>
              CRUQUIM
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-tight mb-5">
              Limpieza que se ve,{' '}
              <span style={{ color: '#2ea84b' }}>calidad</span>{' '}
              que se siente.
            </h1>
            <p className="text-slate-500 text-lg mb-8 max-w-md leading-relaxed">
              Productos de limpieza de alta calidad para el hogar,
              tu negocio o empresa.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <Link to="/catalogo"
                className="px-7 py-3 rounded-lg font-semibold text-white text-sm transition hover:opacity-90 text-center"
                style={{ background: 'linear-gradient(135deg, #1a56a0, #2ea84b)' }}>
                Ver productos
              </Link>
              <a href={`https://wa.me/${WA}?text=${WA_MSG}`}
                target="_blank" rel="noopener noreferrer"
                className="px-7 py-3 rounded-lg font-semibold text-slate-700 text-sm border border-slate-200 hover:bg-slate-50 transition text-center">
                Contactar por WhatsApp
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {features.map(f => (
                <div key={f.titulo} className="flex items-start gap-2.5">
                  <div className="mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: '#e8f5e9', color: '#2ea84b' }}>
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800 leading-tight">{f.titulo}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Imagen */}
          <div className="flex-1 flex items-end justify-center md:justify-end md:self-end">
            <img
              src={fondoInicio}
              alt="Productos CRUQUIM"
              className="w-full max-w-lg md:max-w-none object-contain"
              style={{ maxHeight: 'calc(100vh - 80px)' }}
            />
          </div>
        </div>
      </section>

      {/* ── Categorías ── */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: '#2ea84b' }}>
              CATEGORÍAS
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-slate-800">
              Encuentra el producto <span style={{ color: '#2ea84b' }}>ideal</span>
            </h2>
            <div className="w-10 h-1 mx-auto mt-3 rounded-full" style={{ backgroundColor: '#2ea84b' }} />
          </div>

          {categorias.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {categorias.map(c => (
                  <Link key={c.id} to={`/catalogo?cat=${c.id}`}
                    className="group flex flex-col items-center gap-3 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-green-100 transition">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-50">
                      {c.icono
                        ? <img src={c.icono} alt={c.nombre} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                        : <div className="w-full h-full flex items-center justify-center text-3xl">🧴</div>
                      }
                    </div>
                    <p className="text-sm font-semibold text-slate-700 text-center leading-tight">{c.nombre}</p>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link to="/categorias"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-white hover:shadow-sm transition">
                  Ver todas las categorías
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <p className="text-sm">Las categorías aparecerán aquí una vez que las crees desde el panel admin.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-black text-slate-800 mb-3">¿Listo para pedir?</h2>
          <p className="text-slate-500 mb-8">
            Explore nuestro catálogo y escríbanos directamente por WhatsApp para hacer su pedido.
          </p>
          <Link to="/catalogo"
            className="inline-block px-10 py-3 rounded-lg text-white font-semibold transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #1a56a0, #2ea84b)' }}>
            Explorar catálogo →
          </Link>
        </div>
      </section>
    </div>
  )
}
