import { useState, useEffect } from 'react';
import { Loader2, Package, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import PedidoDetailModal from '@/components/PedidoDetailModal';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  totalItems?: number;
  totalPrice?: number;
  items?: any[];
  observations?: string;
  invoiceUrl?: string;
  invoiceNumber?: string;
}

export default function PedidosPage() {
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPedido, setSelectedPedido] = useState<Order | null>(null);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      const response = await api.get<Order[]>('/orders?_sort=createdAt&_order=desc');
      // Ordenar en frontend también por si acaso
      const sortedPedidos = response.data.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Descendente (más reciente primero)
      });
      setPedidos(sortedPedidos);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
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

  const isPedidoCerrado = (status: string) => {
    return status === 'cerrado' || status === 'procesado' || status === 'delivered';
  };

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900">Mis Pedidos</h1>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: '#5B7C99' }} />
            <p className="text-gray-600">Cargando pedidos...</p>
          </div>
        ) : pedidos.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4 text-lg">No tenés pedidos aún</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-[#5B7C99] hover:underline font-semibold"
            >
              Explorá el catálogo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((pedido) => {
              const itemCount =
                pedido.totalItems ||
                (Array.isArray(pedido.items) ? pedido.items.length : 0);
              const total = pedido.totalPrice || 0;

              return (
                <div
                  key={pedido.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedPedido(pedido)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-900">
                        Pedido #{pedido.orderNumber}
                      </h3>
                      {getStatusBadge(pedido.status)}
                      {/* Ícono de factura (solo pedidos cerrados) */}
                      {isPedidoCerrado(pedido.status) && pedido.invoiceUrl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(pedido.invoiceUrl, '_blank');
                          }}
                          className="text-[#5B7C99] hover:text-[#486581] transition-colors"
                          title="Descargar factura"
                        >
                          <FileText className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{formatDate(pedido.createdAt)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
                    </span>
                    <span className="font-bold text-lg" style={{ color: '#5B7C99' }}>
                      {formatPrice(total)}
                    </span>
                  </div>

                  {pedido.observations && (
                    <p className="text-xs text-gray-500 mt-2 truncate">
                      Observaciones: {pedido.observations}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de detalle */}
        {selectedPedido && (
          <PedidoDetailModal pedido={selectedPedido} onClose={() => setSelectedPedido(null)} />
        )}
      </div>
    </div>
  );
}

