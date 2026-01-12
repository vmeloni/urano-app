import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Search, ChevronDown } from 'lucide-react';
import uranoLogo from '@/assets/images/urano_logo.png';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import api from '@/lib/api';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  totalItems?: number;
  totalPrice?: number;
}

interface Account {
  currentBalance: number;
  creditLimit: number;
  invoices?: Array<{ date: string }>;
}

export default function Header() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openOrders, setOpenOrders] = useState<Order[]>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch pedidos abiertos
  useEffect(() => {
    const fetchOpenOrders = async () => {
      try {
        const response = await api.get<Order[]>('/orders');
        const open = response.data.filter((order) =>
          ['in-preparation', 'shipped', 'pending'].includes(order.status)
        );
        setOpenOrders(open.slice(0, 3)); // Solo los primeros 3
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };
    fetchOpenOrders();
  }, []);

  // Fetch cuenta corriente
  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await api.get<Account>('/account');
        setAccount(response.data);
      } catch (error) {
        console.error('Error fetching account:', error);
      }
    };
    fetchAccount();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsUserMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navegar al dashboard con query de búsqueda
      navigate(`/dashboard?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  // Links de navegación (fila 2)
  const navLinks = [
    { label: 'Inicio', path: '/dashboard', exact: true },
    { label: 'Catálogo', path: '/catalogo' },
    { label: 'Novedades', path: '/catalogo?filter=novedades' },
    { label: 'Bestsellers', path: '/catalogo?filter=bestsellers' },
    { label: 'Pre-ventas', path: '/catalogo?filter=preventas' },
    { label: 'Ficción', path: '/catalogo?categoria=ficcion' },
    { label: 'No Ficción', path: '/catalogo?categoria=no-ficcion' },
  ];

  const isActiveLink = (link: typeof navLinks[0]) => {
    if (link.exact) {
      return location.pathname === link.path || location.pathname === '/';
    }
    return location.pathname.startsWith(link.path.split('?')[0]);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        {/* Fila 1: Logo + Búsqueda + Acciones de Usuario */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 mb-3">
          {/* Mobile: Logo + Usuario + Carrito */}
          <div className="flex md:hidden items-center justify-between">
            <img
              src={uranoLogo}
              alt="Ediciones Urano"
              className="h-8 object-contain"
            />
            <div className="flex items-center gap-4">
              {/* Usuario dropdown mobile */}
              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <span className="truncate max-w-[100px]">{user?.name || 'Usuario'}</span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Carrito mobile */}
              <button
                onClick={() => navigate('/cart')}
                className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center font-semibold"
                    style={{ backgroundColor: '#C84C3C' }}
                  >
                    {totalItems > 99 ? '99+' : totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Desktop: Logo */}
          <img
            src={uranoLogo}
            alt="Ediciones Urano"
            className="hidden md:block h-10 object-contain"
          />

          {/* Búsqueda */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Ingresar título, autor, ISBN, palabra clave o categoría"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>
          </form>

          {/* Desktop: Acciones de usuario */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            {/* Dropdown Pedidos */}
            <div className="relative group">
              <Link
                to="/pedidos"
                className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-700 hover:text-gray-900">Pedidos</span>
                {openOrders.length > 0 && (
                  <span
                    className="text-white text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ backgroundColor: '#C84C3C' }}
                  >
                    {openOrders.length}
                  </span>
                )}
              </Link>

              {/* Dropdown menu */}
              {openOrders.length > 0 && (
                <div className="hidden group-hover:block absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[280px] z-50">
                  <div className="px-4 py-3 border-b border-gray-200 font-semibold text-sm">
                    Pedidos Abiertos ({openOrders.length})
                  </div>

                  {openOrders.map((order) => (
                    <div
                      key={order.id}
                      className="px-4 py-3 border-b border-gray-100 flex justify-between text-sm"
                    >
                      <span>
                        #{order.orderNumber} - {order.totalItems || 0} items
                      </span>
                      <strong style={{ color: '#5B7C99' }}>
                        {new Intl.NumberFormat('es-AR', {
                          style: 'currency',
                          currency: 'ARS',
                          minimumFractionDigits: 0,
                        }).format(order.totalPrice || 0)}
                      </strong>
                    </div>
                  ))}

                  <div className="px-4 py-3 text-center">
                    <Link
                      to="/pedidos"
                      className="text-sm hover:underline"
                      style={{ color: '#5B7C99' }}
                    >
                      → Ver todos los pedidos
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Dropdown Cuenta Corriente */}
            <div className="relative group">
              <Link
                to="/cuenta-corriente"
                className="cursor-pointer px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900"
              >
                Cuenta Corriente
              </Link>

              {/* Dropdown menu */}
              {account && (
                <div className="hidden group-hover:block absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[280px] z-50">
                  <div className="px-4 py-3 border-b border-gray-200 font-semibold text-sm">
                    Estado de Cuenta
                  </div>

                  <div className="px-4 py-3 border-b border-gray-100 flex justify-between text-sm">
                    <span>Saldo actual</span>
                    <strong>
                      {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                        minimumFractionDigits: 2,
                      }).format(account.currentBalance)}
                    </strong>
                  </div>

                  <div className="px-4 py-3 border-b border-gray-100 flex justify-between text-sm">
                    <span>Crédito disponible</span>
                    <strong className="text-green-600">
                      {new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                        minimumFractionDigits: 0,
                      }).format(account.creditLimit - account.currentBalance)}
                    </strong>
                  </div>

                  {account.invoices && account.invoices.length > 0 && (
                    <div className="px-4 py-3 border-b border-gray-100 flex justify-between text-sm">
                      <span>Último pago</span>
                      <span>
                        {new Date(account.invoices[0].date).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}

                  <div className="px-4 py-3 text-center">
                    <Link
                      to="/cuenta-corriente"
                      className="text-sm hover:underline"
                      style={{ color: '#5B7C99' }}
                    >
                      → Ver cuenta completa
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Usuario dropdown desktop */}
            <div ref={userMenuRef} className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                <span>{user?.name || 'Usuario'}</span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              )}
            </div>

            {/* Carrito desktop */}
            <button
              onClick={() => navigate('/cart')}
              className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center font-semibold"
                  style={{ backgroundColor: '#C84C3C' }}
                >
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Fila 2: Navegación / Categorías */}
        <nav className="flex gap-6 md:gap-8 text-sm border-t border-gray-200 pt-3 overflow-x-auto">
          {navLinks.map((link) => {
            const isActive = isActiveLink(link);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`whitespace-nowrap transition-colors ${
                  isActive
                    ? 'font-semibold hover:underline'
                    : 'text-gray-700 hover:text-gray-900 hover:underline'
                }`}
                style={isActive ? { color: '#5B7C99' } : {}}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
