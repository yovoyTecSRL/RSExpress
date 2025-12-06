/**
 * useFleet Hook
 * Hook personalizado para gestionar conductores y vehículos
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import DriverFleetService from '@services/DriverFleetService';
import TraccarService from '@services/TraccarService';

const useFleet = (odooService, traccarConfig = {}) => {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [positions, setPositions] = useState(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [traccarConnected, setTraccarConnected] = useState(false);

  const fleetManagerRef = useRef(null);
  const traccarServiceRef = useRef(null);

  /**
   * Inicializar servicios
   */
  const initServices = useCallback(() => {
    if (!fleetManagerRef.current && odooService) {
      fleetManagerRef.current = new DriverFleetService(odooService);
    }

    if (!traccarServiceRef.current) {
      traccarServiceRef.current = new TraccarService(traccarConfig);
    }

    return {
      fleet: fleetManagerRef.current,
      traccar: traccarServiceRef.current
    };
  }, [odooService, traccarConfig]);

  /**
   * Cargar conductores
   */
  const loadDrivers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { fleet } = initServices();
      if (!fleet) throw new Error('Fleet manager no inicializado');

      console.log('[useFleet] 👥 Cargando conductores...');

      const loadedDrivers = await fleet.loadDrivers();
      setDrivers(loadedDrivers);

      console.log(`[useFleet] ✅ ${loadedDrivers.length} conductores cargados`);
      return loadedDrivers;
    } catch (err) {
      console.error('[useFleet] Error cargando conductores:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [initServices]);

  /**
   * Cargar vehículos
   */
  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { fleet } = initServices();
      if (!fleet) throw new Error('Fleet manager no inicializado');

      console.log('[useFleet] 🚗 Cargando vehículos...');

      const loadedVehicles = await fleet.loadVehicles();
      setVehicles(loadedVehicles);

      console.log(`[useFleet] ✅ ${loadedVehicles.length} vehículos cargados`);
      return loadedVehicles;
    } catch (err) {
      console.error('[useFleet] Error cargando vehículos:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [initServices]);

  /**
   * Cargar datos de Traccar
   */
  const loadTraccarData = useCallback(async () => {
    try {
      const { traccar } = initServices();
      if (!traccar) throw new Error('Traccar service no inicializado');

      console.log('[useFleet] 📍 Conectando con Traccar...');

      // Autenticar
      await traccar.authenticate();

      // Obtener dispositivos
      await traccar.getDevices();

      // Obtener todas las posiciones
      const allPositions = await traccar.getAllPositions();

      // Actualizar estado local
      const posMap = new Map();
      allPositions.forEach(pos => {
        posMap.set(pos.deviceId, pos);
      });
      setPositions(posMap);

      setTraccarConnected(true);

      console.log('[useFleet] ✅ Datos de Traccar cargados');
      return allPositions;
    } catch (err) {
      console.error('[useFleet] Error cargando Traccar:', err);
      setError(err.message);
      setTraccarConnected(false);
      return [];
    }
  }, [initServices]);

  /**
   * Obtener posición de conductor
   */
  const getDriverPosition = useCallback((driverId) => {
    return positions.get(driverId) || null;
  }, [positions]);

  /**
   * Actualizar ubicación de conductor
   */
  const updateDriverLocation = useCallback((driverId, lat, lon) => {
    const { fleet } = initServices();
    if (!fleet) return false;

    try {
      fleet.updateDriverLocation(driverId, lat, lon);
      return true;
    } catch (err) {
      console.error('[useFleet] Error actualizando ubicación:', err);
      setError(err.message);
      return false;
    }
  }, [initServices]);

  /**
   * Asignar orden a conductor
   */
  const assignOrderToDriver = useCallback((driverId, orderId) => {
    const { fleet } = initServices();
    if (!fleet) return false;

    try {
      const success = fleet.assignOrderToDriver(driverId, orderId);

      if (success) {
        // Actualizar conductores en estado local
        setDrivers(prev =>
          prev.map(driver =>
            driver.id === driverId
              ? { ...driver, assignedOrders: [...driver.assignedOrders, orderId] }
              : driver
          )
        );
      }

      return success;
    } catch (err) {
      console.error('[useFleet] Error asignando orden:', err);
      setError(err.message);
      return false;
    }
  }, [initServices]);

  /**
   * Obtener resumen de flota
   */
  const getFleetSummary = useCallback(() => {
    const { fleet } = initServices();
    if (!fleet) return null;

    return fleet.getFleetSummary();
  }, [initServices]);

  /**
   * Obtener estadísticas de Traccar
   */
  const getTraccarStats = useCallback(() => {
    const { traccar } = initServices();
    if (!traccar) return null;

    return traccar.getFleetStats();
  }, [initServices]);

  /**
   * Conectar WebSocket de Traccar para actualizaciones en tiempo real
   */
  const connectTraccarWebSocket = useCallback(async () => {
    try {
      const { traccar } = initServices();
      if (!traccar) throw new Error('Traccar service no inicializado');

      console.log('[useFleet] 🔗 Conectando WebSocket de Traccar...');

      await traccar.connectWebSocket();
      setTraccarConnected(true);

      console.log('[useFleet] ✅ WebSocket conectado');
      return true;
    } catch (err) {
      console.error('[useFleet] Error conectando WebSocket:', err);
      setError(err.message);
      setTraccarConnected(false);
      return false;
    }
  }, [initServices]);

  /**
   * Desconectar WebSocket
   */
  const disconnectTraccarWebSocket = useCallback(() => {
    const { traccar } = initServices();
    if (traccar) {
      traccar.disconnectWebSocket();
      setTraccarConnected(false);
      console.log('[useFleet] ✅ WebSocket desconectado');
    }
  }, [initServices]);

  /**
   * Resetear
   */
  const reset = useCallback(() => {
    setDrivers([]);
    setVehicles([]);
    setPositions(new Map());
    setSelectedDriver(null);
    setError(null);
    setTraccarConnected(false);
  }, []);

  return {
    drivers,
    vehicles,
    positions,
    loading,
    error,
    selectedDriver,
    traccarConnected,
    loadDrivers,
    loadVehicles,
    loadTraccarData,
    getDriverPosition,
    updateDriverLocation,
    assignOrderToDriver,
    getFleetSummary,
    getTraccarStats,
    connectTraccarWebSocket,
    disconnectTraccarWebSocket,
    reset,
    setSelectedDriver
  };
};

export default useFleet;
