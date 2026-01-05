import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [observations, setObservations] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const totalPrice = getTotalPrice();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(price);
  };

  // Redirigir si no hay items
  useEffect(() => {
    if (items.length === 0 && !orderConfirmed) {
      navigate('/cart');
    }
  }, [items.length, orderConfirmed, navigate]);

  // Confirmar pedido
  const handleConfirmOrder = async () => {
    setIsSubmitting(true);

    try {
      // Generar número de pedido
      const orderNum = `#${String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0')}`;

      // Crear objeto de pedido
      const newOrder = {
        orderNumber: orderNum,
        customerId: user?.email || 'demo',
        customerName: user?.name || 'Librería El Ateneo',
        status: 'in-preparation',
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

      // Guardar en db.json
      await api.post('/orders', newOrder);

      // Actualizar estado
      setOrderNumber(orderNum);
      setOrderConfirmed(true);

      // Limpiar carrito
      clearCart();

      toast.success('¡Pedido confirmado exitosamente!');
    } catch (error) {
      console.error('Error al crear pedido:', error);
      toast.error('Hubo un error al confirmar el pedido. Intentá nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si no hay items, no mostrar nada (se redirige)
  if (items.length === 0 && !orderConfirmed) {
    return null;
  }

  // Pantalla de confirmación
  if (orderConfirmed) {
    return (
      <div className="min-h-screen bg-rosa-100 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Pedido confirmado!
            </h1>

            <p className="text-gray-600 mb-6">
              Tu pedido <span className="font-semibold">{orderNumber}</span> ha sido registrado
              correctamente.
            </p>

            <div className="bg-rosa-50 rounded-lg p-4 mb-6">
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Total de productos:</strong> {totalItems}
                </p>
                <p>
                  <strong>Monto total:</strong> {formatPrice(totalPrice)}
                </p>
                <p>
                  <strong>Estado:</strong> En preparación
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/pedidos')}
                className="bg-azul hover:bg-azul-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Ver mis pedidos
              </button>

              <button
                onClick={() => navigate('/catalogo')}
                className="border border-azul text-azul hover:bg-azul-50 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Volver al catálogo
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Pantalla de checkout
  return (
    <div className="min-h-screen bg-rosa-100 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-azul hover:text-azul-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al carrito</span>
        </button>

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Confirmar pedido</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resumen de productos */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lista de productos */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos ({totalItems})
              </h2>

              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start py-3 border-b border-gray-200 last:border-b-0"
                  >
                    <div className="flex gap-3 flex-1">
                      <img
                        src={
                          item.coverImage ||
                          'https://via.placeholder.com/60x80?text=Sin+imagen'
                        }
                        alt={item.title}
                        className="w-12 h-16 object-cover rounded flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
                          {item.title}
                        </h3>
                        <p className="text-xs text-gray-600">{item.author}</p>
                        <p className="text-xs text-gray-500">{item.sello}</p>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-gray-600">x{item.quantity}</p>
                      <p className="font-semibold text-azul">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Observaciones */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Observaciones (opcional)
              </label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Agregá notas o instrucciones especiales para este pedido..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-azul focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {observations.length}/500 caracteres
              </p>
            </div>
          </div>

          {/* Resumen y confirmación */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Productos ({totalItems})</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-azul">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleConfirmOrder}
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-azul hover:bg-azul-600 text-white'
                }`}
              >
                {isSubmitting ? 'Confirmando...' : 'Confirmar pedido'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Al confirmar, tu pedido será procesado y recibirás una confirmación.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

