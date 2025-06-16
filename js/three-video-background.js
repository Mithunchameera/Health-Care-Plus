/**
 * Three.js Video Background for Healthcare E-Channelling
 * Creates animated medical-themed 3D background with theme awareness
 */

import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

class HealthcareVideoBackground {
    constructor(container) {
        this.container = container;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        this.medicalIcons = [];
        this.animationId = null;
        this.time = 0;
        this.currentTheme = 'light';
        this.themeColors = this.getThemeColors();
        
        this.init();
        this.setupThemeWatcher();
    }
    
    getThemeColors() {
        return {
            light: {
                background: new THREE.Color(0xf8fafc),
                particles: [
                    new THREE.Color(0x0ea5e9), // Blue
                    new THREE.Color(0x10b981), // Green
                    new THREE.Color(0x8b5cf6), // Purple
                    new THREE.Color(0x06b6d4)  // Cyan
                ],
                medical: new THREE.Color(0x10b981),
                ambient: new THREE.Color(0x94a3b8),
                lights: [
                    { color: 0x10b981, intensity: 0.8 },
                    { color: 0x0ea5e9, intensity: 0.6 }
                ]
            },
            dark: {
                background: new THREE.Color(0x0f172a),
                particles: [
                    new THREE.Color(0x38bdf8), // Light blue
                    new THREE.Color(0x34d399), // Light green
                    new THREE.Color(0xa78bfa), // Light purple
                    new THREE.Color(0x22d3ee)  // Light cyan
                ],
                medical: new THREE.Color(0x34d399),
                ambient: new THREE.Color(0x1e293b),
                lights: [
                    { color: 0x34d399, intensity: 1.2 },
                    { color: 0x38bdf8, intensity: 1.0 }
                ]
            },
            morning: {
                background: new THREE.Color(0xfef3c7),
                particles: [
                    new THREE.Color(0xf59e0b), // Amber
                    new THREE.Color(0xef4444), // Red
                    new THREE.Color(0xf97316), // Orange
                    new THREE.Color(0xeab308)  // Yellow
                ],
                medical: new THREE.Color(0xf59e0b),
                ambient: new THREE.Color(0xfbbf24),
                lights: [
                    { color: 0xf59e0b, intensity: 1.0 },
                    { color: 0xef4444, intensity: 0.8 }
                ]
            },
            afternoon: {
                background: new THREE.Color(0xdbeafe),
                particles: [
                    new THREE.Color(0x3b82f6), // Blue
                    new THREE.Color(0x06b6d4), // Cyan
                    new THREE.Color(0x8b5cf6), // Purple
                    new THREE.Color(0x10b981)  // Green
                ],
                medical: new THREE.Color(0x3b82f6),
                ambient: new THREE.Color(0x60a5fa),
                lights: [
                    { color: 0x3b82f6, intensity: 1.0 },
                    { color: 0x10b981, intensity: 0.9 }
                ]
            },
            evening: {
                background: new THREE.Color(0x1e1b4b),
                particles: [
                    new THREE.Color(0x8b5cf6), // Purple
                    new THREE.Color(0x06b6d4), // Cyan
                    new THREE.Color(0x10b981), // Green
                    new THREE.Color(0x3b82f6)  // Blue
                ],
                medical: new THREE.Color(0x8b5cf6),
                ambient: new THREE.Color(0x312e81),
                lights: [
                    { color: 0x8b5cf6, intensity: 1.1 },
                    { color: 0x06b6d4, intensity: 0.9 }
                ]
            },
            night: {
                background: new THREE.Color(0x0c0a1a),
                particles: [
                    new THREE.Color(0x1e293b), // Dark blue
                    new THREE.Color(0x374151), // Gray
                    new THREE.Color(0x1f2937), // Dark gray
                    new THREE.Color(0x111827)  // Very dark
                ],
                medical: new THREE.Color(0x475569),
                ambient: new THREE.Color(0x1e293b),
                lights: [
                    { color: 0x475569, intensity: 0.5 },
                    { color: 0x1e293b, intensity: 0.3 }
                ]
            }
        };
    }

    init() {
        this.setupScene();
        this.createParticles();
        this.createMedicalElements();
        this.setupLighting();
        this.animate();
        this.handleResize();
    }
    
