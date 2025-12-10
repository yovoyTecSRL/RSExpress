/**
 * useLeads Hook
 * Hook personalizado para gestionar leads con caché y paginación
 */

import { useState, useCallback, useRef } from 'react';

const useLeads = (odooService) => {
  const [leads, setLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 10,
    total: 0,
    hasMore: true
  });

  const cacheRef = useRef(new Map());

  /**
   * Cargar leads con filtros opcionales
   */
  const loadLeads = useCallback(async (domain = [], offset = 0, limit = 10) => {
    // Datos demo para pruebas
    const demoLeads = [
      {
        id: 1,
        name: 'Empresa Logística ABC',
        email: 'contacto@logisticaabc.com',
        phone: '+34 912 345 678',
        state: 'new',
        priority: 'high',
        description: 'Necesita servicio de entregas urgentes'
      },
      {
        id: 2,
        name: 'Tienda Retail XYZ',
        email: 'info@retailxyz.es',
        phone: '+34 913 456 789',
        state: 'assigned',
        priority: 'normal',
        description: 'Distribución diaria de inventario'
      },
      {
        id: 3,
        name: 'E-Commerce FastShip',
        email: 'logistics@fastship.com',
        phone: '+34 914 567 890',
        state: 'won',
        priority: 'high',
        description: 'Contrato mensual para entregas'
      },
      {
        id: 4,
        name: 'Farmacia Central Valencia',
        email: 'gerente@farmacentral.es',
        phone: '+34 961 234 567',
        state: 'new',
        priority: 'normal',
        description: 'Entregas de medicamentos'
      },
      {
        id: 5,
        name: 'Hotel Boutique Sevilla',
        email: 'reservas@hotelboutique.es',
        phone: '+34 954 123 456',
        state: 'assigned',
        priority: 'normal',
        description: 'Room service y entregas'
      },
      {
        id: 6,
        name: 'Restaurante Gourmet Bilbao',
        email: 'chef@gourmetchef.es',
        phone: '+34 944 123 456',
        state: 'won',
        priority: 'high',
        description: 'Entregas de insumos frescos'
      },
      {
        id: 7,
        name: 'Boutique de Ropa Madrid',
        email: 'ventas@boutiquemoda.es',
        phone: '+34 912 123 456',
        state: 'lost',
        priority: 'normal',
        description: 'Envío de pedidos online'
      },
      {
        id: 8,
        name: 'Clínica Dental Barcelona',
        email: 'admin@clinicadental.cat',
        phone: '+34 933 123 456',
        state: 'new',
        priority: 'normal',
        description: 'Envío de equipamiento médico'
      }
    ];

    try {
      setLoading(true);
      setError(null);

      // Generar clave de caché
      const cacheKey = `leads_${offset}_${limit}_${JSON.stringify(domain)}`;

      // Verificar caché
      if (cacheRef.current.has(cacheKey)) {
        console.log('[useLeads] 📦 Leads desde caché');
        const cachedLeads = cacheRef.current.get(cacheKey);
        setLeads(cachedLeads);
        setPagination({
          offset,
          limit,
          total: cachedLeads.length,
          hasMore: cachedLeads.length === limit
        });
        return cachedLeads;
      }

      // Intentar cargar desde Odoo
      let fetchedLeads = [];
      if (odooService) {
        console.log('[useLeads] 🔍 Cargando leads desde Odoo...');
        try {
          fetchedLeads = await odooService.getLeads(domain, offset, limit);
        } catch (err) {
          console.warn('[useLeads] ⚠️ Error con Odoo, usando datos demo:', err.message);
          fetchedLeads = demoLeads;
        }
      } else {
        console.log('[useLeads] 📊 Usando datos demo (Odoo no disponible)');
        fetchedLeads = demoLeads;
      }

      // Si la respuesta está vacía, usar demo
      if (!fetchedLeads || fetchedLeads.length === 0) {
        console.log('[useLeads] 📊 Usando datos de demostración');
        fetchedLeads = demoLeads;
      }

      // Guardar en caché
      cacheRef.current.set(cacheKey, fetchedLeads);

      setLeads(fetchedLeads);
      setPagination({
        offset,
        limit,
        total: fetchedLeads.length,
        hasMore: fetchedLeads.length === limit
      });

      console.log(`[useLeads] ✅ ${fetchedLeads.length} leads cargados`);
      return fetchedLeads;
    } catch (err) {
      console.error('[useLeads] Error cargando leads:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [odooService]);

  /**
   * Cargar siguiente página
   */
  const nextPage = useCallback(async (domain = []) => {
    const newOffset = pagination.offset + pagination.limit;
    return loadLeads(domain, newOffset, pagination.limit);
  }, [pagination, loadLeads]);

  /**
   * Cargar página anterior
   */
  const previousPage = useCallback(async (domain = []) => {
    const newOffset = Math.max(0, pagination.offset - pagination.limit);
    return loadLeads(domain, newOffset, pagination.limit);
  }, [pagination, loadLeads]);

  /**
   * Obtener un lead específico
   */
  const getLeadDetail = useCallback(async (leadId) => {
    if (!odooService) return null;

    try {
      setLoading(true);
      setError(null);

      console.log(`[useLeads] 📄 Obteniendo detalles del lead ${leadId}...`);
      const lead = await odooService.getLeadById(leadId);

      setSelectedLead(lead);

      console.log('[useLeads] ✅ Lead obtenido');
      return lead;
    } catch (err) {
      console.error('[useLeads] Error obteniendo lead:', err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [odooService]);

  /**
   * Buscar leads por término
   */
  const searchLeads = useCallback(async (searchTerm) => {
    if (!odooService) return [];

    try {
      setLoading(true);
      setError(null);

      console.log(`[useLeads] 🔎 Buscando leads: "${searchTerm}"`);

      const domain = [
        '|',
        ['name', 'ilike', searchTerm],
        ['email', 'ilike', searchTerm]
      ];

      const results = await odooService.getLeads(domain, 0, 20);

      setLeads(results);
      setPagination({
        offset: 0,
        limit: 20,
        total: results.length,
        hasMore: false
      });

      console.log(`[useLeads] ✅ ${results.length} resultados encontrados`);
      return results;
    } catch (err) {
      console.error('[useLeads] Error en búsqueda:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [odooService]);

  /**
   * Filtrar leads
   */
  const filterLeads = useCallback((filterFn) => {
    const filtered = leads.filter(filterFn);
    console.log(`[useLeads] 🔀 ${filtered.length} leads después del filtro`);
    return filtered;
  }, [leads]);

  /**
   * Limpiar caché
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
    console.log('[useLeads] 🗑️ Caché limpiado');
  }, []);

  /**
   * Resetear
   */
  const reset = useCallback(() => {
    setLeads([]);
    setSelectedLead(null);
    setError(null);
    setPagination({
      offset: 0,
      limit: 10,
      total: 0,
      hasMore: true
    });
    clearCache();
  }, [clearCache]);

  return {
    leads,
    selectedLead,
    loading,
    error,
    pagination,
    loadLeads,
    nextPage,
    previousPage,
    getLeadDetail,
    searchLeads,
    filterLeads,
    clearCache,
    reset,
    setSelectedLead
  };
};

export default useLeads;
