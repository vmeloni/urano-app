import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookImage from '@/components/BookImage';
import { useStockAlerts } from '@/hooks/useStockAlerts';

interface Product {
  id: string;
  isbn: string;
  title: string;
  author: string;
  price: number;
  stock: number;
  coverImage?: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string, quantity: number) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const { registerAlert, isNotified } = useStockAlerts();
  
  const isOutOfStock = product.stock === 0;
  const isNotifiedForThisProduct = isNotified(product.id);

  const handleCardClick = () => {
    navigate(`/producto/${product.id}`);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleAdd();
  };

  const handleAlertClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    registerAlert(product.id);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStockColor = (stock: number) => {
    if (stock > 50) return 'text-green-600';
    if (stock >= 30) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleAdd = () => {
    if (product.stock > 0 && quantity > 0) {
      onAddToCart(product.id, quantity);
      setQuantity(1); // Reset después de agregar
    }
  };

  return (
    <div className="group flex flex-col h-full cursor-pointer" onClick={handleCardClick}>
      {/* Imagen */}
      <div className="aspect-[3/4] mb-2 rounded-lg overflow-hidden bg-gray-100 relative">
        <BookImage
          src={product.coverImage}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Contenido - flex-grow para expandirse */}
      <div className="flex flex-col flex-grow">
        {/* Autor */}
        <p className="text-xs text-gray-500 truncate mb-1">{product.author}</p>

        {/* Título - flex-grow para ocupar espacio disponible */}
        <h3 className="text-xs font-semibold text-gray-900 line-clamp-2 mb-2 flex-grow">
          {product.title}
        </h3>

        {/* Precio */}
        <p className="text-sm font-bold mb-2" style={{ color: '#5B7C99' }}>
          {formatCurrency(product.price)}
        </p>

        {/* Stock */}
        <p className={`text-xs font-medium mb-2 ${getStockColor(product.stock)}`}>
          Stock: {product.stock}
        </p>

        {/* Input cantidad + Botón - mt-auto para empujar al fondo */}
        <div className="flex gap-2 mt-2 mt-auto">
          {isOutOfStock ? (
            <>
              <input
                type="number"
                disabled
                defaultValue="1"
                onClick={(e) => e.stopPropagation()}
                className="w-16 px-2 py-2 border border-gray-300 rounded text-sm text-center bg-gray-100 text-gray-400 cursor-not-allowed"
              />
              {isNotifiedForThisProduct ? (
                <button
                  disabled
                  className="flex-1 bg-green-100 text-green-700 px-4 py-2 rounded text-sm font-semibold cursor-not-allowed flex items-center justify-center gap-1"
                >
                  ✓ Te avisaremos
                </button>
              ) : (
                <button
                  onClick={handleAlertClick}
                  className="flex-1 bg-[#5B7C99] text-white px-4 py-2 rounded text-sm font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1"
                >
                  🔔 Avisarme
                </button>
              )}
            </>
          ) : (
            <>
              <input
                type="number"
                min="1"
                max={product.stock}
                value={quantity}
                onChange={(e) => {
                  e.stopPropagation();
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.min(Math.max(1, val), product.stock));
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-16 px-2 py-2 border border-gray-300 rounded text-sm text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleAddClick}
                className="flex-1 bg-[#5B7C99] text-white px-4 py-2 rounded text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                + Agregar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

