import { useCart } from '../../context/CartContext'

interface Props {
  onClick: () => void
}

export default function CartButton({ onClick }: Props) {
  const { count } = useCart()

  return (
    <button
      onClick={onClick}
      aria-label="Ver carrito"
      className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition hover:scale-110 active:scale-95"
      style={{ background: 'linear-gradient(135deg, #1a56a0, #2ea84b)' }}
    >
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}
