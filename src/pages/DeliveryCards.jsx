/**
 * DeliveryCards Component
 * Componente React para visualizar entregas y rutas
 * 
 * Migración de: delivery-cards.html
 */

import React, { useEffect, useState } from 'react';
import useOdoo from '@hooks/useOdoo';
import useOrders from '@hooks/useOrders';
import useFleet from '@hooks/useFleet';
import '@styles/delivery-cards.css';

const DeliveryCards = () => {
  const [routeFilter, setRouteFilter] = useState('all');
  const [selectedRoute, setSelectedRoute] = useState(null);

  // Hooks
  const { odoo, isConnected } = useOdoo({
    url: 'http://localhost:9999',
    database: 'odoo19',
    uid: 5,
    token: '1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b'
  });

  const { orders, updateStatus } = useOrders(odoo);

  const {
    drivers,
    vehicles,
    positions,
    loadDrivers,
    loadVehicles,
    loadTraccarData,
    getDriverPosition
  } = useFleet(odoo, {
    baseURL: 'http://localhost:8082',
    username: 'admin',
    password: 'admin'
  });

  /**
   * Cargar datos cuando se conecte
   */
  useEffect(() => {
    let mounted = true;
    
    if (isConnected && odoo && mounted) {
      loadDrivers();
      loadVehicles();
      loadTraccarData();
    }

    return () => {
      mounted = false;
    };
  }, [isConnected]);

  /**
   * Filtrar órdenes
   */
  const getFilteredOrders = () => {
    if (routeFilter === 'all') return orders;
    return orders.filter(order => order.status === routeFilter);
  };

  /**
   * Actualizar estado de entrega
   */
  const handleStatusUpdate = (orderId, newStatus) => {
    if (updateStatus(orderId, newStatus)) {
      alert(`✅ Entrega actualizada: ${newStatus}`);
    }
  };

  /**
   * Obtener información del conductor
   */
  const getDriverInfo = (driverId) => {
    const driver = drivers.find(d => d.id === driverId);
    const position = getDriverPosition(driverId);

    return { driver, position };
  };

  const filteredOrders = getFilteredOrders();

  return (
    <div className="delivery-cards">
      {/* Header */}
      <div className="delivery-header">
        <h1>🚚 Gestión de Entregas</h1>
        <div className="header-stats">
          <span className="stat">
            📦 Total: {orders.length}
          </span>
          <span className="stat">
            👥 Conductores: {drivers.length}
          </span>
          <span className="stat">
            🚗 Vehículos: {vehicles.length}
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        {['all', 'draft', 'confirmed', 'delivered'].map(status => (
          <button
            key={status}
            onClick={() => setRouteFilter(status)}
            className={`tab ${routeFilter === status ? 'active' : ''}`}
          >
            {status === 'all' ? '📋 Todas' : `${status}`}
            <span className="count">
              {status === 'all'
                ? orders.length
                : orders.filter(o => o.status === status).length}
            </span>
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      <div className="cards-grid">
        {filteredOrders && filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const { driver, position } = getDriverInfo(order.assigned_driver);

            return (
              <div
                key={order.id}
                className={`delivery-card status-${order.status}`}
                onClick={() => setSelectedRoute(order.id)}
              >
                {/* Card Header */}
                <div className="card-header">
                  <div className="card-title">
                    <h3>{order.reference}</h3>
                    <span className={`status-badge status-${order.status}`}>
                      {order.status}
                    </span>
                  </div>
                  <button
                    className="btn-close"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRoute(null);
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Customer Info */}
                <div className="card-section">
                  <h4>👤 Cliente</h4>
                  <p className="customer-name">{order.customer.name}</p>
                  <p className="customer-id">ID: {order.customer.id}</p>
                </div>

                {/* Order Details */}
                <div className="card-section">
                  <h4>📋 Detalles</h4>
                  <div className="order-details">
                    <p>
                      <span className="label">Monto:</span>
                      <span className="value">${order.amount.toFixed(2)}</span>
                    </p>
                  </div>
                </div>

                {/* Driver Assignment */}
                {driver ? (
                  <div className="card-section driver-info">
                    <h4>👨‍💼 Conductor Asignado</h4>
                    <p className="driver-name">{driver.name}</p>
                    <p className="driver-contact">
                      📞 {driver.phone || 'No disponible'}
                    </p>

                    {/* Position */}
                    {position && (
                      <div className="position-info">
                        <p className="position">
                          📍 ({position.latitude.toFixed(4)}, {position.longitude.toFixed(4)})
                        </p>
                        <p className="speed">
                          ⚡ {position.speed} km/h
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="card-section no-driver">
                    <p>⚠️ Sin conductor asignado</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="card-actions">
                  {order.status === 'draft' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(order.id, 'confirmed');
                      }}
                      className="btn btn-confirm"
                    >
                      ✓ Confirmar
                    </button>
                  )}

                  {order.status === 'confirmed' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusUpdate(order.id, 'delivered');
                      }}
                      className="btn btn-deliver"
                    >
                      ✓ Entregar
                    </button>
                  )}

                  {order.status === 'delivered' && (
                    <span className="badge-delivered">✓ Entregado</span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-orders">
            <p>ℹ️ No hay entregas en este estado</p>
          </div>
        )}
      </div>

      {/* Detail View */}
      {selectedRoute && (
        <div className="route-detail-modal">
          <div className="modal-content">
            <button
              onClick={() => setSelectedRoute(null)}
              className="btn-close-modal"
            >
              ✕
            </button>
            <h2>Detalles de Ruta</h2>
            <p>Información detallada de la entrega seleccionada</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryCards;
