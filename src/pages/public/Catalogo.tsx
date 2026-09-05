import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Producto, Categoria } from '../../types'
import { useCart } from '../../context/CartContext'

function imagenUrl(producto: Producto): string {
  if (producto.imagen_url) return producto.imagen_url
  if (producto.imagen_drive_id)
    return `https://drive.google.com/uc?export=view&id=${producto.imagen_drive_id}`
  return '/placeholder-product.png'
}

function CardProducto({ p }: { p: Producto }) {
  const { agregar, items } = useCart()
  const [agregado, setAgregado] = useState(false)
  const enCarrito = items.some(i => i.producto.id === p.id)

  function handleAgregar() {
    agregar(p)
    setAgregado(true)
    setTimeout(() => setAgregado(false), 1500)
  }

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition flex flex-col">
      <div className="aspect-square bg-slate-50 overflow-hidden">
        <img
          src={imagenUrl(p)}
          alt={p.nombre}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = '/placeholder-product.png' }}
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        {p.categoria && (
          <span className="text-xs font-medium text-[#2ea84b] uppercase tracking-wide mb-1">
            {p.categoria.nombre}
          </span>
        )}
        <h3 className="font-semibold text-slate-800 mb-1 line-clamp-2">{p.nombre}</h3>
        {p.referencia && <p className="text-xs text-slate-400 mb-2">Ref: {p.referencia}</p>}
        {p.descripcion && <p className="text-sm text-slate-500 line-clamp-3 mb-4">{p.descripcion}</p>}
        {p.unidad && <p className="text-xs text-slate-400 mb-3">Presentación: {p.unidad}</p>}
        {p.precio_sugerido ? (
          <p className="text-sm font-bold mb-3" style={{ color: '#2ea84b' }}>
            ${p.precio_sugerido.toLocaleString('es-CO')}
          </p>
        ) : null}
        <div className="mt-auto">
          <button
            onClick={handleAgregar}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-white text-sm font-medium transition"
            style={{ background: agregado ? '#2ea84b' : enCarrito ? '#1a56a0' : 'linear-gradient(135deg, #1a56a0, #2ea84b)' }}
          >
            {agregado ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Agregado
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {enCarrito ? 'Agregar otro' : 'Agregar al carrito'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Catalogo() {
  const [searchParams] = useSearchParams()
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState<string>(searchParams.get('cat') ?? 'all')
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      const [{ data: prods }, { data: cats }] = await Promise.all([
        supabase
          .from('productos')
          .select('*, categoria:categorias(id, nombre)')
          .eq('disponible', true)
          .order('nombre'),
        supabase.from('categorias').select('*').eq('activa', true).order('nombre'),
      ])
      setProductos(prods ?? [])
      setCategorias(cats ?? [])
      setLoading(false)
    }
    cargar()
  }, [])

  const filtrados = productos.filter(p => {
    const enCategoria = categoriaActiva === 'all' || p.categoria_id === categoriaActiva
    const enBusqueda = !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase())
    return enCategoria && enBusqueda
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Catálogo de productos</h1>
        <p className="text-slate-500">Explore nuestra línea completa de soluciones de limpieza.</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56a0]/30"
        />
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCategoriaActiva('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${categoriaActiva === 'all' ? 'bg-[#1a56a0] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            Todos
          </button>
          {categorias.map(c => (
            <button
              key={c.id}
              onClick={() => setCategoriaActiva(c.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${categoriaActiva === c.id ? 'bg-[#1a56a0] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {c.nombre}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
              <div className="aspect-square bg-slate-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 bg-slate-100 rounded w-1/3" />
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-full" />
                <div className="h-8 bg-slate-100 rounded mt-4" />
              </div>
            </div>
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-medium">No se encontraron productos</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtrados.map(p => <CardProducto key={p.id} p={p} />)}
        </div>
      )}
    </div>
  )
}
