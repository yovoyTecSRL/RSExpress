#!/bin/bash

################################################################################
# Script de Instalación Automatizada de Odoo 19 para RS Express
# Dominio: rsexpress.net
# Theme: Delivery personalizado (Rojo, Amarillo, Negro)
# Fecha: 2025-11-19
################################################################################

set -e

# Colores para output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║     INSTALACIÓN ODOO 19 - RS EXPRESS DELIVERY             ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"

# Variables de configuración
ODOO_VERSION="19.0"
DOMAIN="rsexpress.net"
ADMIN_EMAIL="admin@rsexpress.net"
ODOO_USER="odoo19"
ODOO_HOME="/opt/odoo19"
ODOO_CONFIG="/etc/odoo19.conf"
POSTGRES_USER="odoo19"
POSTGRES_PASSWORD=$(openssl rand -base64 32)
ODOO_PORT="8069"
LONGPOLLING_PORT="8072"

# Verificar si se ejecuta como root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}[ERROR] Por favor ejecuta este script como root${NC}"
    exit 1
fi

echo -e "${GREEN}[1/12] Actualizando sistema...${NC}"
apt-get update && apt-get upgrade -y

echo -e "${GREEN}[2/12] Instalando dependencias del sistema...${NC}"
apt-get install -y \
    python3-pip python3-dev python3-venv \
    libxml2-dev libxslt1-dev zlib1g-dev \
    libsasl2-dev libldap2-dev libssl-dev \
    libpq-dev libjpeg-dev libfreetype6-dev \
    liblcms2-dev libwebp-dev libharfbuzz-dev \
    libfribidi-dev libxcb1-dev \
    build-essential wget git curl \
    node-less npm nodejs \
    postgresql postgresql-client \
    nginx certbot python3-certbot-nginx \
    fontconfig xfonts-75dpi xfonts-base

echo -e "${GREEN}[3/12] Instalando wkhtmltopdf...${NC}"
cd /tmp
wget https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6.1-2/wkhtmltox_0.12.6.1-2.jammy_amd64.deb
apt install -y ./wkhtmltox_0.12.6.1-2.jammy_amd64.deb
rm wkhtmltox_0.12.6.1-2.jammy_amd64.deb

echo -e "${GREEN}[4/12] Configurando PostgreSQL...${NC}"
sudo -u postgres psql -c "CREATE USER ${POSTGRES_USER} WITH SUPERUSER PASSWORD '${POSTGRES_PASSWORD}';"
sudo -u postgres psql -c "ALTER USER ${POSTGRES_USER} CREATEDB;"

echo -e "${GREEN}[5/12] Creando usuario de sistema Odoo...${NC}"
useradd -m -d ${ODOO_HOME} -U -r -s /bin/bash ${ODOO_USER}

echo -e "${GREEN}[6/12] Clonando Odoo 19 desde GitHub...${NC}"
sudo -u ${ODOO_USER} git clone --depth 1 --branch ${ODOO_VERSION} https://github.com/odoo/odoo.git ${ODOO_HOME}/odoo

echo -e "${GREEN}[7/12] Creando entorno virtual Python...${NC}"
sudo -u ${ODOO_USER} python3 -m venv ${ODOO_HOME}/venv

echo -e "${GREEN}[8/12] Instalando dependencias Python de Odoo...${NC}"
sudo -u ${ODOO_USER} ${ODOO_HOME}/venv/bin/pip install --upgrade pip
sudo -u ${ODOO_USER} ${ODOO_HOME}/venv/bin/pip install wheel
sudo -u ${ODOO_USER} ${ODOO_HOME}/venv/bin/pip install -r ${ODOO_HOME}/odoo/requirements.txt

echo -e "${GREEN}[9/12] Creando directorios para módulos personalizados...${NC}"
mkdir -p ${ODOO_HOME}/custom-addons
mkdir -p ${ODOO_HOME}/logs
chown -R ${ODOO_USER}:${ODOO_USER} ${ODOO_HOME}

