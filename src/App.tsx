import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import MainLayout from './components/layout/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CatalogPage from './pages/CatalogPage';
import CartPage from './pages/CartPage';
import PedidosPage from './pages/PedidosPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AyudaPage from './pages/AyudaPage';
import TerminosPage from './pages/TerminosPage';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/catalogo"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CatalogPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <MainLayout>
                <CartPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pedidos"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PedidosPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/producto/:id"
          element={
            <ProtectedRoute>
              <MainLayout>
                <ProductDetailPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/ayuda"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AyudaPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/terminos"
          element={
            <ProtectedRoute>
              <MainLayout>
                <TerminosPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

