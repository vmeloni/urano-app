import { RotateCcw } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  itemCount: number;
  total: number;
  items: string[]; // Preview de títulos
}

interface QuickReorderProps {
  orders: Order[];
  onReorder: (orderId: string) => void;
}

export default function QuickReorder({ orders, onReorder }: QuickReorderProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (orders.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Repetir Pedido Rápido</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex flex-col h-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="font-bold text-gray-900 text-sm">#{order.orderNumber}</p>
                <p className="text-xs text-gray-600 truncate">{order.date}</p>
              </div>
              <p className="text-sm font-bold" style={{ color: '#5B7C99' }}>
                {formatCurrency(order.total)}
              </p>
            </div>

            {/* Items count */}
            <p className="text-xs text-gray-600 mb-2">{order.itemCount} items</p>

            {/* Preview productos - flex-grow para expandirse */}
            <div className="mb-3 pb-3 border-b border-gray-100 flex-grow">
              <p className="text-xs text-gray-500 mb-1">Productos:</p>
              <p className="text-xs text-gray-700 line-clamp-2">
                {order.items.slice(0, 2).join(', ')}
                {order.items.length > 2 && ` +${order.items.length - 2} más`}
              </p>
            </div>

            {/* Botón - mt-auto para empujar al fondo */}
            <button
              onClick={() => onReorder(order.id)}
              className="w-full py-2 px-3 text-sm font-semibold text-white rounded transition-colors flex items-center justify-center gap-2 mt-auto"
              style={{ backgroundColor: '#5B7C99' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#4A6B85';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#5B7C99';
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Repetir pedido
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

