// RS Express - Main Application Logic
class RSExpressApp {
    constructor() {
        this.currentUser = null;
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
        
        this.init();
    }

    init() {
        this.initMap();
        this.setupEventListeners();
        this.loadTripsFromStorage();
        this.checkLoginState();
        this.setDefaultDate();
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

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

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

        // Simulate login (in real app, call API)
        const user = {
            id: Date.now(),
            name: email.split('@')[0],
            email: email,
            phone: '+1234567890',
            avatar: null
        };

        this.currentUser = user;
        localStorage.setItem('rsexpress_user', JSON.stringify(user));
        
        this.updateUIForLoggedInUser();
        this.closeModal('loginModal');
        this.showToast(`¡Bienvenido, ${user.name}!`, 'success');
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
        localStorage.removeItem('rsexpress_user');
        this.updateUIForLoggedInUser();
        this.navigateTo('home');
        this.showToast('Sesión cerrada', 'success');
    }

    checkLoginState() {
        const savedUser = localStorage.getItem('rsexpress_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.updateUIForLoggedInUser();
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

        if (this.currentUser) {
            loginBtn.style.display = 'none';
            userProfile.style.display = 'flex';
            document.getElementById('userName').textContent = this.currentUser.name;
            
            if (this.currentUser.avatar) {
                document.getElementById('userAvatar').src = this.currentUser.avatar;
            }
        } else {
            loginBtn.style.display = 'block';
            userProfile.style.display = 'none';
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
}

// Initialize app
const app = new RSExpressApp();

// Service Worker for PWA (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered'))
            .catch(err => console.log('Service Worker registration failed'));
    });
}