    setupThemeWatcher() {
        // Watch for theme changes
        const observer = new MutationObserver(() => {
            this.updateTheme();
        });
        
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
        
        // Listen for theme manager events
        window.addEventListener('themeChanged', () => {
            this.updateTheme();
        });
        
        // Check for theme changes periodically for time-based themes
        setInterval(() => {
            this.updateTheme();
        }, 60000); // Check every minute
        
        // Initial theme detection
        this.updateTheme();
    }

    detectCurrentTheme() {
        // Get current time for time-based themes
        const now = new Date();
        const hour = now.getHours();
        
        // Check ThemeManager first
        if (window.ThemeManager) {
            const themeInfo = window.ThemeManager.getCurrentTimeInfo();
            if (themeInfo && themeInfo.period) {
                return themeInfo.period;
            }
            
            const currentTheme = window.ThemeManager.getCurrentTheme();
            if (currentTheme === 'auto') {
                // Determine time-based theme
                if (hour >= 6 && hour < 12) return 'morning';
                if (hour >= 12 && hour < 17) return 'afternoon';
                if (hour >= 17 && hour < 21) return 'evening';
                return 'night';
            } else {
                return currentTheme;
            }
        }
        
        // Fallback to data-theme attribute
        const htmlElement = document.documentElement;
        const dataTheme = htmlElement.getAttribute('data-theme');
        if (dataTheme && dataTheme !== 'auto') {
            return dataTheme;
        }
        
        // Auto-detect based on computed styles
        const bgColor = window.getComputedStyle(document.body).backgroundColor;
        const isDark = this.isColorDark(bgColor);
        return isDark ? 'dark' : 'light';
    }
    