echo -e "${GREEN}[10/12] Creando theme personalizado RS Express...${NC}"
cat > ${ODOO_HOME}/custom-addons/theme_rsexpress_delivery/__manifest__.py << 'MANIFEST_EOF'
# -*- coding: utf-8 -*-
{
    'name': 'RS Express Delivery Theme',
    'version': '19.0.1.0.0',
    'category': 'Theme/Services',
    'summary': 'Theme de delivery personalizado para RS Express con colores corporativos',
    'description': """
        Theme profesional para plataforma de delivery RS Express
        - Colores corporativos: Rojo, Amarillo, Negro
        - Diseño optimizado para servicios de entrega
        - Responsive y moderno
    """,
    'author': 'RS Express',
    'website': 'https://rsexpress.net',
    'depends': ['website', 'website_sale', 'delivery'],
    'data': [
        'views/templates.xml',
        'views/snippets.xml',
    ],
    'assets': {
        'web.assets_frontend': [
            'theme_rsexpress_delivery/static/src/scss/primary_variables.scss',
            'theme_rsexpress_delivery/static/src/scss/custom.scss',
            'theme_rsexpress_delivery/static/src/js/custom.js',
        ],
    },
    'images': [
        'static/description/theme_screenshot.png',
    ],
    'installable': True,
    'application': False,
    'auto_install': False,
    'license': 'LGPL-3',
}
MANIFEST_EOF

mkdir -p ${ODOO_HOME}/custom-addons/theme_rsexpress_delivery/static/src/scss
mkdir -p ${ODOO_HOME}/custom-addons/theme_rsexpress_delivery/static/src/js
mkdir -p ${ODOO_HOME}/custom-addons/theme_rsexpress_delivery/static/description
mkdir -p ${ODOO_HOME}/custom-addons/theme_rsexpress_delivery/views

cat > ${ODOO_HOME}/custom-addons/theme_rsexpress_delivery/static/src/scss/primary_variables.scss << 'SCSS_VARS_EOF'
// RS Express Corporate Colors
$o-color-palettes: (
    'rsexpress-red': #E31E24,
    'rsexpress-yellow': #FFD700,
    'rsexpress-black': #1A1A1A,
    'rsexpress-dark-red': #B71C1C,
    'rsexpress-light-yellow': #FFF9C4,
    'rsexpress-gray': #2C2C2C,
);

// Primary brand color
$o-theme-color-palette: 'rsexpress-red' !default;
$primary: map-get($o-color-palettes, 'rsexpress-red');
$secondary: map-get($o-color-palettes, 'rsexpress-yellow');
$dark: map-get($o-color-palettes, 'rsexpress-black');

// Typography
$font-family-base: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
$headings-font-family: 'Montserrat', 'Poppins', $font-family-base;
$headings-font-weight: 700;

// Buttons
$btn-border-radius: 8px;
$btn-padding-y: 0.75rem;
$btn-padding-x: 2rem;

// Cards
$card-border-radius: 12px;
$card-box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
SCSS_VARS_EOF

cat > ${ODOO_HOME}/custom-addons/theme_rsexpress_delivery/static/src/scss/custom.scss << 'SCSS_EOF'
// RS Express Delivery Theme Custom Styles

// Header styling
#wrapwrap {
    background-color: #f8f9fa;
}

