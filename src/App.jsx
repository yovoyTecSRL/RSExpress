/**
 * App.jsx
 * Componente principal con React Router
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import OrdersFromCRM from '@pages/OrdersFromCRM';
import OrdersFromSales from '@pages/OrdersFromSales';
import DeliveryCards from '@pages/DeliveryCards';
import FleetDashboard from '@pages/FleetDashboard';
import '@styles/app.css';

const App = () => {
  return (
    <Router>
      <div className="app">
        {/* Navigation */}
        <nav className="navbar">
          <div className="nav-container">
            <Link to="/" className="nav-logo">
              🚚 RSExpress
            </Link>
            <ul className="nav-menu">
              <li className="nav-item">
                <Link to="/" className="nav-link">
                  📦 Órdenes CRM
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/sales" className="nav-link">
                  💼 Órdenes Venta
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/deliveries" className="nav-link">
                  🚚 Entregas
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/fleet" className="nav-link">
                  🚗 Flota
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<OrdersFromCRM />} />
            <Route path="/sales" element={<OrdersFromSales />} />
            <Route path="/deliveries" element={<DeliveryCards />} />
            <Route path="/fleet" element={<FleetDashboard />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="footer">
          <p>© 2024 RSExpress - Gestión de Envíos y Entregas</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
