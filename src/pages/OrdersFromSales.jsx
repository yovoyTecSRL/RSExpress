/**
 * OrdersFromSales Component - Sales Orders Dashboard
 * Componente React para visualizar órdenes desde el modelo sale.order de Odoo
 * Características: Tabla de órdenes, filtros, búsqueda, información de auditoría
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import useOdoo from '@hooks/useOdoo';
import '@styles/orders-from-crm-new.css';
import '@styles/delivery-cards.css';
import '/assets/delivery-cards-page.css';

const OrdersFromSales = () => {
  // ═══════════════════════════════════════════════════════════════════
  // ESTADOS Y HOOKS
  // ═══════════════════════════════════════════════════════════════════

  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('all');

  // Hooks principales
  const { odoo, isConnected } = useOdoo({
    url: 'http://localhost:9999',
    database: 'odoo19',
    uid: 5,
    token: '1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b'
  });

  // ═══════════════════════════════════════════════════════════════════
  // CARGAR ÓRDENES
  // ═══════════════════════════════════════════════════════════════════

  const loadOrders = useCallback(async () => {
    if (!odoo || !isConnected) {
      console.log('[OrdersFromSales] ⚠️ Odoo no conectado');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('[OrdersFromSales] 🔍 Cargando órdenes desde sale.order...');

      const result = await odoo.callOdooAPI('object', 'execute_kw', [
        'odoo19',
        5,
        '1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b',
        'sale.order',
        'search_read',
        [],
        {
          fields: ['id', 'name', 'partner_id', 'amount_total', 'state', 'create_uid', 'create_date'],
          order: 'id DESC',
          limit: 100
        }
      ]);

      console.log('[OrdersFromSales] ✅ Órdenes cargadas:', result.length);
      setOrders(result || []);
    } catch (err) {
      console.error('[OrdersFromSales] Error cargando órdenes:', err);
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [odoo, isConnected]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // ═══════════════════════════════════════════════════════════════════
  // FILTRADO Y BÚSQUEDA
  // ═══════════════════════════════════════════════════════════════════

  useEffect(() => {
    let filtered = orders;

    // Filtro de estado
    if (filterState !== 'all') {
      filtered = filtered.filter(order => order.state === filterState);
    }

    // Filtro de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.name.toLowerCase().includes(term) ||
        (order.partner_id && Array.isArray(order.partner_id) && order.partner_id[1].toLowerCase().includes(term))
      );
    }

    setFilteredOrders(filtered);
  }, [orders, filterState, searchTerm]);

  // ═══════════════════════════════════════════════════════════════════
  // FUNCIONES DE RENDERIZADO
  // ═══════════════════════════════════════════════════════════════════

  const renderStateBadge = (state) => {
    const badges = {
      draft: { class: 'badge-borrador', label: 'Borrador', icon: '📝' },
      sent: { class: 'badge-enviado', label: 'Enviado', icon: '📤' },
      sale: { class: 'badge-venta', label: 'Venta', icon: '💰' },
      done: { class: 'badge-entregados', label: 'Completado', icon: '✅' },
      cancel: { class: 'badge-fallidos', label: 'Cancelado', icon: '❌' }
    };
    const badge = badges[state] || badges.draft;
    return <span className={`state-badge ${badge.class}`}>{badge.icon} {badge.label}</span>;
  };

  const getPartnerName = (partnerId) => {
    if (Array.isArray(partnerId)) {
      return partnerId[1];
    }
    return 'N/A';
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  // ═══════════════════════════════════════════════════════════════════
  // RENDER PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="orders-from-sales">
      {/* HEADER */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-title">
            <h1>💼 Órdenes de Venta</h1>
            <p>Gestiona todas las órdenes de venta desde Odoo</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-primary"
              onClick={loadOrders}
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
            placeholder="🔎 Buscar por nombre de orden o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-bar">
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="sent">Enviado</option>
            <option value="sale">Venta</option>
            <option value="done">Completado</option>
            <option value="cancel">Cancelado</option>
          </select>
        </div>

        <div className="stats-info">
          <span className="stat-item">
            <span className="stat-label">Total:</span>
            <span className="stat-value">{filteredOrders.length}</span>
          </span>
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando órdenes de venta...</p>
        </div>
      )}

      {/* ERROR STATE */}
      {error && (
        <div className="error-state">
          <p>⚠️ Error al cargar las órdenes: {error}</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && filteredOrders.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No hay órdenes para mostrar</h3>
          <p>Intenta ajustar los filtros o crear una nueva orden</p>
        </div>
      )}

      {/* TABLE */}
      {!loading && filteredOrders.length > 0 && (
        <div className="delivery-table orders-table">
          <table>
            <thead>
              <tr>
                <th className="col-id">ID</th>
                <th className="col-name">Orden</th>
                <th className="col-partner">Cliente</th>
                <th className="col-amount">Monto</th>
                <th className="col-state">Estado</th>
                <th className="col-created">Creado por</th>
                <th className="col-date">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr key={order.id} className="order-row">
                  <td className="col-id">
                    <strong>#{order.id}</strong>
                  </td>
                  <td className="col-name">
                    <div className="order-name">
                      <strong>{order.name}</strong>
                    </div>
                  </td>
                  <td className="col-partner">
                    <span>{getPartnerName(order.partner_id)}</span>
                  </td>
                  <td className="col-amount">
                    <span className="amount-value">
                      {formatCurrency(order.amount_total)}
                    </span>
                  </td>
                  <td className="col-state">
                    {renderStateBadge(order.state)}
                  </td>
                  <td className="col-created">
                    <span>{getCreatedByName(order.create_uid)}</span>
                  </td>
                  <td className="col-date">
                    <span className="date-value">
                      {formatDate(order.create_date)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* STATS FOOTER */}
      {filteredOrders.length > 0 && (
        <div className="orders-footer">
          <div className="footer-stats">
            <div className="stat-item">
              <span className="stat-label">Total de Órdenes:</span>
              <span className="stat-value">{filteredOrders.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Monto Total:</span>
              <span className="stat-value amount">
                {formatCurrency(filteredOrders.reduce((sum, order) => sum + (order.amount_total || 0), 0))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersFromSales;
