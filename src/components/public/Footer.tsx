export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-400 text-sm">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-xs"
            style={{ background: 'linear-gradient(135deg, #1a56a0, #2ea84b)' }}>
            CQ
          </div>
          <span className="text-white font-semibold">CRUQUIM</span>
          <span>— Soluciones de limpieza profesional</span>
        </div>
        <p>© {new Date().getFullYear()} CRUQUIM. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
