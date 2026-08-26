export interface Categoria {
  id: string
  nombre: string
  descripcion: string | null
  icono: string | null
  activa: boolean
  created_at: string
}

export interface Producto {
  id: string
  nombre: string
  descripcion: string | null
  referencia: string | null
  categoria_id: string
  categoria?: Categoria
  imagen_drive_id: string | null
  imagen_url: string | null
  unidad: string | null
  disponible: boolean
  destacado: boolean
  // Costos (solo admin)
  costo_compra: number | null
  costo_transporte: number | null
  costo_envase: number | null
  iva_porcentaje: number | null
  margen_porcentaje: number | null
  precio_sugerido: number | null
  stock_actual: number
  stock_minimo: number
  created_at: string
  updated_at: string
}

export interface MovimientoInventario {
  id: string
  producto_id: string
  producto?: Producto
  tipo: 'entrada' | 'salida'
  cantidad: number
  motivo: string | null
  created_at: string
}
