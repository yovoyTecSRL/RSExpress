/**
 * DriverFleet Service
 * Gestor de conductores y flotas
 * 
 * Equivalente modular de scripts/odoo/driver-fleet.js
 */

class DriverFleetService {
  constructor(odooConnector) {
    this.odooConnector = odooConnector;
    this.drivers = new Map();
    this.vehicles = new Map();
    this.traccarData = new Map();
  }

  /**
   * Cargar conductores desde Odoo
   */
  async loadDrivers() {
    try {
      console.log('[DriverFleet] 👥 Cargando conductores...');

      const drivers = await this.odooConnector.callOdooAPI(
        'object',
        'execute_kw',
        [
          this.odooConnector.config.database,
          this.odooConnector.config.uid,
          this.odooConnector.config.token,
          'hr.employee',
          'search_read',
          [
            [['department_id', '!=', false]],
            ['id', 'name', 'email', 'mobile_phone', 'work_location']
          ]
        ]
      );

      drivers.forEach(driver => {
        this.drivers.set(driver.id, {
          id: driver.id,
          name: driver.name,
          email: driver.email,
          phone: driver.mobile_phone,
          location: driver.work_location,
          active: true,
          assignedOrders: [],
          trackingId: null,
          lastUpdate: new Date()
        });
      });

      console.log(`[DriverFleet] ✅ ${drivers.length} conductores cargados`);
      return Array.from(this.drivers.values());
    } catch (error) {
      console.error('[DriverFleet] Error cargando conductores:', error);
      throw error;
    }
  }

  /**
   * Obtener conductor por ID
   */
  getDriver(driverId) {
    return this.drivers.get(driverId) || null;
  }

  /**
   * Obtener todos los conductores
   */
  getAllDrivers() {
    return Array.from(this.drivers.values());
  }

  /**
   * Cargar vehículos desde Odoo
   */
  async loadVehicles() {
    try {
      console.log('[DriverFleet] 🚗 Cargando vehículos...');

      const vehicles = await this.odooConnector.callOdooAPI(
        'object',
        'execute_kw',
        [
          this.odooConnector.config.database,
          this.odooConnector.config.uid,
          this.odooConnector.config.token,
          'fleet.vehicle',
          'search_read',
          [
            [['active', '=', true]],
            ['id', 'name', 'license_plate', 'driver_id', 'model_id', 'state']
          ]
        ]
      );

      vehicles.forEach(vehicle => {
        this.vehicles.set(vehicle.id, {
          id: vehicle.id,
          name: vehicle.name,
          plate: vehicle.license_plate,
          driverId: vehicle.driver_id?.[0] || null,
          model: vehicle.model_id?.[1] || 'Unknown',
          status: vehicle.state,
          location: null,
          lastUpdate: new Date()
        });
      });

      console.log(`[DriverFleet] ✅ ${vehicles.length} vehículos cargados`);
      return Array.from(this.vehicles.values());
    } catch (error) {
      console.error('[DriverFleet] Error cargando vehículos:', error);
      throw error;
    }
  }

  /**
   * Obtener vehículo por ID
   */
  getVehicle(vehicleId) {
    return this.vehicles.get(vehicleId) || null;
  }

  /**
   * Obtener todos los vehículos
   */
  getAllVehicles() {
    return Array.from(this.vehicles.values());
  }

  /**
   * Asignar orden a conductor
   */
  assignOrderToDriver(driverId, orderId) {
    const driver = this.drivers.get(driverId);
    if (driver) {
      if (!driver.assignedOrders.includes(orderId)) {
        driver.assignedOrders.push(orderId);
        console.log(`[DriverFleet] 📌 Orden ${orderId} asignada a conductor ${driverId}`);
        return true;
      }
    }
    return false;
  }

  /**
   * Actualizar ubicación de conductor (desde Traccar)
   */
  updateDriverLocation(driverId, lat, lon, speed = 0) {
    const driver = this.drivers.get(driverId);
    if (driver) {
      driver.lastUpdate = new Date();
      this.traccarData.set(driverId, {
        lat,
        lon,
        speed,
        timestamp: new Date(),
        accuracy: 10
      });
      console.log(`[DriverFleet] 📍 Ubicación actualizada: ${driverId} (${lat}, ${lon})`);
      return true;
    }
    return false;
  }

  /**
   * Obtener ubicación actual del conductor
   */
  getDriverLocation(driverId) {
    return this.traccarData.get(driverId) || null;
  }

  /**
   * Obtener resumen de flota
   */
  getFleetSummary() {
    const drivers = Array.from(this.drivers.values());
    const vehicles = Array.from(this.vehicles.values());

    return {
      totalDrivers: drivers.length,
      activeDrivers: drivers.filter(d => d.active).length,
      totalVehicles: vehicles.length,
      driversWithOrders: drivers.filter(d => d.assignedOrders.length > 0).length,
      totalAssignedOrders: drivers.reduce((sum, d) => sum + d.assignedOrders.length, 0),
      drivers,
      vehicles
    };
  }
}

export default DriverFleetService;
