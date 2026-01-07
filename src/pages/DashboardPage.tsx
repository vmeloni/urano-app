import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
import FinancialSummary from '@/components/dashboard/FinancialSummary';
import SearchBar from '@/components/dashboard/SearchBar';
import QuickReorder from '@/components/dashboard/QuickReorder';
import ProductGrid from '@/components/dashboard/ProductGrid';
import ProductCard from '@/components/dashboard/ProductCard';

interface Account {
  currentBalance: number;
  creditLimit: number;
  status: string;
  invoices?: Array<{ id: string; date: string; amount: number }>;
}

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

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  items: number | any[];
  totalItems?: number;
  createdAt: string;
  totalPrice?: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { addItem } = useCartStore();

  // Estados de datos
  const [account, setAccount] = useState<Account | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);

  // Estados de loading
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Estados de búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('most-sold');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const productsPerPage = 18;

  // Fetch Account
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await api.get<Account>('/account');
        setAccount(response.data);
      } catch (error) {
        console.error('Error fetching account:', error);
      } finally {
        setLoadingAccount(false);
      }
    };
    fetchAccount();
  }, []);

  // Fetch Products (todos)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get<Product[]>('/products');
        setProducts(response.data);
        
        // Novedades del mes (isNew = true)
        const featured = response.data.filter(p => p.isNew).slice(0, 6);
        setFeaturedProducts(featured);
        
        // Basado en pedidos (simulado: productos más vendidos o aleatorios)
        const recommended = response.data.slice(0, 6);
        setRecommendedProducts(recommended);
        
        // Catálogo completo (todos)
        setCatalogProducts(response.data);
        setTotalProducts(response.data.length);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get<Order[]>('/orders?_sort=createdAt&_order=desc&_limit=3');
        setOrders(response.data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  // Filtrar productos por búsqueda
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = products.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.isbn.includes(searchQuery) ||
          p.sello.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setCatalogProducts(filtered);
      setTotalProducts(filtered.length);
    } else {
      setCatalogProducts(products);
      setTotalProducts(products.length);
    }
  }, [searchQuery, products]);

  // Ordenar productos
  useEffect(() => {
    const sorted = [...catalogProducts];
    switch (sortBy) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
      default:
        // most-sold: mantener orden original
        break;
    }
    setCatalogProducts(sorted);
  }, [sortBy]);

  // Calcular datos financieros
  const openOrdersCount = orders.filter((order) =>
    ['in-preparation', 'shipped', 'pending'].includes(order.status)
  ).length;

  const lastOrder = orders.length > 0
    ? {
        id: orders[0].orderNumber.replace('#', ''),
        date: new Date(orders[0].createdAt).toLocaleDateString('es-AR', {
          day: '2-digit',
          month: 'long',
        }),
      }
    : null;

  // Preparar datos para QuickReorder
  const quickReorderOrders = orders.slice(0, 3).map((order) => {
    const items = Array.isArray(order.items) ? order.items : [];
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      date: new Date(order.createdAt).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'long',
      }),
      itemCount: order.totalItems || (Array.isArray(order.items) ? order.items.length : 0),
      total: order.totalPrice || 0,
      items: items.map((item: any) => item.title || 'Producto').slice(0, 3),
    };
  });

  // Handlers
  const handleAddToCart = (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      addItem(product, quantity);
      toast.success(`"${product.title}" agregado al carrito`, {
        duration: 2000,
        position: 'bottom-right',
      });
    }
  };

  const handleReorder = async (orderId: string) => {
    try {
      const order = orders.find((o) => o.id === orderId);
      if (!order || !Array.isArray(order.items)) {
        toast.error('No se pudo cargar el pedido');
        return;
      }

      let itemsAdded = 0;
      for (const item of order.items) {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          addItem(product, item.quantity || 1);
          itemsAdded += item.quantity || 1;
        }
      }

      toast.success(`${itemsAdded} productos agregados al carrito`, {
        duration: 3000,
        position: 'bottom-right',
      });

      // Opcional: redirigir al carrito
      // navigate('/cart');
    } catch (error) {
      console.error('Error al repetir pedido:', error);
      toast.error('Error al repetir el pedido');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Paginación
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const paginatedProducts = catalogProducts.slice(startIndex, endIndex);
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  // Fecha actual
  const currentDate = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto px-4 py-6">
        {/* 1. Info Financiera */}
        {!loadingAccount && account && (
          <FinancialSummary
            balance={account.currentBalance}
            openOrders={openOrdersCount}
            lastOrder={lastOrder}
          />
        )}

        {/* 2. Saludo + Búsqueda */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Hola, {user?.name || 'Usuario'}
          </h1>
          <p className="text-sm text-gray-600 mb-4 capitalize">{currentDate}</p>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
          />
        </div>

        {/* 3. Repetir Pedido Rápido */}
        {!loadingOrders && quickReorderOrders.length > 0 && (
          <QuickReorder orders={quickReorderOrders} onReorder={handleReorder} />
        )}

        {/* 4. Novedades del Mes */}
        {!loadingProducts && (
          <ProductGrid
            title="Novedades del Mes"
            products={featuredProducts}
            badge="DESTACADO"
            showViewAll
            viewAllLink="/dashboard"
            onAddToCart={handleAddToCart}
          />
        )}

        {/* 5. Basado en tus pedidos */}
        {!loadingProducts && (
          <ProductGrid
            title="Basado en tus pedidos"
            products={recommendedProducts}
            showViewAll
            viewAllLink="/dashboard"
            onAddToCart={handleAddToCart}
          />
        )}

        {/* 6. Catálogo Completo */}
        <div className="mb-8">
          {/* Header con filtros */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Catálogo Completo</h2>
            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="most-sold">Más vendidos</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="newest">Novedades</option>
              </select>
            </div>
          </div>

          {/* Grid de productos */}
          {loadingProducts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#5B7C99' }} />
            </div>
          ) : paginatedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 items-stretch">
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Mostrando {startIndex + 1}-{Math.min(endIndex, totalProducts)} de {totalProducts} productos
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      ←
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1.5 text-sm border rounded ${
                            currentPage === page
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      →
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500 text-sm">
              No se encontraron productos
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
