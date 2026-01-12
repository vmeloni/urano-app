import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import BookImage from '@/components/BookImage';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = getTotalPrice();

  // Formatear precio en pesos argentinos
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Enviar pedido directamente
  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generar número de pedido
      const orderNum = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0');

      // Crear objeto de pedido
      const newOrder = {
        orderNumber: orderNum,
        customerId: user?.email || 'demo',
        customerName: user?.name || 'Librería El Ateneo',
        status: 'abierto',
        createdAt: new Date().toISOString(),
        items: items.map((item) => ({
          productId: item.id,
          isbn: item.isbn,
          title: item.title,
          author: item.author,
          sello: item.sello,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        })),
        totalItems: totalItems,
        totalPrice: totalPrice,
        observations: observations.trim() || null,
      };

      // Crear pedido en la API
      await api.post('/orders', newOrder);

      // Toast de éxito
      toast.success(`Pedido #${orderNum} enviado correctamente`, {
        duration: 4000,
        position: 'bottom-right',
      });

      // Redireccionar inmediatamente
      navigate('/pedidos');

      // Limpiar carrito DESPUÉS de navegar
      setTimeout(() => {
        clearCart();
      }, 500);
    } catch (error) {
      console.error('Error al enviar el pedido:', error);
      toast.error('Error al enviar el pedido. Intentá nuevamente.', {
        duration: 3000,
        position: 'bottom-right',
      });
      setIsSubmitting(false);
    }
  };

  // Si el carrito está vacío (pero no durante submit)
  if (items.length === 0 && !isSubmitting) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </button>

          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Tu carrito está vacío
            </h2>
            <p className="text-gray-600 mb-6">
              Explorá nuestro catálogo y agregá productos a tu carrito
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-[#5B7C99] hover:opacity-90 text-white px-6 py-3 rounded-lg transition-opacity font-medium"
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
    <div className="min-h-screen bg-white py-8 relative">
      {/* Loading Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center min-w-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B7C99] mx-auto mb-4"></div>
            <p className="font-semibold text-gray-900">Enviando pedido...</p>
            <p className="text-sm text-gray-600 mt-2">Por favor esperá</p>
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* Breadcrumb/Volver */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </button>

        {/* Título */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Mi Carrito ({totalItems} {totalItems === 1 ? 'producto' : 'productos'})
          </h1>
          <button
            onClick={clearCart}
            className="text-sm text-red-600 hover:underline transition-colors"
          >
            Vaciar carrito
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda: Items (2/3) */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg border border-gray-200 p-4 flex gap-4"
              >
                {/* Imagen */}
                <BookImage
                  src={item.coverImage}
                  alt={item.title}
                  className="w-20 h-28 object-cover rounded flex-shrink-0"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-gray-500 mb-1">{item.author}</p>
                  <p className="text-xs text-gray-600 mb-2">
                    {item.sello} • ISBN: {item.isbn}
                  </p>

                  {/* Precio unitario */}
                  <p className="text-sm font-semibold mb-2" style={{ color: '#5B7C99' }}>
                    {formatPrice(item.price)}
                  </p>
                </div>

                {/* Cantidad + Subtotal */}
                <div className="flex flex-col items-end justify-between">
                  {/* Controles cantidad */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        updateQuantity(item.id, Math.max(1, val));
                      }}
                      className="w-16 text-center border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 border border-gray-300 rounded hover:bg-gray-50 transition-colors flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <p className="text-base font-bold mt-2" style={{ color: '#5B7C99' }}>
                    {formatPrice(item.price * item.quantity)}
                  </p>

                  {/* Eliminar */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-xs text-red-600 hover:underline mt-2"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Columna derecha: Resumen (1/3) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
              <h2 className="font-bold text-lg mb-4">Resumen del pedido</h2>

              <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Productos ({totalItems})</span>
                  <span className="font-semibold">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* Observaciones */}
              <div className="mb-4">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Observaciones (opcional)
                </label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Agregá notas o instrucciones especiales..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{observations.length}/500 caracteres</p>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="font-bold text-lg">Total</span>
                <span className="font-bold text-2xl" style={{ color: '#5B7C99' }}>
                  {formatPrice(totalPrice)}
                </span>
              </div>

              <button
                onClick={handleSubmitOrder}
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg font-semibold mb-3 transition-opacity ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#5B7C99] hover:opacity-90 text-white'
                }`}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar pedido'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                Los precios incluyen IVA
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
