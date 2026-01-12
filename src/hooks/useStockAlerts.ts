import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export function useStockAlerts() {
  const [notifiedProducts, setNotifiedProducts] = useState<Set<string>>(new Set());
  const { user } = useAuthStore();

  // Cargar productos notificados desde localStorage al montar
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('stockAlerts') || '[]');
    setNotifiedProducts(new Set(stored));
  }, []);

  const registerAlert = async (productId: string) => {
    try {
      // Intentar guardar en backend
      try {
        await api.post('/stock-alerts', {
          productId,
          userId: user?.email || 'demo',
          createdAt: new Date().toISOString(),
        });
      } catch (error) {
        // Si el endpoint no existe aún, solo guardar en localStorage
        console.log('Backend endpoint not available, using localStorage only');
      }

      // Actualizar estado local inmediatamente
      const newSet = new Set(notifiedProducts).add(productId);
      setNotifiedProducts(newSet);
      
      // Guardar en localStorage para persistencia
      localStorage.setItem('stockAlerts', JSON.stringify(Array.from(newSet)));

      toast.success('Te avisaremos cuando esté disponible', {
        duration: 3000,
        position: 'bottom-right',
      });
    } catch (error) {
      console.error('Error al registrar aviso:', error);
      toast.error('Error al registrar aviso. Intentá nuevamente.', {
        duration: 3000,
        position: 'bottom-right',
      });
    }
  };

  const isNotified = (productId: string): boolean => {
    return notifiedProducts.has(productId);
  };

  return { registerAlert, isNotified };
}

