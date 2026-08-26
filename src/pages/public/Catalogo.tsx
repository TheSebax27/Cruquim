import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Producto, Categoria } from '../../types'

const WA = import.meta.env.VITE_WHATSAPP_NUMBER ?? '573001234567'

function imagenUrl(producto: Producto): string {
  if (producto.imagen_url) return producto.imagen_url
  if (producto.imagen_drive_id)
    return `https://drive.google.com/uc?export=view&id=${producto.imagen_drive_id}`
  return '/placeholder-product.png'
}

function CardProducto({ p }: { p: Producto }) {
  const msg = encodeURIComponent(`Hola, me interesa el producto: ${p.nombre}${p.referencia ? ` (Ref: ${p.referencia})` : ''}`)
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
        <div className="mt-auto">
          <a
            href={`https://wa.me/${WA}?text=${msg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-white text-sm font-medium transition hover:opacity-90"
            style={{ backgroundColor: '#25D366' }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Pedir por WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

export default function Catalogo() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [categoriaActiva, setCategoriaActiva] = useState<string>('all')
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
