/**
 * Traccar Integration Service
 * Gestor de localización GPS en tiempo real
 * 
 * Integración con Traccar para rastreo de flotas
 */

class TraccarService {
  constructor(traccarConfig = {}) {
    this.baseURL = traccarConfig.baseURL || 'http://localhost:8082';
    this.username = traccarConfig.username || 'admin';
    this.password = traccarConfig.password || 'admin';
    this.sessionId = null;
    this.devices = new Map();
    this.positions = new Map();
    this.websocket = null;
  }

  /**
   * Autenticar con Traccar
   */
  async authenticate() {
    try {
      console.log('[Traccar] 🔐 Autenticando con Traccar...');

      const response = await fetch(`${this.baseURL}/api/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `email=${encodeURIComponent(this.username)}&password=${encodeURIComponent(this.password)}`
      });

      if (!response.ok) throw new Error('Traccar authentication failed');

      const data = await response.json();
      this.sessionId = data.id;

      console.log('[Traccar] ✅ Autenticación exitosa');
      return true;
    } catch (error) {
      console.error('[Traccar] Error en autenticación:', error);
      throw error;
    }
  }

  /**
   * Obtener dispositivos (vehículos)
   */
  async getDevices() {
    try {
      if (!this.sessionId) await this.authenticate();

      console.log('[Traccar] 🔍 Obteniendo dispositivos...');

      const response = await fetch(`${this.baseURL}/api/devices`, {
        headers: { 'Cookie': `JSESSIONID=${this.sessionId}` }
      });

      if (!response.ok) throw new Error('Failed to fetch devices');

      const devices = await response.json();

      devices.forEach(device => {
        this.devices.set(device.id, {
          id: device.id,
          name: device.name,
          uniqueId: device.uniqueId,
          status: device.status,
          lastUpdate: device.lastUpdate
        });
      });

      console.log(`[Traccar] ✅ ${devices.length} dispositivos obtenidos`);
      return Array.from(this.devices.values());
    } catch (error) {
      console.error('[Traccar] Error obteniendo dispositivos:', error);
      throw error;
    }
  }

  /**
   * Obtener posición actual de un dispositivo
   */
  async getDevicePosition(deviceId) {
    try {
      if (!this.sessionId) await this.authenticate();

      const response = await fetch(`${this.baseURL}/api/positions?deviceId=${deviceId}&limit=1`, {
        headers: { 'Cookie': `JSESSIONID=${this.sessionId}` }
      });

      if (!response.ok) throw new Error('Failed to fetch position');

      const positions = await response.json();
      if (positions.length > 0) {
        const position = positions[0];
        this.positions.set(deviceId, {
          deviceId: position.deviceId,
          latitude: position.latitude,
          longitude: position.longitude,
          speed: position.speed,
          accuracy: position.accuracy,
          course: position.course,
          altitude: position.altitude,
          timestamp: position.deviceTime
        });

        console.log(`[Traccar] 📍 Posición obtenida para dispositivo ${deviceId}`);
        return this.positions.get(deviceId);
      }

      return null;
    } catch (error) {
      console.error('[Traccar] Error obteniendo posición:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las posiciones
   */
  async getAllPositions() {
    try {
      if (!this.sessionId) await this.authenticate();

      const response = await fetch(`${this.baseURL}/api/positions?limit=1`, {
        headers: { 'Cookie': `JSESSIONID=${this.sessionId}` }
      });

      if (!response.ok) throw new Error('Failed to fetch positions');

      const positions = await response.json();

      positions.forEach(pos => {
        this.positions.set(pos.deviceId, {
          deviceId: pos.deviceId,
          latitude: pos.latitude,
          longitude: pos.longitude,
          speed: pos.speed,
          accuracy: pos.accuracy,
          course: pos.course,
          altitude: pos.altitude,
          timestamp: pos.deviceTime
        });
      });

      console.log(`[Traccar] ✅ ${positions.length} posiciones actualizadas`);
      return Array.from(this.positions.values());
    } catch (error) {
      console.error('[Traccar] Error obteniendo posiciones:', error);
      throw error;
    }
  }

  /**
   * Obtener historial de un dispositivo
   */
  async getDeviceHistory(deviceId, fromTime, toTime) {
    try {
      if (!this.sessionId) await this.authenticate();

      const params = new URLSearchParams({
        deviceId: deviceId,
        from: fromTime,
        to: toTime
      });

      const response = await fetch(`${this.baseURL}/api/positions?${params}`, {
        headers: { 'Cookie': `JSESSIONID=${this.sessionId}` }
      });

      if (!response.ok) throw new Error('Failed to fetch history');

      const history = await response.json();

      console.log(`[Traccar] 📊 ${history.length} registros históricos obtenidos`);
      return history;
    } catch (error) {
      console.error('[Traccar] Error obteniendo historial:', error);
      throw error;
    }
  }

  /**
   * Conectar WebSocket para actualizaciones en tiempo real
   */
  connectWebSocket() {
    return new Promise((resolve, reject) => {
      try {
        const wsProtocol = this.baseURL.startsWith('https') ? 'wss' : 'ws';
        const wsURL = this.baseURL.replace(/^https?/, wsProtocol) + '/api/socket';

        console.log('[Traccar] 🔗 Conectando WebSocket...');

        this.websocket = new WebSocket(wsURL);

        this.websocket.onopen = () => {
          console.log('[Traccar] ✅ WebSocket conectado');

          // Enviar token de autenticación
          this.websocket.send(JSON.stringify({
            type: 'auth',
            token: this.sessionId
          }));

          resolve(true);
        };

        this.websocket.onmessage = (event) => {
          const data = JSON.parse(event.data);

          if (data.positions) {
            data.positions.forEach(pos => {
              this.positions.set(pos.deviceId, {
                deviceId: pos.deviceId,
                latitude: pos.latitude,
                longitude: pos.longitude,
                speed: pos.speed,
                timestamp: pos.deviceTime
              });

              console.log(`[Traccar] 🔄 Posición actualizada (WS): ${pos.deviceId}`);
            });
          }
        };

        this.websocket.onerror = (error) => {
          console.error('[Traccar] Error en WebSocket:', error);
          reject(error);
        };

        this.websocket.onclose = () => {
          console.log('[Traccar] ⚠️ WebSocket desconectado');
        };
      } catch (error) {
        console.error('[Traccar] Error conectando WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Desconectar WebSocket
   */
  disconnectWebSocket() {
    if (this.websocket) {
      this.websocket.close();
      console.log('[Traccar] 🔌 WebSocket desconectado');
    }
  }

  /**
   * Obtener estadísticas de flota
   */
  getFleetStats() {
    const devices = Array.from(this.devices.values());
    const positions = Array.from(this.positions.values());

    const moving = positions.filter(p => p.speed > 0).length;
    const stopped = positions.filter(p => p.speed === 0).length;
    const offline = devices.filter(d => d.status === 'offline').length;

    return {
      totalDevices: devices.length,
      activeDevices: devices.filter(d => d.status === 'online').length,
      offlineDevices: offline,
      moving,
      stopped,
      devices,
      positions
    };
  }
}

export default TraccarService;