    isColorDark(color) {
        // Parse RGB values and calculate luminance
        const rgb = color.match(/\d+/g);
        if (!rgb) return false;
        
        const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
        return luminance < 0.5;
    }

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.updateSceneBackground();
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.offsetWidth / this.container.offsetHeight,
            0.1,
            1000
        );
        this.camera.position.z = 30;
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true,
            antialias: true 
        });
        this.renderer.setSize(this.container.offsetWidth, this.container.offsetHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.container.appendChild(this.renderer.domElement);
    }
    
    updateSceneBackground() {
        const theme = this.detectCurrentTheme();
        const colors = this.themeColors[theme] || this.themeColors.light;
        this.scene.background = colors.background.clone();
        this.currentTheme = theme;
    }
    
    createParticles() {
        const particleCount = 200;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        this.updateParticleColors(colors, particleCount);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Random positions
            positions[i3] = (Math.random() - 0.5) * 100;
            positions[i3 + 1] = (Math.random() - 0.5) * 100;
            positions[i3 + 2] = (Math.random() - 0.5) * 100;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }
    
    updateParticleColors(colors, particleCount) {
        const theme = this.detectCurrentTheme();
        const themeColors = this.themeColors[theme] || this.themeColors.light;
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const color = themeColors.particles[Math.floor(Math.random() * themeColors.particles.length)];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }
    }
    
    updateTheme() {
        const newTheme = this.detectCurrentTheme();
        if (newTheme !== this.currentTheme) {
            this.currentTheme = newTheme;
            this.updateSceneBackground();
            this.updateMaterialColors();
        }
    }
    
    updateMaterialColors() {
        const theme = this.detectCurrentTheme();
        const colors = this.themeColors[theme] || this.themeColors.light;
        
        // Update particle colors
        if (this.particles && this.particles.geometry) {
            const colorAttribute = this.particles.geometry.getAttribute('color');
            if (colorAttribute) {
                this.updateParticleColors(colorAttribute.array, colorAttribute.count);
                colorAttribute.needsUpdate = true;
            }
        }
        
        // Update medical cross colors
        this.medicalIcons.forEach(cross => {
            cross.children.forEach(mesh => {
                if (mesh.material) {
                    mesh.material.color = colors.medical.clone();
                }
            });
        });
        
        // Update DNA helix colors
        if (this.dnaHelix && this.dnaHelix.geometry) {
            const helixColorAttribute = this.dnaHelix.geometry.getAttribute('color');
            if (helixColorAttribute) {
                this.updateDNAColors(helixColorAttribute.array, helixColorAttribute.count, colors);
                helixColorAttribute.needsUpdate = true;
            }
        }
        
        // Update heartbeat colors
        if (this.heartbeatWave && this.heartbeatWave.geometry) {
            const waveColorAttribute = this.heartbeatWave.geometry.getAttribute('color');
            if (waveColorAttribute) {
                this.updateHeartbeatColors(waveColorAttribute.array, waveColorAttribute.count, colors);
                waveColorAttribute.needsUpdate = true;
            }
        }
        
        // Update lighting
        this.updateLighting(colors);
    }
    
    updateDNAColors(colors, count, themeColors) {
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            const color = i % 2 === 0 ? themeColors.particles[0] : themeColors.particles[1];
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }
    }
    
    updateHeartbeatColors(colors, count, themeColors) {
        const heartColor = themeColors.medical;
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            colors[i3] = heartColor.r;
            colors[i3 + 1] = heartColor.g;
            colors[i3 + 2] = heartColor.b;
        }
    }
    
    updateLighting(colors) {
        // Remove existing lights
        const lightsToRemove = [];
        this.scene.traverse((child) => {
            if (child instanceof THREE.PointLight) {
                lightsToRemove.push(child);
            }
        });
        lightsToRemove.forEach(light => this.scene.remove(light));
        
        // Add new themed lights
        colors.lights.forEach((lightConfig, index) => {
            const light = new THREE.PointLight(lightConfig.color, lightConfig.intensity, 50);
            if (index === 0) {
                light.position.set(20, 20, 20);
            } else {
                light.position.set(-20, -20, 20);
            }
            this.scene.add(light);
        });
        
        // Update ambient light
        this.scene.traverse((child) => {
            if (child instanceof THREE.AmbientLight) {
                child.color = colors.ambient;
            }
        });
    }
    
    createMedicalElements() {
        // Create floating medical cross symbols
        this.createMedicalCrosses();
        
        // Create DNA helix
        this.createDNAHelix();
        
        // Create heartbeat wave
        this.createHeartbeatWave();
    }
    
    createMedicalCrosses() {
        const crossGeometry = new THREE.BoxGeometry(0.2, 1, 0.1);
        const crossGeometry2 = new THREE.BoxGeometry(1, 0.2, 0.1);
        
        const theme = this.detectCurrentTheme();
        const colors = this.themeColors[theme] || this.themeColors.light;
        
        for (let i = 0; i < 5; i++) {
            const crossGroup = new THREE.Group();
            
            const crossMaterial = new THREE.MeshBasicMaterial({ 
                color: colors.medical.getHex(),
                transparent: true,
                opacity: 0.7
            });
            
            const vertical = new THREE.Mesh(crossGeometry, crossMaterial.clone());
            const horizontal = new THREE.Mesh(crossGeometry2, crossMaterial.clone());
            
            crossGroup.add(vertical);
            crossGroup.add(horizontal);
            
            crossGroup.position.set(
                (Math.random() - 0.5) * 80,
                (Math.random() - 0.5) * 60,
                (Math.random() - 0.5) * 40
            );
            
            crossGroup.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            
            this.medicalIcons.push(crossGroup);
            this.scene.add(crossGroup);
        }
    }
    
    createDNAHelix() {
        const helixPoints = [];
        const helixColors = [];
        
        const theme = this.detectCurrentTheme();
        const colors = this.themeColors[theme] || this.themeColors.light;
        
        for (let i = 0; i < 200; i++) {
            const angle = (i / 200) * Math.PI * 8;
            const x = Math.cos(angle) * 3;
            const y = (i / 200) * 20 - 10;
            const z = Math.sin(angle) * 3;
            
            helixPoints.push(x, y, z);
            
            // Alternate colors from theme palette
            const color = i % 2 === 0 ? colors.particles[0] : colors.particles[1];
            helixColors.push(color.r, color.g, color.b);
        }
        
        const helixGeometry = new THREE.BufferGeometry();
        helixGeometry.setAttribute('position', new THREE.Float32BufferAttribute(helixPoints, 3));
        helixGeometry.setAttribute('color', new THREE.Float32BufferAttribute(helixColors, 3));
        
        const helixMaterial = new THREE.PointsMaterial({
            size: 4,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        this.dnaHelix = new THREE.Points(helixGeometry, helixMaterial);
        this.dnaHelix.position.set(-30, 0, -20);
        this.scene.add(this.dnaHelix);
    }
    
    createHeartbeatWave() {
        const wavePoints = [];
        const waveColors = [];
        
        const theme = this.detectCurrentTheme();
        const colors = this.themeColors[theme] || this.themeColors.light;
        const heartColor = colors.medical;
        
        for (let i = 0; i < 100; i++) {
            const x = (i / 100) * 40 - 20;
            let y = 0;
            
            // Create heartbeat pattern
            if (i % 20 < 2) {
                y = Math.sin((i % 20) * Math.PI) * 5;
            } else if (i % 20 < 5) {
                y = Math.sin(((i % 20) - 2) * Math.PI * 2) * 2;
            }
            
            const z = 0;
            
            wavePoints.push(x, y, z);
            waveColors.push(heartColor.r, heartColor.g, heartColor.b);
        }
        
        const waveGeometry = new THREE.BufferGeometry();
        waveGeometry.setAttribute('position', new THREE.Float32BufferAttribute(wavePoints, 3));
        waveGeometry.setAttribute('color', new THREE.Float32BufferAttribute(waveColors, 3));
        
        const waveMaterial = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            linewidth: 3
        });
        
        this.heartbeatWave = new THREE.Line(waveGeometry, waveMaterial);
        this.heartbeatWave.position.set(0, -15, -10);
        this.scene.add(this.heartbeatWave);
    }
    
    setupLighting() {
        const theme = this.detectCurrentTheme();
        const colors = this.themeColors[theme] || this.themeColors.light;
        
        // Ambient light
        const ambientLight = new THREE.AmbientLight(colors.ambient.getHex(), 0.3);
        this.scene.add(ambientLight);
        
        // Point lights for medical atmosphere
        colors.lights.forEach((lightConfig, index) => {
            const light = new THREE.PointLight(lightConfig.color, lightConfig.intensity, 50);
            if (index === 0) {
                light.position.set(20, 20, 20);
            } else {
                light.position.set(-20, -20, 20);
            }
            this.scene.add(light);
        });
    }
    
    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        this.time += 0.01;
        
        // Animate particles
        if (this.particles) {
            this.particles.rotation.y += 0.002;
            this.particles.rotation.x += 0.001;
        }
        
        // Animate medical crosses
        this.medicalIcons.forEach((cross, index) => {
            cross.rotation.y += 0.01 + index * 0.002;
            cross.rotation.x += 0.005;
            cross.position.y += Math.sin(this.time + index) * 0.02;
        });
        
        // Animate DNA helix
        if (this.dnaHelix) {
            this.dnaHelix.rotation.y += 0.01;
            this.dnaHelix.position.y = Math.sin(this.time) * 2;
        }
        
        // Animate heartbeat wave
        if (this.heartbeatWave) {
            this.heartbeatWave.position.x = Math.sin(this.time * 2) * 5;
        }
        
        // Camera movement
        this.camera.position.x = Math.sin(this.time * 0.5) * 5;
        this.camera.position.y = Math.cos(this.time * 0.3) * 3;
        this.camera.lookAt(0, 0, 0);
        
        this.renderer.render(this.scene, this.camera);
    }
    
    handleResize() {
        window.addEventListener('resize', () => {
            const width = this.container.offsetWidth;
            const height = this.container.offsetHeight;
            
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        });
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
            this.container.removeChild(this.renderer.domElement);
        }
    }
}

// Global reference for theme updates
window.HealthcareVideoBackground = HealthcareVideoBackground;

// Initialize when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
    // Wait for theme manager to be available
    const initializeBackground = () => {
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
            try {
                // Create container for 3D background
                const videoContainer = document.createElement('div');
                videoContainer.className = 'video-background';
                videoContainer.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    z-index: -1;
                    overflow: hidden;
                    pointer-events: none;
                `;
                
                heroSection.style.position = 'relative';
                heroSection.insertBefore(videoContainer, heroSection.firstChild);
                
                // Store reference globally for theme updates
                window.healthcareBackground = new HealthcareVideoBackground(videoContainer);
                
                // Listen for theme changes globally
                document.addEventListener('themeChanged', () => {
                    if (window.healthcareBackground && window.healthcareBackground.updateTheme) {
                        window.healthcareBackground.updateTheme();
                    }
                });
                
            } catch (error) {
                console.warn('Failed to initialize 3D background:', error);
                // Continue without 3D background if there's an error
            }
        }
    };
    
    // Initialize immediately or wait for theme manager
    if (window.ThemeManager) {
        initializeBackground();
    } else {
        // Wait for theme manager to load
        setTimeout(initializeBackground, 100);
    }
});