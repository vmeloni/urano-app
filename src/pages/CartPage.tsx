import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = getTotalPrice();

  // Formatear precio en pesos argentinos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(price);
  };

  // Si el carrito está vacío
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-rosa-100 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/catalogo')}
            className="flex items-center gap-2 text-azul hover:text-azul-600 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver al catálogo</span>
          </button>

          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-600 mb-6">
              Explorá nuestro catálogo y agregá productos a tu carrito
            </p>
            <button
              onClick={() => navigate('/catalogo')}
              className="bg-azul hover:bg-azul-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              Ver catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Carrito con productos
  return (
    <div className="min-h-screen bg-rosa-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/catalogo')}
              className="flex items-center gap-2 text-azul hover:text-azul-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver al catálogo</span>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">
              Mi Carrito ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})
            </h1>
          </div>

          <button
            onClick={clearCart}
            className="text-sm text-terracota hover:text-terracota-500 transition-colors font-medium"
          >
            Vaciar carrito
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de productos */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md p-4 flex flex-col sm:flex-row gap-4"
              >
                {/* Imagen */}
                <img
                  src={
                    item.coverImage ||
                    'https://via.placeholder.com/100x140?text=Sin+imagen'
                  }
                  alt={item.title}
                  className="w-20 h-28 object-cover rounded flex-shrink-0"
                />

                {/* Info del producto */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">{item.author}</p>
                  <p className="text-xs text-gray-500 mb-2">
                    {item.sello} • ISBN: {item.isbn}
                  </p>
                  <p className="text-lg font-bold text-azul">
                    {formatPrice(item.price)}
                  </p>
                </div>

                {/* Controles de cantidad */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-4">
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-terracota hover:text-terracota-500 transition-colors"
                    aria-label="Eliminar producto"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>

                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="h-4 w-4" />
                      </button>

                      <span className="w-12 text-center font-medium">
                        {item.quantity}
                      </span>

                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="text-sm font-semibold text-gray-900">
                      Subtotal: {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen del pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Resumen del pedido
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Productos ({totalItems})</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-azul">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-azul hover:bg-azul-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                Confirmar pedido
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Los precios incluyen IVA
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

