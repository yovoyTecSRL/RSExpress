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
    if (!odooService) return [];

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

      // Cargar desde Odoo
      console.log('[useLeads] 🔍 Cargando leads desde Odoo...');
      const fetchedLeads = await odooService.getLeads(domain, offset, limit);

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
