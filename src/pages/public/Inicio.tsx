import { Link } from 'react-router-dom'
import logo from '../../assets/cruquim.png'

const servicios = [
  { icono: '🏠', titulo: 'Hogares', desc: 'Productos seguros y efectivos para el cuidado del hogar.' },
  { icono: '🏢', titulo: 'Empresas', desc: 'Soluciones industriales para oficinas e instituciones.' },
  { icono: '🍽️', titulo: 'Restaurantes', desc: 'Desengrasantes y desinfectantes para cocinas profesionales.' },
  { icono: '📦', titulo: 'Mayoristas', desc: 'Precios especiales para distribuidores y comercios.' },
]

export default function Inicio() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden py-24 px-4"
        style={{ background: 'linear-gradient(135deg, #0f3d7a 0%, #1a56a0 50%, #2ea84b 100%)' }}>
        <div className="max-w-4xl mx-auto text-center text-white">
          <img src={logo} alt="CRUQUIM" className="h-20 w-auto mx-auto mb-6" />
          <p className="text-sm font-semibold uppercase tracking-widest text-green-300 mb-3">
            Soluciones de limpieza profesional
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Limpieza que se<br />
            <span className="text-green-300">nota y se siente</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-10">
            En CRUQUIM ofrecemos productos de limpieza de alta calidad para hogares,
            empresas y comercios. Catálogo completo con atención personalizada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/catalogo"
              className="px-8 py-3 bg-white text-[#1a56a0] font-semibold rounded-lg hover:bg-blue-50 transition">
              Ver catálogo
            </Link>
            <a href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER ?? '573217630395'}?text=${encodeURIComponent('Hola, me gustaría información sobre los productos de CRUQUIM. ¿Me pueden ayudar?')}`}
              target="_blank" rel="noopener noreferrer"
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition">
              Contactar por WhatsApp
            </a>
          </div>
        </div>
        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 0C1440 0 1080 60 720 60C360 60 0 0 0 0L0 60Z" fill="#f8fafc" />
          </svg>
        </div>
      </section>

      {/* Servicios */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-800 mb-3">¿A quién servimos?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Nuestros productos están diseñados para diferentes sectores y necesidades.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {servicios.map(s => (
              <div key={s.titulo} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center hover:shadow-md transition">
                <div className="text-4xl mb-4">{s.icono}</div>
                <h3 className="font-bold text-slate-800 mb-2">{s.titulo}</h3>
                <p className="text-slate-500 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-slate-50">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">¿Listo para pedir?</h2>
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