header.o_header_standard {
    background: linear-gradient(135deg, #1A1A1A 0%, #2C2C2C 100%);
    box-shadow: 0 2px 10px rgba(227, 30, 36, 0.3);
    
    .navbar-brand img {
        filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
    }
    
    .nav-link {
        color: #FFD700 !important;
        font-weight: 600;
        transition: all 0.3s ease;
        
        &:hover {
            color: #E31E24 !important;
            transform: translateY(-2px);
        }
    }
}

// Hero section
.o_delivery_hero {
    background: linear-gradient(135deg, #E31E24 0%, #B71C1C 100%);
    color: white;
    padding: 100px 0;
    position: relative;
    overflow: hidden;
    
    &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L30 60M0 30L60 30' stroke='%23FFD700' stroke-width='0.5' opacity='0.1'/%3E%3C/svg%3E");
        opacity: 0.3;
    }
    
    h1 {
        font-size: 3.5rem;
        font-weight: 800;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        margin-bottom: 1.5rem;
    }
    
    .lead {
        font-size: 1.5rem;
        margin-bottom: 2rem;
        text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
    }
}

// Buttons
.btn-primary {
    background: linear-gradient(135deg, #E31E24 0%, #B71C1C 100%);
    border: none;
    color: #FFD700;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    box-shadow: 0 4px 15px rgba(227, 30, 36, 0.4);
    transition: all 0.3s ease;
    
    &:hover {
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(227, 30, 36, 0.6);
        background: linear-gradient(135deg, #B71C1C 0%, #E31E24 100%);
    }
}

.btn-secondary {
    background: #FFD700;
    color: #1A1A1A;
    border: none;
    font-weight: 700;
    
    &:hover {
        background: #FFF9C4;
        color: #E31E24;
    }
}

// Service cards
.o_delivery_services {
    padding: 80px 0;
    
    .card {
        border: none;
        border-radius: 15px;
        overflow: hidden;
        transition: all 0.3s ease;
        background: white;
        box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        
        &:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 40px rgba(227, 30, 36, 0.2);
        }
        
        .card-header {
            background: linear-gradient(135deg, #1A1A1A 0%, #2C2C2C 100%);
            color: #FFD700;
            padding: 1.5rem;
            font-weight: 700;
            font-size: 1.25rem;
            border: none;
        }
        
        .card-body {
            padding: 2rem;
        }
        
        .service-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #E31E24 0%, #B71C1C 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
            font-size: 2rem;
            color: #FFD700;
            box-shadow: 0 5px 15px rgba(227, 30, 36, 0.3);
        }
    }
}

// Features section
.o_delivery_features {
    background: #1A1A1A;
    color: white;
    padding: 80px 0;
    
    .feature-item {
        text-align: center;
        padding: 2rem;
        
        i {
            font-size: 3rem;
            color: #FFD700;
            margin-bottom: 1rem;
            display: block;
        }
        
        h4 {
            color: #FFD700;
            font-weight: 700;
            margin-bottom: 1rem;
        }
        
        p {
            color: #ddd;
        }
    }
}

// Footer
footer {
    background: linear-gradient(135deg, #1A1A1A 0%, #0A0A0A 100%);
    color: #FFD700;
    padding: 3rem 0 1rem;
    
    a {
        color: #FFD700;
        transition: color 0.3s ease;
        
        &:hover {
            color: #E31E24;
            text-decoration: none;
        }
    }
    
    .footer-title {
        color: #E31E24;
        font-weight: 700;
        margin-bottom: 1rem;
        text-transform: uppercase;
    }
}

// Track order section
.o_track_order {
    background: linear-gradient(135deg, #FFD700 0%, #FFF9C4 100%);
    padding: 60px 0;
    
    .track-input {
        border: 3px solid #E31E24;
        border-radius: 50px;
        padding: 1rem 2rem;
        font-size: 1.1rem;
        
        &:focus {
            box-shadow: 0 0 20px rgba(227, 30, 36, 0.4);
            border-color: #B71C1C;
        }
    }
}

// Animations
@keyframes pulse-red {
    0%, 100% { box-shadow: 0 0 0 0 rgba(227, 30, 36, 0.7); }
    50% { box-shadow: 0 0 0 20px rgba(227, 30, 36, 0); }
}

.pulse-animation {
    animation: pulse-red 2s infinite;
}

// Responsive
@media (max-width: 768px) {
    .o_delivery_hero h1 {
        font-size: 2rem;
    }
    
    .o_delivery_hero .lead {
        font-size: 1.1rem;
    }
}
SCSS_EOF

cat > ${ODOO_HOME}/custom-addons/theme_rsexpress_delivery/static/src/js/custom.js << 'JS_EOF'
/** @odoo-module **/

import publicWidget from "@web/legacy/js/public/public_widget";

publicWidget.registry.RSExpressDelivery = publicWidget.Widget.extend({
    selector: '.o_delivery_hero',
    
    start: function () {
        this._super.apply(this, arguments);
        this._initAnimations();
    },
    
    _initAnimations: function () {
        // Add smooth scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
        
        // Add fade-in animation on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.card, .feature-item').forEach(el => {
            observer.observe(el);
        });
    }
});

export default publicWidget.registry.RSExpressDelivery;
JS_EOF

cat > ${ODOO_HOME}/custom-addons/theme_rsexpress_delivery/views/templates.xml << 'XML_EOF'
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <!-- Homepage Template -->
    <template id="rsexpress_homepage" name="RS Express Homepage" inherit_id="website.homepage">
        <xpath expr="//div[@id='wrap']" position="replace">
            <div id="wrap" class="oe_structure oe_empty">
                <!-- Hero Section -->
                <section class="o_delivery_hero">
                    <div class="container">
                        <div class="row align-items-center">
                            <div class="col-lg-6 text-center text-lg-start">
                                <h1 class="display-1">RS Express</h1>
                                <p class="lead">Tu solución de entrega rápida y confiable</p>
                                <p class="mb-4">Envíos seguros en tiempo record. Rastrea tu pedido en tiempo real.</p>
                                <a href="/shop" class="btn btn-primary btn-lg me-3 pulse-animation">Hacer Pedido</a>
                                <a href="#track" class="btn btn-secondary btn-lg">Rastrear Envío</a>
                            </div>
                            <div class="col-lg-6">
                                <img src="/theme_rsexpress_delivery/static/src/img/delivery-hero.svg" 
                                     alt="RS Express Delivery" class="img-fluid"/>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Services Section -->
                <section class="o_delivery_services">
                    <div class="container">
                        <h2 class="text-center mb-5 display-4" style="color: #E31E24; font-weight: 800;">
                            Nuestros Servicios
                        </h2>
                        <div class="row g-4">
                            <div class="col-md-4">
                                <div class="card h-100">
                                    <div class="card-header text-center">Express 24h</div>
                                    <div class="card-body text-center">
                                        <div class="service-icon">
                                            <i class="fa fa-bolt"></i>
                                        </div>
                                        <h4>Entrega Rápida</h4>
                                        <p>Recibe tu pedido en menos de 24 horas</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card h-100">
                                    <div class="card-header text-center">Rastreo GPS</div>
                                    <div class="card-body text-center">
                                        <div class="service-icon">
                                            <i class="fa fa-map-marker-alt"></i>
                                        </div>
                                        <h4>Tracking en Vivo</h4>
                                        <p>Monitorea tu envío en tiempo real</p>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="card h-100">
                                    <div class="card-header text-center">Seguro Total</div>
                                    <div class="card-body text-center">
                                        <div class="service-icon">
                                            <i class="fa fa-shield-alt"></i>
                                        </div>
                                        <h4>100% Protegido</h4>
                                        <p>Todos los envíos están asegurados</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Features Section -->
                <section class="o_delivery_features">
                    <div class="container">
                        <h2 class="text-center mb-5 display-4" style="color: #FFD700; font-weight: 800;">
                            ¿Por qué elegirnos?
                        </h2>
                        <div class="row">
                            <div class="col-md-3">
                                <div class="feature-item">
                                    <i class="fa fa-clock"></i>
                                    <h4>Rapidez</h4>
                                    <p>Entregas en tiempo record</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="feature-item">
                                    <i class="fa fa-users"></i>
                                    <h4>Confianza</h4>
                                    <p>+10,000 clientes satisfechos</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="feature-item">
                                    <i class="fa fa-headset"></i>
                                    <h4>Soporte 24/7</h4>
                                    <p>Atención al cliente siempre disponible</p>
                                </div>
                            </div>
                            <div class="col-md-3">
                                <div class="feature-item">
                                    <i class="fa fa-dollar-sign"></i>
                                    <h4>Mejor Precio</h4>
                                    <p>Tarifas competitivas garantizadas</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <!-- Track Order Section -->
                <section class="o_track_order" id="track">
                    <div class="container">
                        <div class="row justify-content-center">
                            <div class="col-lg-8 text-center">
                                <h2 class="display-4 mb-4" style="color: #1A1A1A; font-weight: 800;">
                                    Rastrea tu Pedido
                                </h2>
                                <p class="lead mb-4" style="color: #2C2C2C;">
                                    Ingresa tu número de seguimiento
                                </p>
                                <div class="input-group input-group-lg">
                                    <input type="text" class="form-control track-input" 
                                           placeholder="Ej: RSX-2025-123456"/>
                                    <button class="btn btn-primary" type="button">
                                        <i class="fa fa-search me-2"></i> Buscar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </xpath>
    </template>

    <!-- Custom Footer -->
    <template id="rsexpress_footer" inherit_id="website.footer_default">
        <xpath expr="//div[@id='footer']" position="replace">
            <div id="footer" class="oe_structure">
                <footer>
                    <div class="container">
                        <div class="row py-5">
                            <div class="col-md-4">
                                <h5 class="footer-title">RS Express</h5>
                                <p>Tu partner de confianza en entregas rápidas y seguras.</p>
                                <div class="social-links mt-3">
                                    <a href="#" class="me-3"><i class="fa fa-facebook fa-2x"></i></a>
                                    <a href="#" class="me-3"><i class="fa fa-instagram fa-2x"></i></a>
                                    <a href="#" class="me-3"><i class="fa fa-twitter fa-2x"></i></a>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <h5 class="footer-title">Enlaces Rápidos</h5>
                                <ul class="list-unstyled">
                                    <li><a href="/shop">Hacer Pedido</a></li>
                                    <li><a href="/page/about-us">Nosotros</a></li>
                                    <li><a href="/contactus">Contacto</a></li>
                                    <li><a href="/page/terms">Términos y Condiciones</a></li>
                                </ul>
                            </div>
                            <div class="col-md-4">
                                <h5 class="footer-title">Contacto</h5>
                                <ul class="list-unstyled">
                                    <li><i class="fa fa-phone me-2"></i> +1 (555) 123-4567</li>
                                    <li><i class="fa fa-envelope me-2"></i> info@rsexpress.net</li>
                                    <li><i class="fa fa-map-marker-alt me-2"></i> Ciudad Principal</li>
                                </ul>
                            </div>
                        </div>
                        <div class="row border-top pt-4">
                            <div class="col text-center">
                                <p class="mb-0">© 2025 RS Express. Todos los derechos reservados.</p>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </xpath>
    </template>
</odoo>
XML_EOF

cat > ${ODOO_HOME}/custom-addons/theme_rsexpress_delivery/views/snippets.xml << 'SNIPPETS_EOF'
<?xml version="1.0" encoding="utf-8"?>
<odoo>
    <template id="rsexpress_delivery_snippets" inherit_id="website.snippets">
        <xpath expr="//div[@id='snippet_structure']" position="inside">
            <div class="o_panel_body">
                <t t-snippet="theme_rsexpress_delivery.s_rsexpress_cta" 
                   t-thumbnail="/theme_rsexpress_delivery/static/src/img/snippets/cta.jpg"/>
            </div>
        </xpath>
    </template>

    <template id="s_rsexpress_cta" name="RS Express CTA">
        <section class="s_rsexpress_cta py-5" style="background: linear-gradient(135deg, #E31E24 0%, #B71C1C 100%);">
            <div class="container">
                <div class="row align-items-center text-white">
                    <div class="col-lg-8">
                        <h2 class="display-4 mb-3" style="color: #FFD700; font-weight: 800;">
                            ¿Listo para enviar con RS Express?
                        </h2>
                        <p class="lead mb-0">Comienza ahora y disfruta de entregas rápidas y seguras</p>
                    </div>
                    <div class="col-lg-4 text-lg-end mt-3 mt-lg-0">
                        <a href="/shop" class="btn btn-secondary btn-lg">
                            <i class="fa fa-box me-2"></i> Hacer Pedido Ya
                        </a>
                    </div>
                </div>
            </div>
        </section>
    </template>
</odoo>
SNIPPETS_EOF

cat > ${ODOO_HOME}/custom-addons/theme_rsexpress_delivery/__init__.py << 'EOF'
# -*- coding: utf-8 -*-
EOF

chown -R ${ODOO_USER}:${ODOO_USER} ${ODOO_HOME}/custom-addons/theme_rsexpress_delivery

echo -e "${GREEN}[11/12] Configurando Odoo 19...${NC}"
cat > ${ODOO_CONFIG} << EOF
[options]
admin_passwd = $(openssl rand -base64 32)
db_host = localhost
db_port = 5432
db_user = ${POSTGRES_USER}
db_password = ${POSTGRES_PASSWORD}
addons_path = ${ODOO_HOME}/odoo/addons,${ODOO_HOME}/custom-addons
default_productivity_apps = True
http_port = ${ODOO_PORT}
gevent_port = ${LONGPOLLING_PORT}
logfile = ${ODOO_HOME}/logs/odoo-server.log
log_level = info
workers = 4
max_cron_threads = 2
limit_memory_hard = 2684354560
limit_memory_soft = 2147483648
limit_request = 8192
limit_time_cpu = 600
limit_time_real = 1200
proxy_mode = True
xmlrpc_interface = 127.0.0.1
EOF

echo -e "${GREEN}[12/12] Creando servicio systemd para Odoo...${NC}"
cat > /etc/systemd/system/odoo19.service << EOF
[Unit]
Description=Odoo 19 - RS Express Delivery Platform
Documentation=https://www.odoo.com
After=network.target postgresql.service

[Service]
Type=simple
User=${ODOO_USER}
Group=${ODOO_USER}
ExecStart=${ODOO_HOME}/venv/bin/python3 ${ODOO_HOME}/odoo/odoo-bin -c ${ODOO_CONFIG}
WorkingDirectory=${ODOO_HOME}
StandardOutput=journal+console
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable odoo19
systemctl start odoo19

echo -e "${GREEN}Configurando Nginx para rsexpress.net...${NC}"
cat > /etc/nginx/sites-available/rsexpress.net << EOF
# RS Express - Odoo 19 Configuration
upstream odoo19 {
    server 127.0.0.1:${ODOO_PORT};
}

upstream odoo19-longpolling {
    server 127.0.0.1:${LONGPOLLING_PORT};
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://\$host\$request_uri;
    }
}

# HTTPS Configuration
server {
    listen 443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};
    
    # SSL Configuration (will be configured by Certbot)
    # ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Logs
    access_log /var/log/nginx/rsexpress_access.log;
    error_log /var/log/nginx/rsexpress_error.log;
    
    # File upload limit
    client_max_body_size 100M;
    
    # Proxy settings
    proxy_read_timeout 720s;
    proxy_connect_timeout 720s;
    proxy_send_timeout 720s;
    proxy_buffers 16 64k;
    proxy_buffer_size 128k;
    
    # Longpolling requests
    location /longpolling {
        proxy_pass http://odoo19-longpolling;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Main Odoo location
    location / {
        proxy_pass http://odoo19;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_redirect off;
    }
    
    # Cache static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://odoo19;
        proxy_cache_valid 200 60m;
        proxy_buffering on;
        expires 864000;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
    gzip_disable "MSIE [1-6]\.";
}
EOF

ln -sf /etc/nginx/sites-available/rsexpress.net /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ INSTALACIÓN COMPLETADA EXITOSAMENTE${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║              INFORMACIÓN DE ACCESO                         ║${NC}"
echo -e "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}URL de Acceso:${NC} http://localhost:${ODOO_PORT}"
echo -e "${GREEN}Dominio:${NC} http://${DOMAIN} (configurar SSL con certbot)"
echo -e "${GREEN}Usuario PostgreSQL:${NC} ${POSTGRES_USER}"
echo -e "${GREEN}Contraseña PostgreSQL:${NC} ${POSTGRES_PASSWORD}"
echo ""
echo -e "${YELLOW}Configuración guardada en: ${ODOO_CONFIG}${NC}"
echo ""
echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}            PRÓXIMOS PASOS:${NC}"
echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}1.${NC} Configurar SSL con Certbot:"
echo -e "   ${YELLOW}certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}${NC}"
echo ""
echo -e "${GREEN}2.${NC} Acceder a Odoo:"
echo -e "   ${YELLOW}http://${DOMAIN}${NC}"
echo ""
echo -e "${GREEN}3.${NC} Crear base de datos RS Express:"
echo -e "   - Base de datos: ${YELLOW}rsexpress${NC}"
echo -e "   - Email: ${YELLOW}${ADMIN_EMAIL}${NC}"
echo -e "   - Contraseña: ${YELLOW}[tu-contraseña-segura]${NC}"
echo ""
echo -e "${GREEN}4.${NC} Instalar módulos:"
echo -e "   - ${YELLOW}website${NC} (Website Builder)"
echo -e "   - ${YELLOW}website_sale${NC} (eCommerce)"
echo -e "   - ${YELLOW}delivery${NC} (Delivery Management)"
echo -e "   - ${YELLOW}theme_rsexpress_delivery${NC} (Theme RS Express)"
echo ""
echo -e "${GREEN}5.${NC} Activar theme personalizado:"
echo -e "   Website → Configuración → Theme → ${YELLOW}RS Express Delivery Theme${NC}"
echo ""
echo -e "${GREEN}6.${NC} Verificar servicios:"
echo -e "   ${YELLOW}systemctl status odoo19${NC}"
echo -e "   ${YELLOW}systemctl status nginx${NC}"
echo -e "   ${YELLOW}systemctl status postgresql${NC}"
echo ""
echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  LOGS: tail -f ${ODOO_HOME}/logs/odoo-server.log${NC}"
echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}¡RS Express Delivery Platform está lista! 🚀📦${NC}"
