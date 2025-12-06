/**
 * FleetDashboard Component
 * Componente React para dashboard de flota y conductores
 * 
 * Migración de: fleet-dashboard.html
 */

import React, { useEffect, useState, useCallback } from 'react';
import useOdoo from '@hooks/useOdoo';
import useFleet from '@hooks/useFleet';
import '@styles/fleet-dashboard.css';

const FleetDashboard = () => {
  const [mapCenter, setMapCenter] = useState({ lat: 40.4168, lng: -3.7038 }); // Madrid
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5s

  // Hooks
  const { odoo, isConnected } = useOdoo({
    url: 'http://localhost:9999',
    database: 'odoo19',
    uid: 5,
    token: '1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b'
  });

  const {
    drivers,
    vehicles,
    positions,
    loading,
    traccarConnected,
    loadDrivers,
    loadVehicles,
    loadTraccarData,
    getDriverPosition,
    connectTraccarWebSocket,
    getFleetSummary,
    getTraccarStats
  } = useFleet(odoo, {
    baseURL: 'http://localhost:8082',
    username: 'admin',
    password: 'admin'
  });

  /**
   * Cargar datos iniciales cuando se conecte
   */
  useEffect(() => {
    let mounted = true;
    
    if (isConnected && odoo && mounted) {
      console.log('[FleetDashboard] 🚀 Cargando datos iniciales...');
      loadDrivers();
      loadVehicles();
      loadTraccarData();

      // Intentar conectar WebSocket
      connectTraccarWebSocket().catch(err => {
        console.warn('[FleetDashboard] WebSocket no disponible:', err);
      });
    }

    return () => {
      mounted = false;
    };
  }, [isConnected]);

  /**
   * Actualizar datos periódicamente
   */
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      loadTraccarData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval, isConnected]);

  /**
   * Obtener información del conductor
   */
  const getDriverStats = useCallback((driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    const position = getDriverPosition(driverId);
    const vehicle = vehicles.find(v => v.driverId === driverId);

    return { driver, position, vehicle };
  }, [drivers, vehicles, getDriverPosition]);

  /**
   * Cambiar conductor seleccionado
   */
  const handleSelectDriver = (driverId) => {
    const stats = getDriverStats(driverId);
    if (stats.position) {
      setMapCenter({
        lat: stats.position.latitude,
        lng: stats.position.longitude
      });
    }
    setSelectedDriver(driverId);
  };

  const fleetSummary = getFleetSummary();
  const traccarStats = getTraccarStats();

  return (
    <div className="fleet-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>🚗 Dashboard de Flota</h1>
        <div className="header-controls">
          <label className="refresh-control">
            Actualizar cada:
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
            >
              <option value={2000}>2s</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
            </select>
          </label>
          <span className={`traccar-status ${traccarConnected ? 'connected' : 'disconnected'}`}>
            {traccarConnected ? '🟢 Traccar Online' : '🔴 Traccar Offline'}
          </span>
        </div>
      </div>

      {/* Stats Overview */}
      {fleetSummary && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Conductores</h3>
              <p className="stat-value">{fleetSummary.totalDrivers}</p>
              <p className="stat-detail">{fleetSummary.activeDrivers} activos</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🚗</div>
            <div className="stat-content">
              <h3>Vehículos</h3>
              <p className="stat-value">{fleetSummary.totalVehicles}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>Órdenes Asignadas</h3>
              <p className="stat-value">{fleetSummary.totalAssignedOrders}</p>
              <p className="stat-detail">{fleetSummary.driversWithOrders} conductores</p>
            </div>
          </div>

          {traccarStats && (
            <>
              <div className="stat-card">
                <div className="stat-icon">🟢</div>
                <div className="stat-content">
                  <h3>En Movimiento</h3>
                  <p className="stat-value">{traccarStats.moving}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">🔴</div>
                <div className="stat-content">
                  <h3>Parados</h3>
                  <p className="stat-value">{traccarStats.stopped}</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      <div className="dashboard-content">
        {/* Drivers List */}
        <div className="drivers-panel">
          <h2>👥 Conductores</h2>
          {loading && <p className="loading">⏳ Cargando...</p>}

          <div className="drivers-list">
            {drivers && drivers.length > 0 ? (
              drivers.map((driver) => {
                const { position, vehicle } = getDriverStats(driver.id);
                const isSelected = selectedDriver === driver.id;

                return (
                  <div
                    key={driver.id}
                    className={`driver-item ${isSelected ? 'selected' : ''} ${
                      position && position.speed > 0 ? 'moving' : 'stopped'
                    }`}
                    onClick={() => handleSelectDriver(driver.id)}
                  >
                    <div className="driver-header">
                      <h3>{driver.name}</h3>
                      <span className={`status ${position ? 'online' : 'offline'}`}>
                        {position ? '🟢 Online' : '⚫ Offline'}
                      </span>
                    </div>

                    <p className="driver-contact">📞 {driver.phone}</p>

                    {vehicle && (
                      <p className="driver-vehicle">
                        🚗 {vehicle.model}
                      </p>
                    )}

                    {position && (
                      <div className="driver-position">
                        <p>📍 Lat: {position.latitude.toFixed(4)}</p>
                        <p>📍 Lon: {position.longitude.toFixed(4)}</p>
                        <p>⚡ Vel: {position.speed} km/h</p>
                      </div>
                    )}

                    {driver.assignedOrders && driver.assignedOrders.length > 0 && (
                      <p className="driver-orders">
                        📦 {driver.assignedOrders.length} órdenes
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="no-data">ℹ️ No hay conductores disponibles</p>
            )}
          </div>
        </div>

        {/* Map & Details */}
        <div className="map-panel">
          <h2>📍 Mapa de Flota</h2>

          {/* Map Container */}
          <div className="map-container">
            <div className="map-placeholder">
              <p>🗺️ Mapa de flotas</p>
              <p className="map-center">
                Centro: {mapCenter.lat.toFixed(4)}, {mapCenter.lng.toFixed(4)}
              </p>
              {selectedDriver && (
                <div className="selected-info">
                  <p>👁️ Siguiendo a: Conductor {selectedDriver}</p>
                </div>
              )}
            </div>
          </div>

          {/* Driver Details */}
          {selectedDriver && (
            <div className="driver-details">
              <h3>📋 Detalles del Conductor</h3>
              {(() => {
                const { driver, position, vehicle } = getDriverStats(selectedDriver);
                return (
                  <>
                    <div className="detail-row">
                      <span className="label">Nombre:</span>
                      <span className="value">{driver?.name}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Teléfono:</span>
                      <span className="value">{driver?.phone}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Vehículo:</span>
                      <span className="value">{vehicle?.model || 'N/A'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Placa:</span>
                      <span className="value">{vehicle?.plate || 'N/A'}</span>
                    </div>
                    {position && (
                      <>
                        <div className="detail-row">
                          <span className="label">Velocidad:</span>
                          <span className="value">{position.speed} km/h</span>
                        </div>
                        <div className="detail-row">
                          <span className="label">Última actualización:</span>
                          <span className="value">
                            {new Date(position.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      </>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FleetDashboard;
