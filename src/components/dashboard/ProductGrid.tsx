import { ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProductCard from './ProductCard';
import ProductSlider from './ProductSlider';

interface Product {
  id: string;
  isbn: string;
  title: string;
  author: string;
  price: number;
  stock: number;
  coverImage?: string;
}

interface ProductGridProps {
  title: string;
  products: Product[];
  badge?: 'DESTACADO' | 'NUEVO';
  showViewAll?: boolean;
  viewAllLink?: string;
  onAddToCart: (productId: string, quantity: number) => void;
}

export default function ProductGrid({
  title,
  products,
  badge,
  showViewAll = false,
  viewAllLink,
  onAddToCart,
}: ProductGridProps) {
  const navigate = useNavigate();

  // Solo "Novedades del Mes" tiene fondo rosa
  const isFeatured = badge === 'DESTACADO';
  
  // Usar slider si hay más de 4 productos
  const shouldUseSlider = products.length > 4;

  return (
    <div className={`mb-8 ${isFeatured ? 'p-6 rounded-lg' : ''}`} style={isFeatured ? { backgroundColor: '#FDF6F3' } : {}}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {badge && (
            <span
              className="px-2 py-0.5 text-xs font-bold text-white rounded-full"
              style={{ backgroundColor: '#C84C3C' }}
            >
              {badge}
            </span>
          )}
        </div>
        {showViewAll && viewAllLink && (
          <button
            onClick={() => navigate(viewAllLink)}
            className="text-sm font-semibold flex items-center gap-1"
            style={{ color: '#5B7C99' }}
          >
            Ver todas
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Grid o Slider */}
      {products.length > 0 ? (
        shouldUseSlider ? (
          <ProductSlider products={products} onAddToCart={onAddToCart} />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
          </div>
        )
      ) : (
        <div className="text-center py-8 text-gray-500 text-sm">
          No hay productos disponibles
        </div>
      )}
    </div>
  );
}

