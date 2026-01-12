import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { toast } from 'react-hot-toast';
import api from '@/lib/api';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const { addItem } = useCartStore();

  // Estados de datos
  const [account, setAccount] = useState<Account | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [bestsellersProducts, setBestsellersProducts] = useState<Product[]>([]);
  const [preventasProducts, setPreventasProducts] = useState<Product[]>([]);

  // Estados de loading
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Estados de búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Leer query parameter de búsqueda desde URL
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    if (urlSearch) {
      setSearchQuery(urlSearch);
    }
  }, [searchParams]);

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
        
        // Más vendidos (simulado: productos con más stock o aleatorios)
        const bestsellers = response.data.slice(0, 6);
        setBestsellersProducts(bestsellers);
        
        // Pre-ventas (simulado: productos con isNew o aleatorios)
        const preventas = response.data.filter(p => p.isNew).slice(0, 6);
        setPreventasProducts(preventas);
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
    // Actualizar URL con query parameter
    if (query.trim()) {
      setSearchParams({ search: query.trim() });
    } else {
      setSearchParams({});
    }
  };


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
        {/* 1. Saludo */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            Hola, {user?.name || 'Usuario'}
          </h1>
          <p className="text-sm text-gray-600 capitalize">{currentDate}</p>
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

        {/* 6. Más Vendidos */}
        {!loadingProducts && (
          <ProductGrid
            title="Más Vendidos"
            products={bestsellersProducts}
            showViewAll
            viewAllLink="/catalogo?filter=bestsellers"
            onAddToCart={handleAddToCart}
          />
        )}

        {/* 7. Pre-ventas */}
        {!loadingProducts && (
          <ProductGrid
            title="Pre-ventas"
            products={preventasProducts}
            showViewAll
            viewAllLink="/catalogo?filter=preventas"
            onAddToCart={handleAddToCart}
          />
        )}
      </div>
    </div>
  );
}
