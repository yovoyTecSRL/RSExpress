/**
 * Integración Odoo 19 para RSExpress
 * Conecta a res.users usando XML-RPC
 */

class OdooIntegration {
    constructor(config = {}) {
        this.url = config.url || 'https://rsexpress.online';
        this.db = config.db || 'orbix';
        this.username = config.username || 'admin';
        this.password = config.password || 'admin';
        
        this.uid = null;
        this.authenticated = false;
        this.users = [];
    }

    /**
     * Autenticarse en Odoo 19 usando XML-RPC
     */
    async authenticate() {
        try {
            const params = [this.db, this.username, this.password, {}];
            const response = await this.xmlrpcCall('common', 'authenticate', params);
            
            if (response && typeof response === 'number' && response > 0) {
                this.uid = response;
                this.authenticated = true;
                console.log(`[Odoo] ✓ Autenticado - UID: ${this.uid}`);
                return true;
            } else {
                throw new Error(`Autenticación fallida: ${response}`);
            }
        } catch (error) {
            console.error('[Odoo] ✗ Error de autenticación:', error);
            throw error;
        }
    }

    /**
     * Obtener usuarios de Odoo
     */
    async getUsers() {
        try {
            if (!this.authenticated || !this.uid) {
                throw new Error('No autenticado');
            }

            // Búsqueda con search_read - Formato: [db, uid, password, model, method, domain, options]
            const params = [
                this.db,
                this.uid,
                this.password,
                'res.users',
                'search_read',
                [],
                {fields: ['id', 'name', 'email', 'login', 'active'], limit: 50}
            ];

            const users = await this.xmlrpcCall('object', 'execute', params);
            
            if (Array.isArray(users)) {
                this.users = users;
                console.log(`[Odoo] ✓ ${users.length} usuarios obtenidos`);
                return users;
            } else {
                throw new Error('Respuesta de usuarios inválida');
            }
        } catch (error) {
            console.error('[Odoo] ✗ Error obteniendo usuarios:', error);
            throw error;
        }
    }

