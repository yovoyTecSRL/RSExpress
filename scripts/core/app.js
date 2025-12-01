// RS Express - Main Application Logic

// User roles enum
const USER_ROLES = {
    CLIENTE: 'cliente',
    DRIVER: 'driver',
    ADMIN: 'admin'
};

// Predefined users database
const USERS_DB = {
    'andres': {
        username: 'andres',
        password: 'cliente123',
        name: 'Andrés Rodríguez',
        role: USER_ROLES.CLIENTE,
        email: 'andres@rsexpress.com'
    },
    'fulgenzio': {
        username: 'fulgenzio',
        password: 'driver123',
        name: 'Fulgencio González',
        role: USER_ROLES.DRIVER,
        email: 'fulgenzio@rsexpress.com'
    },
    'admin': {
        username: 'admin',
        password: 'admin123',
        name: 'Administrador',
        role: USER_ROLES.ADMIN,
        email: 'admin@rsexpress.com'
    }
};

class RSExpressApp {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
        this.trips = [];
        this.map = null;
        this.pickupMarker = null;
        this.deliveryMarker = null;
        this.routeLine = null;
        this.pickupCoords = null;
        this.deliveryCoords = null;
        this.selectingMode = null; // 'pickup' or 'delivery'
        
        // Tracking system
        this.trackingMap = null;
        this.activeTracking = null;
        this.driverMarker = null;
        this.trackingInterval = null;
        
        // Traccar integration
        this.traccar = null;
        this.traccarDevices = new Map();
        this.traccarApiKey = 'eyJkYXRhIjo1MDA1Nn0ubTFrRzRFdDBiRk1obDMyMVRGdXNFVHQxQXlTNGI3ODZtL0xYaFdZZmNQWQ';
        
        // Connection status
        this.connectionStatus = 'disconnected';
        
        // Shipment routes and freight management
        this.shipments = new Map();
        this.routes = new Map();
        this.freight = new Map();
        
