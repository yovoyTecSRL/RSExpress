/**
 * OrdersFromCRM Component - Advanced Dashboard with Delivery-Cards Style
 * Componente React para visualizar y gestionar leads/órdenes desde CRM Odoo
 * Combina: Lógica de delivery-cards.html + DOM structure + CSS animations
 * Características: Panel flotante de stats, filtros avanzados, vista grid/list, modal moderno
 */

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import useOdoo from '@hooks/useOdoo';
import useLeads from '@hooks/useLeads';
import useOrders from '@hooks/useOrders';
import '@styles/orders-from-crm.css';

const OrdersFromCRM = () => {
  // ═══════════════════════════════════════════════════════════════════
  // ESTADOS Y HOOKS
  // ═══════════════════════════════════════════════════════════════════

  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [showFilters, setShowFilters] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapOpen, setMapOpen] = useState(false);

  // Estados de filtro
  const [filterState, setFilterState] = useState('all');
  const [filterPriority, setPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados del formulario modal
  const [newOrder, setNewOrder] = useState({
    name: '',
    client_name: '',
    description: '',
    pickup_location: '',
    delivery_location: '',
    distance: '',
    status: 'pending',
    priority: 'normal',
    notes: ''
  });

  // Hooks principales
  const { odoo, isConnected, loading: odooLoading, stats } = useOdoo({
    url: 'http://localhost:9999',
    database: 'odoo19',
    uid: 5,
    token: '1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b'
  });

  const { leads, loading: leadsLoading, error: leadsError, loadLeads } = useLeads(odoo);
  const { createOrderFromLead } = useOrders(odoo);

  // ═══════════════════════════════════════════════════════════════════
  // CARGA DE DATOS
  // ═══════════════════════════════════════════════════════════════════

  useEffect(() => {
    console.log('[OrdersFromCRM] 🚀 Auto-cargando leads...');
    loadLeads([], 0, 50);
  }, [loadLeads]);

  // ═══════════════════════════════════════════════════════════════════
  // FUNCIONES DE FILTRADO Y BÚSQUEDA
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Calcular estadísticas de leads
   */
  const calculateStats = useCallback(() => {
    return {
      failed: leads.filter(l => l.state === 'lost').length,
      pending: leads.filter(l => l.state === 'new').length,
      inTransit: leads.filter(l => l.state === 'assigned').length,
      completed: leads.filter(l => l.state === 'won').length,
      total: leads.length
    };
  }, [leads]);

  /**
   * Filtrar leads según criterios
   */
  const filteredLeads = useCallback(() => {
    return leads.filter(lead => {
      // Filtro de estado
      if (filterState !== 'all' && lead.state !== filterState) return false;

      // Filtro de prioridad
      if (filterPriority !== 'all' && lead.priority !== filterPriority) return false;

      // Filtro de búsqueda
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchSearch =
          lead.name.toLowerCase().includes(term) ||
          (lead.email && lead.email.toLowerCase().includes(term)) ||
          (lead.phone && lead.phone.includes(term));
        if (!matchSearch) return false;
      }

      return true;
    });
  }, [leads, filterState, filterPriority, searchTerm]);

  const stats_data = calculateStats();
  const displayedLeads = filteredLeads();

  // ═══════════════════════════════════════════════════════════════════
  // MANEJADORES DE EVENTOS
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Manejar cambio en input del modal
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrder(prev => ({
      ...prev,
      [name]: value
    }));
  };

  /**
   * Manejar selección de ubicación en mapa
   */
  const handleMapSelect = (location) => {
    setSelectedLocation(location);
    setNewOrder(prev => ({
      ...prev,
      delivery_location: `${location.lat}, ${location.lng}`
    }));
    setMapOpen(false);
  };

  /**
   * Crear nueva orden
   */
  const handleCreateNewOrder = async (e) => {
    e.preventDefault();
    
    if (!newOrder.name || !newOrder.client_name) {
      alert('⚠️ Por favor completa los campos requeridos');
      return;
    }

    try {
      const orderData = {
        name: newOrder.name,
        partner_id: [0, newOrder.client_name],
        description: newOrder.description,
        state: newOrder.status,
        priority: newOrder.priority,
        notes: newOrder.notes
      };

      await createOrderFromLead(null, orderData);
      alert('✅ Orden creada exitosamente');
      
      // Resetear formulario
      setNewOrder({
        name: '',
        client_name: '',
        description: '',
        pickup_location: '',
        delivery_location: '',
        distance: '',
        status: 'pending',
        priority: 'normal',
        notes: ''
      });
      setSelectedLocation(null);
      setShowModal(false);
      
      // Recargar leads
      loadLeads([], 0, 50);
    } catch (error) {
      console.error('Error creando orden:', error);
      alert('❌ Error al crear la orden: ' + error.message);
    }
  };

  /**
   * Crear orden desde lead existente
   */
  const handleCreateOrderFromLead = async (lead) => {
    try {
      const orderData = {
        customer_id: lead.id,
        name: `PO-${lead.id}-${Date.now()}`,
        origin: 'crm_lead',
        state: 'draft'
      };
      await createOrderFromLead(lead, orderData);
      alert(`✅ Orden creada para ${lead.name}`);
      loadLeads([], 0, 50);
    } catch (error) {
      console.error('Error creando orden:', error);
      alert('❌ Error al crear la orden');
    }
  };

  /**
   * Refrescar leads
   */
  const handleRefresh = () => {
    console.log('[OrdersFromCRM] 🔄 Refrescando leads...');
    loadLeads([], 0, 50);
  };

  // ═══════════════════════════════════════════════════════════════════
  // FUNCIONES DE RENDERIZADO
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Renderizar badge de estado
   */
  const renderStateBadge = (state) => {
    const badges = {
      new: { class: 'badge-pendiente', label: 'Pendiente', icon: '📋' },
      assigned: { class: 'badge-entregando', label: 'Asignado', icon: '🚗' },
      won: { class: 'badge-entregados', label: 'Ganado', icon: '✅' },
      lost: { class: 'badge-fallidos', label: 'Perdido', icon: '❌' }
    };
    const badge = badges[state] || badges.new;
    return <span className={`state-badge ${badge.class}`}>{badge.icon} {badge.label}</span>;
  };

  /**
   * Renderizar prioridad
   */
  const renderPriority = (priority) => {
    const priorities = {
      low: { label: 'Baja', icon: '📍' },
      normal: { label: 'Normal', icon: '📌' },
      high: { label: 'Alta', icon: '🔴' },
      urgent: { label: 'Urgente', icon: '🆘' }
    };
    const p = priorities[priority] || priorities.normal;
    return <span className={`priority-badge priority-${priority}`}>{p.icon} {p.label}</span>;
  };

  /**
   * Renderizar card de lead (Grid)
   */
  const renderLeadCard = (lead) => (
    <div key={lead.id} className="delivery-card">
      <div className="card-header">
        <div className="card-title">
          <h4>{lead.name}</h4>
          <p className="card-email">{lead.email || 'Sin email'}</p>
        </div>
        <div className="card-badges">
          {renderStateBadge(lead.state)}
          {renderPriority(lead.priority || 'normal')}
        </div>
      </div>

      <div className="card-body">
        <div className="info-row">
          <span className="label">📱 Teléfono:</span>
          <span className="value">{lead.phone || 'No especificado'}</span>
        </div>
        <div className="info-row">
          <span className="label">🏢 Empresa:</span>
          <span className="value">{lead.company || 'N/A'}</span>
        </div>
        <div className="info-row">
          <span className="label">📍 Ciudad:</span>
          <span className="value">{lead.city || 'No especificada'}</span>
        </div>
        {lead.description && (
          <div className="info-row">
            <span className="label">📝 Descripción:</span>
            <span className="value">{lead.description.substring(0, 60)}...</span>
          </div>
        )}
      </div>

      <div className="card-footer">
        <button 
          className="btn btn-primary"
          onClick={() => handleCreateOrderFromLead(lead)}
        >
          ✨ Crear Orden
        </button>
        <button className="btn btn-secondary">
          👁️ Ver Detalles
        </button>
      </div>
    </div>
  );

  /**
   * Renderizar fila de lead (List)
   */
  const renderLeadRow = (lead) => (
    <tr key={lead.id} className="lead-row">
      <td className="col-name">
        <div className="name-cell">
          <strong>{lead.name}</strong>
          <small>{lead.email || 'Sin email'}</small>
        </div>
      </td>
      <td className="col-state">{renderStateBadge(lead.state)}</td>
      <td className="col-priority">{renderPriority(lead.priority || 'normal')}</td>
      <td className="col-contact">
        <div className="contact-cell">
          <div>📱 {lead.phone || 'N/A'}</div>
          <div>🏢 {lead.company || 'N/A'}</div>
        </div>
      </td>
      <td className="col-actions">
        <button 
          className="btn-icon"
          onClick={() => handleCreateOrderFromLead(lead)}
          title="Crear orden"
        >
          ✨
        </button>
        <button className="btn-icon" title="Ver detalles">
          👁️
        </button>
      </td>
    </tr>
  );

  // ═══════════════════════════════════════════════════════════════════
  // RENDER PRINCIPAL
  // ═══════════════════════════════════════════════════════════════════

  return (
    <div className="orders-from-crm">
      {/* HEADER */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-title">
            <h1>📦 Pedidos desde CRM</h1>
            <p>Gestiona y crea órdenes de entrega desde tus leads en Odoo</p>
          </div>
          <div className="header-actions">
            <button 
              className="btn btn-success"
              onClick={() => setShowModal(true)}
            >
              ➕ Nueva Orden
            </button>
          </div>
        </div>
      </div>

      {/* FLOATING STATS PANEL */}
    

      {/* TOOLBAR */}
      <div className="toolbar">
        <button 
          className={`toolbar-btn filter-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          🔍 Filtros
        </button>

          <div className="floating-stats-panel">
        <div className="stats-container">
          <div className="stat-badge badge-fallidos">
            <span className="stat-icon">❌</span>
            <span className="stat-label">Fallidos</span>
            <span className="stat-value">{stats_data.failed}</span>
          </div>

          <div className="stat-badge badge-pendiente">
            <span className="stat-icon">📋</span>
            <span className="stat-label">Pendientes</span>
            <span className="stat-value">{stats_data.pending}</span>
          </div>

          <div className="stat-badge badge-entregando">
            <span className="stat-icon">🚗</span>
            <span className="stat-label">En Entrega</span>
            <span className="stat-value">{stats_data.inTransit}</span>
          </div>

          <div className="stat-badge badge-entregados">
            <span className="stat-icon">✅</span>
            <span className="stat-label">Entregados</span>
            <span className="stat-value">{stats_data.completed}</span>
          </div>

          <div className="stat-badge badge-total">
            <span className="stat-icon">📊</span>
            <span className="stat-label">Total</span>
            <span className="stat-value">{stats_data.total}</span>
          </div>
        </div>

        <div className="stats-actions">
          <button 
            className="stats-btn btn-add"
            onClick={() => setShowModal(true)}
            title="Agregar nueva orden"
          >
            ➕
          </button>
          <button 
            className="stats-btn btn-refresh"
            onClick={handleRefresh}
            title="Refrescar datos"
          >
            🔄
          </button>
        </div>
      </div>

        <div className="view-toggle">
          <button 
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Vista de grilla"
          >
            ⊞ Grid
          </button>
          <button 
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="Vista de lista"
          >
            ≡ Lista
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      {showFilters && (
        <div className="filter-section">
          <div className="filter-group">
            <label>Estado</label>
            <select 
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="new">Nuevo</option>
              <option value="assigned">Asignado</option>
              <option value="won">Ganado</option>
              <option value="lost">Perdido</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Prioridad</label>
            <select 
              value={filterPriority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="all">Todas las prioridades</option>
              <option value="low">Baja</option>
              <option value="normal">Normal</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          <div className="filter-group search">
            <label>🔎 Buscar</label>
            <input 
              type="text"
              placeholder="Nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button 
            className="btn btn-outline"
            onClick={() => {
              setFilterState('all');
              setPriority('all');
              setSearchTerm('');
            }}
          >
            Limpiar Filtros
          </button>
        </div>
      )}

      {/* LOADING STATE */}
      {(leadsLoading || odooLoading) && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando pedidos...</p>
        </div>
      )}

      {/* ERROR STATE */}
      {leadsError && (
        <div className="error-state">
          <p>⚠️ Error al cargar los pedidos: {leadsError}</p>
        </div>
      )}

      {/* EMPTY STATE */}
      {!leadsLoading && displayedLeads.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No hay pedidos para mostrar</h3>
          <p>Intenta ajustar los filtros o crear uno nuevo</p>
          <button 
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            ➕ Crear Primer Pedido
          </button>
        </div>
      )}

      {/* CONTENT */}
      {!leadsLoading && displayedLeads.length > 0 && (
        <>
          {viewMode === 'grid' && (
            <div className="delivery-grid">
              {displayedLeads.map(lead => renderLeadCard(lead))}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="delivery-table">
              <table>
                <thead>
                  <tr>
                    <th className="col-name">Nombre</th>
                    <th className="col-state">Estado</th>
                    <th className="col-priority">Prioridad</th>
                    <th className="col-contact">Contacto</th>
                    <th className="col-actions">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedLeads.map(lead => renderLeadRow(lead))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* MODAL NEW ORDER */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>➕ Crear Nueva Orden</h2>
              <button 
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ✕
              </button>
            </div>

            <form className="modal-form" onSubmit={handleCreateNewOrder}>
              <div className="form-group">
                <label>🏷️ ID Pedido *</label>
                <input 
                  type="text"
                  name="name"
                  placeholder="Ej: PO-001"
                  value={newOrder.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>👤 Cliente *</label>
                <input 
                  type="text"
                  name="client_name"
                  placeholder="Nombre del cliente"
                  value={newOrder.client_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>📝 Descripción</label>
                <textarea 
                  name="description"
                  placeholder="Descripción del pedido..."
                  value={newOrder.description}
                  onChange={handleInputChange}
                  rows="3"
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group half">
                  <label>📍 Ubicación Recogida</label>
                  <input 
                    type="text"
                    name="pickup_location"
                    placeholder="Dirección de recogida"
                    value={newOrder.pickup_location}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group half">
                  <label>📍 Ubicación Entrega</label>
                  <div className="location-input">
                    <input 
                      type="text"
                      name="delivery_location"
                      placeholder="Selecciona en el mapa..."
                      value={newOrder.delivery_location}
                      onChange={handleInputChange}
                      readOnly
                    />
                    <button 
                      type="button"
                      className="btn-map"
                      onClick={() => setMapOpen(!mapOpen)}
                    >
                      🗺️
                    </button>
                  </div>
                </div>
              </div>

              {mapOpen && (
                <div className="map-selector">
                  <div className="map-info">
                    <p>📍 Selecciona una ubicación en el mapa (próximamente)</p>
                    {selectedLocation && (
                      <p className="selected-location">
                        ✅ Ubicación: {selectedLocation.lat}, {selectedLocation.lng}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group half">
                  <label>📏 Distancia (km)</label>
                  <input 
                    type="number"
                    name="distance"
                    placeholder="0"
                    value={newOrder.distance}
                    onChange={handleInputChange}
                    step="0.1"
                  />
                </div>

                <div className="form-group half">
                  <label>⚡ Prioridad</label>
                  <select 
                    name="priority"
                    value={newOrder.priority}
                    onChange={handleInputChange}
                  >
                    <option value="low">Baja</option>
                    <option value="normal">Normal</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>📊 Estado</label>
                <select 
                  name="status"
                  value={newOrder.status}
                  onChange={handleInputChange}
                >
                  <option value="pending">Pendiente</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="completed">Completado</option>
                </select>
              </div>

              <div className="form-group">
                <label>💬 Notas</label>
                <textarea 
                  name="notes"
                  placeholder="Notas adicionales..."
                  value={newOrder.notes}
                  onChange={handleInputChange}
                  rows="2"
                ></textarea>
              </div>

              <div className="modal-footer">
                <button 
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="btn btn-success"
                >
                  ✅ Crear Orden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersFromCRM;
