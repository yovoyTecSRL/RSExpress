/**
 * useOdoo Hook
 * Hook personalizado para gestionar la conexión a Odoo
 */

import { useState, useEffect, useCallback } from 'react';
import OdooConnectorService from '@services/OdooConnectorService';

const useOdoo = (config = {}) => {
  const [odoo, setOdoo] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  // Inicializar servicio Odoo (solo una vez)
  useEffect(() => {
    let mounted = true;
    
    const initOdoo = async () => {
      try {
        setLoading(true);
        console.log('[useOdoo] 🚀 Inicializando Odoo...');

        const odooService = new OdooConnectorService(config);
        
        // Verificar conexión
        const connected = await odooService.checkConnection();
        
        if (!mounted) return;
        setIsConnected(connected);

        if (connected) {
          // Sincronizar usuarios
          await odooService.syncUsers();
          
          if (!mounted) return;
          
          // Obtener estadísticas
          const leadStats = await odooService.getLeadStats();
          setStats(leadStats);

          console.log('[useOdoo] ✅ Odoo conectado exitosamente');
        } else {
          setError('No se pudo conectar a Odoo');
        }

        if (mounted) {
          setOdoo(odooService);
        }
      } catch (err) {
        console.error('[useOdoo] Error inicializando:', err);
        if (mounted) {
          setError(err.message || 'Error desconocido');
          setIsConnected(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initOdoo();
    
    // Cleanup
    return () => {
      mounted = false;
    };
  }, []);

  // Función para obtener leads
  const getLeads = useCallback(async (domain = [], offset = 0, limit = 10) => {
    if (!odoo) return [];
    
    try {
      return await odoo.getLeads(domain, offset, limit);
    } catch (err) {
      console.error('[useOdoo] Error obteniendo leads:', err);
      throw err;
    }
  }, [odoo]);

  // Función para obtener lead por ID
  const getLeadById = useCallback(async (leadId) => {
    if (!odoo) return null;

    try {
      return await odoo.getLeadById(leadId);
    } catch (err) {
      console.error('[useOdoo] Error obteniendo lead:', err);
      throw err;
    }
  }, [odoo]);

  // Función para crear lead default
  const createLead = useCallback(async () => {
    if (!odoo) return null;

    try {
      return await odoo.createDefaultLead();
    } catch (err) {
      console.error('[useOdoo] Error creando lead:', err);
      throw err;
    }
  }, [odoo]);

  // Función para sincronizar
  const sync = useCallback(async () => {
    if (!odoo) return false;

    try {
      setLoading(true);
      await odoo.syncUsers();
      const newStats = await odoo.getLeadStats();
      setStats(newStats);
      return true;
    } catch (err) {
      console.error('[useOdoo] Error sincronizando:', err);
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [odoo]);

  // Obtener usuarios
  const getUsers = useCallback(() => {
    if (!odoo) return [];
    return odoo.getUsers();
  }, [odoo]);

  // Obtener partners
  const getPartners = useCallback(() => {
    if (!odoo) return [];
    return odoo.getPartners();
  }, [odoo]);

  return {
    odoo,
    isConnected,
    loading,
    error,
    stats,
    getLeads,
    getLeadById,
    createLead,
    sync,
    getUsers,
    getPartners,
    setError
  };
};

export default useOdoo;