        this.init();
    }

    init() {
        console.log('[RSExpress] Iniciando aplicación...');
        this.initMap();
        this.setupEventListeners();
        this.loadTripsFromStorage();
        this.checkLoginState();
        this.setDefaultDate();
        
        // Mostrar estado de conexión inmediatamente
        this.updateConnectionStatus('connecting');
        
        // Inicializar Traccar después de un pequeño delay para asegurar DOM ready
        setTimeout(() => {
            console.log('[RSExpress] Iniciando Traccar después de DOM ready');
            this.initTraccar();
        }, 500);
    }

    initMap() {
        // Initialize Leaflet map centered on a default location
        this.map = L.map('map').setView([19.4326, -99.1332], 12); // Mexico City default

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.map);

        // Try to get user's current location
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    this.map.setView([latitude, longitude], 13);
                },
                (error) => {
                    console.log('Geolocation not available, using default location');
                }
            );
        }

        // Add click handler for map
        this.map.on('click', (e) => {
            if (this.selectingMode) {
                this.setLocationFromMap(e.latlng);
            }
        });

        // Custom marker icons
        this.pickupIcon = L.icon({
            iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDMyIDQwIj48cGF0aCBmaWxsPSIjMjdhZTYwIiBkPSJNMTYgMEM3LjE2IDAgMCA3LjE2IDAgMTZjMCAxMi4xNiAxNiAyNCAxNiAyNHMxNi0xMS44NCAxNi0yNGMwLTguODQtNy4xNi0xNi0xNi0xNnptMCAyMmMtMy4zMSAwLTYtMi42OS02LTZzMi42OS02IDYtNiA2IDIuNjkgNiA2LTIuNjkgNi02IDZ6Ii8+PC9zdmc+',
            iconSize: [32, 40],
            iconAnchor: [16, 40],
            popupAnchor: [0, -40]
        });

        this.deliveryIcon = L.icon({
            iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDMyIDQwIj48cGF0aCBmaWxsPSIjZTc0YzNjIiBkPSJNMTYgMEM3LjE2IDAgMCA3LjE2IDAgMTZjMCAxMi4xNiAxNiAyNCAxNiAyNHMxNi0xMS44NCAxNi0yNGMwLTguODQtNy4xNi0xNi0xNi0xNnptMCAyMmMtMy4zMSAwLTYtMi42OS02LTZzMi42OS02IDYtNiA2IDIuNjkgNiA2LTIuNjkgNi02IDZ6Ii8+PC9zdmc+',
            iconSize: [32, 40],
            iconAnchor: [16, 40],
            popupAnchor: [0, -40]
        });
    }

    setLocationFromMap(latlng) {
        const { lat, lng } = latlng;

        if (this.selectingMode === 'pickup') {
            // Remove previous marker if exists
            if (this.pickupMarker) {
                this.map.removeLayer(this.pickupMarker);
            }

            // Add new marker
            this.pickupMarker = L.marker([lat, lng], { icon: this.pickupIcon })
                .addTo(this.map)
                .bindPopup('📍 Punto de Recogida')
                .openPopup();

            this.pickupCoords = { lat, lng };

            // Reverse geocode to get address
            this.reverseGeocode(lat, lng, 'pickupLocation');
            
            this.selectingMode = null;
            this.showToast('Punto de recogida seleccionado', 'success');
            
            // Remove map highlight
            document.getElementById('map').style.cursor = 'grab';
            
        } else if (this.selectingMode === 'delivery') {
            // Remove previous marker if exists
            if (this.deliveryMarker) {
                this.map.removeLayer(this.deliveryMarker);
            }

            // Add new marker
            this.deliveryMarker = L.marker([lat, lng], { icon: this.deliveryIcon })
                .addTo(this.map)
                .bindPopup('🎯 Punto de Entrega')
                .openPopup();

            this.deliveryCoords = { lat, lng };

            // Reverse geocode to get address
            this.reverseGeocode(lat, lng, 'deliveryLocation');
            
            this.selectingMode = null;
            this.showToast('Punto de entrega seleccionado', 'success');
            
            // Remove map highlight
            document.getElementById('map').style.cursor = 'grab';
        }

        // Draw route if both points are set
        if (this.pickupCoords && this.deliveryCoords) {
            this.drawRoute();
            this.calculateRealDistance();
        }
    }

    async reverseGeocode(lat, lng, inputId) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            
            const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            document.getElementById(inputId).value = address;
        } catch (error) {
            document.getElementById(inputId).value = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        }
    }

    drawRoute() {
        // Remove previous route if exists
        if (this.routeLine) {
            this.map.removeLayer(this.routeLine);
        }

        // Draw line between pickup and delivery
        const latlngs = [
            [this.pickupCoords.lat, this.pickupCoords.lng],
            [this.deliveryCoords.lat, this.deliveryCoords.lng]
        ];

        this.routeLine = L.polyline(latlngs, {
            color: '#e74c3c',
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10'
        }).addTo(this.map);

        // Fit map bounds to show both markers
        const bounds = L.latLngBounds([
            [this.pickupCoords.lat, this.pickupCoords.lng],
            [this.deliveryCoords.lat, this.deliveryCoords.lng]
        ]);
        this.map.fitBounds(bounds, { padding: [50, 50] });
    }

    calculateRealDistance() {
        if (!this.pickupCoords || !this.deliveryCoords) return;

        // Calculate distance using Haversine formula
        const R = 6371; // Earth's radius in km
        const dLat = this.toRad(this.deliveryCoords.lat - this.pickupCoords.lat);
        const dLon = this.toRad(this.deliveryCoords.lng - this.pickupCoords.lng);
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(this.toRad(this.pickupCoords.lat)) * 
                  Math.cos(this.toRad(this.deliveryCoords.lat)) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        // Calculate price and time
        const distanceRounded = Math.round(distance * 10) / 10;
        const time = Math.floor(distance * 3 + 10);
        const basePrice = 50;
        const pricePerKm = 15;
        const price = Math.round(basePrice + (distance * pricePerKm));

        document.getElementById('estimatedDistance').textContent = `${distanceRounded} km`;
        document.getElementById('estimatedTime').textContent = `${time} min`;
        document.getElementById('estimatedPrice').textContent = `$${price}`;
    }

    toRad(degrees) {
        return degrees * Math.PI / 180;
    }

    clearRoute() {
        // Remove markers
        if (this.pickupMarker) {
            this.map.removeLayer(this.pickupMarker);
            this.pickupMarker = null;
        }
        if (this.deliveryMarker) {
            this.map.removeLayer(this.deliveryMarker);
            this.deliveryMarker = null;
        }
        if (this.routeLine) {
            this.map.removeLayer(this.routeLine);
            this.routeLine = null;
        }

        // Clear coordinates
        this.pickupCoords = null;
        this.deliveryCoords = null;
        this.selectingMode = null;

        // Clear inputs
        document.getElementById('pickupLocation').value = '';
        document.getElementById('deliveryLocation').value = '';

        // Reset estimates
        document.getElementById('estimatedDistance').textContent = '-- km';
        document.getElementById('estimatedTime').textContent = '-- min';
        document.getElementById('estimatedPrice').textContent = '$--';

        document.getElementById('map').style.cursor = 'grab';
        this.showToast('Ruta limpiada', 'success');
    }

    centerMap() {
        if (this.pickupCoords && this.deliveryCoords) {
            const bounds = L.latLngBounds([
                [this.pickupCoords.lat, this.pickupCoords.lng],
                [this.deliveryCoords.lat, this.deliveryCoords.lng]
            ]);
            this.map.fitBounds(bounds, { padding: [50, 50] });
        } else if (this.pickupCoords) {
            this.map.setView([this.pickupCoords.lat, this.pickupCoords.lng], 13);
        } else if (this.deliveryCoords) {
            this.map.setView([this.deliveryCoords.lat, this.deliveryCoords.lng], 13);
        }
    }

    setupMenuDashboard() {
        const btnMenuDashboard = document.getElementById('btnMenuDashboard');
        const menuDashboard = document.getElementById('menuDashboard');
        const closeMenuDashboard = document.getElementById('closeMenuDashboard');
        const dashboardOverlay = document.querySelector('.dashboard-overlay');
        const dashboardItems = document.querySelectorAll('.dashboard-item');
        const dashboardLogout = document.getElementById('dashboardLogout');

        // Abrir menú
        btnMenuDashboard?.addEventListener('click', (e) => {
            e.stopPropagation();
            menuDashboard?.classList.add('active');
        });

        // Cerrar menú
        closeMenuDashboard?.addEventListener('click', () => {
            menuDashboard?.classList.remove('active');
        });

        // Cerrar menú al hacer clic en overlay
        dashboardOverlay?.addEventListener('click', () => {
            menuDashboard?.classList.remove('active');
        });

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dashboard-menu') && !e.target.closest('.btn-menu-dashboard')) {
                menuDashboard?.classList.remove('active');
            }
        });

        // Manejar items del menú
        dashboardItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                if (page) {
                    this.navigateTo(page);
                    menuDashboard?.classList.remove('active');
                }
            });
        });

        // Logout desde el menú
        dashboardLogout?.addEventListener('click', () => {
            this.logout();
            menuDashboard?.classList.remove('active');
        });

        // Cerrar menú al presionar Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                menuDashboard?.classList.remove('active');
            }
        });
    }

    /**
     * Configurar menú según el rol del usuario
     */
    setupMenuForRole() {
        if (!this.currentUser) return;

        // Filtrar items en barra de navegación
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            let showItem = true;

            switch(this.userRole) {
                case USER_ROLES.CLIENTE:
                    // Cliente ve: Inicio, Mis Viajes, Flota, Ser Conductor, Perfil
                    showItem = ['home', 'trips', 'fleet', 'driver', 'profile'].includes(page);
                    break;
                
                case USER_ROLES.DRIVER:
                    // Driver ve: Inicio, Flota, Panel Conductor, Historial, Estadísticas, Perfil
                    showItem = ['home', 'fleet', 'driver-panel', 'history', 'stats', 'profile'].includes(page);
                    break;
                
                case USER_ROLES.ADMIN:
                    // Admin ve: Todo
                    showItem = true;
                    break;
                
                default:
                    // No autenticado solo ve Inicio
                    showItem = page === 'home';
            }

            link.style.display = showItem ? 'block' : 'none';
        });

        // Filtrar items en dashboard menu
        const dashboardGrid = document.querySelector('.dashboard-grid');
        const dashboardItems = dashboardGrid?.querySelectorAll('.dashboard-item');

        dashboardItems?.forEach(item => {
            const page = item.getAttribute('data-page');
            let showItem = true;

            switch(this.userRole) {
                case USER_ROLES.CLIENTE:
                    // Cliente ve: Inicio, Mis Viajes, Flota, Ser Conductor, Perfil
                    showItem = ['home', 'trips', 'fleet', 'driver', 'profile'].includes(page);
                    break;
                
                case USER_ROLES.DRIVER:
                    // Driver ve: Inicio, Flota, Panel Conductor, Historial, Estadísticas, Perfil
                    showItem = ['home', 'fleet', 'driver-panel', 'history', 'stats', 'profile'].includes(page);
                    break;
                
                case USER_ROLES.ADMIN:
                    // Admin ve: Todo
                    showItem = true;
                    break;
                
                default:
                    // No autenticado solo ve Inicio
                    showItem = page === 'home';
            }

            item.style.display = showItem ? 'flex' : 'none';
        });

        console.log(`[Menu] Configurado para rol: ${this.userRole}`);
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Menu Dashboard
        this.setupMenuDashboard();

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.dataset.page;
                this.navigateTo(page);
            });
        });

        // Login/Logout
        document.getElementById('loginBtn').addEventListener('click', () => {
            this.showModal('loginModal');
        });

        document.getElementById('logoutBtn')?.addEventListener('click', () => {
            this.logout();
        });

        // Service selector
        document.querySelectorAll('.service-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.service-btn').forEach(b => b.classList.remove('active'));
                e.currentTarget.classList.add('active');
                this.updateServiceForm(e.currentTarget.dataset.service);
            });
        });

        // Order form
        document.getElementById('orderForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitOrder();
        });

        // Location button
        document.getElementById('btnPickupLocation').addEventListener('click', () => {
            this.getCurrentLocation();
        });

        // Map selection buttons
        document.getElementById('btnPickupMap').addEventListener('click', () => {
            this.selectingMode = 'pickup';
            document.getElementById('map').style.cursor = 'crosshair';
            this.showToast('Haz clic en el mapa para seleccionar el punto de recogida', 'info');
        });

        document.getElementById('btnDeliveryMap').addEventListener('click', () => {
            this.selectingMode = 'delivery';
            document.getElementById('map').style.cursor = 'crosshair';
            this.showToast('Haz clic en el mapa para seleccionar el punto de entrega', 'info');
        });

        // Map controls
        document.getElementById('btnCenterMap').addEventListener('click', () => {
            this.centerMap();
        });

        document.getElementById('btnClearRoute').addEventListener('click', () => {
            this.clearRoute();
        });

        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // Register form
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });

        // Driver form
        document.getElementById('driverForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitDriverApplication();
        });

        // Modal close buttons
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal').id);
            });
        });

        // Switch between login/register
        document.getElementById('showRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('loginModal');
            this.showModal('registerModal');
        });

        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal('registerModal');
            this.showModal('loginModal');
        });

        // Trip filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.filterTrips(e.target.dataset.filter);
            });
        });

        // Profile tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Real-time price estimation
        const locationInputs = ['pickupLocation', 'deliveryLocation'];
        locationInputs.forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                // Only auto-calculate if not using map selection
                if (!this.pickupCoords && !this.deliveryCoords) {
                    this.calculateEstimate();
                }
            });
        });

        // Close modals on outside click
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    navigateTo(page) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // Show page
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.getElementById(`${page}Page`).classList.add('active');
        
        // Initialize page-specific functionality
        if (page === 'driver-panel') {
            this.initDriverPanel();
        } else if (page === 'history') {
            this.initHistoryPage();
        } else if (page === 'stats') {
            this.initStatsPage();
        } else if (page === 'fleet') {
            this.loadFleet();
        } else if (page === 'admin') {
            this.loadAdminDashboard();
        } else if (page === 'odooUsers') {
            this.loadOdooUsersPage();
        }

        // Load page-specific content
        if (page === 'trips') {
            this.loadTrips();
        } else if (page === 'profile') {
            this.loadProfile();
        }
    }

    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }

    updateServiceForm(service) {
        const packageDetails = document.getElementById('packageDetails');
        const errandDetails = document.getElementById('errandDetails');

        if (service === 'errand') {
            packageDetails.style.display = 'none';
            errandDetails.style.display = 'block';
        } else {
            packageDetails.style.display = 'block';
            errandDetails.style.display = 'none';
        }

        this.calculateEstimate();
    }

    getCurrentLocation() {
        if ('geolocation' in navigator) {
            this.showToast('Obteniendo ubicación...', 'info');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    
                    // Update map
                    this.map.setView([latitude, longitude], 15);
                    
                    // Set pickup marker
                    if (this.pickupMarker) {
                        this.map.removeLayer(this.pickupMarker);
                    }
                    
                    this.pickupMarker = L.marker([latitude, longitude], { icon: this.pickupIcon })
                        .addTo(this.map)
                        .bindPopup('📍 Tu ubicación actual')
                        .openPopup();
                    
                    this.pickupCoords = { lat: latitude, lng: longitude };
                    
                    // Reverse geocode
                    this.reverseGeocode(latitude, longitude, 'pickupLocation');
                    
                    this.showToast('Ubicación obtenida', 'success');
                },
                (error) => {
                    this.showToast('No se pudo obtener la ubicación', 'error');
                }
            );
        } else {
            this.showToast('Geolocalización no disponible', 'error');
        }
    }

    calculateEstimate() {
        const pickup = document.getElementById('pickupLocation').value;
        const delivery = document.getElementById('deliveryLocation').value;

        if (pickup && delivery) {
            // Simulate distance calculation
            const distance = Math.floor(Math.random() * 20) + 2; // 2-22 km
            const time = Math.floor(distance * 3 + 10); // Rough estimate
            const basePrice = 50;
            const pricePerKm = 15;
            const price = basePrice + (distance * pricePerKm);

            document.getElementById('estimatedDistance').textContent = `${distance} km`;
            document.getElementById('estimatedTime').textContent = `${time} min`;
            document.getElementById('estimatedPrice').textContent = `$${price}`;
        }
    }

    submitOrder() {
        if (!this.currentUser) {
            this.showToast('Debes iniciar sesión para solicitar un servicio', 'warning');
            this.showModal('loginModal');
            return;
        }

        if (!this.pickupCoords || !this.deliveryCoords) {
            this.showToast('Por favor selecciona los puntos de recogida y entrega en el mapa', 'warning');
            return;
        }

        const serviceType = document.querySelector('.service-btn.active').dataset.service;
        const pickup = document.getElementById('pickupLocation').value;
        const delivery = document.getElementById('deliveryLocation').value;
        const date = document.getElementById('orderDate').value;
        const time = document.getElementById('orderTime').value;
        const description = serviceType === 'errand' 
            ? document.getElementById('errandDescription').value
            : document.getElementById('packageDescription').value;
        const price = document.getElementById('estimatedPrice').textContent;

        const trip = {
            id: Date.now(),
            type: serviceType,
            pickup,
            delivery,
            pickupCoords: { ...this.pickupCoords },
            deliveryCoords: { ...this.deliveryCoords },
            date,
            time,
            description,
            price,
            status: 'active',
            createdAt: new Date().toISOString(),
            driver: null,
            trackingCode: this.generateTrackingCode()
        };

        this.trips.push(trip);
        this.saveTripsToStorage();

        // Start live tracking immediately
        this.startLiveTracking(trip);

        this.showToast('¡Servicio solicitado con éxito!', 'success');
        document.getElementById('orderForm').reset();
        this.setDefaultDate();
        
        // Clear map markers after order
        this.clearRoute();
    }

    startLiveTracking(trip) {
        this.activeTracking = {
            trip: trip,
            currentStatus: 'searching',
            driverPosition: null,
            startTime: Date.now(),
            statusHistory: [
                { status: 'searching', time: new Date().toLocaleTimeString() }
            ]
        };

        // Show tracking modal
        this.showTrackingModal(trip);

        // Simulate driver assignment after 3-5 seconds
        setTimeout(() => {
            this.assignDriverToTrip(trip.id);
        }, Math.random() * 2000 + 3000);
    }

    showTrackingModal(trip) {
        // Initialize tracking map if not already done
        if (!this.trackingMap) {
            this.showModal('trackingModal');
            setTimeout(() => {
                this.initTrackingMap(trip);
            }, 300);
        } else {
            this.showModal('trackingModal');
            this.updateTrackingMap(trip);
        }

        // Update tracking UI
        this.updateTrackingUI();
    }

    initTrackingMap(trip) {
        const trackingMapElement = document.getElementById('trackingMap');
        
        // Clear existing map if any
        if (this.trackingMap) {
            this.trackingMap.remove();
        }

        // Initialize map centered between pickup and delivery
        const pickupLat = trip.pickupCoords?.lat || 19.4326;
        const pickupLng = trip.pickupCoords?.lng || -99.1332;
        const deliveryLat = trip.deliveryCoords?.lat || 19.4326;
        const deliveryLng = trip.deliveryCoords?.lng || -99.1332;
        
        const centerLat = (pickupLat + deliveryLat) / 2;
        const centerLng = (pickupLng + deliveryLng) / 2;
        
        this.trackingMap = L.map('trackingMap').setView([centerLat, centerLng], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19
        }).addTo(this.trackingMap);

        // Add pickup and delivery markers
        if (trip.pickupCoords) {
            L.marker([trip.pickupCoords.lat, trip.pickupCoords.lng], {
                icon: this.pickupIcon
            }).addTo(this.trackingMap).bindPopup('📍 Recogida');
        }

        if (trip.deliveryCoords) {
            L.marker([trip.deliveryCoords.lat, trip.deliveryCoords.lng], {
                icon: this.deliveryIcon
            }).addTo(this.trackingMap).bindPopup('🎯 Entrega');
        }

        // Create driver icon
        this.driverIcon = L.icon({
            iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDMyIDMyIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxNCIgZmlsbD0iIzM0OThlNyIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjIiLz48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMTYgOGwtMyA2aDJsLTIgNiA2LTggaC0ybDMtNHoiLz48L3N2Zz4=',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });
    }

    updateTrackingMap(trip) {
        if (!this.trackingMap) return;

        // Fit bounds to show all markers
        const bounds = [];
        if (trip.pickupCoords) bounds.push([trip.pickupCoords.lat, trip.pickupCoords.lng]);
        if (trip.deliveryCoords) bounds.push([trip.deliveryCoords.lat, trip.deliveryCoords.lng]);
        if (this.activeTracking?.driverPosition) {
            bounds.push([this.activeTracking.driverPosition.lat, this.activeTracking.driverPosition.lng]);
        }

        if (bounds.length > 0) {
            this.trackingMap.fitBounds(bounds, { padding: [50, 50] });
        }
    }

    assignDriverToTrip(tripId) {
        const trip = this.trips.find(t => t.id === tripId);
        if (!trip) return;

        const driverName = this.generateDriverName();
        
        trip.driver = {
            name: driverName,
            vehicle: this.generateVehicle(),
            plate: this.generatePlate(),
            rating: (4 + Math.random()).toFixed(1),
            phone: '+1234567890',
            avatar: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%233498e7'/%3E%3Ctext x='50' y='65' font-size='45' text-anchor='middle' fill='white'%3E${driverName[0]}%3C/text%3E%3C/svg%3E`
        };

        // Set initial driver position (near pickup)
        const lat = trip.pickupCoords?.lat || 19.4326;
        const lng = trip.pickupCoords?.lng || -99.1332;
        this.activeTracking.driverPosition = {
            lat: lat + (Math.random() - 0.5) * 0.01,
            lng: lng + (Math.random() - 0.5) * 0.01
        };

        // Add driver marker
        if (this.driverMarker) {
            this.trackingMap.removeLayer(this.driverMarker);
        }
        this.driverMarker = L.marker(
            [this.activeTracking.driverPosition.lat, this.activeTracking.driverPosition.lng],
            { icon: this.driverIcon }
        ).addTo(this.trackingMap).bindPopup(`🚗 ${trip.driver.name}`);

        // Update status
        this.activeTracking.currentStatus = 'assigned';
        this.activeTracking.statusHistory.push({
            status: 'assigned',
            time: new Date().toLocaleTimeString()
        });

        this.saveTripsToStorage();
        this.updateTrackingUI();
        this.showToast('¡Conductor asignado!', 'success');

        // Start movement simulation
        setTimeout(() => this.simulateDriverMovement(trip), 3000);
    }

    simulateDriverMovement(trip) {
        if (!this.activeTracking || this.activeTracking.trip.id !== trip.id) return;

        const statuses = ['assigned', 'pickup', 'in-transit', 'delivered'];
        const currentIndex = statuses.indexOf(this.activeTracking.currentStatus);
        
        if (currentIndex >= statuses.length - 1) {
            // Trip completed
            this.completeDelivery(trip);
            return;
        }

        // Move to next status
        const nextStatus = statuses[currentIndex + 1];
        this.activeTracking.currentStatus = nextStatus;
        this.activeTracking.statusHistory.push({
            status: nextStatus,
            time: new Date().toLocaleTimeString()
        });

        trip.status = nextStatus === 'delivered' ? 'completed' : 'active';
        this.saveTripsToStorage();
        this.updateTrackingUI();

        // Calculate target position based on status
        let targetLat, targetLng;
        if (nextStatus === 'pickup') {
            targetLat = trip.pickupCoords?.lat || 19.4326;
            targetLng = trip.pickupCoords?.lng || -99.1332;
        } else if (nextStatus === 'in-transit' || nextStatus === 'delivered') {
            targetLat = trip.deliveryCoords?.lat || 19.4326;
            targetLng = trip.deliveryCoords?.lng || -99.1332;
        }

        // Animate driver movement
        this.animateDriverToPosition(targetLat, targetLng, () => {
            // Continue to next status after delay
            const delay = nextStatus === 'delivered' ? 2000 : 5000;
            setTimeout(() => this.simulateDriverMovement(trip), delay);
        });
    }

    animateDriverToPosition(targetLat, targetLng, callback) {
        if (!this.activeTracking?.driverPosition) return;

        const startLat = this.activeTracking.driverPosition.lat;
        const startLng = this.activeTracking.driverPosition.lng;
        const steps = 50;
        let currentStep = 0;

        const animate = () => {
            currentStep++;
            const progress = currentStep / steps;

            const currentLat = startLat + (targetLat - startLat) * progress;
            const currentLng = startLng + (targetLng - startLng) * progress;

            this.activeTracking.driverPosition = { lat: currentLat, lng: currentLng };

            // Update marker position
            if (this.driverMarker) {
                this.driverMarker.setLatLng([currentLat, currentLng]);
            }

            // Update distance and time
            this.updateTrackingStats(targetLat, targetLng);

            if (currentStep < steps) {
                setTimeout(animate, 100);
            } else if (callback) {
                callback();
            }
        };

        animate();
    }

    updateTrackingStats(targetLat, targetLng) {
        if (!this.activeTracking?.driverPosition) return;

        const R = 6371;
        const dLat = this.toRad(targetLat - this.activeTracking.driverPosition.lat);
        const dLon = this.toRad(targetLng - this.activeTracking.driverPosition.lng);
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(this.toRad(this.activeTracking.driverPosition.lat)) * 
                  Math.cos(this.toRad(targetLat)) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;

        const distanceKm = distance.toFixed(1);
        const timeMin = Math.ceil(distance * 3);

        document.getElementById('trackingDistance').textContent = `${distanceKm} km`;
        document.getElementById('trackingTime').textContent = `${timeMin} min`;
    }

    updateTrackingUI() {
        if (!this.activeTracking) return;

        const trip = this.activeTracking.trip;
        const driver = trip.driver;

        // Update driver info
        if (driver) {
            document.getElementById('trackingDriverName').textContent = driver.name;
            document.getElementById('trackingDriverVehicle').textContent = driver.vehicle;
            document.getElementById('trackingDriverRating').textContent = `⭐ ${driver.rating}`;
            document.getElementById('trackingDriverAvatar').src = driver.avatar;
            document.getElementById('trackingDriverPhone').style.display = 'flex';
            document.getElementById('trackingDriverPhone').href = `tel:${driver.phone}`;
        } else {
            document.getElementById('trackingDriverName').textContent = 'Buscando conductor...';
            document.getElementById('trackingDriverVehicle').textContent = '';
            document.getElementById('trackingDriverRating').textContent = '';
            document.getElementById('trackingDriverPhone').style.display = 'none';
        }

        // Update status timeline
        const steps = document.querySelectorAll('.status-step');
        const statuses = ['searching', 'assigned', 'pickup', 'in-transit', 'delivered'];
        const currentIndex = statuses.indexOf(this.activeTracking.currentStatus);

        steps.forEach((step, index) => {
            step.classList.remove('active', 'completed');
            const stepStatus = step.dataset.step;
            const stepIndex = statuses.indexOf(stepStatus);

            if (stepIndex < currentIndex) {
                step.classList.add('completed');
            } else if (stepIndex === currentIndex) {
                step.classList.add('active');
            }

            // Update time
            const historyItem = this.activeTracking.statusHistory.find(h => h.status === stepStatus);
            if (historyItem) {
                const timeSpan = step.querySelector('.step-time');
                if (timeSpan) timeSpan.textContent = historyItem.time;
            }
        });
    }

    completeDelivery(trip) {
        trip.status = 'completed';
        this.saveTripsToStorage();
        this.updateTrackingUI();
        
        setTimeout(() => {
            this.showToast('¡Entrega completada con éxito!', 'success');
            this.closeModal('trackingModal');
            this.activeTracking = null;
            
            if (this.driverMarker) {
                this.trackingMap.removeLayer(this.driverMarker);
                this.driverMarker = null;
            }
        }, 2000);
    }

    assignDriver(tripId) {
        const trip = this.trips.find(t => t.id === tripId);
        if (trip && trip.status === 'active') {
            trip.driver = {
                name: this.generateDriverName(),
                vehicle: this.generateVehicle(),
                plate: this.generatePlate(),
                rating: (4 + Math.random()).toFixed(1),
                phone: '+1234567890'
            };
            this.saveTripsToStorage();
            this.showToast('¡Conductor asignado!', 'success');
        }
    }

    generateTrackingCode() {
        return 'RSX-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    generateDriverName() {
        const names = ['Carlos Martínez', 'Ana García', 'Luis Rodríguez', 'María López', 'Juan Pérez'];
        return names[Math.floor(Math.random() * names.length)];
    }

    generateVehicle() {
        const vehicles = ['Honda Civic 2020', 'Toyota Corolla 2021', 'Mazda 3 2019', 'Ford Focus 2020'];
        return vehicles[Math.floor(Math.random() * vehicles.length)];
    }

    generatePlate() {
        return 'ABC-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    }

    login() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showToast('Por favor completa todos los campos', 'warning');
            return;
        }

        // Buscar usuario en la base de datos
        const user = USERS_DB[email];
        
        if (!user || user.password !== password) {
            this.showToast('Email o contraseña incorrectos', 'error');
            return;
        }

        // Usuario autenticado
        this.currentUser = {
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: null
        };
        
        this.userRole = user.role;
        
        localStorage.setItem('rsexpress_user', JSON.stringify(this.currentUser));
        
        // Limpiar form
        document.getElementById('loginForm').reset();
        
        // Cerrar modal primero
        const loginModal = document.getElementById('loginModal');
        loginModal.classList.remove('active');
        
        // Esperar a que se cierre el modal antes de actualizar UI
        setTimeout(() => {
            this.updateUIForLoggedInUser();
            this.setupMenuForRole();
            this.showToast(`¡Bienvenido, ${this.currentUser.name}!`, 'success');
        }, 300);
    }

    register() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const phone = document.getElementById('registerPhone').value;
        const password = document.getElementById('registerPassword').value;

        // Simulate registration (in real app, call API)
        const user = {
            id: Date.now(),
            name: name,
            email: email,
            phone: phone,
            avatar: null
        };

        this.currentUser = user;
        localStorage.setItem('rsexpress_user', JSON.stringify(user));
        
        this.updateUIForLoggedInUser();
        this.closeModal('registerModal');
        this.showToast(`¡Cuenta creada exitosamente, ${user.name}!`, 'success');
    }
    logout() {
        this.currentUser = null;
        this.userRole = null;
        localStorage.removeItem('rsexpress_user');
        setTimeout(() => {
            this.updateUIForLoggedInUser();
        }, 50);
        this.navigateTo('home');
        this.showToast('Sesión cerrada', 'success');
    }

    checkLoginState() {
        const savedUser = localStorage.getItem('rsexpress_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.userRole = this.currentUser.role;
            this.setupMenuForRole();
            
            // Delay para asegurar que el DOM está listo
            setTimeout(() => {
                this.updateUIForLoggedInUser();
            }, 100);
        }

        // Check saved theme preference
        const savedTheme = localStorage.getItem('rsexpress_theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            this.updateThemeIcon();
        }
    }

    toggleTheme() {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        localStorage.setItem('rsexpress_theme', isLight ? 'light' : 'dark');
        this.updateThemeIcon();
        this.showToast(isLight ? 'Tema claro activado' : 'Tema oscuro activado', 'success');
    }

    updateThemeIcon() {
        const themeToggle = document.getElementById('themeToggle');
        const icon = themeToggle.querySelector('i');
        const isLight = document.body.classList.contains('light-theme');
        icon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
    }

    updateUIForLoggedInUser() {
        const loginBtn = document.getElementById('loginBtn');
        const userProfile = document.getElementById('userProfile');
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');

        if (this.currentUser) {
            if (loginBtn) loginBtn.style.display = 'none';
            if (userProfile) userProfile.style.display = 'flex';
            if (userName) userName.textContent = this.currentUser.name;
            
            if (userAvatar) {
                if (this.currentUser.avatar) {
                    userAvatar.src = this.currentUser.avatar;
                    userAvatar.onerror = () => this.generateInitialAvatar(this.currentUser.name);
                } else {
                    // Generar avatar con inicial del nombre
                    this.generateInitialAvatar(this.currentUser.name);
                }
            }
        } else {
            if (loginBtn) loginBtn.style.display = 'block';
            if (userProfile) userProfile.style.display = 'none';
        }
    }

    generateInitialAvatar(name) {
        console.log('[RSExpress] Generando avatar para:', name);
        
        const initial = (name || 'U').charAt(0).toUpperCase();
        const colors = {
            'A': '#e74c3c', 'B': '#3498db', 'C': '#2ecc71', 'D': '#f39c12',
            'E': '#9b59b6', 'F': '#1abc9c', 'G': '#34495e', 'H': '#e67e22',
            'I': '#c0392b', 'J': '#16a085', 'K': '#8e44ad', 'L': '#27ae60',
            'M': '#f1c40f', 'N': '#e74c3c', 'O': '#95a5a6', 'P': '#3498db',
            'Q': '#2ecc71', 'R': '#f39c12', 'S': '#9b59b6', 'T': '#1abc9c',
            'U': '#34495e', 'V': '#e67e22', 'W': '#c0392b', 'X': '#16a085',
            'Y': '#8e44ad', 'Z': '#27ae60'
        };
        
        const backgroundColor = colors[initial] || '#e74c3c';
        
        // Crear SVG usando método más confiable
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar) {
            // Crear canvas para generar imagen
            const canvas = document.createElement('canvas');
            canvas.width = 200;
            canvas.height = 200;
            const ctx = canvas.getContext('2d');
            
            // Dibujar círculo de fondo
            ctx.fillStyle = backgroundColor;
            ctx.beginPath();
            ctx.arc(100, 100, 100, 0, Math.PI * 2);
            ctx.fill();
            
            // Dibujar texto
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 100px Arial, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(initial, 100, 100);
            
            // Convertir canvas a data URL
            const dataUrl = canvas.toDataURL('image/png');
            userAvatar.src = dataUrl;
            userAvatar.alt = `Avatar de ${name}`;
            console.log('[RSExpress] ✅ Avatar generado exitosamente para:', initial);
        } else {
            console.warn('[RSExpress] ❌ No se encontró elemento userAvatar');
        }
    }

    loadTrips() {
        const tripsList = document.getElementById('tripsList');
        
        if (this.trips.length === 0) {
            tripsList.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: var(--gray);">
                    <i class="fas fa-inbox" style="font-size: 4rem; margin-bottom: 1rem;"></i>
                    <p>No tienes viajes aún</p>
                </div>
            `;
            return;
        }

        tripsList.innerHTML = this.trips.map(trip => this.createTripCard(trip)).join('');

        // Add click handlers
        document.querySelectorAll('.trip-card').forEach(card => {
            card.addEventListener('click', () => {
                const tripId = parseInt(card.dataset.tripId);
                const trip = this.trips.find(t => t.id === tripId);
                this.showTripDetails(trip);
            });
        });
    }

    createTripCard(trip) {
        const icons = {
            delivery: 'fa-box',
            errand: 'fa-shopping-bag',
            transport: 'fa-car'
        };

        return `
            <div class="trip-card" data-trip-id="${trip.id}">
                <div class="trip-icon">
                    <i class="fas ${icons[trip.type]}"></i>
                </div>
                <div class="trip-info">
                    <h3>${trip.trackingCode}</h3>
                    <div class="trip-route">
                        <i class="fas fa-circle"></i>
                        <span>${trip.pickup}</span>
                        <i class="fas fa-arrow-right"></i>
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${trip.delivery}</span>
                    </div>
                    <div class="trip-meta">
                        <span><i class="fas fa-calendar"></i> ${trip.date}</span>
                        <span><i class="fas fa-clock"></i> ${trip.time}</span>
                    </div>
                </div>
                <div class="trip-status">
                    <span class="status-badge ${trip.status}">${this.getStatusText(trip.status)}</span>
                    <div class="trip-price">${trip.price}</div>
                </div>
            </div>
        `;
    }

    getStatusText(status) {
        const statusTexts = {
            active: 'En Progreso',
            completed: 'Completado',
            cancelled: 'Cancelado'
        };
        return statusTexts[status] || status;
    }

    showTripDetails(trip) {
        const detailsHTML = `
            <h2>Detalles del Viaje</h2>
            <div style="margin: 2rem 0;">
                <div style="background: var(--light); padding: 1rem; border-radius: 10px; margin-bottom: 1rem;">
                    <h3 style="color: var(--primary-color);">${trip.trackingCode}</h3>
                    <span class="status-badge ${trip.status}" style="margin-top: 0.5rem;">${this.getStatusText(trip.status)}</span>
                </div>

                <div style="margin: 1.5rem 0;">
                    <h4 style="margin-bottom: 0.5rem;"><i class="fas fa-map-marker-alt"></i> Ruta</h4>
                    <p><strong>Origen:</strong> ${trip.pickup}</p>
                    <p><strong>Destino:</strong> ${trip.delivery}</p>
                </div>

                <div style="margin: 1.5rem 0;">
                    <h4 style="margin-bottom: 0.5rem;"><i class="fas fa-calendar"></i> Fecha y Hora</h4>
                    <p>${trip.date} a las ${trip.time}</p>
                </div>

                ${trip.description ? `
                    <div style="margin: 1.5rem 0;">
                        <h4 style="margin-bottom: 0.5rem;"><i class="fas fa-info-circle"></i> Descripción</h4>
                        <p>${trip.description}</p>
                    </div>
                ` : ''}

                ${trip.driver ? `
                    <div style="margin: 1.5rem 0; background: var(--light); padding: 1rem; border-radius: 10px;">
                        <h4 style="margin-bottom: 1rem;"><i class="fas fa-user"></i> Conductor</h4>
                        <p><strong>Nombre:</strong> ${trip.driver.name}</p>
                        <p><strong>Vehículo:</strong> ${trip.driver.vehicle}</p>
                        <p><strong>Placa:</strong> ${trip.driver.plate}</p>
                        <p><strong>Rating:</strong> ⭐ ${trip.driver.rating}</p>
                        <p><strong>Teléfono:</strong> ${trip.driver.phone}</p>
                    </div>
                ` : '<p style="color: var(--warning);"><i class="fas fa-clock"></i> Buscando conductor...</p>'}

                <div style="margin: 1.5rem 0; text-align: right;">
                    <h3 style="color: var(--primary-color);">Total: ${trip.price}</h3>
                </div>

                ${trip.status === 'active' ? `
                    <button onclick="app.showTrackingModal(app.trips.find(t => t.id === ${trip.id}))" class="btn-submit" style="margin-top: 1rem; background: var(--success);">
                        <i class="fas fa-map-marked-alt"></i> Ver Seguimiento en Vivo
                    </button>
                    <button onclick="app.completeTrip(${trip.id})" class="btn-submit" style="margin-top: 1rem;">
                        <i class="fas fa-check"></i> Marcar como Completado
                    </button>
                ` : ''}
            </div>
        `;

        document.getElementById('tripDetails').innerHTML = detailsHTML;
        this.showModal('tripModal');
    }

    completeTrip(tripId) {
        const trip = this.trips.find(t => t.id === tripId);
        if (trip) {
            trip.status = 'completed';
            this.saveTripsToStorage();
            this.closeModal('tripModal');
            this.showToast('Viaje completado', 'success');
            if (document.getElementById('tripsPage').classList.contains('active')) {
                this.loadTrips();
            }
        }
    }

    filterTrips(filter) {
        const tripCards = document.querySelectorAll('.trip-card');
        
        tripCards.forEach(card => {
            const tripId = parseInt(card.dataset.tripId);
            const trip = this.trips.find(t => t.id === tripId);
            
            if (filter === 'all' || trip.status === filter) {
                card.style.display = 'grid';
            } else {
                card.style.display = 'none';
            }
        });
    }

    loadProfile() {
        if (!this.currentUser) {
            this.navigateTo('home');
            this.showModal('loginModal');
            return;
        }

        document.getElementById('profileName').textContent = this.currentUser.name;
        document.getElementById('profileEmail').textContent = this.currentUser.email;
        document.getElementById('totalTrips').textContent = this.trips.length;
        
        document.getElementById('fullName').value = this.currentUser.name;
        document.getElementById('email').value = this.currentUser.email;
        document.getElementById('phone').value = this.currentUser.phone;
    }

    switchTab(tab) {
        // Update tabs
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Show content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`${tab}Tab`).classList.add('active');
    }

    submitDriverApplication() {
        this.showToast('Solicitud enviada. Te contactaremos pronto.', 'success');
        document.getElementById('driverForm').reset();
    }

    saveTripsToStorage() {
        localStorage.setItem('rsexpress_trips', JSON.stringify(this.trips));
    }

    loadTripsFromStorage() {
        const savedTrips = localStorage.getItem('rsexpress_trips');
        if (savedTrips) {
            this.trips = JSON.parse(savedTrips);
        } else {
            // Load demo trips
            this.trips = this.generateDemoTrips();
            this.saveTripsToStorage();
        }
    }

    generateDemoTrips() {
        const demoPickup = { lat: 19.4326, lng: -99.1332 };
        const demoDelivery = { lat: 19.4426, lng: -99.1432 };

        return [
            {
                id: 1,
                type: 'delivery',
                pickup: 'Centro Comercial Plaza',
                delivery: 'Av. Principal 123',
                pickupCoords: demoPickup,
                deliveryCoords: demoDelivery,
                date: '2025-11-18',
                time: '14:30',
                description: 'Paquete mediano, frágil',
                price: '$200',
                status: 'completed',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                trackingCode: 'RSX-ABC123',
                driver: {
                    name: 'Carlos Martínez',
                    vehicle: 'Honda Civic 2020',
                    plate: 'ABC-123',
                    rating: '4.8',
                    phone: '+1234567890'
                }
            },
            {
                id: 2,
                type: 'errand',
                pickup: 'Supermercado Central',
                delivery: 'Calle Luna 456',
                pickupCoords: { lat: 19.4226, lng: -99.1232 },
                deliveryCoords: { lat: 19.4526, lng: -99.1532 },
                date: '2025-11-17',
                time: '10:00',
                description: 'Comprar medicamentos',
                price: '$150',
                status: 'completed',
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                trackingCode: 'RSX-DEF456',
                driver: {
                    name: 'Ana García',
                    vehicle: 'Toyota Corolla 2021',
                    plate: 'DEF-456',
                    rating: '4.9',
                    phone: '+1234567891'
                }
            }
        ];
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        document.getElementById('orderDate').value = today;
        document.getElementById('orderDate').min = today;
        document.getElementById('orderTime').value = `${hours}:${minutes}`;
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // ============ DRIVER PANEL METHODS ============
    initDriverPanel() {
        this.loadAvailableJobs();
        this.updateDriverStats();
        this.initRouteMaps();
        this.setupDriverListeners();
    }

    loadAvailableJobs() {
        const jobsContainer = document.getElementById('availableJobs');
        const noJobsState = document.getElementById('noJobsState');
        
        // Generate mock available jobs
        const availableJobs = [
            {
                id: 'JOB001',
                type: 'delivery',
                pickup: 'Centro Comercial XYZ',
                delivery: 'Residencia Los Ángeles',
                distance: 3.2,
                payment: '$45.00',
                time: '15 min',
                pickupCoords: { lat: 19.4326, lng: -99.1332 },
                deliveryCoords: { lat: 19.4526, lng: -99.1132 }
            },
            {
                id: 'JOB002',
                type: 'errand',
                pickup: 'Farmacia Central',
                delivery: 'Oficina Downtown',
                distance: 2.8,
                payment: '$35.00',
                time: '12 min',
                pickupCoords: { lat: 19.4226, lng: -99.1232 },
                deliveryCoords: { lat: 19.4426, lng: -99.1432 }
            },
            {
                id: 'JOB003',
                type: 'transport',
                pickup: 'Hotel Presidente',
                delivery: 'Aeropuerto Internacional',
                distance: 12.5,
                payment: '$85.00',
                time: '35 min',
                pickupCoords: { lat: 19.4926, lng: -99.1032 },
                deliveryCoords: { lat: 19.4206, lng: -99.0232 }
            }
        ];

        if (availableJobs.length === 0) {
            noJobsState.style.display = 'block';
            jobsContainer.innerHTML = '';
            return;
        }

        jobsContainer.innerHTML = availableJobs.map(job => `
            <div class="job-card" data-job-id="${job.id}">
                <div class="job-header">
                    <span class="job-id">${job.id}</span>
                    <span class="job-payment">${job.payment}</span>
                </div>
                <div class="job-distance">
                    <div>
                        <strong>${job.distance} km</strong>
                        <span>${job.time}</span>
                    </div>
                </div>
                <div class="job-location">
                    <div class="job-location-label"><i class="fas fa-map-marker-alt"></i> Recogida</div>
                    <div class="job-location-text">${job.pickup}</div>
                </div>
                <div class="job-location">
                    <div class="job-location-label"><i class="fas fa-flag"></i> Destino</div>
                    <div class="job-location-text">${job.delivery}</div>
                </div>
                <div class="job-actions">
                    <button class="btn-accept" onclick="app.acceptJob('${job.id}')">Aceptar</button>
                    <button class="btn-decline" onclick="app.declineJob('${job.id}')">Declinar</button>
                </div>
            </div>
        `).join('');

        noJobsState.style.display = 'none';
    }

    acceptJob(jobId) {
        this.showToast(`Viaje ${jobId} aceptado!`, 'success');
        this.loadAvailableJobs(); // Reload jobs
    }

    declineJob(jobId) {
        this.showToast(`Viaje ${jobId} declinado`, 'info');
        this.loadAvailableJobs(); // Reload jobs
    }

    updateDriverStats() {
        document.getElementById('earningsToday').textContent = '$' + (Math.random() * 200 + 50).toFixed(2);
        document.getElementById('deliveriesToday').textContent = Math.floor(Math.random() * 8 + 2);
        document.getElementById('driverRating').textContent = (Math.random() * 0.5 + 4.5).toFixed(1) + ' ★';
        document.getElementById('activeHours').textContent = Math.floor(Math.random() * 6 + 2) + ' h';
        
        document.getElementById('weekEarnings').textContent = '$' + (Math.random() * 1500 + 500).toFixed(2);
        document.getElementById('monthEarnings').textContent = '$' + (Math.random() * 6000 + 2000).toFixed(2);
        document.getElementById('totalEarnings').textContent = '$' + (Math.random() * 25000 + 5000).toFixed(2);
    }

    initRouteMaps() {
        const routeMapContainer = document.getElementById('routeMap');
        if (routeMapContainer) {
            setTimeout(() => {
                if (!this.routeMap) {
                    this.routeMap = L.map('routeMap').setView([19.4326, -99.1332], 12);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors'
                    }).addTo(this.routeMap);
                }
            }, 100);
        }
    }

    setupDriverListeners() {
        const onlineBtn = document.getElementById('btnOnline');
        const offlineBtn = document.getElementById('btnOffline');
        
        if (onlineBtn) {
            onlineBtn.addEventListener('click', () => {
                onlineBtn.classList.add('active');
                offlineBtn.classList.remove('active');
                this.showToast('Conectado a la plataforma', 'success');
            });
        }

        if (offlineBtn) {
            offlineBtn.addEventListener('click', () => {
                offlineBtn.classList.add('active');
                onlineBtn.classList.remove('active');
                this.showToast('Desconectado de la plataforma', 'info');
            });
        }
    }

    // ============ HISTORY METHODS ============
    initHistoryPage() {
        this.loadHistoryTable();
        this.setupHistoryFilters();
    }

    loadHistoryTable() {
        const historyBody = document.getElementById('historyBody');
        const noHistoryState = document.getElementById('noHistoryState');

        const historyData = [
            {
                id: 'RSX-2025-001',
                origin: 'Av. Principal 123',
                destination: 'Calle Luna 456',
                date: '2025-11-22',
                cost: '$45.00',
                status: 'completed',
                driver: { name: 'Carlos López', avatar: '' },
                rating: 5
            },
            {
                id: 'RSX-2025-002',
                origin: 'Centro Comercial XYZ',
                destination: 'Residencia Los Ángeles',
                date: '2025-11-21',
                cost: '$38.50',
                status: 'completed',
                driver: { name: 'María García', avatar: '' },
                rating: 4.8
            },
            {
                id: 'RSX-2025-003',
                origin: 'Hotel Presidente',
                destination: 'Aeropuerto',
                date: '2025-11-20',
                cost: '$120.00',
                status: 'completed',
                driver: { name: 'Juan Rodríguez', avatar: '' },
                rating: 5
            },
            {
                id: 'RSX-2025-004',
                origin: 'Farmacia Central',
                destination: 'Oficina Downtown',
                date: '2025-11-19',
                cost: '$0.00',
                status: 'cancelled',
                driver: { name: '-', avatar: '' },
                rating: null
            }
        ];

        if (historyData.length === 0) {
            noHistoryState.style.display = 'block';
            historyBody.innerHTML = '';
            return;
        }

        historyBody.innerHTML = historyData.map(item => `
            <tr>
                <td><span class="order-id">${item.id}</span></td>
                <td>
                    <div class="location-route">
                        <i class="fas fa-circle-dot"></i>
                        <span>${item.origin}</span>
                        <i class="fas fa-arrow-right" style="color: var(--primary-color);"></i>
                        <i class="fas fa-flag"></i>
                        <span>${item.destination}</span>
                    </div>
                </td>
                <td>${item.date}</td>
                <td>${item.cost}</td>
                <td><span class="status-badge ${item.status}">${item.status === 'completed' ? 'Completado' : 'Cancelado'}</span></td>
                <td>
                    <div class="driver-badge">
                        <img src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Ccircle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23e74c3c%22/%3E%3Ctext x=%2250%22 y=%2260%22 font-size=%2240%22 text-anchor=%22middle%22 fill=%22white%22%3E${item.driver.name[0]}%3C/text%3E%3C/svg%3E" alt="${item.driver.name}">
                        <span>${item.driver.name}</span>
                    </div>
                </td>
                <td>
                    <div class="history-actions">
                        <button class="btn-action" title="Ver detalles" onclick="app.showHistoryDetail('${item.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn-action" title="Descargar recibo" onclick="app.downloadReceipt('${item.id}')">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        noHistoryState.style.display = 'none';
    }

    setupHistoryFilters() {
        const filterDate = document.getElementById('filterDate');
        const filterStatus = document.getElementById('filterStatus');
        const filterSearch = document.getElementById('filterSearch');

        [filterDate, filterStatus, filterSearch].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => this.loadHistoryTable());
            }
        });
    }

    showHistoryDetail(orderId) {
        this.showToast(`Abriendo detalles del pedido ${orderId}`, 'info');
    }

    downloadReceipt(orderId) {
        this.showToast(`Descargando recibo ${orderId}...`, 'success');
    }

    // ============ STATISTICS METHODS ============
    initStatsPage() {
        this.loadStatistics();
        this.setupStatsPeriodButtons();
        this.generateCharts();
        this.loadDailyActivity();
        this.setupExportButtons();
    }

    loadStatistics() {
        document.getElementById('statCompletedOrders').textContent = Math.floor(Math.random() * 150 + 50);
        document.getElementById('statTotalIncome').textContent = '$' + (Math.random() * 8000 + 2000).toFixed(2);
        document.getElementById('statAvgRating').textContent = (Math.random() * 0.5 + 4.5).toFixed(1) + '★';
        document.getElementById('statDeliveryRate').textContent = Math.floor(Math.random() * 5 + 95) + '%';
    }

    setupStatsPeriodButtons() {
        const periodBtns = document.querySelectorAll('.period-btn');
        periodBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                periodBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.loadStatistics();
                this.generateCharts();
                this.loadDailyActivity();
            });
        });
    }

    generateCharts() {
        // Mock data for charts
        const revenueData = [120, 150, 170, 140, 200, 180, 210];
        const ordersData = [8, 12, 15, 10, 18, 14, 20];

        // Revenue Chart
        const revenueCanvas = document.getElementById('revenueCanvas');
        if (revenueCanvas && revenueCanvas.getContext) {
            const ctx = revenueCanvas.getContext('2d');
            ctx.clearRect(0, 0, revenueCanvas.width, revenueCanvas.height);
            
            // Simple line chart visualization
            ctx.strokeStyle = '#e74c3c';
            ctx.lineWidth = 3;
            ctx.beginPath();
            revenueData.forEach((val, idx) => {
                const x = (idx / (revenueData.length - 1)) * revenueCanvas.width;
                const y = revenueCanvas.height - (val / 250) * revenueCanvas.height;
                if (idx === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
        }

        // Orders Chart
        const ordersCanvas = document.getElementById('ordersCanvas');
        if (ordersCanvas && ordersCanvas.getContext) {
            const ctx = ordersCanvas.getContext('2d');
            ctx.clearRect(0, 0, ordersCanvas.width, ordersCanvas.height);
            
            ctx.fillStyle = 'rgba(39, 174, 96, 0.3)';
            ctx.strokeStyle = '#27ae60';
            ctx.lineWidth = 2;
            
            ordersData.forEach((val, idx) => {
                const x = (idx / (ordersData.length - 1)) * ordersCanvas.width;
                const barWidth = ordersCanvas.width / ordersData.length * 0.6;
                const barHeight = (val / 25) * ordersCanvas.height;
                ctx.fillRect(x - barWidth / 2, ordersCanvas.height - barHeight, barWidth, barHeight);
            });
        }
    }

    loadDailyActivity() {
        const activityContainer = document.getElementById('dailyActivity');
        const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
        
        activityContainer.innerHTML = days.map(day => {
            const orders = Math.floor(Math.random() * 15 + 5);
            const income = '$' + (Math.random() * 500 + 100).toFixed(2);
            const hours = Math.floor(Math.random() * 8 + 2);
            
            return `
                <div class="activity-row">
                    <span>${day}</span>
                    <span>${orders}</span>
                    <span>${income}</span>
                    <span>${hours}h</span>
                </div>
            `;
        }).join('');
    }

    setupExportButtons() {
        const btnPDF = document.getElementById('btnExportPDF');
        const btnCSV = document.getElementById('btnExportCSV');
        const btnExcel = document.getElementById('btnExportExcel');

        if (btnPDF) {
            btnPDF.addEventListener('click', () => {
                this.showToast('Descargando reporte en PDF...', 'success');
            });
        }

        if (btnCSV) {
            btnCSV.addEventListener('click', () => {
                this.showToast('Descargando datos en CSV...', 'success');
            });
        }

        if (btnExcel) {
            btnExcel.addEventListener('click', () => {
                this.showToast('Descargando datos en Excel...', 'success');
            });
        }
    }

    /**
     * Actualizar estado de conexión en el bulb
     */
    updateConnectionStatus(status) {
        this.connectionStatus = status;
        console.log('[RSExpress] Actualizando estado de conexión a:', status);
        
        const bulb = document.getElementById('connectionBulb');
        const tooltip = document.getElementById('bulbTooltip');
        
        if (!bulb) {
            console.warn('[RSExpress] ❌ Elemento connectionBulb no encontrado');
            return;
        }
        
        // Log de clases actuales
        console.log('[RSExpress] Clases actuales del bulbo:', bulb.className);
        
        // Remover clases anteriores de forma explícita
        bulb.classList.remove('connected');
        bulb.classList.remove('connecting');
        bulb.classList.remove('disconnected');
        
        // Agregar clase según estado
        if (status === 'connected') {
            bulb.classList.add('connected');
            if (tooltip) tooltip.textContent = '🟢 Conectado';
            console.log('[RSExpress] ✅ Bulbo actualizado a CONECTADO - Clases:', bulb.className);
        } else if (status === 'connecting') {
            bulb.classList.add('connecting');
            if (tooltip) tooltip.textContent = '🟡 Conectando...';
            console.log('[RSExpress] 🟡 Bulbo actualizado a CONECTANDO - Clases:', bulb.className);
        } else {
            bulb.classList.add('disconnected');
            if (tooltip) tooltip.textContent = '🔴 Desconectado';
            console.log('[RSExpress] ❌ Bulbo actualizado a DESCONECTADO - Clases:', bulb.className);
        }
    }

    /**
     * Crear un nuevo envío vinculado con ruta y flete
     */
    createShipment(shipmentData) {
        const shipmentId = 'SHP' + Date.now();
        
        const shipment = {
            id: shipmentId,
            status: 'pending',
            pickup: shipmentData.pickup,
            delivery: shipmentData.delivery,
            weight: shipmentData.weight || 0,
            dimensions: shipmentData.dimensions || {},
            description: shipmentData.description || '',
            timestamp: new Date(),
            routeId: null,
            freightId: null,
            price: shipmentData.price || 0,
            driver: null,
            vehicle: null
        };
        
        this.shipments.set(shipmentId, shipment);
        console.log(`[Shipment] Envío creado: ${shipmentId}`);
        
        return shipment;
    }

    /**
     * Crear una ruta para un conductor
     */
    createRoute(routeData) {
        const routeId = 'RTE' + Date.now();
        
        const route = {
            id: routeId,
            driverId: routeData.driverId,
            driverName: routeData.driverName || 'Driver',
            startTime: new Date(),
            endTime: null,
            startLocation: routeData.startLocation,
            currentLocation: routeData.startLocation,
            stops: [],
            totalDistance: 0,
            estimatedTime: routeData.estimatedTime || 0,
            shipments: [],
            status: 'active',
            vehicle: routeData.vehicle || {}
        };
        
        this.routes.set(routeId, route);
        console.log(`[Route] Ruta creada: ${routeId}`);
        
        return route;
    }

    /**
     * Crear registro de flete
     */
    createFreight(freightData) {
        const freightId = 'FRT' + Date.now();
        
        const freight = {
            id: freightId,
            shipmentId: freightData.shipmentId,
            routeId: freightData.routeId,
            weight: freightData.weight,
            volume: freightData.volume,
            type: freightData.type, // 'standard', 'fragile', 'perishable', etc
            value: freightData.value || 0,
            insuranceRequired: freightData.insuranceRequired || false,
            specialHandling: freightData.specialHandling || [],
            trackingNumber: 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase(),
            createdAt: new Date()
        };
        
        this.freight.set(freightId, freight);
        console.log(`[Freight] Flete registrado: ${freightId}`);
        
        return freight;
    }

    /**
     * Vincular envío con ruta
     */
    assignShipmentToRoute(shipmentId, routeId) {
        const shipment = this.shipments.get(shipmentId);
        const route = this.routes.get(routeId);
        
        if (!shipment || !route) {
            console.error('Envío o ruta no encontrada');
            return false;
        }
        
        shipment.routeId = routeId;
        shipment.driver = route.driverName;
        shipment.vehicle = route.vehicle;
        shipment.status = 'assigned';
        
        route.shipments.push(shipmentId);
        route.stops.push({
            location: shipment.delivery,
            shipmentId: shipmentId,
            order: route.stops.length + 1
        });
        
        console.log(`[Assignment] Envío ${shipmentId} asignado a ruta ${routeId}`);
        
        this.showToast(`Envío asignado a ${route.driverName}`, 'success');
        
        return true;
    }

    /**
     * Vincular flete con envío
     */
    linkFreightToShipment(freightId, shipmentId) {
        const freight = this.freight.get(freightId);
        const shipment = this.shipments.get(shipmentId);
        
        if (!freight || !shipment) {
            console.error('Flete o envío no encontrada');
            return false;
        }
        
        freight.shipmentId = shipmentId;
        shipment.freightId = freightId;
        
        console.log(`[Linking] Flete ${freightId} vinculado a envío ${shipmentId}`);
        
        return true;
    }

    /**
     * Obtener información completa de un envío
     */
    getShipmentDetails(shipmentId) {
        const shipment = this.shipments.get(shipmentId);
        
        if (!shipment) return null;
        
        const route = shipment.routeId ? this.routes.get(shipment.routeId) : null;
        const freight = shipment.freightId ? this.freight.get(shipment.freightId) : null;
        
        return {
            shipment,
            route,
            freight,
            fullInfo: {
                id: shipment.id,
                status: shipment.status,
                pickupAddress: shipment.pickup,
                deliveryAddress: shipment.delivery,
                description: shipment.description,
                price: shipment.price,
                driver: shipment.driver,
                vehicle: shipment.vehicle,
                weight: freight?.weight || shipment.weight,
                volume: freight?.volume,
                freightType: freight?.type,
                trackingNumber: freight?.trackingNumber,
                route: route?.id,
                estimatedTime: route?.estimatedTime
            }
        };
    }

    /**
     * Obtener todas las rutas activas
     */
    getActiveRoutes() {
        const activeRoutes = [];
        this.routes.forEach(route => {
            if (route.status === 'active') {
                activeRoutes.push(route);
            }
        });
        return activeRoutes;
    }

    /**
     * Obtener envíos pendientes
     */
    getPendingShipments() {
        const pending = [];
        this.shipments.forEach(shipment => {
            if (shipment.status === 'pending') {
                pending.push(shipment);
            }
        });
        return pending;
    }

    /**
     * Actualizar estado del envío
     */
    updateShipmentStatus(shipmentId, newStatus) {
        const shipment = this.shipments.get(shipmentId);
        if (!shipment) return false;
        
        const oldStatus = shipment.status;
        shipment.status = newStatus;
        
        // Actualizar ruta si está asignada
        if (shipment.routeId) {
            const route = this.routes.get(shipment.routeId);
            if (route && newStatus === 'delivered') {
                const stopIndex = route.stops.findIndex(s => s.shipmentId === shipmentId);
                if (stopIndex !== -1) {
                    route.stops[stopIndex].status = 'completed';
                }
            }
        }
        
        console.log(`[Shipment] ${shipmentId}: ${oldStatus} → ${newStatus}`);
        
        return true;
    }

    /**
     * Obtener estadísticas de envíos y rutas
     */
    getShipmentsStats() {
        let totalShipments = this.shipments.size;
        let pendingShipments = 0;
        let assignedShipments = 0;
        let deliveredShipments = 0;
        let totalValue = 0;
        
        this.shipments.forEach(shipment => {
            if (shipment.status === 'pending') pendingShipments++;
            else if (shipment.status === 'assigned') assignedShipments++;
            else if (shipment.status === 'delivered') deliveredShipments++;
            totalValue += shipment.price;
        });
        
        let totalDistance = 0;
        let activeRoutesCount = 0;
        
        this.routes.forEach(route => {
            if (route.status === 'active') {
                activeRoutesCount++;
                totalDistance += route.totalDistance;
            }
        });
        
        return {
            totalShipments,
            pendingShipments,
            assignedShipments,
            deliveredShipments,
            totalValue,
            activeRoutes: activeRoutesCount,
            totalDistance: totalDistance.toFixed(2),
            freightRecords: this.freight.size
        };
    }

    /**
     * Inicializar Traccar para rastreo en tiempo real
     */
    async initTraccar() {
        try {
            console.log('[RSExpress] Iniciando sistema Traccar...');
            
            // Actualizar estado a conectando
            this.updateConnectionStatus('connecting');
            
            // Inicializar instancia de Traccar si existe la clase
            if (typeof TraccarIntegration !== 'undefined') {
                console.log('[RSExpress] Clase TraccarIntegration detectada');
                this.traccar = new TraccarIntegration(this.traccarApiKey);
                
                // Configurar callbacks
                this.traccar.onPositionUpdate = (position) => {
                    console.log('[RSExpress] Actualización de posición recibida');
                    this.handleTraccarPositionUpdate(position);
                };
                
                this.traccar.onDeviceStatusChange = (device) => {
                    console.log('[RSExpress] Cambio de estado de dispositivo:', device);
                    this.handleTraccarDeviceStatusChange(device);
                };
                
                this.traccar.onEventReceived = (event) => {
                    console.log('[RSExpress] Evento recibido:', event);
                    this.handleTraccarEvent(event);
                };
                
                // Inicializar conexión con timeout de 5 segundos
                console.log('[RSExpress] Intentando conectar con Traccar (timeout: 5s)...');
                
                const initPromise = this.traccar.initialize();
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout de conexión')), 5000)
                );
                
                let initialized = false;
                try {
                    initialized = await Promise.race([initPromise, timeoutPromise]);
                } catch (timeoutError) {
                    console.warn('[RSExpress] Timeout en inicialización de Traccar:', timeoutError.message);
                    initialized = false;
                }
                
                console.log('[RSExpress] Resultado de inicialización:', initialized);
                
                if (initialized) {
                    console.log('[RSExpress] Traccar inicializado exitosamente');
                    this.updateConnectionStatus('connected');
                    this.showToast('✅ Sistema de rastreo activado', 'success');
                    
                    // Cargar dispositivos disponibles
                    this.updateTraccarDevicesList();
                } else {
                    console.warn('[RSExpress] No se pudo conectar - usando modo DEMO automático');
                    // Simular modo demo como fallback
                    this.traccar.simulateDemoMode?.();
                    this.updateConnectionStatus('connected');
                    this.showToast('🟡 Modo DEMO (dispositivos simulados)', 'warning');
                    this.updateTraccarDevicesList();
                }
            } else {
                console.warn('[RSExpress] Clase TraccarIntegration NO está disponible');
                this.updateConnectionStatus('disconnected');
                this.showToast('❌ Traccar no disponible', 'error');
            }
        } catch (error) {
            console.error('[RSExpress] Error crítico en inicialización de Traccar:', error);
            this.updateConnectionStatus('disconnected');
            this.showToast('❌ Error de conexión', 'error');
        }
    }

    /**
     * Actualizar lista de dispositivos disponibles en Traccar
     */
    updateTraccarDevicesList() {
        if (!this.traccar) return;
        
        this.traccarDevices.clear();
        this.traccar.devices.forEach((device, deviceId) => {
            this.traccarDevices.set(deviceId, {
                id: device.id,
                name: device.name,
                status: device.status,
                lastUpdate: device.lastUpdate
            });
        });
        
        console.log(`[RSExpress] ${this.traccarDevices.size} dispositivos Traccar disponibles`);
    }

    /**
     * Manejar actualización de posición desde Traccar
     */
    handleTraccarPositionUpdate(position) {
        try {
            const deviceId = position.deviceId;
            const device = this.traccar.devices.get(deviceId);
            
            if (!device) return;
            
            console.log(`[RSExpress] Actualización de posición: ${device.name}`);
            
            // Si hay un rastreo activo, actualizar el mapa
            if (this.activeTracking && this.activeTracking.deviceId === deviceId) {
                this.updateTrackingMapPosition(position);
            }
            
            // Actualizar información en viajes activos
            this.updateTripWithTraccarData(deviceId, position);
        } catch (error) {
            console.error('[RSExpress] Error al procesar actualización de posición:', error);
        }
    }

    /**
     * Actualizar posición en el mapa de rastreo
     */
    updateTrackingMapPosition(position) {
        try {
            if (!this.trackingMap) return;
            
            const { latitude, longitude, speed, course, accuracy } = position;
            
            // Actualizar marcador del conductor
            if (this.driverMarker) {
                this.trackingMap.removeLayer(this.driverMarker);
            }
            
            // Crear marcador con ícono de vehículo rotado según dirección
            const vehicleIcon = L.icon({
                iconUrl: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iIzI3YWU2MCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIi8+PHBvbHlnb24gcG9pbnRzPSIyMCw1IDM1LDM1IDIwLDMwIDUsMzUiIGZpbGw9IndoaXRlIiB0cmFuc2Zvcm09InJvdGF0ZSgke2NvdXJzZSB8fCAwfSAyMCAyMCkiLz48L3N2Zz4=`,
                iconSize: [40, 40],
                iconAnchor: [20, 20],
                popupAnchor: [0, -20]
            });
            
            this.driverMarker = L.marker([latitude, longitude], { icon: vehicleIcon })
                .addTo(this.trackingMap)
                .bindPopup(`
                    <div class="popup-content">
                        <p><strong>Velocidad:</strong> ${(speed || 0).toFixed(1)} km/h</p>
                        <p><strong>Precisión:</strong> ${(accuracy || 0).toFixed(1)} m</p>
                    </div>
                `);
            
            // Centrar mapa en la posición actual
            this.trackingMap.setView([latitude, longitude], 15);
            
            // Actualizar información de distancia y tiempo
            if (this.pickupCoords && this.deliveryCoords) {
                const distToDelivery = this.traccar.calculateDistance(
                    latitude, longitude,
                    this.deliveryCoords.lat, this.deliveryCoords.lng
                );
                
                document.getElementById('trackingDistance').textContent = `${distToDelivery.toFixed(2)} km`;
                
                // Estimar tiempo (velocidad promedio 30 km/h)
                const estimatedTime = Math.round((distToDelivery / 30) * 60);
                document.getElementById('trackingTime').textContent = `${estimatedTime} min`;
            }
        } catch (error) {
            console.error('[RSExpress] Error al actualizar posición en mapa:', error);
        }
    }

    /**
     * Manejar cambio de estado de dispositivo
     */
    handleTraccarDeviceStatusChange(device) {
        console.log(`[RSExpress] Estado de dispositivo ${device.name}: ${device.status}`);
        
        // Actualizar en interfaz
        const statusElement = document.querySelector(`[data-device-id="${device.id}"] .device-status`);
        if (statusElement) {
            statusElement.textContent = device.status === 'online' ? 'En línea' : 'Desconectado';
            statusElement.className = `device-status ${device.status}`;
        }
    }

    /**
     * Manejar evento recibido desde Traccar
     */
    handleTraccarEvent(event) {
        console.log('[RSExpress] Evento Traccar:', event);
        
        // Tipos de eventos comunes
        const eventMessages = {
            'deviceOnline': '✓ Dispositivo en línea',
            'deviceOffline': '✗ Dispositivo desconectado',
            'deviceMoving': '▶ Vehículo en movimiento',
            'deviceStopped': '⏸ Vehículo detenido',
            'geofenceEnter': '📍 Entrada a zona',
            'geofenceExit': '📍 Salida de zona',
            'speedExceeded': '⚠ Velocidad excedida',
            'maintenanceRequired': '🔧 Mantenimiento requerido'
        };
        
        const message = eventMessages[event.type] || event.type;
        this.showToast(message, 'info');
    }

    /**
     * Actualizar viaje con datos de Traccar
     */
    updateTripWithTraccarData(deviceId, position) {
        try {
            // Buscar viaje activo asociado a este dispositivo
            const activeTrip = this.trips.find(trip => 
                trip.status === 'active' && trip.driverTraccarId === deviceId
            );
            
            if (activeTrip) {
                activeTrip.lastPosition = {
                    lat: position.latitude,
                    lng: position.longitude,
                    speed: position.speed,
                    timestamp: position.fixTime
                };
                
                // Guardar cambios
                this.saveTripsToStorage();
            }
        } catch (error) {
            console.error('[RSExpress] Error al actualizar viaje con datos de Traccar:', error);
        }
    }

    /**
     * Iniciar rastreo de un viaje con Traccar
     */
    async startTraccarTracking(trip, deviceId) {
        try {
            if (!this.traccar) {
                this.showToast('Sistema de rastreo no disponible', 'error');
                return false;
            }
            
            // Obtener posición inicial
            const position = await this.traccar.getDevicePosition(deviceId);
            if (!position) {
                this.showToast('No se pudo obtener la posición del vehículo', 'error');
                return false;
            }
            
            this.activeTracking = {
                tripId: trip.id,
                deviceId: deviceId,
                startTime: new Date(),
                positions: [position]
            };
            
            // Mostrar mapa de rastreo
            this.initTrackingMap(position);
            
            console.log('[RSExpress] Rastreo con Traccar iniciado para dispositivo:', deviceId);
            return true;
        } catch (error) {
            console.error('[RSExpress] Error al iniciar rastreo con Traccar:', error);
            return false;
        }
    }

    /**
     * Detener rastreo
     */
    stopTraccarTracking() {
        if (this.activeTracking && this.traccar) {
            const stats = this.traccar.calculateDrivingStats(this.activeTracking.positions);
            
            console.log('[RSExpress] Estadísticas de rastreo:', stats);
            
            this.activeTracking = null;
            
            // Mostrar resumen
            this.showToast(
                `Viaje completado: ${stats.distance} km en ${stats.duration} min`,
                'success'
            );
        }
    }

    /**
     * Obtener reporte de actividad desde Traccar
     */
    async getTraccarActivityReport(deviceId, from, to) {
        try {
            if (!this.traccar) return null;
            
            const report = await this.traccar.generateActivityReport(deviceId, from, to);
            return report;
        } catch (error) {
            console.error('[RSExpress] Error al obtener reporte de actividad:', error);
            return null;
        }
    }

    /**
     * Obtener estadísticas de conducción desde Traccar
     */
    async getTraccarDrivingStats(deviceId, from, to) {
        try {
            if (!this.traccar) return null;
            
            const positions = await this.traccar.getPositionHistory(deviceId, from, to);
            const stats = this.traccar.calculateDrivingStats(positions);
            
            return stats;
        } catch (error) {
            console.error('[RSExpress] Error al obtener estadísticas de conducción:', error);
            return null;
        }
    }

    /**
     * Verificar estado de conexión de Traccar
     */
    getTraccarStatus() {
        if (!this.traccar) {
            return {
                connected: false,
                message: 'No disponible'
            };
        }
        
        return this.traccar.getConnectionStatus();
    }

    /**
     * Cargar y mostrar unidades de flota desde Traccar o DriverFleetPanel
     */
    async loadFleet() {
        console.log('[Fleet] Cargando unidades de flota...');
        
        try {
            let devices = [];

            // Intentar usar DriverFleetPanel primero (si está disponible)
            if (window.driverFleetPanel && window.driverFleetPanel.drivers.size > 0) {
                console.log('[Fleet] Usando DriverFleetPanel');
                const snapshot = getFleetSnapshot();
                // Transformar drivers a formato esperado
                devices = snapshot.drivers.map(driver => ({
                    id: driver.id,
                    name: driver.name,
                    status: driver.status === 'activo' ? 'online' : 'offline',
                    lastUpdate: new Date().toISOString(),
                    latitude: driver.lat,
                    longitude: driver.lon,
                    speed: 0,
                    vehicle: driver.vehicle,
                    phone: driver.phone,
                    completedDeliveries: driver.completedDeliveries,
                    efficiency: driver.efficiency
                })) || [];
            }
            // Si no, usar Traccar
            else if (this.traccar) {
                console.log('[Fleet] Usando Traccar');
                devices = this.traccar.getDevices() || [];
            }
            else {
                console.error('[Fleet] Ni DriverFleetPanel ni Traccar disponibles');
                this.displayFleetEmpty();
                return;
            }
            
            if (!devices || devices.length === 0) {
                console.warn('[Fleet] No hay dispositivos disponibles');
                this.displayFleetEmpty();
                return;
            }

            console.log(`[Fleet] ${devices.length} dispositivo(s) encontrado(s)`, devices);

            // Actualizar estadísticas
            this.updateFleetStats(devices);

            // Mostrar unidades en grid
            this.displayFleetUnits(devices);

        } catch (error) {
            console.error('[Fleet] Error cargando flota:', error);
            this.displayFleetError();
        }
    }

    /**
     * Actualizar estadísticas de flota
     */
    updateFleetStats(devices) {
        try {
            const onlineUnits = devices.filter(d => d.status === 'online').length;
            const offlineUnits = devices.length - onlineUnits;

            const totalElement = document.querySelector('[data-stat="total"]');
            const onlineElement = document.querySelector('[data-stat="online"]');
            const offlineElement = document.querySelector('[data-stat="offline"]');

            if (totalElement) totalElement.textContent = devices.length;
            if (onlineElement) onlineElement.textContent = onlineUnits;
            if (offlineElement) offlineElement.textContent = offlineUnits;

            console.log(`[Fleet] Estadísticas actualizadas: Total=${devices.length}, Online=${onlineUnits}, Offline=${offlineUnits}`);

        } catch (error) {
            console.error('[Fleet] Error actualizando estadísticas:', error);
        }
    }

    /**
     * Mostrar unidades de flota en grid
     */
    displayFleetUnits(devices) {
        const fleetList = document.getElementById('fleet-list');
        
        if (!fleetList) {
            console.error('[Fleet] Elemento fleet-list no encontrado');
            return;
        }

        // Limpiar contenido previo
        fleetList.innerHTML = '';

        // Crear tarjeta para cada dispositivo
        devices.forEach(device => {
            const card = this.createFleetCard(device);
            fleetList.appendChild(card);
        });

        console.log(`[Fleet] ${devices.length} tarjeta(s) de vehículo renderizadas`);
    }

    /**
     * Crear tarjeta de vehículo
     */
    createFleetCard(device) {
        const card = document.createElement('div');
        card.className = 'fleet-card';
        card.setAttribute('data-device-id', device.id);

        const isOnline = device.status === 'online';
        const lastUpdate = device.lastUpdate ? new Date(device.lastUpdate).toLocaleTimeString() : 'N/A';
        const speed = device.speed || 0;

        const statusClass = isOnline ? 'online' : 'offline';
        const statusText = isOnline ? '🟢 En línea' : '🔴 Desconectado';

        card.innerHTML = `
            <div class="fleet-card-header">
                <div class="fleet-unit-name">${device.name}</div>
                <div class="fleet-unit-status ${statusClass}">
                    <span class="status-dot"></span>
                    ${statusText}
                </div>
            </div>

            <div class="fleet-info">
                <div class="fleet-info-row">
                    <span class="fleet-info-label">ID Dispositivo:</span>
                    <span class="fleet-info-value">#${device.id}</span>
                </div>
                <div class="fleet-info-row">
                    <span class="fleet-info-label">Velocidad:</span>
                    <span class="fleet-info-value">${speed} km/h</span>
                </div>
                <div class="fleet-info-row">
                    <span class="fleet-info-label">Posición:</span>
                    <span class="fleet-info-value">${device.latitude ? `${device.latitude.toFixed(4)}, ${device.longitude.toFixed(4)}` : 'Sin datos'}</span>
                </div>
                <div class="fleet-info-row">
                    <span class="fleet-info-label">Última actualización:</span>
                    <span class="fleet-info-value">${lastUpdate}</span>
                </div>
                ${device.odometer ? `
                <div class="fleet-info-row">
                    <span class="fleet-info-label">Odómetro:</span>
                    <span class="fleet-info-value">${(device.odometer / 1000).toFixed(2)} km</span>
                </div>
                ` : ''}
            </div>

            <div class="fleet-actions">
                <button class="fleet-btn" onclick="app.focusDeviceOnMap(${device.id})">
                    <i class="fas fa-map-marker-alt"></i> Ver en Mapa
                </button>
                <button class="fleet-btn secondary" onclick="app.showDeviceDetails(${device.id})">
                    <i class="fas fa-info-circle"></i> Detalles
                </button>
            </div>
        `;

        return card;
    }

    /**
     * Enfocar dispositivo en el mapa
     */
    focusDeviceOnMap(deviceId) {
        console.log(`[Fleet] Enfocando dispositivo ${deviceId} en mapa`);
        
        try {
            // Cambiar a pestaña de inicio para ver el mapa
            const homeLink = document.querySelector('a[onclick="app.showPage(\'homePage\')"]');
            if (homeLink) homeLink.click();

            // Buscar el dispositivo
            if (!this.traccar) return;

            const devices = this.traccar.devices;
            const device = devices.find(d => d.id === deviceId);

            if (device && device.latitude && device.longitude && this.map) {
                // Centrar mapa en dispositivo
                this.map.setView([device.latitude, device.longitude], 16);
                
                // Crear marcador visible
                if (this.deviceMarkers && this.deviceMarkers[deviceId]) {
                    this.deviceMarkers[deviceId].openPopup();
                }

                console.log(`[Fleet] Mapa enfocado en dispositivo ${device.name}`);
            }
        } catch (error) {
            console.error('[Fleet] Error enfocando en mapa:', error);
        }
    }

    /**
     * Mostrar detalles del dispositivo
     */
    showDeviceDetails(deviceId) {
        console.log(`[Fleet] Mostrando detalles del dispositivo ${deviceId}`);
        
        try {
            if (!this.traccar) return;

            const devices = this.traccar.devices;
            const device = devices.find(d => d.id === deviceId);

            if (!device) {
                console.error('[Fleet] Dispositivo no encontrado');
                return;
            }

            // Crear modal con detalles
            const modal = document.createElement('div');
            modal.className = 'modal active';
            modal.id = 'deviceDetailsModal';
            modal.innerHTML = `
                <div class="modal-content" style="max-width: 500px;">
                    <div class="modal-header">
                        <h2>${device.name}</h2>
                        <button class="close-modal" onclick="document.getElementById('deviceDetailsModal').remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div style="display: grid; gap: 1rem;">
                            <div>
                                <p style="margin: 0.5rem 0; color: #888; font-size: 0.9rem;">INFORMACIÓN DEL VEHÍCULO</p>
                                <p style="margin: 0.25rem 0;"><strong>ID Dispositivo:</strong> #${device.id}</p>
                                <p style="margin: 0.25rem 0;"><strong>Estado:</strong> 
                                    <span style="color: ${device.status === 'online' ? '#27ae60' : '#e74c3c'};">
                                        ${device.status === 'online' ? '🟢 En línea' : '🔴 Desconectado'}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <p style="margin: 0.5rem 0; color: #888; font-size: 0.9rem;">UBICACIÓN ACTUAL</p>
                                <p style="margin: 0.25rem 0;"><strong>Latitud:</strong> ${device.latitude ? device.latitude.toFixed(6) : 'N/A'}</p>
                                <p style="margin: 0.25rem 0;"><strong>Longitud:</strong> ${device.longitude ? device.longitude.toFixed(6) : 'N/A'}</p>
                                <p style="margin: 0.25rem 0;"><strong>Velocidad:</strong> ${device.speed || 0} km/h</p>
                            </div>
                            <div>
                                <p style="margin: 0.5rem 0; color: #888; font-size: 0.9rem;">ESTADÍSTICAS</p>
                                <p style="margin: 0.25rem 0;"><strong>Odómetro:</strong> ${device.odometer ? (device.odometer / 1000).toFixed(2) : 'N/A'} km</p>
                                <p style="margin: 0.25rem 0;"><strong>Última actualización:</strong> ${device.lastUpdate ? new Date(device.lastUpdate).toLocaleString() : 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn-secondary" onclick="document.getElementById('deviceDetailsModal').remove()">Cerrar</button>
                        <button class="btn-primary" onclick="app.focusDeviceOnMap(${device.id}); document.getElementById('deviceDetailsModal').remove();">
                            Ver en Mapa
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);

            console.log(`[Fleet] Detalles mostrados para ${device.name}`);

        } catch (error) {
            console.error('[Fleet] Error mostrando detalles:', error);
        }
    }

    /**
     * Mostrar mensaje cuando no hay unidades
     */
    displayFleetEmpty() {
        const fleetList = document.getElementById('fleet-list');
        
        if (!fleetList) return;

        fleetList.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
                <i class="fas fa-inbox" style="font-size: 3rem; color: var(--gray-light); margin-bottom: 1rem; display: block;"></i>
                <p style="color: var(--gray-light); font-size: 1.1rem;">No hay unidades disponibles en tu flota</p>
                <p style="color: var(--gray-light); font-size: 0.9rem; margin-top: 0.5rem;">Agrega dispositivos en Traccar para comenzar</p>
            </div>
        `;
    }

    /**
     * Mostrar mensaje de error
     */
    displayFleetError() {
        const fleetList = document.getElementById('fleet-list');
        
        if (!fleetList) return;

        fleetList.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem 1rem;">
                <i class="fas fa-exclamation-circle" style="font-size: 3rem; color: var(--primary-color); margin-bottom: 1rem; display: block;"></i>
                <p style="color: var(--primary-color); font-size: 1.1rem;">Error cargando flota</p>
                <p style="color: var(--gray-light); font-size: 0.9rem; margin-top: 0.5rem;">Intenta nuevamente más tarde</p>
            </div>
        `;
    }

    /**
     * Cargar datos del admin dashboard
     */
    loadAdminDashboard() {
        console.log('[Admin] Cargando dashboard administrativo...');
        
        // Actualizar resúmenes
        this.updateAdminSummary();
        
        // Cargar datos de entregas
        this.loadAdminDeliveries();
        
        // Setup tab switching
        this.setupAdminTabs();
    }

    /**
     * Actualizar resumen de admin
     */
    updateAdminSummary() {
        // Datos simulados para demostración
        const summary = {
            totalDeliveries: this.trips.length,
            activeClients: 3,
            onlineDrivers: 2,
            todayRevenue: this.trips.length * 15
        };

        document.getElementById('adminTotalDeliveries').textContent = summary.totalDeliveries;
        document.getElementById('adminActiveClients').textContent = summary.activeClients;
        document.getElementById('adminOnlineDrivers').textContent = summary.onlineDrivers;
        document.getElementById('adminTodayRevenue').textContent = `$${summary.todayRevenue.toFixed(2)}`;
    }

    /**
     * Cargar entregas en el admin dashboard
     */
    loadAdminDeliveries() {
        const deliveriesList = document.getElementById('deliveriesList');
        
        if (!deliveriesList) return;

        if (this.trips.length === 0) {
            deliveriesList.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--gray-light);">No hay entregas registradas</div>';
            return;
        }

        const html = this.trips.map((trip, index) => `
            <div class="list-item">
                <span>#${index + 1001}</span>
                <span>${trip.pickupLocation || 'N/A'}</span>
                <span>Conductor ${index + 1}</span>
                <span>Completado</span>
                <span>${new Date(trip.date || Date.now()).toLocaleDateString()}</span>
                <button class="item-action-btn" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        `).join('');

        deliveriesList.innerHTML = html;
    }

    /**
     * Setup admin tabs functionality
     */
    setupAdminTabs() {
        const adminTabBtns = document.querySelectorAll('.admin-tab-btn');
        
        adminTabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = btn.getAttribute('data-tab');
                this.switchAdminTab(tabName);
            });
        });
    }

    /**
     * Cambiar tab del admin
     */
    switchAdminTab(tabName) {
        // Desactivar todos los tabs
        document.querySelectorAll('.admin-tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // Activar tab seleccionado
        const tabContent = document.getElementById(`tab-${tabName}`);
        const tabBtn = document.querySelector(`[data-tab="${tabName}"]`);
        
        if (tabContent) {
            tabContent.classList.add('active');
        }
        if (tabBtn) {
            tabBtn.classList.add('active');
        }

        // Cargar datos específicos del tab
        switch(tabName) {
            case 'clients':
                this.loadAdminClients();
                break;
            case 'drivers':
                this.loadAdminDrivers();
                break;
            case 'units':
                this.loadAdminUnits();
                break;
        }

        console.log(`[Admin] Tab cambiado a: ${tabName}`);
    }

    /**
     * Cargar clientes en admin dashboard
     */
    loadAdminClients() {
        const clientsList = document.getElementById('clientsList');
        
        if (!clientsList) return;

        const mockClients = [
            { name: 'Andrés Rodríguez', email: 'andres@rsexpress.com', phone: '555-0101', deliveries: 5, status: 'active' },
            { name: 'Juan García', email: 'juan@example.com', phone: '555-0102', deliveries: 12, status: 'active' },
            { name: 'María López', email: 'maria@example.com', phone: '555-0103', deliveries: 8, status: 'inactive' }
        ];

        const html = mockClients.map(client => `
            <div class="list-item">
                <span>${client.name}</span>
                <span>${client.email}</span>
                <span>${client.phone}</span>
                <span>${client.deliveries}</span>
                <span><span class="status-badge ${client.status}">${client.status === 'active' ? 'Activo' : 'Inactivo'}</span></span>
                <button class="item-action-btn" title="Ver perfil">
                    <i class="fas fa-user"></i>
                </button>
            </div>
        `).join('');

        clientsList.innerHTML = html;
    }

    /**
     * Cargar conductores en admin dashboard
     */
    loadAdminDrivers() {
        const driversList = document.getElementById('driversList');
        
        if (!driversList) return;

        const mockDrivers = [
            { name: 'Fulgencio González', vehicle: 'Moto Honda', status: 'online', deliveries: 24, rating: '4.8★' },
            { name: 'Carlos Rodríguez', vehicle: 'Moto Yamaha', status: 'online', deliveries: 18, rating: '4.6★' },
            { name: 'Luis Martínez', vehicle: 'Moto Suzuki', status: 'offline', deliveries: 15, rating: '4.5★' }
        ];

        const html = mockDrivers.map(driver => `
            <div class="list-item">
                <span>${driver.name}</span>
                <span>${driver.vehicle}</span>
                <span><span class="status-badge ${driver.status === 'online' ? 'active' : 'inactive'}">${driver.status === 'online' ? 'En Línea' : 'Offline'}</span></span>
                <span>${driver.deliveries}</span>
                <span>${driver.rating}</span>
                <button class="item-action-btn" title="Ver perfil">
                    <i class="fas fa-user"></i>
                </button>
            </div>
        `).join('');

        driversList.innerHTML = html;
    }

    /**
     * Cargar unidades en admin dashboard
     */
    loadAdminUnits() {
        const unitsList = document.getElementById('unitsList');
        
        if (!unitsList) return;

        const mockUnits = [
            { id: 'MOT001', model: 'Honda CB500', driver: 'Fulgencio González', km: 12450, fuel: '85%', maintenance: 'OK' },
            { id: 'MOT002', model: 'Yamaha YZF', driver: 'Carlos Rodríguez', km: 8920, fuel: '60%', maintenance: 'Revisión próxima' },
            { id: 'MOT003', model: 'Suzuki GSX', driver: 'Luis Martínez', km: 15280, fuel: '40%', maintenance: 'Vencida' }
        ];

        const html = mockUnits.map(unit => `
            <div class="list-item">
                <span>${unit.id}</span>
                <span>${unit.model}</span>
                <span>${unit.driver}</span>
                <span>${unit.km} km</span>
                <span>${unit.fuel}</span>
                <span><span class="status-badge ${unit.maintenance === 'OK' ? 'active' : 'pending'}">${unit.maintenance}</span></span>
                <button class="item-action-btn" title="Ver detalles">
                    <i class="fas fa-tools"></i>
                </button>
            </div>
        `).join('');

        unitsList.innerHTML = html;
    }

    /**
     * Cargar página de usuarios Odoo
     */
    loadOdooUsersPage() {
        console.log('[Odoo] Cargando página de usuarios...');
        this.setupOdooUsersUI();
    }

    /**
     * Setup UI para usuarios Odoo
     */
    setupOdooUsersUI() {
        const btnSync = document.getElementById('btnSyncOdooUsers');
        
        btnSync?.addEventListener('click', () => {
            this.syncOdooUsers();
        });
    }

    /**
     * Sincronizar usuarios desde Odoo 19
     */
    async syncOdooUsers() {
        console.log('[Odoo] Iniciando sincronización...');
        
        const btnSync = document.getElementById('btnSyncOdooUsers');
        const statusEl = document.getElementById('odooConnectionStatus');
        const countEl = document.getElementById('odooUserCount');
        const containerEl = document.getElementById('odooUsersContainer');

        // Mostrar estado de sincronización
        btnSync.disabled = true;
        btnSync.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sincronizando...';
        statusEl.textContent = '🟡 Sincronizando...';

        try {
            // Validar que odoo está disponible
            if (!window.odoo) {
                throw new Error('Odoo integration no disponible');
            }

            // Conectar a Odoo
            const connected = await window.odoo.connect();
            
            if (!connected) {
                throw new Error('No se pudo conectar a Odoo');
            }

            // Actualizar estado
            statusEl.textContent = '🟢 Conectado';
            countEl.textContent = window.odoo.users.length;

            // Mostrar tabla de usuarios
            const tableHtml = window.odoo.getUsersTable();
            containerEl.innerHTML = tableHtml;

            console.log('[Odoo] ✓ Sincronización completada');
            this.showToast('Usuarios sincronizados correctamente', 'success');

        } catch (error) {
            console.error('[Odoo] ✗ Error:', error);
            statusEl.textContent = '🔴 Error de conexión';
            containerEl.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: var(--primary-color);">
                    <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                    <p><strong>Error de conexión</strong></p>
                    <p style="font-size: 0.9rem; margin-top: 0.5rem;">${error.message}</p>
                    <p style="font-size: 0.85rem; margin-top: 1rem; color: var(--gray-light);">
                        Verifica que resexpress.online esté disponible
                    </p>
                </div>
            `;
            this.showToast('Error sincronizando usuarios: ' + error.message, 'error');

        } finally {
            btnSync.disabled = false;
            btnSync.innerHTML = '<i class="fas fa-sync-alt"></i> Sincronizar';
        }
    }
}

// Initialize app
const app = new RSExpressApp();
window.app = app;  // Hacer accesible desde consola

console.log('[RSExpress] Aplicación inicializada. Acceso en window.app');

// Service Worker for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed'));
    });
}
