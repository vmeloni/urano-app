import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useStockAlerts } from '@/hooks/useStockAlerts';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import BookImage from '@/components/BookImage';
import ProductCard from '@/components/dashboard/ProductCard';

interface Product {
  id: string;
  isbn: string;
  title: string;
  author: string;
  sello: string;
  price: number;
  stock: number;
  isNew: boolean;
  coverImage?: string;
  description?: string;
  pages?: number;
  language?: string;
  format?: string;
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCartStore();
  const { registerAlert, isNotified } = useStockAlerts();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchRelatedProducts();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get<Product>(`/products/${id}`);
      setProduct(response.data);
      setError(false);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      // Obtener productos relacionados: mismo autor o mismo sello
      const response = await api.get<Product[]>(`/products`);
      const currentProduct = response.data.find((p) => p.id === id);
      
      if (currentProduct) {
        const related = response.data
          .filter(
            (p) =>
              p.id !== id &&
              (p.author === currentProduct.author || p.sello === currentProduct.sello) &&
              p.stock > 0
          )
          .slice(0, 4);
        setRelatedProducts(related);
      }
    } catch (err) {
      console.error('Error fetching related products:', err);
    }
  };

  const handleAddToCart = (productId: string, qty: number) => {
    const productToAdd = product;
    if (productToAdd) {
      addItem(productToAdd, qty);
      toast.success(`"${productToAdd.title}" agregado al carrito`, {
        duration: 2000,
        position: 'bottom-right',
      });
    }
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
    if (stock > 50) return 'bg-green-100 text-green-800';
    if (stock >= 30) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: '#5B7C99' }} />
            <p className="text-gray-600">Cargando producto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4 text-lg">Producto no encontrado</p>
            <button
              onClick={() => navigate('/catalogo')}
              className="text-[#5B7C99] hover:underline font-semibold"
            >
              Volver al catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const isNotifiedForThisProduct = isNotified(product.id);

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-[1400px] mx-auto px-6">
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-600 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="hover:text-gray-900 transition-colors"
          >
            Inicio
          </button>
          <span className="mx-2">›</span>
          <button
            onClick={() => navigate('/catalogo')}
            className="hover:text-gray-900 transition-colors"
          >
            Catálogo
          </button>
          <span className="mx-2">›</span>
          <span className="text-gray-900">{product.title}</span>
        </nav>

        {/* Sección principal: 50/50 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12 mb-12">
          {/* Columna izquierda: Portada (50%) */}
          <div>
            <div className="aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 shadow-lg">
              <BookImage
                src={product.coverImage}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Columna derecha: Info básica (50%) */}
          <div>
            {/* Título */}
            <h1 className="text-4xl font-bold mb-3 text-gray-900">{product.title}</h1>

            {/* Autor */}
            <p className="text-xl text-gray-700 mb-4">{product.author}</p>

            {/* Precio - inmediatamente después del autor */}
            <div className="text-3xl font-bold text-gray-900 mb-6">
              {formatCurrency(product.price)}
            </div>

            {/* Stock */}
            <div className="mb-6">
              <span
                className={`inline-block px-3 py-1 rounded text-xs font-semibold ${getStockColor(product.stock)}`}
              >
                {product.stock > 0 ? `Stock: ${product.stock}` : 'Agotado'}
              </span>
            </div>

            {/* Agregar al carrito */}
            <div className="flex gap-3 items-center mb-8">
              <div className="flex items-center border border-gray-300 rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isOutOfStock}
                  className="px-3 py-2 text-base hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 1;
                    setQuantity(Math.min(Math.max(1, val), product.stock || 1));
                  }}
                  disabled={isOutOfStock}
                  className="w-14 py-2 text-center text-base border-l border-r border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                  style={{ MozAppearance: 'textfield' }}
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 1, quantity + 1))}
                  disabled={isOutOfStock}
                  className="px-3 py-2 text-base hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  +
                </button>
              </div>

              {isOutOfStock ? (
                isNotifiedForThisProduct ? (
                  <button
                    disabled
                    className="flex-1 bg-green-100 text-green-700 py-2.5 px-6 rounded font-semibold text-base cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    ✓ Te avisaremos
                  </button>
                ) : (
                  <button
                    onClick={() => registerAlert(product.id)}
                    className="flex-1 bg-[#5B7C99] text-white py-2.5 px-6 rounded font-semibold text-base hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    🔔 Avisarme cuando haya stock
                  </button>
                )
              ) : (
                <button
                  onClick={() => handleAddToCart(product.id, quantity)}
                  className="flex-1 bg-[#5B7C99] text-white py-2.5 px-6 rounded font-semibold text-base hover:opacity-90 transition-opacity uppercase"
                >
                  Agregar al carrito
                </button>
              )}
            </div>

            {/* Descripción - Dentro de la columna derecha */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-bold mb-4 text-gray-900">Descripción</h2>

              {/* Info básica */}
              <div className="mb-4 space-y-2 text-sm">
                <p>
                  <strong>Autor:</strong> {product.author}
                </p>
                <p>
                  <strong>Editorial:</strong> {product.sello}
                </p>
                <p>
                  <strong>ISBN:</strong> {product.isbn}
                </p>
              </div>

              {/* Especificaciones técnicas */}
              <div className="mb-4 space-y-2 text-sm">
                {product.pages && (
                  <p>
                    <strong>Páginas:</strong> {product.pages}
                  </p>
                )}
                {(product as any).height && (
                  <p>
                    <strong>Altura:</strong> {(product as any).height} cm.
                  </p>
                )}
                {(product as any).width && (
                  <p>
                    <strong>Ancho:</strong> {(product as any).width} cm.
                  </p>
                )}
                {(product as any).spine && (
                  <p>
                    <strong>Lomo:</strong> {(product as any).spine} cm.
                  </p>
                )}
                {(product as any).weight && (
                  <p>
                    <strong>Peso:</strong> {(product as any).weight} kgs.
                  </p>
                )}
                {product.language && (
                  <p>
                    <strong>Idioma:</strong> {product.language}
                  </p>
                )}
                {product.format && (
                  <p>
                    <strong>Formato:</strong> {product.format}
                  </p>
                )}
              </div>

              {/* Sinopsis */}
              {product.description && (
                <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {product.description}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Upselling */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-gray-200 pt-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">También te puede interesar</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

