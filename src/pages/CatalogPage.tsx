import { useState, useEffect } from 'react';
import { Search, Plus, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import { useCartStore } from '@/store/cartStore';

interface Product {
  id: string;
  isbn: string;
  title: string;
  author: string;
  sello: string;
  price: number;
  stock: number;
  isNew: boolean;
  coverImage: string;
}

const SELLOS = ['Urano', 'Paidós', 'Kepler', 'Debate'];

export default function CatalogPage() {
  const { addItem } = useCartStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSellos, setSelectedSellos] = useState<string[]>([]);
  const [onlyNew, setOnlyNew] = useState(false);
  const [sortBy, setSortBy] = useState('title');

  // Fetch productos
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get<Product[]>('/products');
        setProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...products];

    // Filtro de búsqueda
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.author.toLowerCase().includes(query) ||
          p.isbn.includes(query)
      );
    }

    // Filtro de sellos
    if (selectedSellos.length > 0) {
      filtered = filtered.filter((p) => selectedSellos.includes(p.sello));
    }

    // Filtro de novedades
    if (onlyNew) {
      filtered = filtered.filter((p) => p.isNew);
    }

    // Ordenar
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'author':
          return a.author.localeCompare(b.author);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset a primera página al cambiar filtros
  }, [products, searchQuery, selectedSellos, onlyNew, sortBy]);

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handleSelloToggle = (sello: string) => {
    setSelectedSellos((prev) =>
      prev.includes(sello) ? prev.filter((s) => s !== sello) : [...prev, sello]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSellos([]);
    setOnlyNew(false);
  };

  const handleAddToCart = (product: Product) => {
    if (product.stock === 0) {
      toast.error('Este producto está agotado', {
        duration: 2000,
        position: 'bottom-right',
      });
      return;
    }

    addItem(product, 1);
    toast.success(`"${product.title}" agregado al carrito`, {
      duration: 2000,
      position: 'bottom-right',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  return (
    <div className="bg-white min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filtros */}
          <aside className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h2>

              {/* Búsqueda */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Búsqueda
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Título, autor, ISBN..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-azul focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filtro Sello */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sello</label>
                <div className="space-y-2">
                  {SELLOS.map((sello) => (
                    <label key={sello} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedSellos.includes(sello)}
                        onChange={() => handleSelloToggle(sello)}
                        className="w-4 h-4 text-azul border-gray-300 rounded focus:ring-azul"
                      />
                      <span className="ml-2 text-sm text-gray-700">{sello}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filtro Novedad */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={onlyNew}
                    onChange={(e) => setOnlyNew(e.target.checked)}
                    className="w-4 h-4 text-azul border-gray-300 rounded focus:ring-azul"
                  />
                  <span className="ml-2 text-sm text-gray-700">Últimos 30 días</span>
                </label>
              </div>

              {/* Botón Limpiar */}
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          </aside>

          {/* Grid de Productos */}
          <div className="lg:w-3/4">
            {/* Header con contador y ordenar */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  Mostrando <span className="font-semibold">{filteredProducts.length}</span> de{' '}
                  <span className="font-semibold">{products.length}</span> libros
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">Ordenar por:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-azul focus:border-transparent"
                >
                  <option value="title">Título A-Z</option>
                  <option value="author">Autor A-Z</option>
                  <option value="price-asc">Precio: Menor a Mayor</option>
                  <option value="price-desc">Precio: Mayor a Menor</option>
                </select>
              </div>
            </div>

            {/* Grid de productos */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-md p-4 animate-pulse"
                  >
                    <div className="w-full h-64 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : currentProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {currentProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
                    >
                      {/* Imagen */}
                      <div className="relative mb-3">
                        <img
                          src={product.coverImage || 'https://via.placeholder.com/300x450'}
                          alt={product.title}
                          className="w-full h-64 object-cover rounded"
                        />
                        {product.isNew && (
                          <span className="absolute top-2 right-2 bg-terracota-400 text-white text-xs font-semibold px-2 py-1 rounded">
                            Nuevo
                          </span>
                        )}
                      </div>

                      {/* Información */}
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">
                          {product.title}
                        </h3>
                        <p className="text-xs text-gray-600">{product.author}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {product.sello}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              product.stock > 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.stock > 0 ? 'En stock' : 'Agotado'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">ISBN: {product.isbn}</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(product.price)}
                        </p>

                        {/* Botón Agregar */}
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                          className={`w-full mt-3 ${
                            product.stock === 0
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-azul hover:bg-azul-600'
                          } text-white font-medium py-2 rounded-md transition-colors flex items-center justify-center space-x-2 disabled:opacity-50`}
                        >
                          <Plus className="h-4 w-4" />
                          <span>{product.stock === 0 ? 'Agotado' : 'Agregar'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center space-x-4">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Anterior</span>
                    </button>
                    <span className="text-sm text-gray-700">
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      <span>Siguiente</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-500">No se encontraron productos con los filtros seleccionados.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

