import { RotateCcw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import BookImage from '@/components/BookImage';

interface OrderItem {
  productId: string;
  isbn?: string;
  title: string;
  author: string;
  sello?: string;
  price: number;
  quantity: number;
  subtotal?: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  items?: OrderItem[] | any[];
  totalPrice?: number;
  totalItems?: number;
  observations?: string;
  invoiceUrl?: string;
  invoiceNumber?: string;
}

interface PedidoDetailModalProps {
  pedido: Order;
  onClose: () => void;
}

export default function PedidoDetailModal({ pedido, onClose }: PedidoDetailModalProps) {
  const navigate = useNavigate();
  const { addItem } = useCartStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      abierto: {
        label: 'Abierto',
        className: 'bg-yellow-100 text-yellow-800',
      },
      'in-preparation': {
        label: 'En preparación',
        className: 'bg-yellow-100 text-yellow-800',
      },
      shipped: {
        label: 'Enviado',
        className: 'bg-blue-100 text-blue-800',
      },
      delivered: {
        label: 'Entregado',
        className: 'bg-green-100 text-green-800',
      },
      cerrado: {
        label: 'Cerrado',
        className: 'bg-green-100 text-green-800',
      },
      procesado: {
        label: 'Procesado',
        className: 'bg-green-100 text-green-800',
      },
    };

    const statusInfo = statusMap[status] || {
      label: status,
      className: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`text-xs px-2 py-1 rounded font-medium ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const handleRepeatOrder = async () => {
    try {
      // Obtener productos completos desde la API
      let itemsAdded = 0;
      for (const item of pedido.items || []) {
        try {
          const response = await api.get(`/products/${item.productId}`);
          const product = response.data;
          if (product) {
            addItem(product, item.quantity);
            itemsAdded += item.quantity;
          }
        } catch (error) {
          console.error(`Error fetching product ${item.productId}:`, error);
        }
      }

      if (itemsAdded > 0) {
        toast.success(`${itemsAdded} productos agregados al carrito`, {
          duration: 3000,
          position: 'bottom-right',
        });
        onClose();
        navigate('/cart');
      } else {
        toast.error('No se pudieron agregar los productos al carrito');
      }
    } catch (error) {
      console.error('Error al repetir pedido:', error);
      toast.error('Error al repetir el pedido');
    }
  };

  const total = pedido.totalPrice || 0;
  const itemCount = pedido.totalItems || (pedido.items?.length || 0);

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900">
                Pedido #{pedido.orderNumber}
              </h2>
              {getStatusBadge(pedido.status)}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* Info general */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <div>
                <p className="text-sm text-gray-500 mb-1">Fecha</p>
                <p className="font-semibold text-gray-900">{formatDate(pedido.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Total</p>
                <p className="text-2xl font-bold" style={{ color: '#5B7C99' }}>
                  {formatPrice(total)}
                </p>
              </div>
            </div>

            {/* Lista de productos */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Productos ({itemCount})
              </h3>
              <div className="space-y-3">
                {(pedido.items || []).map((item, index) => (
                  <div
                    key={item.productId || index}
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-12 h-16 rounded flex-shrink-0 overflow-hidden bg-gray-100">
                      <BookImage
                        src={(item as any).coverImage || (item as any).imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 line-clamp-2">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500">{item.author}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        Cantidad: {item.quantity} • {item.sello || 'Sin sello'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold" style={{ color: '#5B7C99' }}>
                        {formatPrice(
                          (item as OrderItem).subtotal || item.price * item.quantity
                        )}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatPrice(item.price)} c/u
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Observaciones */}
            {pedido.observations && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold mb-1 text-gray-900">Observaciones</p>
                <p className="text-sm text-gray-700">{pedido.observations}</p>
              </div>
            )}

            {/* Factura (solo pedidos cerrados) */}
            {(pedido.status === 'cerrado' || pedido.status === 'procesado') &&
              pedido.invoiceUrl && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm mb-1 text-gray-900">📄 Factura</p>
                      <p className="text-xs text-gray-600">
                        N° {pedido.invoiceNumber || 'No disponible'}
                      </p>
                    </div>
                    <a
                      href={pedido.invoiceUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#5B7C99] text-white px-4 py-2 rounded text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      📥 Descargar PDF
                    </a>
                  </div>
                </div>
              )}
          </div>

          {/* Footer con acciones */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
            <button
              onClick={handleRepeatOrder}
              className="flex-1 bg-[#5B7C99] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Repetir pedido
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

