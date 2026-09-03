import logo from '../../assets/cruquim.png'

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-400 text-sm">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="CRUQUIM" className="h-8 w-auto brightness-0 invert" />
          <span>— Soluciones de limpieza profesional</span>
        </div>
        <p>© {new Date().getFullYear()} CRUQUIM. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
