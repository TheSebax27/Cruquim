import { supabase } from './supabase'

interface OpcionesSubida {
  bucket?: string
  maxPx?: number       // dimensión máxima en píxeles
  calidad?: number     // 0-1, calidad WebP
  carpeta?: string
}

export async function subirImagenWebP(
  file: File,
  opciones: OpcionesSubida = {}
): Promise<string> {
  const {
    bucket = 'imagenes',
    maxPx = 800,
    calidad = 0.85,
    carpeta = 'varios',
  } = opciones

  // 1. Dibujar en canvas y redimensionar
  const bitmap = await createImageBitmap(file)
  const ratio = Math.min(maxPx / bitmap.width, maxPx / bitmap.height, 1)
  const w = Math.round(bitmap.width * ratio)
  const h = Math.round(bitmap.height * ratio)

  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()

  // 2. Convertir a WebP
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      b => b ? resolve(b) : reject(new Error('No se pudo convertir la imagen')),
      'image/webp',
      calidad
    )
  })

  // 3. Subir a Supabase Storage
  const nombre = `${carpeta}/${Date.now()}.webp`
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(nombre, blob, { contentType: 'image/webp', upsert: true })

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path)
  return publicUrl
}

export async function eliminarImagen(url: string): Promise<void> {
  // Extraer el path desde la URL pública de Supabase
  const match = url.match(/\/storage\/v1\/object\/public\/imagenes\/(.+)/)
  if (!match) return
  await supabase.storage.from('imagenes').remove([match[1]])
}
