/**
 * FleetDashboard Component - Fleet Vehicles Management
 * Componente React para gestionar vehículos desde el modelo fleet.vehicle de Odoo
 * Campos: id, name, license_plate, driver_id, create_uid, create_date
 */

import React, { useEffect, useState, useCallback } from 'react';
import useOdoo from '@hooks/useOdoo';
import '@styles/fleet-dashboard.css';

const FleetDashboard = () => {
  // ═══════════════════════════════════════════════════════════════════
  // ESTADOS
  // ═══════════════════════════════════════════════════════════════════

  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Hooks
  const { odoo, isConnected } = useOdoo({
    url: 'http://localhost:9999',
    database: 'odoo19',
    uid: 5,
    token: '1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b'
  });

  // ═══════════════════════════════════════════════════════════════════
  // CARGAR VEHÍCULOS
  // ═══════════════════════════════════════════════════════════════════

  const loadVehicles = useCallback(async () => {
    if (!odoo || !isConnected) {
      console.log('[FleetDashboard] ⚠️ Odoo no conectado');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('[FleetDashboard] 🚗 Cargando vehículos desde fleet.vehicle...');

      const result = await odoo.callOdooAPI('object', 'execute_kw', [
        'odoo19',
        5,
        '1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b',
        'fleet.vehicle',
        'search_read',
        [],
        {
          fields: ['id', 'name', 'license_plate', 'driver_id', 'create_uid', 'create_date'],
          order: 'id DESC',
          limit: 100
        }
      ]);

      console.log('[FleetDashboard] ✅ Vehículos cargados:', result.length);
      setVehicles(result || []);
    } catch (err) {
      console.error('[FleetDashboard] Error cargando vehículos:', err);
      setError(err.message);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [odoo, isConnected]);

  useEffect(() => {
    loadVehicles();
  }, [loadVehicles]);

  // ═══════════════════════════════════════════════════════════════════
  // FILTRADO Y BÚSQUEDA
  // ═══════════════════════════════════════════════════════════════════

  useEffect(() => {
    let filtered = vehicles;

    // Búsqueda (sin filtro de estado ya que fleet.vehicle no tiene ese campo)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(vehicle =>
        vehicle.name.toLowerCase().includes(term) ||
        (vehicle.license_plate && vehicle.license_plate.toLowerCase().includes(term)) ||
        (vehicle.driver_id && Array.isArray(vehicle.driver_id) && vehicle.driver_id[1].toLowerCase().includes(term))
      );
    }

    setFilteredVehicles(filtered);
  }, [vehicles, searchTerm]);

  // ═══════════════════════════════════════════════════════════════════
  // FUNCIONES AUXILIARES
  // ═══════════════════════════════════════════════════════════════════

  const getDriverName = (driverId) => {
    if (Array.isArray(driverId)) {
      return driverId[1];
    }
    return 'Sin asignar';
  };

  const getCreatedByName = (createUid) => {
    if (Array.isArray(createUid)) {
      return createUid[1];
    }
    return createUid || 'N/A';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  // ═══════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="fleet-dashboard">
      {/* HEADER */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-title">
            <h1>🚗 Flota de Vehículos</h1>
            <p>Gestiona todos los vehículos de la flota desde Odoo</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-primary"
              onClick={loadVehicles}
              disabled={loading}
            >
              {loading ? '⏳ Cargando...' : '🔄 Refrescar'}
            </button>
          </div>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="toolbar">
        <div className="search-bar">
          <input
            type="text"
            placeholder="🔎 Buscar por vehículo, placa o conductor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="stats-info">
          <span className="stat-item">
            <span className="stat-label">Total:</span>
            <span className="stat-value">{filteredVehicles.length}</span>
          </span>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando vehículos...</p>
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <div className="error-state">
          <p>⚠️ Error al cargar los vehículos: {error}</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filteredVehicles.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🚗</div>
          <h3>No hay vehículos para mostrar</h3>
          <p>Intenta ajustar los filtros o crea un nuevo vehículo en Odoo</p>
        </div>
      )}

      {/* TABLE */}
      {!loading && filteredVehicles.length > 0 && (
        <div className="delivery-table vehicles-table">
          <table>
            <thead>
              <tr>
                <th className="col-id">ID</th>
                <th className="col-name">Vehículo</th>
                <th className="col-plate">Placa</th>
                <th className="col-driver">Conductor</th>
                <th className="col-created">Creado por</th>
                <th className="col-date">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filteredVehicles.map(vehicle => (
                <tr key={vehicle.id} className="vehicle-row">
                  <td className="col-id">
                    <strong>#{vehicle.id}</strong>
                  </td>
                  <td className="col-name">
                    <div className="vehicle-name">
                      <strong>🚗 {vehicle.name}</strong>
                    </div>
                  </td>
                  <td className="col-plate">
                    <span className="plate-badge">
                      {vehicle.license_plate || 'N/A'}
                    </span>
                  </td>
                  <td className="col-driver">
                    <span>{getDriverName(vehicle.driver_id)}</span>
                  </td>
                  <td className="col-created">
                    <span>{getCreatedByName(vehicle.create_uid)}</span>
                  </td>
                  <td className="col-date">
                    <span className="date-value">
                      {formatDate(vehicle.create_date)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* STATS FOOTER */}
      {filteredVehicles.length > 0 && (
        <div className="vehicles-footer">
          <div className="footer-stats">
            <div className="stat-item">
              <span className="stat-label">Total de Vehículos:</span>
              <span className="stat-value">{filteredVehicles.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetDashboard;
