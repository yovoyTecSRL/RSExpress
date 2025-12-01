/**
 * Odoo 19 Integration Module
 * Maneja la conexión y sincronización de datos de Odoo
 */

class OdooIntegrationV2 {
    constructor() {
        this.host = 'rsexpress.online';
        this.proxyUrl = 'http://localhost:9999'; // Proxy local para evitar CORS
        this.db = 'odoo19';
        this.uid = 5;
        this.apiKey = '1fc63a72dcf97e88aab89c5a8a54dc0eac25cb9b';
        
        this.users = [];
        this.partners = [];
        this.isConnected = false;
        this.lastSync = null;
        
        this.init();
    }

    /**
     * Inicializar la integración
     */
    init() {
        console.log('[Odoo] Inicializando integración con Odoo 19...');
        this.setupListeners();
        this.checkConnection();
    }

    /**
     * Configurar event listeners
     */
    setupListeners() {
        // Botón del Admin Panel
        const syncBtnAdmin = document.getElementById('btnSyncOdooUsersAdmin');
        if (syncBtnAdmin) {
            syncBtnAdmin.addEventListener('click', async () => {
                await this.syncUsers();
                this.renderUsers('odooUsersContainerAdmin'); // Renderizar en admin panel
            });
        }

        // Botón de la página de Odoo
        const syncBtnPage = document.getElementById('btnSyncOdooUsersPage');
        if (syncBtnPage) {
            syncBtnPage.addEventListener('click', async () => {
                await this.syncUsers();
                this.renderUsers('odooUsersContainerPage'); // Renderizar en página
            });
        }

        // Agregar listener para cambio de tabs
        const odooTab = document.querySelector('[data-tab="odoo-users"]');
        if (odooTab) {
            odooTab.addEventListener('click', () => this.showOdooUsersTab());
        }
    }

    /**
     * Hacer llamada JSON-RPC a Odoo usando fetch a través del proxy
     */
    async callOdooAPI(service, method, args) {
        try {
            const payload = {
                jsonrpc: '2.0',
                method: 'call',
                params: {
                    service: service,
                    method: method,
                    args: args
                },
                id: Math.random()
            };

            const response = await fetch(`${this.proxyUrl}/jsonrpc`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.data?.message || data.error.message);
            }

            return data.result;
        } catch (error) {
            console.error('[Odoo] Error:', error);
            throw error;
        }
    }

    /**
     * Verificar conexión con Odoo
     */
    async checkConnection() {
        try {
            const result = await this.callOdooAPI('common', 'version', []);
            if (result && result.server_version) {
                this.isConnected = true;
                console.log(`[Odoo] ✅ Conectado a Odoo ${result.server_version}`);
                this.updateConnectionStatus(true);
                return true;
            }
        } catch (error) {
            console.error('[Odoo] ❌ No se pudo conectar:', error);
            this.isConnected = false;
            this.updateConnectionStatus(false);
            return false;
        }
    }

    /**
     * Sincronizar usuarios desde Odoo
     */
    async syncUsers() {
        try {
            console.log('[Odoo] Sincronizando usuarios...');
            this.showLoadingState(true);

            // Obtener usuarios
            const users = await this.callOdooAPI('object', 'execute_kw', [
                this.db,
                this.uid,
                this.apiKey,
                'res.users',
                'search_read',
                [],
                {
                    fields: ['id', 'name', 'login', 'email', 'active'],
                    limit: 100
                }
            ]);

            // Obtener partners
            const partners = await this.callOdooAPI('object', 'execute_kw', [
                this.db,
                this.uid,
                this.apiKey,
                'res.partner',
                'search_read',
                [],
                {
                    fields: ['id', 'name', 'email', 'phone', 'is_company'],
                    limit: 100
                }
            ]);

            this.users = users;
            this.partners = partners;
            this.lastSync = new Date();

            console.log(`[Odoo] ✅ Sincronización completada: ${users.length} usuarios, ${partners.length} partners`);
            
            this.renderUsers();
            this.updateConnectionStatus(true);
            
            // Toast de éxito
            this.showToast(`✅ Sincronización exitosa: ${users.length} usuarios y ${partners.length} partners`, 'success');

        } catch (error) {
            console.error('[Odoo] Error durante sincronización:', error);
            this.showToast(`❌ Error: ${error.message}`, 'error');
        } finally {
            this.showLoadingState(false);
        }
    }

    /**
     * Renderizar usuarios en la UI
     */
    renderUsers(containerId = 'odooUsersContainerAdmin') {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('[Odoo] No se encontró contenedor:', containerId);
            return;
        }

        if (this.users.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--gray-light); padding: 2rem;">No hay usuarios</p>';
            return;
        }

        let html = '<div class="odoo-users-list">';

        this.users.forEach(user => {
            html += `
                <div class="odoo-user-card" onclick="window.odooIntegration.showUserDetails(${user.id})">
                    <div class="user-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div class="user-info">
                        <h3>${user.name}</h3>
                        <p class="user-login"><strong>Login:</strong> ${user.login}</p>
                        <p class="user-email"><strong>Email:</strong> ${user.email || 'N/A'}</p>
                        <p class="user-status">
                            <strong>Estado:</strong> 
                            <span class="status-badge ${user.active ? 'active' : 'inactive'}">
                                ${user.active ? 'Activo' : 'Inactivo'}
                            </span>
                        </p>
                        <div class="user-actions">
                            <button class="btn-small btn-info" onclick="event.stopPropagation(); odooIntegration.showUserDetails(${user.id})">
                                <i class="fas fa-info-circle"></i> Detalles
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

        // Actualizar contador
        const countElement = document.getElementById('odooUserCount');
        if (countElement) {
            countElement.textContent = this.users.length;
        }
    }

    /**
     * Mostrar detalles de usuario
     */
    showUserDetails(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const details = `
Usuario: ${user.name}
━━━━━━━━━━━━━━━━━━━━
ID: ${user.id}
Login: ${user.login}
Email: ${user.email || 'N/A'}
Estado: ${user.active ? 'Activo ✅' : 'Inactivo ❌'}
        `;
        
        alert(details);
    }

    /**
     * Mostrar pestaña de usuarios Odoo
     */
    showOdooUsersTab() {
        if (this.users.length === 0) {
            this.syncUsers();
        } else {
            this.renderUsers();
        }
    }

    /**
     * Actualizar estado de conexión en UI
     */
    updateConnectionStatus(connected) {
        const status = document.getElementById('odooConnectionStatus');
        if (status) {
            if (connected) {
                status.textContent = '🟢 Conectado';
                status.style.color = '#27ae60';
            } else {
                status.textContent = '🔴 Desconectado';
                status.style.color = '#e74c3c';
            }
        }
    }

    /**
     * Mostrar estado de carga
     */
    showLoadingState(loading) {
        const syncBtn = document.getElementById('btnSyncOdooUsers');
        if (syncBtn) {
            if (loading) {
                syncBtn.disabled = true;
                syncBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sincronizando...';
            } else {
                syncBtn.disabled = false;
                syncBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Sincronizar Ahora';
            }
        }
    }

    /**
     * Mostrar notificación toast
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            border-radius: 4px;
            z-index: 10000;
            animation: slideInUp 0.3s ease;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// Inicializar cuando el DOM esté listo
let odooIntegration;
document.addEventListener('DOMContentLoaded', () => {
    odooIntegration = new OdooIntegrationV2();
    window.odooIntegration = odooIntegration; // Hacer disponible globalmente
});
