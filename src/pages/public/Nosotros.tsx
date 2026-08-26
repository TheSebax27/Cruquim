const valores = [
  { icono: '💧', titulo: 'Calidad', desc: 'Productos formulados con estándares profesionales.' },
  { icono: '🌿', titulo: 'Sostenibilidad', desc: 'Comprometidos con el medio ambiente en cada proceso.' },
  { icono: '🤝', titulo: 'Confianza', desc: 'Relaciones duraderas con nuestros clientes y proveedores.' },
  { icono: '⚡', titulo: 'Eficiencia', desc: 'Resultados visibles con menor esfuerzo y tiempo.' },
]

export default function Nosotros() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">Sobre CRUQUIM</h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
          Somos una empresa especializada en soluciones de limpieza para el sector doméstico,
          comercial e industrial. Nuestra misión es ofrecer productos de alta calidad que
          garanticen higiene, frescura y confianza en cada espacio.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16 items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Nuestra historia</h2>
          <p className="text-slate-500 leading-relaxed mb-4">
            CRUQUIM nació con el objetivo de democratizar el acceso a productos de limpieza
            profesional. Creemos que un espacio limpio es sinónimo de bienestar, productividad
            y salud.
          </p>
          <p className="text-slate-500 leading-relaxed">
            Hoy atendemos a hogares, restaurantes, empresas e instituciones con un catálogo
            cuidadosamente seleccionado y una atención personalizada que nos distingue.
          </p>
        </div>
        <div className="rounded-2xl overflow-hidden h-64 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #1a56a0, #2ea84b)' }}>
          <div className="text-white text-center">
            <div className="text-6xl font-black opacity-20 select-none">CQ</div>
            <p className="text-sm opacity-70 mt-2">CRUQUIM</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {valores.map(v => (
          <div key={v.titulo} className="text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100">
            <div className="text-4xl mb-3">{v.icono}</div>
            <h3 className="font-bold text-slate-800 mb-2">{v.titulo}</h3>
            <p className="text-sm text-slate-500">{v.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
