import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import WhatsAppButton from '../shared/WhatsAppButton'
import { CartProvider } from '../../context/CartContext'
import CartDrawer from './CartDrawer'
import CartButton from './CartButton'

export default function PublicLayout() {
  const [drawerAbierto, setDrawerAbierto] = useState(false)

  return (
    <CartProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
        <WhatsAppButton />
        <CartButton onClick={() => setDrawerAbierto(true)} />
        <CartDrawer abierto={drawerAbierto} onCerrar={() => setDrawerAbierto(false)} />
      </div>
    </CartProvider>
  )
}
