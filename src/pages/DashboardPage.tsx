import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CreditCard, Package, Loader2, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

interface Invoice {
  id: string;
  date: string;
  amount: number;
}

interface Account {
  currentBalance: number;
  creditLimit: number;
  status: string;
  invoices?: Invoice[];
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
  items: number | any[]; // Puede ser número o array
  totalItems?: number; // Para pedidos nuevos
  createdAt: string;
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [account, setAccount] = useState<Account | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingAccount, setLoadingAccount] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

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

  // Fetch New Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get<Product[]>('/products?isNew=true');
        setProducts(response.data.slice(0, 5));
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      'in-preparation': { label: 'En preparación', className: 'bg-yellow-100 text-yellow-800' },
      'prepared': { label: 'Preparado', className: 'bg-blue-100 text-blue-800' },
      'shipped': { label: 'Enviado', className: 'bg-purple-100 text-purple-800' },
      'delivered': { label: 'Entregado', className: 'bg-green-100 text-green-800' },
    };
    return statusMap[status] || { label: status, className: 'bg-gray-100 text-gray-800' };
  };

  const currentDate = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div>
        {/* Header Bienvenida */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hola, {user?.name || 'Usuario'}
          </h1>
          <p className="text-gray-600 capitalize">{currentDate}</p>
        </div>

        {/* Grid de Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Widget Cuenta Corriente */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cuenta Corriente</h2>
            {loadingAccount ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-azul" />
              </div>
            ) : account ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Saldo actual</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {formatCurrency(account.currentBalance)}
                  </p>
                </div>
                
                {/* Últimas facturas */}
                {account.invoices && account.invoices.length > 0 && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-3">Últimas facturas:</p>
                    <div className="space-y-2">
                      {account.invoices.slice(0, 3).map((invoice) => (
                        <div
                          key={invoice.id}
                          className="flex items-center justify-between text-sm"
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">Factura #{invoice.id}</span>
                            <span className="text-gray-400">|</span>
                            <span className="text-gray-600">
                              {new Date(invoice.date).toLocaleDateString('es-AR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">
                            {formatCurrency(invoice.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      account.status === 'ok'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {account.status === 'ok' ? '✓ Al día' : 'Atención'}
                  </span>
                  <Link
                    to="/cuenta-corriente"
                    className="text-azul hover:text-azul-600 font-medium text-sm flex items-center"
                  >
                    Ver detalle <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No se pudo cargar la información</p>
            )}
          </div>

          {/* Widget Accesos Rápidos */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Accesos Rápidos</h2>
            <div className="space-y-3">
              <Link
                to="/catalogo?nuevos=true"
                className="flex items-center space-x-3 p-4 bg-azul text-white rounded-lg hover:bg-azul-600 transition-colors"
              >
                <BookOpen className="h-5 w-5" />
                <span className="font-medium">Novedades del Mes</span>
              </Link>
              <Link
                to="/pedidos"
                className="flex items-center space-x-3 p-4 bg-azul text-white rounded-lg hover:bg-azul-600 transition-colors"
              >
                <Package className="h-5 w-5" />
                <span className="font-medium">Pedidos</span>
              </Link>
              <Link
                to="/cuenta-corriente"
                className="flex items-center space-x-3 p-4 bg-azul text-white rounded-lg hover:bg-azul-600 transition-colors"
              >
                <CreditCard className="h-5 w-5" />
                <span className="font-medium">Cuenta Corriente</span>
              </Link>
            </div>
          </div>

          {/* Widget Novedades del Mes */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Novedades del Mes</h2>
              <Link
                to="/catalogo?nuevos=true"
                className="text-azul hover:text-azul-600 font-medium text-sm flex items-center"
              >
                Ver todas <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            {loadingProducts ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-azul" />
              </div>
            ) : products.length > 0 ? (
              <div className="overflow-x-auto">
                <div className="flex space-x-4 pb-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex-shrink-0 w-48 bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <img
                        src={product.coverImage}
                        alt={product.title}
                        className="w-full h-64 object-cover rounded mb-3"
                      />
                      <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                        {product.title}
                      </h3>
                      <p className="text-xs text-gray-600">{product.author}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No hay novedades disponibles</p>
            )}
          </div>

          {/* Widget Resumen de Pedidos */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Resumen de Pedidos</h2>
              <Link
                to="/pedidos"
                className="text-azul hover:text-azul-600 font-medium text-sm flex items-center"
              >
                Ver todos <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            {loadingOrders ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-azul" />
              </div>
            ) : orders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        # Pedido
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Fecha
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Estado
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                        Items
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => {
                      const status = getStatusBadge(order.status);
                      return (
                        <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            #{order.orderNumber}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {typeof order.items === 'number'
                              ? order.items
                              : order.totalItems || (Array.isArray(order.items) ? order.items.length : 0)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No hay pedidos disponibles</p>
            )}
          </div>
        </div>
    </div>
  );
}
