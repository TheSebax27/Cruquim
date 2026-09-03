import { useRef, useState } from 'react'
import { subirImagenWebP } from '../../lib/imageUpload'

interface Props {
  urlActual: string | null
  carpeta: string
  maxPx?: number
  onSubida: (url: string) => void
  onError?: (msg: string) => void
}

export default function ImageUpload({ urlActual, carpeta, maxPx = 800, onSubida, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [subiendo, setSubiendo] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Preview local inmediato
    setPreview(URL.createObjectURL(file))
    setSubiendo(true)

    try {
      const url = await subirImagenWebP(file, { carpeta, maxPx, calidad: 0.85 })
      onSubida(url)
    } catch (err) {
      onError?.('Error al subir la imagen. Intenta de nuevo.')
      setPreview(null)
    } finally {
      setSubiendo(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const src = preview ?? urlActual

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      <div
        onClick={() => !subiendo && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition cursor-pointer
          ${subiendo ? 'opacity-60 cursor-wait' : 'hover:border-[#1a56a0] hover:bg-blue-50/40'}
          ${src ? 'border-slate-200' : 'border-slate-200 bg-slate-50'}`}
        style={{ minHeight: src ? 'auto' : '120px' }}
      >
        {src ? (
          <div className="relative w-full">
            <img
              src={src}
              alt="Imagen"
              className="w-full rounded-xl object-cover"
              style={{ maxHeight: '200px' }}
            />
            {!subiendo && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/0 hover:bg-black/30 transition group">
                <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition">
                  Cambiar imagen
                </span>
              </div>
            )}
            {subiendo && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center px-4">
            {subiendo ? (
              <>
                <div className="w-8 h-8 border-2 border-[#1a56a0] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-sm text-slate-400">Convirtiendo y subiendo...</p>
              </>
            ) : (
              <>
                <svg className="w-8 h-8 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-slate-400">Clic para subir imagen</p>
                <p className="text-xs text-slate-300 mt-0.5">PNG, JPG, HEIC… se convierte a WebP automáticamente</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
