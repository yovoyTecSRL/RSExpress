/**
 * useOrders Hook
 * Hook personalizado para gestionar órdenes
 */

import { useState, useCallback, useRef } from 'react';
import OrderManagerService from '@services/OrderManagerService';

const useOrders = (odooService) => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'draft', 'confirmed', 'delivered'

  const orderManagerRef = useRef(null);

  // Inicializar OrderManager
  const initOrderManager = useCallback(() => {
    if (!orderManagerRef.current && odooService) {
      orderManagerRef.current = new OrderManagerService(odooService);
    }
    return orderManagerRef.current;
  }, [odooService]);

  /**
   * Crear orden desde un lead
   */
  const createOrderFromLead = useCallback(async (leadId, leadData) => {
    try {
      setLoading(true);
      setError(null);

      const manager = initOrderManager();
      if (!manager) throw new Error('Order manager no inicializado');

      console.log(`[useOrders] 📦 Creando orden desde lead ${leadId}...`);

      const order = await manager.createOrderFromLead(leadId, leadData);

      // Agregar a lista
      setOrders(prev => [...prev, order]);

      console.log('[useOrders] ✅ Orden creada exitosamente');
      return order;
    } catch (err) {
      console.error('[useOrders] Error creando orden:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initOrderManager]);

  /**
   * Obtener todas las órdenes
   */
  const getAllOrders = useCallback(() => {
    const manager = initOrderManager();
    if (!manager) return [];

    const allOrders = manager.getAllOrders();

    if (filter === 'all') {
      return allOrders;
    }

    return allOrders.filter(order => order.status === filter);
  }, [filter, initOrderManager]);

  /**
   * Obtener orden específica
   */
  const getOrder = useCallback((orderId) => {
    const manager = initOrderManager();
    if (!manager) return null;

    return manager.getOrder(orderId);
  }, [initOrderManager]);

  /**
   * Asignar conductor a orden
   */
  const assignDriver = useCallback((orderId, driverId) => {
    const manager = initOrderManager();
    if (!manager) return false;

    try {
      const success = manager.assignDriver(orderId, driverId);

      if (success) {
        // Actualizar estado local
        setOrders(prev =>
          prev.map(order =>
            order.id === orderId
              ? { ...order, assigned_driver: driverId }
              : order
          )
        );
      }

      return success;
    } catch (err) {
      console.error('[useOrders] Error asignando conductor:', err);
      setError(err.message);
      return false;
    }
  }, [initOrderManager]);

  /**
   * Actualizar estado de orden
   */
  const updateStatus = useCallback((orderId, status) => {
    const manager = initOrderManager();
    if (!manager) return false;

    try {
      const success = manager.updateOrderStatus(orderId, status);

      if (success) {
        // Actualizar estado local
        setOrders(prev =>
          prev.map(order =>
            order.id === orderId
              ? { ...order, status }
              : order
          )
        );
      }

      return success;
    } catch (err) {
      console.error('[useOrders] Error actualizando estado:', err);
      setError(err.message);
      return false;
    }
  }, [initOrderManager]);

  /**
   * Filtrar órdenes por estado
   */
  const filterByStatus = useCallback((status) => {
    setFilter(status);
    console.log(`[useOrders] 🔀 Filtro aplicado: ${status}`);
  }, []);

  /**
   * Obtener resumen de órdenes
   */
  const getOrderSummary = useCallback(() => {
    const allOrders = getAllOrders();

    return {
      total: allOrders.length,
      draft: allOrders.filter(o => o.status === 'draft').length,
      confirmed: allOrders.filter(o => o.status === 'confirmed').length,
      delivered: allOrders.filter(o => o.status === 'delivered').length,
      withDriver: allOrders.filter(o => o.assigned_driver).length,
      withoutDriver: allOrders.filter(o => !o.assigned_driver).length
    };
  }, [getAllOrders]);

  /**
   * Resetear
   */
  const reset = useCallback(() => {
    setOrders([]);
    setSelectedOrder(null);
    setError(null);
    setFilter('all');
  }, []);

  return {
    orders: getAllOrders(),
    selectedOrder,
    loading,
    error,
    filter,
    createOrderFromLead,
    getAllOrders,
    getOrder,
    assignDriver,
    updateStatus,
    filterByStatus,
    getOrderSummary,
    reset,
    setSelectedOrder
  };
};

export default useOrders;
