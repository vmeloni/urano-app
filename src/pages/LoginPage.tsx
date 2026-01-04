import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import uranoLogo from '@/assets/images/urano_logo.png';
import { useAuthStore } from '@/store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast.success('¡Bienvenido!');
        navigate('/dashboard');
      } else {
        toast.error('Credenciales incorrectas');
      }
    } catch (error) {
      toast.error('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#fefbfc' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={uranoLogo} alt="Ediciones Urano" className="h-20 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">PORTAL B2B</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">Recordarme</span>
              </label>
              <a href="#" style={{ color: '#b85450' }} className="text-sm hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: '#4a6176' }}
              className="w-full hover:opacity-90 text-white font-semibold py-3 rounded-md transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        {/* Solicitar acceso */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-700 mb-4">¿No tienes acceso?</p>
          <button 
            style={{ borderColor: '#4a6176', color: '#4a6176' }}
            className="px-6 py-2.5 border-2 hover:bg-gray-50 rounded-md font-medium transition-colors"
          >
            Solicitar acceso
          </button>
        </div>

        {/* Credenciales de prueba */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600 mb-2">Credenciales de prueba:</p>
          <div className="bg-gray-100 rounded-md p-3 text-sm">
            <p><strong>Email:</strong> demo@libreria.com</p>
            <p><strong>Contraseña:</strong> demo123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
