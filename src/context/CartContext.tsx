import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Producto } from '../types'

export interface CartItem {
  producto: Producto
  cantidad: number
}

interface CartCtx {
  items: CartItem[]
  agregar: (p: Producto) => void
  quitar: (id: string) => void
  actualizar: (id: string, cantidad: number) => void
  vaciar: () => void
  count: number
  total: number
}

const CartContext = createContext<CartCtx | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('cruquim_cart')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  useEffect(() => {
    try { localStorage.setItem('cruquim_cart', JSON.stringify(items)) } catch {}
  }, [items])

  function agregar(p: Producto) {
    setItems(prev => {
      const existe = prev.find(i => i.producto.id === p.id)
      if (existe) return prev.map(i => i.producto.id === p.id ? { ...i, cantidad: i.cantidad + 1 } : i)
      return [...prev, { producto: p, cantidad: 1 }]
    })
  }

  function quitar(id: string) {
    setItems(prev => prev.filter(i => i.producto.id !== id))
  }

  function actualizar(id: string, cantidad: number) {
    if (cantidad <= 0) { quitar(id); return }
    setItems(prev => prev.map(i => i.producto.id === id ? { ...i, cantidad } : i))
  }

  function vaciar() { setItems([]) }

  const count = items.reduce((s, i) => s + i.cantidad, 0)
  const total = items.reduce((s, i) => s + (i.producto.precio_sugerido ?? 0) * i.cantidad, 0)

  return (
    <CartContext.Provider value={{ items, agregar, quitar, actualizar, vaciar, count, total }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}
