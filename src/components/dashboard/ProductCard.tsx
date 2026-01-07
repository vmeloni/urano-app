import { useState } from 'react';
import { Plus } from 'lucide-react';

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
  const [quantity, setQuantity] = useState(1);

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
    <div className="group flex flex-col h-full">
      {/* Imagen */}
      <div className="aspect-[3/4] mb-2 rounded-lg overflow-hidden bg-gray-100 relative">
        <img
          src={product.coverImage || 'https://via.placeholder.com/200x280'}
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
        <div className="flex gap-2 mt-auto">
          <input
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              setQuantity(Math.min(val, product.stock));
            }}
            className="w-12 px-2 py-1.5 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={product.stock === 0}
          />
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="flex-1 py-1.5 px-3 text-xs font-semibold text-white rounded transition-colors flex items-center justify-center gap-1 disabled:bg-gray-300 disabled:cursor-not-allowed"
            style={{ backgroundColor: product.stock === 0 ? '#D1D5DB' : '#5B7C99' }}
            onMouseEnter={(e) => {
              if (product.stock > 0) {
                e.currentTarget.style.backgroundColor = '#4A6B85';
              }
            }}
            onMouseLeave={(e) => {
              if (product.stock > 0) {
                e.currentTarget.style.backgroundColor = '#5B7C99';
              }
            }}
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

