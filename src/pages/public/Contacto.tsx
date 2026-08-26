const WA = import.meta.env.VITE_WHATSAPP_NUMBER ?? '573217630395'

export default function Contacto() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-slate-800 mb-3">Contáctenos</h1>
        <p className="text-slate-500 max-w-xl mx-auto">
          Estamos listos para atenderle. Escríbanos por WhatsApp para consultas, pedidos o información sobre nuestros productos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <a
          href={`https://wa.me/${WA}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center hover:shadow-md hover:border-green-200 transition"
        >
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition"
            style={{ backgroundColor: '#25D366' }}>
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <h3 className="font-bold text-slate-800 mb-1">WhatsApp</h3>
          <p className="text-sm text-slate-500">Chatea con nosotros ahora</p>
        </a>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-blue-50">
            <svg className="w-6 h-6 text-[#1a56a0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Correo</h3>
          <p className="text-sm text-slate-500">info@cruquim.com</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 bg-green-50">
            <svg className="w-6 h-6 text-[#2ea84b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-slate-800 mb-1">Ubicación</h3>
          <p className="text-sm text-slate-500">Colombia</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
        <h2 className="text-xl font-bold text-slate-800 mb-3">¿Listo para hacer su pedido?</h2>
        <p className="text-slate-500 mb-6">
          Haga clic en el botón y nos escribirá directamente por WhatsApp. Le respondemos en minutos.
        </p>
        <a
          href={`https://wa.me/${WA}?text=${encodeURIComponent('Hola, me gustaría hacer un pedido de productos CRUQUIM. ¿Me pueden asesorar?')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-lg text-white font-semibold transition hover:opacity-90"
          style={{ backgroundColor: '#25D366' }}
        >
          Escribir por WhatsApp
        </a>
      </div>
    </div>
  )
}
