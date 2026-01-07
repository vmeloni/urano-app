import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FinancialSummaryProps {
  balance: number;
  openOrders: number;
  lastOrder: {
    id: string;
    date: string;
  } | null;
}

export default function FinancialSummary({ balance, openOrders, lastOrder }: FinancialSummaryProps) {
  const [isOpen, setIsOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg mb-4">
      {/* Header - Siempre visible */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-700">
            Saldo: <span className="font-bold text-gray-900">{formatCurrency(balance)}</span>
          </span>
          <span className="text-gray-400">|</span>
          <span className="text-gray-700">
            Pedidos abiertos: <span className="font-bold text-gray-900">{openOrders}</span>
          </span>
          {lastOrder && (
            <>
              <span className="text-gray-400">|</span>
              <span className="text-gray-700">
                Último pedido: <span className="font-bold text-gray-900">#{lastOrder.id}</span> - {lastOrder.date}
              </span>
            </>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-600" />
        )}
      </button>

      {/* Contenido expandible */}
      {isOpen && (
        <div className="border-t border-gray-200 px-4 py-3 text-sm text-gray-600">
          <p>Información financiera detallada disponible en la sección de Cuenta Corriente.</p>
        </div>
      )}
    </div>
  );
}