    /**
     * Realizar llamada XML-RPC
     */
    async xmlrpcCall(service, method, params) {
        const endpoint = `${this.url}/xmlrpc/2/${service}`;
        
        // Construir body XML-RPC
        const xmlBody = this.buildXmlRpc(method, params);
        
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/xml',
                },
                body: xmlBody
            });

            const responseText = await response.text();
            return this.parseXmlRpcResponse(responseText);
        } catch (error) {
            throw new Error(`Error XML-RPC: ${error.message}`);
        }
    }

    /**
     * Construir request XML-RPC
     */
    buildXmlRpc(method, params) {
        let xml = '<?xml version="1.0"?>\n<methodCall>\n';
        xml += `<methodName>${this.escapeXml(method)}</methodName>\n`;
        xml += '<params>\n';
        
        for (const param of params) {
            xml += this.valueToXml(param);
        }
        
        xml += '</params>\n</methodCall>';
        return xml;
    }

    /**
     * Convertir valor a XML-RPC
     */
    valueToXml(value) {
        if (value === null) {
            return '<param><value><nil/></value></param>\n';
        } else if (typeof value === 'boolean') {
            return `<param><value><boolean>${value ? 1 : 0}</boolean></value></param>\n`;
        } else if (typeof value === 'number') {
            return `<param><value><int>${value}</int></value></param>\n`;
        } else if (typeof value === 'string') {
            return `<param><value><string>${this.escapeXml(value)}</string></value></param>\n`;
        } else if (Array.isArray(value)) {
            let xml = '<param><value><array><data>\n';
            for (const item of value) {
                xml += `<value>${this.getValueContent(item)}</value>\n`;
            }
            xml += '</data></array></value></param>\n';
            return xml;
        } else if (typeof value === 'object') {
            let xml = '<param><value><struct>\n';
            for (const [key, val] of Object.entries(value)) {
                xml += '<member>\n';
                xml += `<name>${this.escapeXml(key)}</name>\n`;
                xml += `<value>${this.getValueContent(val)}</value>\n`;
                xml += '</member>\n';
            }
            xml += '</struct></value></param>\n';
            return xml;
        }
        return '<param><value></value></param>\n';
    }

    /**
     * Obtener contenido de valor XML
     */
    getValueContent(value) {
        if (value === null) return '<nil/>';
        if (typeof value === 'boolean') return `<boolean>${value ? 1 : 0}</boolean>`;
        if (typeof value === 'number') return `<int>${value}</int>`;
        if (typeof value === 'string') return `<string>${this.escapeXml(value)}</string>`;
        if (Array.isArray(value)) {
            let xml = '<array><data>\n';
            for (const item of value) {
                xml += `<value>${this.getValueContent(item)}</value>\n`;
            }
            xml += '</data></array>';
            return xml;
        }
        if (typeof value === 'object') {
            let xml = '<struct>\n';
            for (const [key, val] of Object.entries(value)) {
                xml += '<member>\n';
                xml += `<name>${this.escapeXml(key)}</name>\n`;
                xml += `<value>${this.getValueContent(val)}</value>\n`;
                xml += '</member>\n';
            }
            xml += '</struct>';
            return xml;
        }
        return '';
    }

    /**
     * Escapar XML
     */
    escapeXml(str) {
        if (typeof str !== 'string') return str;
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }

    /**
     * Parsear respuesta XML-RPC
     */
    parseXmlRpcResponse(xmlText) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(xmlText, 'text/xml');
        
        // Buscar faults (errores)
        const fault = doc.getElementsByTagName('fault');
        if (fault.length > 0) {
            const faultString = doc.getElementsByTagName('faultString')[0];
            throw new Error(faultString?.textContent || 'Fault desconocido');
        }

        // Buscar valor de respuesta
        const methodResponse = doc.getElementsByTagName('methodResponse')[0];
        if (!methodResponse) throw new Error('Respuesta XML-RPC inválida');

        const params = methodResponse.getElementsByTagName('param');
        if (params.length > 0) {
            return this.xmlValueToJs(params[0].getElementsByTagName('value')[0]);
        }

        return null;
    }

    /**
     * Convertir XML value a JavaScript
     */
    xmlValueToJs(valueNode) {
        if (!valueNode) return null;

        // Buscar tipo específico
        const int = valueNode.getElementsByTagName('int')[0];
        if (int) return parseInt(int.textContent);

        const double = valueNode.getElementsByTagName('double')[0];
        if (double) return parseFloat(double.textContent);

        const string = valueNode.getElementsByTagName('string')[0];
        if (string) return string.textContent;

        const boolean = valueNode.getElementsByTagName('boolean')[0];
        if (boolean) return boolean.textContent === '1';

        const array = valueNode.getElementsByTagName('array')[0];
        if (array) {
            const result = [];
            const values = array.getElementsByTagName('value');
            for (const val of values) {
                result.push(this.xmlValueToJs(val));
            }
            return result;
        }

        const struct = valueNode.getElementsByTagName('struct')[0];
        if (struct) {
            const result = {};
            const members = struct.getElementsByTagName('member');
            for (const member of members) {
                const name = member.getElementsByTagName('name')[0]?.textContent;
                const value = member.getElementsByTagName('value')[0];
                if (name) result[name] = this.xmlValueToJs(value);
            }
            return result;
        }

        return valueNode.textContent;
    }

    /**
     * Formatear usuarios como tabla HTML
     */
    getUsersTable() {
        if (!this.users || this.users.length === 0) {
            return '<p style="text-align: center; color: var(--gray-light);">No hay usuarios</p>';
        }

        let html = '<table style="width: 100%; border-collapse: collapse;">\n<thead>\n<tr>\n';
        html += '<th style="border: 1px solid var(--border-color); padding: 0.75rem; text-align: left;">ID</th>\n';
        html += '<th style="border: 1px solid var(--border-color); padding: 0.75rem; text-align: left;">Usuario</th>\n';
        html += '<th style="border: 1px solid var(--border-color); padding: 0.75rem; text-align: left;">Email</th>\n';
        html += '<th style="border: 1px solid var(--border-color); padding: 0.75rem; text-align: left;">Activo</th>\n';
        html += '</tr>\n</thead>\n<tbody>\n';

        for (const user of this.users) {
            html += '<tr>\n';
            html += `<td style="border: 1px solid var(--border-color); padding: 0.75rem;">${user.id}</td>\n`;
            html += `<td style="border: 1px solid var(--border-color); padding: 0.75rem;">${user.login || 'N/A'}</td>\n`;
            html += `<td style="border: 1px solid var(--border-color); padding: 0.75rem;">${user.email || 'N/A'}</td>\n`;
            html += `<td style="border: 1px solid var(--border-color); padding: 0.75rem;">${user.active ? '✓' : '✗'}</td>\n`;
            html += '</tr>\n';
        }

        html += '</tbody>\n</table>';
        return html;
    }

    /**
     * Conectar a Odoo
     */
    async connect() {
        try {
            await this.authenticate();
            await this.getUsers();
            return true;
        } catch (error) {
            console.error('[Odoo] Error:', error);
            return false;
        }
    }
}

// Crear instancia global
window.odoo = new OdooIntegration();
console.log('[Odoo] Instancia creada en window.odoo');
